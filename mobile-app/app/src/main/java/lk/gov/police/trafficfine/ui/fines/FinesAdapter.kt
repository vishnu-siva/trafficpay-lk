package com.slpolice.trafficfineapp.ui.fines

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.slpolice.trafficfineapp.databinding.ItemFineBinding
import com.slpolice.trafficfineapp.model.FineResponse

class FinesAdapter : RecyclerView.Adapter<FinesAdapter.FineViewHolder>() {

    private var fines: List<FineResponse> = emptyList()

    fun submitList(newList: List<FineResponse>) {
        fines = newList
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): FineViewHolder {
        val binding = ItemFineBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return FineViewHolder(binding)
    }

    override fun onBindViewHolder(holder: FineViewHolder, position: Int) {
        holder.bind(fines[position])
    }

    override fun getItemCount() = fines.size

    class FineViewHolder(private val binding: ItemFineBinding) :
        RecyclerView.ViewHolder(binding.root) {

        fun bind(fine: FineResponse) {
            binding.tvRef.text = fine.referenceNumber
            binding.tvDriver.text = fine.driverName ?: "Unknown"
            binding.tvVehicle.text = fine.vehicleNumber
            binding.tvAmount.text = "LKR %.2f".format(fine.amount)
            binding.tvDate.text = fine.issuedAt?.take(10) ?: "—"

            binding.tvStatus.text = fine.status
            val statusColor = when (fine.status.uppercase()) {
                "PAID" -> 0xFF4CAF50.toInt()
                "PENDING" -> 0xFFFF9800.toInt()
                else -> 0xFF9E9E9E.toInt()
            }
            binding.tvStatus.setBackgroundColor(statusColor)
        }
    }
}
