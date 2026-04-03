import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';

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
    fullName: '',
    email: '',
    password: '',
    mobile: ''
  };

  loginData = {
    email: '',
    password: ''
  };

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Initialize Google login
    google.accounts.id.initialize({
      client_id: '481397534301-3r9dl62f6m2ij565i79463d5276ig2oh.apps.googleusercontent.com',
      callback: (response: any) => {
        const token = response.credential;

        this.authService.googleLogin(token).subscribe({
          next: (res: any) => {
            localStorage.setItem('token', res.token); // ✅ Store Google token
            alert('Google login success');
          },
          error: () => alert('Google login failed')
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
    this.authService.signup(this.signupData).subscribe({
      next: () => {
        alert('Signup success');
        this.isLogin = true;
      },
      error: () => alert('Signup failed')
    });
  }

  // Normal Login
  onLogin() {
    this.authService.login(this.loginData).subscribe({
      next: (res: any) => {
        localStorage.setItem('token', res.token); // ✅ Store login token
        alert('Login success');
      },
      error: () => alert('Login failed')
    });
  }

  // Toggle login/signup
  toggleForm() {
    this.isLogin = !this.isLogin;
  }
}