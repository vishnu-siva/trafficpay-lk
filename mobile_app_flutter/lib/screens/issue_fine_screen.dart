import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../models/api_models.dart';
import '../services/auth_service.dart';
import '../services/firebase_service.dart';
import 'my_fines_screen.dart';

class IssueFineScreen extends StatefulWidget {
  const IssueFineScreen({super.key});
  @override
  State<IssueFineScreen> createState() => _IssueFineScreenState();
}

class _IssueFineScreenState extends State<IssueFineScreen> {
  final _firebaseService = FirebaseService();
  final _authService = AuthService();

  final _vehicleNumCtrl = TextEditingController();
  final _driverNicCtrl = TextEditingController();
  final _driverNameCtrl = TextEditingController();
  final _driverPhoneCtrl = TextEditingController();

  List<FineCategory> _categories = [];
  FineCategory? _selectedCategory;
  String _selectedVehicleType = 'CAR';
  final _vehicleTypes = ['CAR', 'MOTORCYCLE', 'THREE_WHEEL', 'BUS', 'TRUCK', 'VAN'];

  double? _lat, _lng;
  String _locationText = 'Location not set';
  bool _loadingCats = true;
  bool _submitting = false;
  FineResponse? _issuedFine;
  OfficerProfile? _officer;

  @override
  void initState() {
    super.initState();
    _init();
  }

  Future<void> _init() async {
    _officer = await _authService.getCurrentProfile();
    final cats = await _firebaseService.getCategories();
    if (mounted) {
      setState(() {
        _categories = cats;
        if (cats.isNotEmpty) _selectedCategory = cats.first;
        _loadingCats = false;
      });
    }
  }

