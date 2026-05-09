package com.slpolice.trafficfineapp.ui.payment

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.navigation.fragment.findNavController
import com.slpolice.trafficfineapp.R
import com.slpolice.trafficfineapp.databinding.FragmentPayFineBinding
import com.slpolice.trafficfineapp.model.FineResponse
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class PayFineFragment : Fragment() {

    private var _binding: FragmentPayFineBinding? = null
    private val binding get() = _binding!!
    private val viewModel: PayFineViewModel by viewModels()

    private var currentFineRef = ""
    private var currentCatId = ""

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentPayFineBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupPaymentMethodSpinner()

        binding.btnLookup.setOnClickListener {
            val ref = binding.etReferenceNumber.text.toString()
            val cat = binding.etCategoryId.text.toString()
            viewModel.lookupFine(ref, cat)
        }

        binding.btnPayNow.setOnClickListener {
            viewModel.payFine(
                referenceNumber = currentFineRef,
                categoryId = currentCatId,
                paidByName = binding.etPayerName.text.toString().trim(),
                paidByNic = binding.etPayerNic.text.toString().trim(),
                paymentMethod = binding.spinnerPaymentMethod.selectedItem?.toString() ?: "CASH"
            )
        }

        viewModel.lookupState.observe(viewLifecycleOwner) { state ->
            when (state) {
                is PayFineViewModel.LookupState.Initial -> {
                    binding.cardFineDetails.visibility = View.GONE
                    binding.cardPaymentDetails.visibility = View.GONE
                }
                is PayFineViewModel.LookupState.Loading -> {
                    binding.btnLookup.isEnabled = false
                    binding.progressLookup.visibility = View.VISIBLE
                    binding.cardFineDetails.visibility = View.GONE
                    binding.cardPaymentDetails.visibility = View.GONE
                }
                is PayFineViewModel.LookupState.Found -> {
                    binding.btnLookup.isEnabled = true
                    binding.progressLookup.visibility = View.GONE
                    val fine = state.fine
                    currentFineRef = fine.referenceNumber
                    currentCatId = fine.categoryId
                    showFineDetails(fine)
                }
                is PayFineViewModel.LookupState.Error -> {
                    binding.btnLookup.isEnabled = true
                    binding.progressLookup.visibility = View.GONE
                    Toast.makeText(requireContext(), state.message, Toast.LENGTH_LONG).show()
                }
            }
        }

        viewModel.paymentState.observe(viewLifecycleOwner) { state ->
            when (state) {
                is PayFineViewModel.PaymentState.Idle -> {
                    binding.btnPayNow.isEnabled = true
                    binding.progressPayment.visibility = View.GONE
                }
                is PayFineViewModel.PaymentState.Loading -> {
                    binding.btnPayNow.isEnabled = false
                    binding.progressPayment.visibility = View.VISIBLE
                }
                is PayFineViewModel.PaymentState.Success -> {
                    binding.progressPayment.visibility = View.GONE
                    val args = Bundle().apply {
                        putString("receiptNumber", state.payment.receiptNumber ?: "N/A")
                        putString("referenceNumber", state.payment.referenceNumber ?: currentFineRef)
                        putDouble("amount", state.payment.amount)
                        putBoolean("smsNotified", state.payment.smsNotified)
                        putString("paidAt", state.payment.paidAt ?: "")
                    }
                    findNavController().navigate(R.id.action_payFine_to_paymentSuccess, args)
                }
                is PayFineViewModel.PaymentState.Error -> {
                    binding.btnPayNow.isEnabled = true
                    binding.progressPayment.visibility = View.GONE
                    Toast.makeText(requireContext(), state.message, Toast.LENGTH_LONG).show()
                }
            }
        }
    }

    private fun showFineDetails(fine: FineResponse) {
        binding.cardFineDetails.visibility = View.VISIBLE
        binding.cardPaymentDetails.visibility = View.VISIBLE
        binding.tvFineRef.text = fine.referenceNumber
        binding.tvFineCategory.text = fine.categoryDescription ?: fine.categoryCode ?: fine.categoryId
        binding.tvVehicleNumber.text = fine.vehicleNumber
        binding.tvDriverName.text = fine.driverName ?: "—"
        binding.tvFineAmountDetail.text = "LKR %.2f".format(fine.amount)
        binding.tvFineStatus.text = fine.status
        binding.tvIssuedBy.text = fine.issuedByName ?: "—"
        binding.tvIssuedAt.text = fine.issuedAt?.take(10) ?: "—"
    }

    private fun setupPaymentMethodSpinner() {
        val methods = arrayOf("CASH", "CARD", "ONLINE_TRANSFER")
        val adapter = ArrayAdapter(requireContext(), android.R.layout.simple_spinner_item, methods)
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        binding.spinnerPaymentMethod.adapter = adapter
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
