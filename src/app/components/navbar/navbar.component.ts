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
      // Optional: Subscribe to a cart service for real-time updates
      // e.g., this.cartService.cartCount$.subscribe(count => this.cartCount = count);
    }
  }

  isLoggedIn(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return !!localStorage.getItem('token');
    }
    return false;
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      localStorage.removeItem('cartCount');
      this.cartCount = 0;
      this.userName = '';
      this.closeDropdown();
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

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const dropdown = document.querySelector('.nav-dropdown');
    if (dropdown && !dropdown.contains(target)) {
      this.closeDropdown();
    }
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      // Navigate to search results page with query parameter
      this.router.navigate(['/search'], { queryParams: { q: this.searchQuery } });
    }
  }
}