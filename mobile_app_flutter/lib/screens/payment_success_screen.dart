import 'package:flutter/material.dart';
import '../models/api_models.dart';

class PaymentSuccessScreen extends StatelessWidget {
  final PaymentResponse payment;
  final String fineRef;

  const PaymentSuccessScreen(
      {super.key, required this.payment, required this.fineRef});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: AppBar(
        title: const Text('Payment Successful'),
        backgroundColor: Colors.green,
        foregroundColor: Colors.white,
        automaticallyImplyLeading: false,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          const SizedBox(height: 16),

          // Success icon
          Center(
            child: Container(
              width: 90,
              height: 90,
              decoration: const BoxDecoration(
                  color: Colors.green, shape: BoxShape.circle),
              child: const Icon(Icons.check, color: Colors.white, size: 52),
            ),
          ),
          const SizedBox(height: 20),
          const Text('Payment Successful!',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold,
                  color: Colors.green)),
          const SizedBox(height: 8),
          const Text(
              'Your fine has been paid.\nShow this receipt to the officer to retrieve your license.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey, fontSize: 14)),
          const SizedBox(height: 32),

          // Receipt card
          Card(
            elevation: 4,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Row(children: [
                  const Icon(Icons.receipt_long, color: Colors.blue),
                  const SizedBox(width: 8),
                  const Text('Payment Receipt',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                ]),
                const SizedBox(height: 16),
                const Divider(),
                const SizedBox(height: 8),
                _row('Receipt No.', payment.receiptNumber ?? 'N/A', bold: true),
                _row('Reference No.', payment.referenceNumber ?? fineRef),
                _row('Paid At',
                    payment.paidAt?.substring(0, 19).replaceAll('T', '  ') ?? '—'),
                const SizedBox(height: 12),
                const Divider(),
                const SizedBox(height: 12),
                Row(children: [
                  const Text('Amount Paid',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                  const Spacer(),
                  Text('LKR ${payment.amount.toStringAsFixed(2)}',
                      style: const TextStyle(fontWeight: FontWeight.bold,
                          fontSize: 24, color: Colors.red)),
                ]),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: payment.smsNotified
                        ? Colors.green.shade50
                        : Colors.orange.shade50,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: payment.smsNotified ? Colors.green : Colors.orange,
                    ),
                  ),
                  child: Row(children: [
                    Icon(
                      payment.smsNotified ? Icons.sms : Icons.sms_failed_outlined,
                      color: payment.smsNotified ? Colors.green : Colors.orange,
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        payment.smsNotified
                            ? 'SMS sent to the officer. You may retrieve your license.'
                            : 'SMS notification pending.',
                        style: TextStyle(
                          color: payment.smsNotified
                              ? Colors.green.shade700
                              : Colors.orange.shade700,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ]),
                ),
              ]),
            ),
          ),
          const SizedBox(height: 32),

          ElevatedButton(
            onPressed: () =>
                Navigator.of(context).popUntil((route) => route.isFirst),
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 16),
              backgroundColor: Colors.blue,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8)),
            ),
            child: const Text('Done', style: TextStyle(fontSize: 16)),
          ),
        ]),
      ),
    );
  }

  Widget _row(String label, String value, {bool bold = false}) => Padding(
    padding: const EdgeInsets.only(bottom: 10),
    child: Row(children: [
      SizedBox(
          width: 110,
          child: Text(label, style: const TextStyle(color: Colors.grey))),
      Expanded(
          child: Text(value,
              style: TextStyle(
                  fontWeight:
                      bold ? FontWeight.bold : FontWeight.normal))),
    ]),
  );
}
