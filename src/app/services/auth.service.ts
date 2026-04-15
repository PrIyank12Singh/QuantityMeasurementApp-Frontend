import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AuthResponse {
  token: string;
  email: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = environment.authUrl;

  constructor(private http: HttpClient) {}

  signup(data: { name: string; email: string; password: string; mobile?: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/signup`, data).pipe(
      tap(res => this.storeSession(res))
    );
  }

  login(data: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, data).pipe(
      tap(res => this.storeSession(res))
    );
  }

  googleLogin(idToken: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/google`, { idToken }).pipe(
      tap(res => this.storeSession(res))
    );
  }

  private storeSession(res: AuthResponse): void {
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify({ email: res.email, name: res.name }));
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUser(): { email: string; name: string } | null {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}