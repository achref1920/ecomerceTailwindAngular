import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { Address } from '../../models/address.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AddressService } from '../../services/address.service';
import { ApiResponse } from '../../models/api.response';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-address',
  standalone: false,
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.css']
})
export class AddressComponent {
  addresses: Address[] = [];
  addressForm: FormGroup;
  showAddModal: boolean = false;
  showEditModal: boolean = false;
  isEditMode: boolean = false;
  currentAddressId: number | null = null;
  errorMessage: string | null = null;
  token: string | null = null;

  constructor(
    private addressService: AddressService,
    private fb: FormBuilder,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.token = localStorage.getItem('token');
    }

    this.addressForm = this.fb.group({
      streetAddress: ['', [Validators.required, Validators.minLength(3)]],
      city: ['', [Validators.required, Validators.minLength(2)]],
      state: ['', [Validators.required, Validators.minLength(2)]],
      zipCode: ['', [Validators.required, Validators.pattern(/^\d{4}(-\d{4})?$/)]],
      country: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  ngOnInit(): void {
    this.loadAddresses();
  }

  loadAddresses(): void {
    if (!this.token) {
      if (isPlatformBrowser(this.platformId)) {
        this.errorMessage = 'Please log in to view your addresses.';
      }
      return;
    }
    this.addressService.getAllAddressesForUser(this.token).subscribe({
      next: (response: ApiResponse<any>) => {
        if (response.status === true && response.data) {
          this.addresses = response.data;
          this.errorMessage = null;
        } else {
          this.errorMessage = response.message || 'Failed to fetch addresses.';
        }
      },
      error: (error: any) => {
        this.errorMessage = error.message || 'An error occurred while fetching addresses.';
        console.error('Error fetching addresses:', error);
      }
    });
  }

  openAddAddressModal(): void {
    this.isEditMode = false;
    this.currentAddressId = null;
    this.addressForm.reset();
    this.showAddModal = true;
  }

  openEditAddressModal(address: Address): void {
    this.isEditMode = true;
    this.currentAddressId = address.id;
    this.addressForm.patchValue(address);
    this.showEditModal = true;
  }

  closeModal(): void {
    this.showAddModal = false;
    this.showEditModal = false;
    this.addressForm.reset();
    this.errorMessage = null;
  }

  saveAddress(): void {
    if (this.addressForm.valid && this.token) {
      const addressData: Address = this.addressForm.value;
      if (this.isEditMode && this.currentAddressId) {
        this.addressService.updateAddress(this.currentAddressId, addressData, this.token).subscribe({
          next: (response: ApiResponse<any>) => {
            if (response.status === true) {
              this.closeModal();
              this.loadAddresses();
            } else {
              this.errorMessage = response.message || 'Failed to update address.';
            }
          },
          error: (error: any) => {
            this.errorMessage = error.message || 'An error occurred while updating the address.';
            console.error('Error updating address:', error);
          }
        });
      } else {
        this.addressService.addAddress(addressData, this.token).subscribe({
          next: (response: ApiResponse<any>) => {
            if (response.status === true) {
              this.closeModal();
              this.loadAddresses();
            } else {
              this.errorMessage = response.message || 'Failed to add address.';
            }
          },
          error: (error: any) => {
            this.errorMessage = error.message || 'An error occurred while adding the address.';
            console.error('Error adding address:', error);
          }
        });
      }
    }
  }

  deleteAddress(addressId: number): void {
    if (!confirm('Are you sure you want to delete this address?') || !this.token) {
      if (!this.token && isPlatformBrowser(this.platformId)) {
        this.errorMessage = 'Please log in to delete addresses.';
      }
      return;
    }
    this.addressService.deleteAddress(addressId, this.token).subscribe({
      next: (response: ApiResponse<any>) => {
        if (response.status === true) {
          this.loadAddresses();
          this.errorMessage = null;
        } else {
          this.errorMessage = response.message || 'Failed to delete address.';
        }
      },
      error: (error: any) => {
        this.errorMessage = error.message || 'An error occurred while deleting the address.';
        console.error('Error deleting address:', error);
      }
    });
  }
}