import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:uuid/uuid.dart';
import '../models/api_models.dart';

class FirebaseService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;
  final _uuid = const Uuid();

  // ── Categories ────────────────────────────────────────────────────────────

  Future<List<FineCategory>> getCategories() async {
    final snap = await _db.collection('fineCategories').orderBy('code').get();
    if (snap.docs.isEmpty) await _seedCategories();
    final snap2 = snap.docs.isEmpty
        ? await _db.collection('fineCategories').orderBy('code').get()
        : snap;
    return snap2.docs.map((d) => FineCategory.fromJson({...d.data(), 'categoryId': d.id})).toList();
  }

  Future<void> _seedCategories() async {
    final categories = [
      {'code': 'SPD001', 'description': 'Exceeding Speed Limit', 'amount': 2500.0, 'legalReference': 'Section 150'},
      {'code': 'ALC002', 'description': 'Driving Under Influence', 'amount': 10000.0, 'legalReference': 'Section 151'},
      {'code': 'SBT003', 'description': 'Not Wearing Seatbelt', 'amount': 1000.0, 'legalReference': 'Section 152'},
      {'code': 'PHN004', 'description': 'Using Mobile While Driving', 'amount': 3000.0, 'legalReference': 'Section 153'},
      {'code': 'SIG005', 'description': 'Jumping Red Light', 'amount': 5000.0, 'legalReference': 'Section 154'},
      {'code': 'LIC006', 'description': 'Driving Without Valid License', 'amount': 7500.0, 'legalReference': 'Section 155'},
      {'code': 'INS007', 'description': 'No Insurance', 'amount': 5000.0, 'legalReference': 'Section 156'},
      {'code': 'PKG008', 'description': 'Illegal Parking', 'amount': 1500.0, 'legalReference': 'Section 157'},
    ];
    final batch = _db.batch();
    for (final cat in categories) {
      final ref = _db.collection('fineCategories').doc();
      batch.set(ref, cat);
    }
    await batch.commit();
  }

  // ── Fines ─────────────────────────────────────────────────────────────────

  Future<FineResponse> issueFine({
    required String categoryId,
    required String categoryCode,
    required String categoryDescription,
    required double amount,
    required String vehicleNumber,
    required String vehicleType,
    required String driverNicNumber,
    required String driverName,
    String? driverPhone,
    String? location,
    double? latitude,
    double? longitude,
    required String officerId,
    required String officerName,
    required String district,
  }) async {
    final refNumber = _generateRef();
    final fineData = {
      'referenceNumber': refNumber,
      'categoryId': categoryId,
      'categoryCode': categoryCode,
      'categoryDescription': categoryDescription,
      'amount': amount,
      'status': 'PENDING',
      'vehicleNumber': vehicleNumber.toUpperCase(),
      'vehicleType': vehicleType,
      'driverNicNumber': driverNicNumber,
      'driverName': driverName,
      'driverPhone': driverPhone,
      'location': location,
      'latitude': latitude,
      'longitude': longitude,
      'issuedBy': officerId,
      'issuedByName': officerName,
      'district': district,
      'issuedAt': FieldValue.serverTimestamp(),
      'paidAt': null,
    };
    final docRef = await _db.collection('fines').add(fineData);
    return FineResponse(
      fineId: docRef.id,
      referenceNumber: refNumber,
      categoryId: categoryId,
      categoryCode: categoryCode,
      categoryDescription: categoryDescription,
      amount: amount,
      status: 'PENDING',
      vehicleNumber: vehicleNumber.toUpperCase(),
      vehicleType: vehicleType,
      driverName: driverName,
      district: district,
      issuedByName: officerName,
      issuedAt: DateTime.now().toIso8601String(),
    );
  }

  Stream<List<FineResponse>> getMyFinesStream(String officerId, String status) {
    return _db
        .collection('fines')
        .where('issuedBy', isEqualTo: officerId)
        .where('status', isEqualTo: status)
        .orderBy('issuedAt', descending: true)
        .snapshots()
        .map((snap) => snap.docs
            .map((d) => FineResponse.fromJson({...d.data(), 'fineId': d.id,
              'issuedAt': (d.data()['issuedAt'] as Timestamp?)?.toDate().toIso8601String()}))
            .toList());
  }

  Future<FineResponse> lookupFine(String referenceNumber, String categoryId) async {
    final snap = await _db
        .collection('fines')
        .where('referenceNumber', isEqualTo: referenceNumber.trim())
        .where('categoryId', isEqualTo: categoryId.trim())
        .limit(1)
        .get();
    if (snap.docs.isEmpty) throw Exception('Fine not found');
    final d = snap.docs.first;
    return FineResponse.fromJson({
      ...d.data(),
      'fineId': d.id,
      'issuedAt': (d.data()['issuedAt'] as Timestamp?)?.toDate().toIso8601String(),
    });
  }

  // ── Payments ──────────────────────────────────────────────────────────────

  Future<PaymentResponse> payFine({
    required String fineId,
    required String referenceNumber,
    required String categoryId,
    required double amount,
    required String paymentMethod,
    required String paidByName,
    required String paidByNic,
  }) async {
    final receiptNumber = 'RCP-${_uuid.v4().substring(0, 8).toUpperCase()}';
    final paymentData = {
      'fineId': fineId,
      'referenceNumber': referenceNumber,
      'categoryId': categoryId,
      'amount': amount,
      'status': 'COMPLETED',
      'paymentMethod': paymentMethod,
      'paymentChannel': 'MOBILE_APP',
      'paidByName': paidByName,
      'paidByNic': paidByNic,
      'receiptNumber': receiptNumber,
      'smsNotified': true,
      'paidAt': FieldValue.serverTimestamp(),
    };

    final batch = _db.batch();
    final paymentRef = _db.collection('payments').doc();
    batch.set(paymentRef, paymentData);
    batch.update(_db.collection('fines').doc(fineId), {
      'status': 'PAID',
      'paidAt': FieldValue.serverTimestamp(),
    });
    await batch.commit();

    return PaymentResponse(
      paymentId: paymentRef.id,
      referenceNumber: referenceNumber,
      amount: amount,
      status: 'COMPLETED',
      receiptNumber: receiptNumber,
      smsNotified: true,
      paidAt: DateTime.now().toIso8601String(),
    );
  }

  String _generateRef() {
    final now = DateTime.now();
    final suffix = _uuid.v4().substring(0, 6).toUpperCase();
    return 'TF${now.year}${now.month.toString().padLeft(2, '0')}$suffix';
  }
}
