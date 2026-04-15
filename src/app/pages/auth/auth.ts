import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

declare const google: any;

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './auth.html',
  styleUrls: ['./auth.css']
})
export class AuthComponent implements OnInit {

  isLogin = true;

  signupData = {
    name: '',
    email: '',
    password: '',
    mobile: ''
  };

  loginData = {
    email: '',
    password: ''
  };

  isLoading = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Initialize Google login
    google.accounts.id.initialize({
      client_id: '481397534301-3r9dl62f6m2ij565i79463d5276ig2oh.apps.googleusercontent.com',
      callback: (response: any) => {
        const token = response.credential;

        this.isLoading = true;
        this.authService.googleLogin(token).subscribe({
          next: (res: any) => {
            localStorage.setItem('token', res.token); // ✅ Store Google token
            alert('Google login success');
            this.isLoading = false;
          },
          error: () => {
            this.isLoading = false;
            alert('Google login failed');
          }
        });
      }
    });

    google.accounts.id.renderButton(
      document.getElementById("google-btn"),
      { theme: "outline", size: "large" }
    );
  }

  // Normal Signup
  onSignup() {
    if (this.isLoading) return;
    this.isLoading = true;

    this.authService.signup(this.signupData).subscribe({
      next: () => {
        alert('Signup success');
        this.isLoading = false;
        this.isLogin = true;
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 429) {
          alert('Too many requests. Please wait a moment.');
        } else {
          alert('Signup failed');
        }
      }
    });
  }

  // Normal Login
  onLogin() {
    if (this.isLoading) return;
    this.isLoading = true;

    this.authService.login(this.loginData).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        localStorage.setItem('token', res.token); // ✅ Store login token
        alert('Login success');
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 429) {
          alert('Too many requests. Please wait a moment.');
        } else {
          alert('Login failed');
        }
      }
    });
  }

  // Toggle login/signup
  toggleForm() {
    this.isLogin = !this.isLogin;
  }
}