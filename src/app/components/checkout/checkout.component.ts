import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

import { Cart } from '../../models/cart.model';
import { Address } from '../../models/address.model';
import { User } from '../../models/user.model';
import { ApiResponse } from '../../models/api.response';
import { PaymentStatus } from '../../models/payment-status.enum';
import { CartService } from '../../services/cart.service';
import { AddressService } from '../../services/address.service';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-checkout',
  standalone: false,
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  cart: Cart = { id: 0, cartItems: [], totalPrice: 0 };
  addresses: Address[] = [];
  selectedAddress: Address | null = null;
  token: string | null = null;
  selectedPaymentMethod: string = 'cashOnDelivery';
  user: User | null = null;
  errorMessage: string | null = null;

  cardNumber: string = '';
  cardCVV: string = '';
  cardExpiry: string = '';
  cardholderName: string = '';

  currentView: 'shipping' | 'payment' | 'confirmation' = 'shipping';

  constructor(
    private cartService: CartService,
    private addressService: AddressService,
    private orderService: OrderService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.token = localStorage.getItem('token');
    }
  }

  ngOnInit(): void {
    this.getCart();
    this.loadAddresses();
    this.getUser();
  }

  redirectToAddAddress(): void {
    this.router.navigate(['/addresses']);
  }

  getUser(): void {
    if (isPlatformBrowser(this.platformId)) {
      const userData = localStorage.getItem('user');
      if (userData) {
        this.user = JSON.parse(userData);
      }
    }
  }

  getCart(): void {
    if (!this.token) {
      if (isPlatformBrowser(this.platformId)) {
        alert('Please log in to view the cart.');
      }
      this.router.navigate(['/sign-in']);
      return;
    }

    this.cartService.getCart(this.token).subscribe({
      next: (response: ApiResponse<Cart>) => {
        if (response.status === true && response.data) {
          this.cart = response.data;
        } else {
          this.errorMessage = response.message || 'An error occurred while fetching the cart.';
        }
      },
      error: (error: any) => {
        this.errorMessage = error.message || 'An error occurred while fetching the cart.';
        console.error("Error fetching cart:", error);
      }
    });
  }

  loadAddresses(): void {
    if (!this.token) {
      if (isPlatformBrowser(this.platformId)) {
        alert('Please log in to view the cart.');
      }
      this.router.navigate(['/sign-in']);
      return;
    }
    this.addressService.getAllAddressesForUser(this.token).subscribe({
      next: (response: ApiResponse<Address[]>) => {
        if (response.status === true && response.data) {
          this.addresses = response.data;
        } else {
          this.errorMessage = response.message || 'An error occurred while fetching addresses.';
        }
      },
      error: (error: any) => {
        this.errorMessage = error.message || 'An error occurred while fetching addresses.';
        console.error("Error fetching addresses:", error);
      }
    });
  }

  onConfirmOrder(): void {
    if (!this.selectedAddress) {
      if (isPlatformBrowser(this.platformId)) {
        alert('Please select a shipping address.');
      }
      return;
    }
  
    const addressId = this.selectedAddress.id;
  
    const paymentData = {
      paymentMethod: this.selectedPaymentMethod,
      paymentStatus: PaymentStatus.SUCCESS,
      cardNumber: this.cardNumber,
      cardCVV: this.cardCVV,
      cardExpiry: this.cardExpiry,
      cardholderName: this.cardholderName
    };
  
    this.placeOrder(addressId, paymentData);
    this.changeView('confirmation');
  }

  placeOrder(addressId: number, paymentData: any): void {
    if (!this.token) {
      if (isPlatformBrowser(this.platformId)) {
        alert('User not authenticated. Please log in.');
      }
      this.router.navigate(['/sign-in']);
      return;
    }

    this.orderService.createOrder(this.token, addressId, paymentData).subscribe({
      next: (response: ApiResponse<any>) => {
        if (response.status === true) {
          if (isPlatformBrowser(this.platformId)) {
            alert('Order placed successfully!');
          }
          this.router.navigate(['/orders']);
        } else {
          this.errorMessage = response.message || 'An error occurred while placing the order.';
        }
      },
      error: (error: any) => {
        this.errorMessage = error.message || 'An error occurred while placing the order.';
        console.error("Error placing order:", error);
      }
    });
  }

  changeView(view: 'shipping' | 'payment' | 'confirmation'): void {
    this.currentView = view;
  }
}