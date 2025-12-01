import { Component, HostListener, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  userName: string = '';
  cartCount: number = 0;
  searchQuery: string = '';
  isDropdownOpen: boolean = false;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.userName = localStorage.getItem('userName') || 'Guest';
      this.cartCount = Number(localStorage.getItem('cartCount')) || 0;
    }
  }

  isLoggedIn(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return !!localStorage.getItem('token');
    }
    return false;
  }

  logout(event: Event): void {
    event.stopPropagation(); // Prevent click from bubbling to document
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      localStorage.removeItem('cartCount');
      this.cartCount = 0;
      this.userName = '';
      this.isDropdownOpen = false; // Close dropdown after logout
      this.router.navigate(['/sign-in']);
    }
  }

  isHomePage(): boolean {
    return this.router.url === '/home';
  }

  isCartPage(): boolean {
    return this.router.url.includes('/my-cart');
  }

  isCheckoutPage(): boolean {
    return this.router.url.includes('/checkout');
  }

  isOrdersPage(): boolean {
    return this.router.url.includes('/orders');
  }

  isLoginPage(): boolean {
    return this.router.url.includes('/sign-in');
  }

  isSignupPage(): boolean {
    return this.router.url.includes('/sign-up');
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation(); // Prevent click from bubbling to document
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const dropdown = document.querySelector('.nav-dropdown');
    const logoutLink = target.closest('a.text-red-600');

    // Do not close dropdown if clicking logout link
    if (logoutLink) {
      return;
    }

    // Close dropdown if clicking outside
    if (dropdown && !dropdown.contains(target)) {
      this.closeDropdown();
    }
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: this.searchQuery } });
    }
  }
}