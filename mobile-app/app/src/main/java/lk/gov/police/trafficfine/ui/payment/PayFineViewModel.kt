package com.slpolice.trafficfineapp.ui.payment

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.slpolice.trafficfineapp.model.FineResponse
import com.slpolice.trafficfineapp.model.InitiatePaymentRequest
import com.slpolice.trafficfineapp.model.PaymentResponse
import com.slpolice.trafficfineapp.network.ApiService
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class PayFineViewModel @Inject constructor(private val api: ApiService) : ViewModel() {

    private val _lookupState = MutableLiveData<LookupState>(LookupState.Initial)
    val lookupState: LiveData<LookupState> = _lookupState

    private val _paymentState = MutableLiveData<PaymentState>(PaymentState.Idle)
    val paymentState: LiveData<PaymentState> = _paymentState

    fun lookupFine(referenceNumber: String, categoryId: String) {
        if (referenceNumber.isBlank() || categoryId.isBlank()) {
            _lookupState.value = LookupState.Error("Enter both reference number and category ID")
            return
        }
        _lookupState.value = LookupState.Loading
        viewModelScope.launch {
            try {
                val response = api.lookupFine(referenceNumber.trim(), categoryId.trim())
                if (response.isSuccessful && response.body() != null) {
                    _lookupState.value = LookupState.Found(response.body()!!)
                } else {
                    _lookupState.value = LookupState.Error("Fine not found. Check reference number and category ID.")
                }
            } catch (e: Exception) {
                _lookupState.value = LookupState.Error("Network error: ${e.message}")
            }
        }
    }

    fun payFine(
        referenceNumber: String,
        categoryId: String,
        paidByName: String,
        paidByNic: String,
        paymentMethod: String
    ) {
        if (paidByName.isBlank() || paidByNic.isBlank()) {
            _paymentState.value = PaymentState.Error("Enter your name and NIC number")
            return
        }
        _paymentState.value = PaymentState.Loading
        viewModelScope.launch {
            try {
                val initiateResponse = api.initiatePayment(
                    InitiatePaymentRequest(
                        referenceNumber = referenceNumber,
                        categoryId = categoryId,
                        paymentMethod = paymentMethod,
                        paymentChannel = "MOBILE_APP",
                        paidByName = paidByName,
                        paidByNic = paidByNic
                    )
                )
                if (!initiateResponse.isSuccessful || initiateResponse.body() == null) {
                    _paymentState.value = PaymentState.Error("Payment initiation failed. Please try again.")
                    return@launch
                }
                val paymentId = initiateResponse.body()!!.paymentId
                val confirmResponse = api.confirmPayment(mapOf("paymentId" to paymentId))
                if (confirmResponse.isSuccessful && confirmResponse.body() != null) {
                    _paymentState.value = PaymentState.Success(confirmResponse.body()!!)
                } else {
                    _paymentState.value = PaymentState.Error("Payment confirmation failed. Contact officer.")
                }
            } catch (e: Exception) {
                _paymentState.value = PaymentState.Error("Network error: ${e.message}")
            }
        }
    }

    sealed class LookupState {
        object Initial : LookupState()
        object Loading : LookupState()
        data class Found(val fine: FineResponse) : LookupState()
        data class Error(val message: String) : LookupState()
    }

    sealed class PaymentState {
        object Idle : PaymentState()
        object Loading : PaymentState()
        data class Success(val payment: PaymentResponse) : PaymentState()
        data class Error(val message: String) : PaymentState()
    }
}
