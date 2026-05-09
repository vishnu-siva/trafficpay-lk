package com.slpolice.trafficfineapp.ui.payment

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import com.slpolice.trafficfineapp.R
import com.slpolice.trafficfineapp.databinding.FragmentPaymentSuccessBinding
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class PaymentSuccessFragment : Fragment() {

    private var _binding: FragmentPaymentSuccessBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentPaymentSuccessBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val args = requireArguments()
        binding.tvReceiptNumber.text = args.getString("receiptNumber", "N/A")
        binding.tvSuccessRef.text = args.getString("referenceNumber", "—")
        binding.tvSuccessAmount.text = "LKR %.2f".format(args.getDouble("amount", 0.0))
        binding.tvPaidAt.text = args.getString("paidAt", "").take(19).ifEmpty { "—" }
        val smsNotified = args.getBoolean("smsNotified", false)
        binding.tvSmsStatus.text = if (smsNotified) "Sent to officer ✓" else "Pending"
        binding.tvSmsStatus.setTextColor(
            if (smsNotified) requireContext().getColor(android.R.color.holo_green_dark)
            else requireContext().getColor(android.R.color.holo_orange_dark)
        )

        binding.btnDone.setOnClickListener {
            findNavController().popBackStack(R.id.loginFragment, false)
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
