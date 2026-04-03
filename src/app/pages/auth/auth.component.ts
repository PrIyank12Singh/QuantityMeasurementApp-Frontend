import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

declare const google: any;

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {

  isLogin = true;
  loading = false;
  errorMsg = '';

  loginData = { email: '', password: '' };

  signupData = { name: '', email: '', password: '', confirmPassword: '', mobile: '' };

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.initGoogle();
  }

  private initGoogle(): void {
    if (typeof google === 'undefined') return;

    google.accounts.id.initialize({
      client_id: '481397534301-3r9dl62f6m2ij565i79463d5276ig2oh.apps.googleusercontent.com',
      callback: (response: any) => this.handleGoogleCallback(response)
    });

    google.accounts.id.renderButton(
      document.getElementById('google-btn'),
      { theme: 'outline', size: 'large', width: 300 }  // ← change '100%' to 300
    );
  }

  private handleGoogleCallback(response: any): void {
    this.loading = true;
    this.errorMsg = '';
    this.authService.googleLogin(response.credential).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.errorMsg = err.error?.message || 'Google login failed';
        this.loading = false;
      }
    });
  }

  onLogin(): void {
    if (!this.loginData.email || !this.loginData.password) {
      this.errorMsg = 'Please fill in all fields';
      return;
    }
    this.loading = true;
    this.errorMsg = '';
    this.authService.login(this.loginData).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.errorMsg = err.error?.message || 'Invalid credentials';
        this.loading = false;
      }
    });
  }

  onSignup(): void {
    if (!this.signupData.name || !this.signupData.email || !this.signupData.password) {
      this.errorMsg = 'Please fill in all required fields';
      return;
    }
    if (this.signupData.password !== this.signupData.confirmPassword) {
      this.errorMsg = 'Passwords do not match';
      return;
    }
    if (this.signupData.password.length < 6) {
      this.errorMsg = 'Password must be at least 6 characters';
      return;
    }
    this.loading = true;
    this.errorMsg = '';
    this.authService.signup(this.signupData).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.errorMsg = err.error?.message || 'Signup failed';
        this.loading = false;
      }
    });
  }

  toggleForm(): void {
    this.isLogin = !this.isLogin;
    this.errorMsg = '';
    this.loading = false;
  }
}