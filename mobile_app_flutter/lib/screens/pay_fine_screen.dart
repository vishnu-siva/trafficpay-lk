import 'package:flutter/material.dart';
import '../models/api_models.dart';
import '../services/auth_service.dart';
import '../services/firebase_service.dart';
import 'payment_success_screen.dart';

class PayFineScreen extends StatefulWidget {
  const PayFineScreen({super.key});
  @override
  State<PayFineScreen> createState() => _PayFineScreenState();
}

class _PayFineScreenState extends State<PayFineScreen> {
  final _firebaseService = FirebaseService();
  final _authService = AuthService();
  final _refCtrl = TextEditingController();
  final _nameCtrl = TextEditingController();
  final _nicCtrl = TextEditingController();

  FineResponse? _fine;
  List<FineCategory> _categories = [];
  FineCategory? _selectedCategory;
  bool _lookingUp = false;
  bool _paying = false;
  String _paymentMethod = 'CASH';
  final _paymentMethods = ['CASH', 'CARD', 'ONLINE_TRANSFER'];

  @override
  void initState() {
    super.initState();
    _loadDriverProfile();
    _loadCategories();
  }

  Future<void> _loadDriverProfile() async {
    final profile = await _authService.getCurrentDriverProfile();
    if (profile != null && mounted) {
      setState(() {
        _nameCtrl.text = profile.fullName;
        _nicCtrl.text = profile.nicNumber;
      });
    }
  }

  Future<void> _loadCategories() async {
    try {
      final cats = await _firebaseService.getCategories();
      if (mounted) setState(() => _categories = cats);
    } catch (_) {}
  }

  Future<void> _lookupFine() async {
    if (_refCtrl.text.trim().isEmpty) {
      _showMsg('Enter the fine reference number');
      return;
    }
    setState(() { _lookingUp = true; _fine = null; });
    try {
      final fine = await _firebaseService.lookupFine(_refCtrl.text.trim());
      setState(() => _fine = fine);
    } catch (_) {
      _showMsg('Fine not found. Check the reference number.');
    } finally {
      if (mounted) setState(() => _lookingUp = false);
    }
  }

  Future<void> _payFine() async {
    if (_fine == null) return;
    if (_nameCtrl.text.trim().isEmpty || _nicCtrl.text.trim().isEmpty) {
      _showMsg('Enter your name and NIC number');
      return;
    }
    setState(() => _paying = true);
    try {
      final payment = await _firebaseService.payFine(
        fineId: _fine!.fineId,
        referenceNumber: _fine!.referenceNumber,
        categoryId: _fine!.categoryId,
        amount: _fine!.amount,
        paymentMethod: _paymentMethod,
        paidByName: _nameCtrl.text.trim(),
        paidByNic: _nicCtrl.text.trim(),
      );
      if (mounted) {
        Navigator.push(context, MaterialPageRoute(
          builder: (_) => PaymentSuccessScreen(
              payment: payment, fineRef: _fine!.referenceNumber),
        ));
      }
    } catch (_) {
      _showMsg('Payment failed. Please try again.');
    } finally {
      if (mounted) setState(() => _paying = false);
    }
  }

