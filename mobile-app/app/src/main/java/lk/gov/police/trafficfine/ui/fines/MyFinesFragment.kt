package com.slpolice.trafficfineapp.ui.fines

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.recyclerview.widget.LinearLayoutManager
import com.google.android.material.tabs.TabLayout
import com.slpolice.trafficfineapp.databinding.FragmentMyFinesBinding
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MyFinesFragment : Fragment() {

    private var _binding: FragmentMyFinesBinding? = null
    private val binding get() = _binding!!
    private val viewModel: MyFinesViewModel by viewModels()
    private val adapter = FinesAdapter()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentMyFinesBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.rvFines.layoutManager = LinearLayoutManager(requireContext())
        binding.rvFines.adapter = adapter

        viewModel.loadFines("PENDING")

        binding.tabLayout.addOnTabSelectedListener(object : TabLayout.OnTabSelectedListener {
            override fun onTabSelected(tab: TabLayout.Tab?) {
                val status = if (tab?.position == 0) "PENDING" else "PAID"
                viewModel.loadFines(status)
            }
            override fun onTabUnselected(tab: TabLayout.Tab?) {}
            override fun onTabReselected(tab: TabLayout.Tab?) {}
        })

        viewModel.fines.observe(viewLifecycleOwner) { fines ->
            adapter.submitList(fines)
        }

        viewModel.loading.observe(viewLifecycleOwner) { loading ->
            binding.progressBar.visibility = if (loading) View.VISIBLE else View.GONE
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