  Future<void> _getLocation() async {
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) { _showMsg('Location services disabled'); return; }
      LocationPermission perm = await Geolocator.checkPermission();
      if (perm == LocationPermission.denied) {
        perm = await Geolocator.requestPermission();
        if (perm == LocationPermission.denied) { _showMsg('Location permission denied'); return; }
      }
      final pos = await Geolocator.getCurrentPosition();
      setState(() {
        _lat = pos.latitude;
        _lng = pos.longitude;
        _locationText = 'Lat: ${_lat!.toStringAsFixed(5)}, Lng: ${_lng!.toStringAsFixed(5)}';
      });
    } catch (_) {
      _showMsg('Could not get location');
    }
  }

  Future<void> _submitFine() async {
    if (_selectedCategory == null) { _showMsg('Select a fine category'); return; }
    if (_vehicleNumCtrl.text.trim().isEmpty) { _showMsg('Enter vehicle number'); return; }
    if (_driverNicCtrl.text.trim().isEmpty) { _showMsg('Enter driver NIC'); return; }
    if (_driverNameCtrl.text.trim().isEmpty) { _showMsg('Enter driver name'); return; }

    setState(() { _submitting = true; _issuedFine = null; });
    try {
      final fine = await _firebaseService.issueFine(
        categoryId: _selectedCategory!.categoryId,
        categoryCode: _selectedCategory!.code,
        categoryDescription: _selectedCategory!.description,
        amount: _selectedCategory!.amount,
        vehicleNumber: _vehicleNumCtrl.text.trim(),
        vehicleType: _selectedVehicleType,
        driverNicNumber: _driverNicCtrl.text.trim(),
        driverName: _driverNameCtrl.text.trim(),
        driverPhone: _driverPhoneCtrl.text.trim().isEmpty ? null : _driverPhoneCtrl.text.trim(),
        location: _locationText,
        latitude: _lat,
        longitude: _lng,
        officerId: _authService.currentUser?.uid ?? '',
        officerName: _officer?.fullName ?? 'Officer',
        district: _officer?.district ?? 'Colombo',
      );
      setState(() => _issuedFine = fine);
      _clearForm();
    } catch (e) {
      _showMsg('Failed to issue fine. Try again.');
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  void _clearForm() {
    _vehicleNumCtrl.clear();
    _driverNicCtrl.clear();
    _driverNameCtrl.clear();
    _driverPhoneCtrl.clear();
    setState(() { _lat = null; _lng = null; _locationText = 'Location not set'; });
  }

  void _showMsg(String msg) =>
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));

  Future<void> _logout() async {
    await _authService.signOut();
    // Navigation handled by StreamBuilder in main.dart
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(children: [
          Image.asset('assets/Logo.png', height: 30,
              errorBuilder: (ctx, err, stack) => const Icon(Icons.local_police, color: Colors.white, size: 30)),
          const SizedBox(width: 8),
          const Text('Issue Traffic Fine'),
        ]),
        actions: [
          IconButton(
            icon: const Icon(Icons.list_alt),
            tooltip: 'My Fines',
            onPressed: () => Navigator.push(context,
                MaterialPageRoute(builder: (_) => const MyFinesScreen())),
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Logout',
            onPressed: _logout,
          ),
        ],
      ),
      body: _loadingCats
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
                if (_officer != null)
                  Container(
                    padding: const EdgeInsets.all(12),
                    margin: const EdgeInsets.only(bottom: 16),
                    decoration: BoxDecoration(
                      color: Colors.blue.shade50,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.blue.shade100),
                    ),
                    child: Row(children: [
                      const Icon(Icons.person, color: Colors.blue),
                      const SizedBox(width: 8),
                      Text('${_officer!.fullName}  •  ${_officer!.district}',
                          style: const TextStyle(fontWeight: FontWeight.bold)),
                    ]),
                  ),

                const Text('Fine Category',
                    style: TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 6),
                DropdownButtonFormField<FineCategory>(
                  initialValue: _selectedCategory,
                  items: _categories
                      .map((c) => DropdownMenuItem(
                          value: c,
                          child: Text('${c.code} - ${c.description}',
                              overflow: TextOverflow.ellipsis)))
                      .toList(),
                  onChanged: (v) => setState(() => _selectedCategory = v),
                  decoration: const InputDecoration(
                      border: OutlineInputBorder(), filled: true, fillColor: Colors.white),
                ),
                const SizedBox(height: 12),

                TextField(
                  controller: _vehicleNumCtrl,
                  textCapitalization: TextCapitalization.characters,
                  decoration: const InputDecoration(
                      labelText: 'Vehicle Number *',
                      border: OutlineInputBorder(),
                      filled: true,
                      fillColor: Colors.white),
                ),
                const SizedBox(height: 12),

                const Text('Vehicle Type', style: TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 6),
                DropdownButtonFormField<String>(
                  initialValue: _selectedVehicleType,
                  items: _vehicleTypes
                      .map((t) => DropdownMenuItem(value: t, child: Text(t)))
                      .toList(),
                  onChanged: (v) => setState(() => _selectedVehicleType = v!),
                  decoration: const InputDecoration(
                      border: OutlineInputBorder(), filled: true, fillColor: Colors.white),
                ),
                const SizedBox(height: 12),

                TextField(
                  controller: _driverNicCtrl,
                  textCapitalization: TextCapitalization.characters,
                  decoration: const InputDecoration(
                      labelText: 'Driver NIC *',
                      border: OutlineInputBorder(),
                      filled: true,
                      fillColor: Colors.white),
                ),
                const SizedBox(height: 12),

                TextField(
                  controller: _driverNameCtrl,
                  textCapitalization: TextCapitalization.words,
                  decoration: const InputDecoration(
                      labelText: 'Driver Name *',
                      border: OutlineInputBorder(),
                      filled: true,
                      fillColor: Colors.white),
                ),
                const SizedBox(height: 12),

                TextField(
                  controller: _driverPhoneCtrl,
                  keyboardType: TextInputType.phone,
                  decoration: const InputDecoration(
                      labelText: 'Driver Phone (optional)',
                      border: OutlineInputBorder(),
                      filled: true,
                      fillColor: Colors.white),
                ),
                const SizedBox(height: 12),

                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    border: Border.all(color: Colors.grey.shade300),
                    borderRadius: BorderRadius.circular(4),
                    color: Colors.white,
                  ),
                  child: Row(children: [
                    Expanded(child: Text(_locationText,
                        style: const TextStyle(fontSize: 12, color: Colors.grey))),
                    TextButton.icon(
                      onPressed: _getLocation,
                      icon: const Icon(Icons.gps_fixed, size: 18),
                      label: const Text('Get GPS'),
                    ),
                  ]),
                ),
                const SizedBox(height: 20),

                _submitting
                    ? const Center(child: CircularProgressIndicator())
                    : ElevatedButton(
                        onPressed: _submitFine,
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8)),
                        ),
                        child: const Text('Issue Fine', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                      ),

                if (_issuedFine != null) ...[
                  const SizedBox(height: 24),
                  Card(
                    color: Colors.green.shade50,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    elevation: 4,
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(children: [
                        const Icon(Icons.check_circle, color: Colors.green, size: 40),
                        const SizedBox(height: 8),
                        const Text('Fine Issued Successfully!',
                            style: TextStyle(color: Colors.green, fontSize: 18,
                                fontWeight: FontWeight.bold)),
                        const SizedBox(height: 4),
                        Text('Ref: ${_issuedFine!.referenceNumber}',
                            style: const TextStyle(fontSize: 16)),
                        Text('LKR ${_issuedFine!.amount.toStringAsFixed(2)}',
                            style: const TextStyle(fontSize: 18,
                                fontWeight: FontWeight.bold, color: Colors.red)),
                        const SizedBox(height: 16),
                        QrImageView(data: _issuedFine!.referenceNumber, size: 200),
                        const SizedBox(height: 8),
                        const Text('Show QR code to driver for on-the-spot payment',
                            textAlign: TextAlign.center,
                            style: TextStyle(fontSize: 12, color: Colors.grey)),
                      ]),
                    ),
                  ),
                ],
              ]),
            ),
    );
  }

  @override
  void dispose() {
    _vehicleNumCtrl.dispose();
    _driverNicCtrl.dispose();
    _driverNameCtrl.dispose();
    _driverPhoneCtrl.dispose();
    super.dispose();
  }
}
