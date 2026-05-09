import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../models/api_models.dart';
import '../services/firebase_service.dart';

class MyFinesScreen extends StatefulWidget {
  const MyFinesScreen({super.key});
  @override
  State<MyFinesScreen> createState() => _MyFinesScreenState();
}

class _MyFinesScreenState extends State<MyFinesScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _firebaseService = FirebaseService();
  String _currentStatus = 'PENDING';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _tabController.addListener(() {
      if (!_tabController.indexIsChanging) {
        setState(() => _currentStatus = _tabController.index == 0 ? 'PENDING' : 'PAID');
      }
    });
  }

  Color _statusColor(String status) {
    switch (status.toUpperCase()) {
      case 'PAID':    return Colors.green;
      case 'PENDING': return Colors.orange;
      default:        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    final uid = FirebaseAuth.instance.currentUser?.uid ?? '';

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Issued Fines'),
        backgroundColor: Colors.blue,
        foregroundColor: Colors.white,
        bottom: TabBar(
          controller: _tabController,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          indicatorColor: Colors.white,
          tabs: const [Tab(text: 'Pending'), Tab(text: 'Paid')],
        ),
      ),
      body: StreamBuilder<List<FineResponse>>(
        stream: _firebaseService.getMyFinesStream(uid, _currentStatus),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }
          final fines = snapshot.data ?? [];
          if (fines.isEmpty) {
            return Center(
              child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                Icon(Icons.inbox_outlined, size: 64, color: Colors.grey.shade300),
                const SizedBox(height: 12),
                Text('No $_currentStatus fines found',
                    style: const TextStyle(color: Colors.grey)),
              ]),
            );
          }
          return ListView.builder(
            padding: const EdgeInsets.all(12),
            itemCount: fines.length,
            itemBuilder: (_, i) => _FineCard(fine: fines[i], statusColor: _statusColor(fines[i].status)),
          );
        },
      ),
    );
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }
}

class _FineCard extends StatelessWidget {
  final FineResponse fine;
  final Color statusColor;
  const _FineCard({required this.fine, required this.statusColor});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Expanded(
              child: Text(fine.referenceNumber,
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                  color: statusColor, borderRadius: BorderRadius.circular(12)),
              child: Text(fine.status,
                  style: const TextStyle(color: Colors.white, fontSize: 11,
                      fontWeight: FontWeight.bold)),
            ),
          ]),
          const SizedBox(height: 8),
          if (fine.categoryDescription != null)
            Text(fine.categoryDescription!,
                style: TextStyle(color: Colors.grey.shade600, fontSize: 13)),
          const SizedBox(height: 4),
          Row(children: [
            const Icon(Icons.person_outline, size: 14, color: Colors.grey),
            const SizedBox(width: 4),
            Text(fine.driverName ?? 'Unknown',
                style: const TextStyle(fontSize: 13)),
            const SizedBox(width: 12),
            const Icon(Icons.directions_car_outlined, size: 14, color: Colors.grey),
            const SizedBox(width: 4),
            Text(fine.vehicleNumber, style: const TextStyle(fontSize: 13)),
          ]),
          const SizedBox(height: 6),
          Row(children: [
            Text(fine.issuedAt?.substring(0, 10) ?? '—',
                style: const TextStyle(fontSize: 12, color: Colors.grey)),
            const Spacer(),
            Text('LKR ${fine.amount.toStringAsFixed(2)}',
                style: const TextStyle(fontWeight: FontWeight.bold,
                    fontSize: 16, color: Colors.red)),
          ]),
        ]),
      ),
    );
  }
}
