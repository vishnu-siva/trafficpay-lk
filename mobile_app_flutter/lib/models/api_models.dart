class LoginRequest {
  final String badgeNumber;
  final String password;
  LoginRequest({required this.badgeNumber, required this.password});
  Map<String, dynamic> toJson() => {'badgeNumber': badgeNumber, 'password': password};
}

class UserInfo {
  final String userId;
  final String fullName;
  final String role;
  final String district;
  final String badgeNumber;
  final String? phoneNumber;
  UserInfo({required this.userId, required this.fullName, required this.role,
      required this.district, required this.badgeNumber, this.phoneNumber});
  factory UserInfo.fromJson(Map<String, dynamic> j) => UserInfo(
    userId: j['userId'] ?? '',
    fullName: j['fullName'] ?? '',
    role: j['role'] ?? '',
    district: j['district'] ?? '',
    badgeNumber: j['badgeNumber'] ?? '',
    phoneNumber: j['phoneNumber'],
  );
}

class AuthResponse {
  final String token;
  final String? refreshToken;
  final UserInfo? user;
  AuthResponse({required this.token, this.refreshToken, this.user});
  factory AuthResponse.fromJson(Map<String, dynamic> j) => AuthResponse(
    token: j['token'] ?? '',
    refreshToken: j['refreshToken'],
    user: j['user'] != null ? UserInfo.fromJson(j['user']) : null,
  );
}

class FineCategory {
  final String categoryId;
  final String code;
  final String description;
  final double amount;
  final String? legalReference;
  FineCategory({required this.categoryId, required this.code,
      required this.description, required this.amount, this.legalReference});
  factory FineCategory.fromJson(Map<String, dynamic> j) => FineCategory(
    categoryId: j['categoryId'] ?? '',
    code: j['code'] ?? '',
    description: j['description'] ?? '',
    amount: (j['amount'] ?? 0).toDouble(),
    legalReference: j['legalReference'],
  );
  @override
  String toString() => '$code - $description';
}

class IssueFineRequest {
  final String categoryId;
  final String vehicleNumber;
  final String vehicleType;
  final String driverNicNumber;
  final String driverName;
  final String? driverPhone;
  final String? location;
  final double? latitude;
  final double? longitude;
  IssueFineRequest({required this.categoryId, required this.vehicleNumber,
      required this.vehicleType, required this.driverNicNumber,
      required this.driverName, this.driverPhone, this.location,
      this.latitude, this.longitude});
  Map<String, dynamic> toJson() => {
    'categoryId': categoryId,
    'vehicleNumber': vehicleNumber,
    'vehicleType': vehicleType,
    'driverNicNumber': driverNicNumber,
    'driverName': driverName,
    if (driverPhone != null) 'driverPhone': driverPhone,
    if (location != null) 'location': location,
    if (latitude != null) 'latitude': latitude,
    if (longitude != null) 'longitude': longitude,
  };
}

class FineResponse {
  final String fineId;
  final String referenceNumber;
  final String categoryId;
  final String? categoryCode;
  final String? categoryDescription;
  final double amount;
  final String status;
  final String vehicleNumber;
  final String? vehicleType;
  final String? driverName;
  final String? district;
  final String? issuedByName;
  final String? issuedAt;
  final String? paidAt;
  FineResponse({required this.fineId, required this.referenceNumber,
      required this.categoryId, this.categoryCode, this.categoryDescription,
      required this.amount, required this.status, required this.vehicleNumber,
      this.vehicleType, this.driverName, this.district,
      this.issuedByName, this.issuedAt, this.paidAt});
  factory FineResponse.fromJson(Map<String, dynamic> j) => FineResponse(
    fineId: j['fineId'] ?? '',
    referenceNumber: j['referenceNumber'] ?? '',
    categoryId: j['categoryId'] ?? '',
    categoryCode: j['categoryCode'],
    categoryDescription: j['categoryDescription'],
    amount: (j['amount'] ?? 0).toDouble(),
    status: j['status'] ?? '',
    vehicleNumber: j['vehicleNumber'] ?? '',
    vehicleType: j['vehicleType'],
    driverName: j['driverName'],
    district: j['district'],
    issuedByName: j['issuedByName'],
    issuedAt: j['issuedAt'],
    paidAt: j['paidAt'],
  );
}

class InitiatePaymentRequest {
  final String referenceNumber;
  final String categoryId;
  final String paymentMethod;
  final String paymentChannel;
  final String paidByName;
  final String paidByNic;
  InitiatePaymentRequest({required this.referenceNumber, required this.categoryId,
      required this.paymentMethod, required this.paymentChannel,
      required this.paidByName, required this.paidByNic});
  Map<String, dynamic> toJson() => {
    'referenceNumber': referenceNumber,
    'categoryId': categoryId,
    'paymentMethod': paymentMethod,
    'paymentChannel': paymentChannel,
    'paidByName': paidByName,
    'paidByNic': paidByNic,
  };
}

class PaymentResponse {
  final String paymentId;
  final String? referenceNumber;
  final double amount;
  final String status;
  final String? receiptNumber;
  final bool smsNotified;
  final String? paidAt;
  PaymentResponse({required this.paymentId, this.referenceNumber,
      required this.amount, required this.status, this.receiptNumber,
      required this.smsNotified, this.paidAt});
  factory PaymentResponse.fromJson(Map<String, dynamic> j) => PaymentResponse(
    paymentId: j['paymentId'] ?? '',
    referenceNumber: j['referenceNumber'],
    amount: (j['amount'] ?? 0).toDouble(),
    status: j['status'] ?? '',
    receiptNumber: j['receiptNumber'],
    smsNotified: j['smsNotified'] ?? false,
    paidAt: j['paidAt'],
  );
}