  void _showMsg(String msg) =>
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: AppBar(
        title: Row(children: [
          Image.asset('assets/Logo.png', height: 30,
              errorBuilder: (ctx, err, stack) => const Icon(Icons.local_police, color: Colors.white, size: 30)),
          const SizedBox(width: 8),
          const Text('Pay Traffic Fine'),
        ]),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Logout',
            onPressed: () => _authService.signOut(),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          const Text('Enter details from your fine sheet',
              style: TextStyle(color: Colors.grey, fontSize: 14)),
          const SizedBox(height: 16),

          // ── Lookup Card ───────────────────────────────────────────────────
          Card(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
                const Text('Fine Reference Details',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                const SizedBox(height: 14),
                TextField(
                  controller: _refCtrl,
                  textCapitalization: TextCapitalization.characters,
                  decoration: const InputDecoration(
                      labelText: 'Fine Reference Number',
                      border: OutlineInputBorder(),
                      prefixIcon: Icon(Icons.numbers)),
                ),
                if (_categories.isNotEmpty) ...[
                  const SizedBox(height: 12),
                  InputDecorator(
                    decoration: const InputDecoration(
                      border: OutlineInputBorder(),
                      prefixIcon: Icon(Icons.category_outlined),
                      contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    ),
                    child: DropdownButton<FineCategory>(
                      value: _selectedCategory,
                      hint: const Text('Fine Category (optional)'),
                      isExpanded: true,
                      underline: const SizedBox.shrink(),
                      items: _categories
                          .map((c) => DropdownMenuItem(
                                value: c,
                                child: Text(
                                  '${c.description} (${c.code})',
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ))
                          .toList(),
                      onChanged: (v) => setState(() => _selectedCategory = v),
                    ),
                  ),
                ],
                const SizedBox(height: 16),
                _lookingUp
                    ? const Center(child: CircularProgressIndicator())
                    : OutlinedButton.icon(
                        onPressed: _lookupFine,
                        icon: const Icon(Icons.search),
                        label: const Text('Look Up Fine'),
                        style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 12)),
                      ),
              ]),
            ),
          ),

          // ── Fine Details Card ─────────────────────────────────────────────
          if (_fine != null) ...[
            const SizedBox(height: 16),
            Card(
              color: Colors.green.shade50,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Row(children: [
                    const Icon(Icons.info_outline, color: Colors.green),
                    const SizedBox(width: 8),
                    const Text('Fine Details',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    const Spacer(),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                          color: Colors.orange,
                          borderRadius: BorderRadius.circular(12)),
                      child: Text(_fine!.status,
                          style: const TextStyle(color: Colors.white,
                              fontSize: 11, fontWeight: FontWeight.bold)),
                    ),
                  ]),
                  const Divider(height: 20),
                  _row('Reference', _fine!.referenceNumber),
                  _row('Violation', _fine!.categoryDescription ??
                      _fine!.categoryCode ?? _fine!.categoryId),
                  _row('Vehicle', _fine!.vehicleNumber),
                  _row('Driver', _fine!.driverName ?? '—'),
                  _row('Issued By', _fine!.issuedByName ?? '—'),
                  _row('Date', _fine!.issuedAt?.substring(0, 10) ?? '—'),
                  const Divider(height: 20),
                  Row(children: [
                    const Text('Fine Amount',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                    const Spacer(),
                    Text('LKR ${_fine!.amount.toStringAsFixed(2)}',
                        style: const TextStyle(fontWeight: FontWeight.bold,
                            fontSize: 22, color: Colors.red)),
                  ]),
                ]),
              ),
            ),
            const SizedBox(height: 16),

            // ── Payment Card ────────────────────────────────────────────────
            Card(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
                  const Text('Payment Information',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  const SizedBox(height: 14),
                  TextField(
                    controller: _nameCtrl,
                    textCapitalization: TextCapitalization.words,
                    decoration: const InputDecoration(
                        labelText: 'Your Full Name',
                        border: OutlineInputBorder(),
                        prefixIcon: Icon(Icons.person_outline)),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _nicCtrl,
                    textCapitalization: TextCapitalization.characters,
                    decoration: const InputDecoration(
                        labelText: 'Your NIC Number',
                        border: OutlineInputBorder(),
                        prefixIcon: Icon(Icons.credit_card)),
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    initialValue: _paymentMethod,
                    items: _paymentMethods
                        .map((m) => DropdownMenuItem(value: m, child: Text(m)))
                        .toList(),
                    onChanged: (v) => setState(() => _paymentMethod = v!),
                    decoration: const InputDecoration(
                        labelText: 'Payment Method',
                        border: OutlineInputBorder(),
                        prefixIcon: Icon(Icons.payment)),
                  ),
                  const SizedBox(height: 20),
                  _paying
                      ? const Center(child: CircularProgressIndicator())
                      : ElevatedButton(
                          onPressed: _payFine,
                          style: ElevatedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            backgroundColor: Colors.green,
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(8)),
                          ),
                          child: Text(
                            'Pay Now — LKR ${_fine!.amount.toStringAsFixed(2)}',
                            style: const TextStyle(
                                fontSize: 16, fontWeight: FontWeight.bold),
                          ),
                        ),
                ]),
              ),
            ),
          ],
        ]),
      ),
    );
  }

  Widget _row(String label, String value) => Padding(
    padding: const EdgeInsets.only(bottom: 8),
    child: Row(children: [
      SizedBox(width: 80,
          child: Text(label, style: const TextStyle(color: Colors.grey, fontSize: 13))),
      Expanded(child: Text(value, style: const TextStyle(fontSize: 13))),
    ]),
  );

  @override
  void dispose() {
    _refCtrl.dispose();
    _nameCtrl.dispose();
    _nicCtrl.dispose();
    super.dispose();
  }
}
