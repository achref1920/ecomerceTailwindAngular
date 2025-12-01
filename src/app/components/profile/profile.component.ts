import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
    user: User = { id: 0, email: '', username: '', phone: 0 };
    error: string = '';
    success: string = '';
    isLoading: boolean = false; // Added for loading state

    constructor(
        private userService: UserService,
        private authService: AuthService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.loadUser();
    }

    loadUser(): void {
        if (!this.authService.isAuthenticated()) {
            this.error = 'Please log in to view your profile.';
            this.router.navigate(['/profile']);
            return;
        }

        this.isLoading = true;
        this.userService.getUser().subscribe({
            next: (user) => {
                if (user && user.id) {
                    this.user = user;
                } else {
                    this.error = 'User not found. Please log in again.';
                    this.router.navigate(['/profile']);
                }
                this.isLoading = false;
            },
            error: () => {
                this.error = 'Failed to load user data.';
                this.isLoading = false;
                this.router.navigate(['/profile']);
            }
        });
    }

    onSubmit(): void {
        this.error = '';
        this.success = '';
        this.isLoading = true;

        // Basic validation
        if (!this.user.email || !this.user.username || !this.user.phone) {
            this.error = 'All fields are required.';
            this.isLoading = false;
            return;
        }

        if (!this.isValidEmail(this.user.email)) {
            this.error = 'Please enter a valid email address.';
            this.isLoading = false;
            return;
        }

        if (this.user.phone < 0 || !Number.isInteger(this.user.phone)) {
            this.error = 'Please enter a valid phone number.';
            this.isLoading = false;
            return;
        }

        this.userService.updateUser(this.user).subscribe({
            next: () => {
                this.success = 'Profile updated successfully!';
                this.isLoading = false;
                localStorage.setItem('userName', this.user.username); // Update username in localStorage
                setTimeout(() => this.router.navigate(['/home']), 2000);
            },
            error: () => {
                this.error = 'Failed to update profile.';
                this.isLoading = false;
            }
        });
    }

    isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    cancel(): void {
        this.router.navigate(['/home']);
    }
}