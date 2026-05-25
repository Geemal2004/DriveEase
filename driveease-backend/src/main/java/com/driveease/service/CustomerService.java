package com.driveease.service;

import com.driveease.dto.CustomerRequest;
import com.driveease.dto.CustomerResponse;
import com.driveease.model.Customer;
import com.driveease.repository.CustomerRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public CustomerResponse createCustomer(CustomerRequest request) {
        Customer customer = Customer.builder()
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .email(request.getEmail())
                .nicOrPassport(request.getNicOrPassport())
                .drivingLicenseNo(request.getDrivingLicenseNo())
                .build();

        Customer savedCustomer = customerRepository.save(customer);
        return CustomerResponse.fromEntity(savedCustomer);
    }

    public List<CustomerResponse> getAllCustomers() {
        return customerRepository.findAll()
                .stream()
                .map(CustomerResponse::fromEntity)
                .toList();
    }

    public CustomerResponse getCustomerById(Long id) {
        Customer customer = getCustomerEntityById(id);
        return CustomerResponse.fromEntity(customer);
    }

    public CustomerResponse updateCustomer(Long id, CustomerRequest request) {
        Customer customer = getCustomerEntityById(id);

        customer.setFullName(request.getFullName());
        customer.setPhone(request.getPhone());
        customer.setEmail(request.getEmail());
        customer.setNicOrPassport(request.getNicOrPassport());
        customer.setDrivingLicenseNo(request.getDrivingLicenseNo());

        Customer updatedCustomer = customerRepository.save(customer);
        return CustomerResponse.fromEntity(updatedCustomer);
    }

    public void deleteCustomer(Long id) {
        Customer customer = getCustomerEntityById(id);
        customerRepository.delete(customer);
    }

    private Customer getCustomerEntityById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + id));
    }
}
