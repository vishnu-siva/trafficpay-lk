import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:google_sign_in/google_sign_in.dart';

class OfficerProfile {
  final String uid;
  final String badgeNumber;
  final String fullName;
  final String role;
  final String district;
  final String? phoneNumber;

  OfficerProfile({
    required this.uid,
    required this.badgeNumber,
    required this.fullName,
    required this.role,
    required this.district,
    this.phoneNumber,
  });

  factory OfficerProfile.fromDoc(String uid, Map<String, dynamic> data) => OfficerProfile(
    uid: uid,
    badgeNumber: data['badgeNumber'] ?? '',
    fullName: data['fullName'] ?? '',
    role: data['role'] ?? 'OFFICER',
    district: data['district'] ?? '',
    phoneNumber: data['phoneNumber'],
  );
}

class DriverProfile {
  final String uid;
  final String fullName;
  final String nicNumber;
  final String email;
  final String? phoneNumber;

  DriverProfile({
    required this.uid,
    required this.fullName,
    required this.nicNumber,
    required this.email,
    this.phoneNumber,
  });

  factory DriverProfile.fromDoc(String uid, Map<String, dynamic> data) => DriverProfile(
    uid: uid,
    fullName: data['fullName'] ?? '',
    nicNumber: data['nicNumber'] ?? '',
    email: data['email'] ?? '',
    phoneNumber: data['phoneNumber'],
  );
}

class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  User? get currentUser => _auth.currentUser;
  Stream<User?> get authStateChanges => _auth.authStateChanges();

  // Officers login with badge number — stored as badge@slpolice.lk in Firebase Auth
  String _emailFromBadge(String badge) => '${badge.toLowerCase()}@slpolice.lk';

  Future<OfficerProfile> signIn(String badgeNumber, String password) async {
    final email = _emailFromBadge(badgeNumber.trim());
    final cred = await _auth.signInWithEmailAndPassword(email: email, password: password);
    return _getOrCreateProfile(cred.user!, badgeNumber.trim());
  }

  Future<OfficerProfile> _getOrCreateProfile(User user, String badgeNumber) async {
    final doc = await _db.collection('officers').doc(user.uid).get();
    if (doc.exists) {
      return OfficerProfile.fromDoc(user.uid, doc.data()!);
    }
    // First login — create profile
    final profile = {
      'badgeNumber': badgeNumber,
      'fullName': user.displayName ?? 'Officer $badgeNumber',
      'role': 'OFFICER',
      'district': 'Colombo',
      'phoneNumber': user.phoneNumber,
      'email': user.email,
      'createdAt': FieldValue.serverTimestamp(),
    };
    await _db.collection('officers').doc(user.uid).set(profile);
    return OfficerProfile.fromDoc(user.uid, profile);
  }

  Future<OfficerProfile?> getCurrentProfile() async {
    final user = _auth.currentUser;
    if (user == null) return null;
    final doc = await _db.collection('officers').doc(user.uid).get();
    if (!doc.exists) return null;
    return OfficerProfile.fromDoc(user.uid, doc.data()!);
  }

  // ── Driver Auth ───────────────────────────────────────────────────────────

  Future<DriverProfile> registerDriver({
    required String fullName,
    required String nicNumber,
    required String email,
    required String password,
    String? phoneNumber,
  }) async {
    final cred = await _auth.createUserWithEmailAndPassword(
        email: email, password: password);
    final data = {
      'fullName': fullName,
      'nicNumber': nicNumber,
      'email': email,
      'phoneNumber': phoneNumber,
      'role': 'DRIVER',
      'createdAt': FieldValue.serverTimestamp(),
    };
    await _db.collection('drivers').doc(cred.user!.uid).set(data);
    return DriverProfile.fromDoc(cred.user!.uid, data);
  }

  Future<DriverProfile> signInDriver(String email, String password) async {
    final cred = await _auth.signInWithEmailAndPassword(
        email: email, password: password);
    final doc = await _db.collection('drivers').doc(cred.user!.uid).get();
    if (!doc.exists) {
      await _auth.signOut();
      throw Exception('This account is not registered as a driver.');
    }
    return DriverProfile.fromDoc(cred.user!.uid, doc.data()!);
  }

  Future<DriverProfile> signInDriverWithGoogle() async {
    final googleUser = await GoogleSignIn().signIn();
    if (googleUser == null) throw Exception('Google sign-in cancelled.');
    final googleAuth = await googleUser.authentication;
    final credential = GoogleAuthProvider.credential(
      accessToken: googleAuth.accessToken,
      idToken: googleAuth.idToken,
    );
    final cred = await _auth.signInWithCredential(credential);
    final user = cred.user!;
    final ref = _db.collection('drivers').doc(user.uid);
    final snap = await ref.get();
    if (!snap.exists) {
      final data = {
        'fullName': user.displayName ?? '',
        'nicNumber': '',
        'email': user.email ?? '',
        'phoneNumber': user.phoneNumber,
        'role': 'DRIVER',
        'createdAt': FieldValue.serverTimestamp(),
      };
      await ref.set(data);
      return DriverProfile.fromDoc(user.uid, data);
    }
    return DriverProfile.fromDoc(user.uid, snap.data()!);
  }

  Future<DriverProfile?> getCurrentDriverProfile() async {
    final user = _auth.currentUser;
    if (user == null) return null;
    final doc = await _db.collection('drivers').doc(user.uid).get();
    if (!doc.exists) return null;
    return DriverProfile.fromDoc(user.uid, doc.data()!);
  }

  Future<String?> getUserRole() async {
    final user = _auth.currentUser;
    if (user == null) return null;
    final officerDoc = await _db.collection('officers').doc(user.uid).get();
    if (officerDoc.exists) return 'OFFICER';
    final driverDoc = await _db.collection('drivers').doc(user.uid).get();
    if (driverDoc.exists) return 'DRIVER';
    return null;
  }

  Future<void> signOut() => _auth.signOut();

  bool get isLoggedIn => _auth.currentUser != null;
}
