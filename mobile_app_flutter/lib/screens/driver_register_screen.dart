import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../services/auth_service.dart';

class DriverRegisterScreen extends StatefulWidget {
  const DriverRegisterScreen({super.key});
  @override
  State<DriverRegisterScreen> createState() => _DriverRegisterScreenState();
}

class _DriverRegisterScreenState extends State<DriverRegisterScreen> {
  final _nameCtrl = TextEditingController();
  final _nicCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();
  final _authService = AuthService();
  bool _loading = false;
  bool _obscure = true;

  Future<void> _register() async {
    final name = _nameCtrl.text.trim();
    final nic = _nicCtrl.text.trim();
    final email = _emailCtrl.text.trim();
    final password = _passwordCtrl.text;
    final confirm = _confirmCtrl.text;

    if (name.isEmpty || nic.isEmpty || email.isEmpty || password.isEmpty) {
      _showMsg('Please fill in all required fields', isError: true);
      return;
    }
    if (password != confirm) {
      _showMsg('Passwords do not match', isError: true);
      return;
    }
    if (password.length < 6) {
      _showMsg('Password must be at least 6 characters', isError: true);
      return;
    }

    setState(() => _loading = true);
    try {
      await _authService.registerDriver(
        fullName: name,
        nicNumber: nic,
        email: email,
        password: password,
        phoneNumber:
            _phoneCtrl.text.trim().isEmpty ? null : _phoneCtrl.text.trim(),
      );
      if (mounted) {
        Navigator.of(context).popUntil((route) => route.isFirst);
      }
    } on FirebaseAuthException catch (e) {
      _showMsg(_errorMsg(e.code), isError: true);
    } catch (_) {
      _showMsg('Registration failed. Please try again.', isError: true);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  String _errorMsg(String code) {
    switch (code) {
      case 'email-already-in-use':
        return 'An account already exists with this email.';
      case 'invalid-email':
        return 'Invalid email address.';
      case 'weak-password':
        return 'Password is too weak.';
      default:
        return 'Registration failed. Please try again.';
    }
  }

  void _showMsg(String msg, {bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg),
      backgroundColor: isError ? Colors.red : Colors.green,
    ));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: AppBar(
        title: const Text('Create Account'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const SizedBox(height: 8),
            const Text('Register as a Driver',
                style:
                    TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const Text(
                'Your details will be saved for future payments',
                style: TextStyle(color: Colors.grey, fontSize: 13)),
            const SizedBox(height: 24),
            _field(_nameCtrl, 'Full Name *', Icons.person_outline,
                caps: TextCapitalization.words),
            const SizedBox(height: 12),
            _field(_nicCtrl, 'NIC Number *', Icons.credit_card,
                caps: TextCapitalization.characters),
            const SizedBox(height: 12),
            _field(_phoneCtrl, 'Phone Number (optional)',
                Icons.phone_outlined,
                type: TextInputType.phone),
            const SizedBox(height: 12),
            _field(_emailCtrl, 'Email *', Icons.email_outlined,
                type: TextInputType.emailAddress),
            const SizedBox(height: 12),
            TextField(
              controller: _passwordCtrl,
              obscureText: _obscure,
              decoration: InputDecoration(
                labelText: 'Password *',
                border: const OutlineInputBorder(),
                prefixIcon: const Icon(Icons.lock_outline),
                filled: true,
                fillColor: Colors.white,
                suffixIcon: IconButton(
                  icon: Icon(
                      _obscure ? Icons.visibility : Icons.visibility_off),
                  onPressed: () => setState(() => _obscure = !_obscure),
                ),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _confirmCtrl,
              obscureText: true,
              decoration: const InputDecoration(
                labelText: 'Confirm Password *',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.lock_outline),
                filled: true,
                fillColor: Colors.white,
              ),
            ),
            const SizedBox(height: 24),
            _loading
                ? const Center(child: CircularProgressIndicator())
                : ElevatedButton(
                    onPressed: _register,
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8)),
                    ),
                    child: const Text('Create Account',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  ),
            const SizedBox(height: 16),
            Row(mainAxisAlignment: MainAxisAlignment.center, children: [
              const Text('Already have an account? '),
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Login'),
              ),
            ]),
          ],
        ),
      ),
    );
  }

  Widget _field(
    TextEditingController ctrl,
    String label,
    IconData icon, {
    TextCapitalization caps = TextCapitalization.none,
    TextInputType type = TextInputType.text,
  }) =>
      TextField(
        controller: ctrl,
        textCapitalization: caps,
        keyboardType: type,
        decoration: InputDecoration(
          labelText: label,
          border: const OutlineInputBorder(),
          prefixIcon: Icon(icon),
          filled: true,
          fillColor: Colors.white,
        ),
      );

  @override
  void dispose() {
    _nameCtrl.dispose();
    _nicCtrl.dispose();
    _phoneCtrl.dispose();
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    _confirmCtrl.dispose();
    super.dispose();
  }
}
