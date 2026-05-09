import 'package:flutter/material.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import '../models/api_models.dart';

class PaymentSuccessScreen extends StatefulWidget {
  final PaymentResponse payment;
  final String fineRef;

  const PaymentSuccessScreen(
      {super.key, required this.payment, required this.fineRef});

  @override
  State<PaymentSuccessScreen> createState() => _PaymentSuccessScreenState();
}

class _PaymentSuccessScreenState extends State<PaymentSuccessScreen> {
  bool _downloading = false;

  Future<void> _downloadReceipt() async {
    setState(() => _downloading = true);
    try {
      final doc = pw.Document();
      doc.addPage(pw.Page(
        pageFormat: PdfPageFormat.a4,
        build: (context) => pw.Column(
          crossAxisAlignment: pw.CrossAxisAlignment.start,
          children: [
            pw.Container(
              width: double.infinity,
              color: PdfColors.blue900,
              padding: const pw.EdgeInsets.all(20),
              child: pw.Column(
                crossAxisAlignment: pw.CrossAxisAlignment.start,
                children: [
                  pw.Text('Sri Lanka Police Department',
                      style: pw.TextStyle(
                          color: PdfColors.white,
                          fontSize: 18,
                          fontWeight: pw.FontWeight.bold)),
                  pw.Text('Traffic Fine Payment Receipt',
                      style: const pw.TextStyle(
                          color: PdfColors.white, fontSize: 12)),
                ],
              ),
            ),
            pw.SizedBox(height: 24),
            pw.Text('PAYMENT RECEIPT',
                style: pw.TextStyle(
                    fontSize: 16, fontWeight: pw.FontWeight.bold)),
            pw.Divider(),
            pw.SizedBox(height: 12),
            _pdfRow('Receipt No', widget.payment.receiptNumber ?? 'N/A'),
            _pdfRow('Reference No', widget.fineRef),
            _pdfRow('Paid At',
                widget.payment.paidAt?.substring(0, 19).replaceAll('T', '  ') ?? '—'),
            pw.SizedBox(height: 16),
            pw.Divider(),
            pw.SizedBox(height: 12),
            pw.Row(
              mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
              children: [
                pw.Text('Amount Paid',
                    style: pw.TextStyle(
                        fontSize: 14, fontWeight: pw.FontWeight.bold)),
                pw.Text(
                    'LKR ${widget.payment.amount.toStringAsFixed(2)}',
                    style: pw.TextStyle(
                        fontSize: 18,
                        fontWeight: pw.FontWeight.bold,
                        color: PdfColors.red)),
              ],
            ),
            pw.SizedBox(height: 24),
            pw.Container(
              padding: const pw.EdgeInsets.all(12),
              decoration: pw.BoxDecoration(
                color: PdfColors.green50,
                border: pw.Border.all(color: PdfColors.green),
                borderRadius: const pw.BorderRadius.all(pw.Radius.circular(6)),
              ),
              child: pw.Text(
                'The issuing officer has been notified via SMS.\nPlease show this receipt to retrieve your license.',
                style: const pw.TextStyle(fontSize: 11),
              ),
            ),
          ],
        ),
      ));
      await Printing.layoutPdf(
        onLayout: (_) async => doc.save(),
        name: 'receipt-${widget.fineRef}.pdf',
      );
    } finally {
      if (mounted) setState(() => _downloading = false);
    }
  }

  pw.Widget _pdfRow(String label, String value) => pw.Padding(
        padding: const pw.EdgeInsets.only(bottom: 8),
        child: pw.Row(children: [
          pw.SizedBox(
              width: 120,
              child: pw.Text(label,
                  style: const pw.TextStyle(color: PdfColors.grey600))),
          pw.Text(value,
              style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
        ]),
      );

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
                _row('Receipt No.', widget.payment.receiptNumber ?? 'N/A', bold: true),
                _row('Reference No.', widget.payment.referenceNumber ?? widget.fineRef),
                _row('Paid At',
                    widget.payment.paidAt?.substring(0, 19).replaceAll('T', '  ') ?? '—'),
                const SizedBox(height: 12),
                const Divider(),
                const SizedBox(height: 12),
                Row(children: [
                  const Text('Amount Paid',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                  const Spacer(),
                  Text('LKR ${widget.payment.amount.toStringAsFixed(2)}',
                      style: const TextStyle(fontWeight: FontWeight.bold,
                          fontSize: 24, color: Colors.red)),
                ]),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: widget.payment.smsNotified
                        ? Colors.green.shade50
                        : Colors.orange.shade50,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: widget.payment.smsNotified ? Colors.green : Colors.orange,
                    ),
                  ),
                  child: Row(children: [
                    Icon(
                      widget.payment.smsNotified ? Icons.sms : Icons.sms_failed_outlined,
                      color: widget.payment.smsNotified ? Colors.green : Colors.orange,
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        widget.payment.smsNotified
                            ? 'SMS sent to the officer. You may retrieve your license.'
                            : 'SMS notification pending.',
                        style: TextStyle(
                          color: widget.payment.smsNotified
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

          OutlinedButton.icon(
            onPressed: _downloading ? null : _downloadReceipt,
            icon: _downloading
                ? const SizedBox(
                    width: 18, height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2))
                : const Icon(Icons.download),
            label: Text(_downloading ? 'Preparing...' : 'Download Receipt (PDF)'),
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 14),
              side: const BorderSide(color: Colors.blue),
              foregroundColor: Colors.blue,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8)),
            ),
          ),
          const SizedBox(height: 12),

          ElevatedButton(
            onPressed: () => Navigator.of(context)
                .pushNamedAndRemoveUntil('/', (route) => false),
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8)),
            ),
            child: const Text('Done', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
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
