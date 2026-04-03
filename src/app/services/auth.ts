import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient) {}

  signup(data: any) {
    return this.http.post(`${this.baseUrl}/signup`, data);
  }

  login(data: any) {
    return this.http.post(`${this.baseUrl}/login`, data);
  }

  googleLogin(token: string) {
    return this.http.post(`${this.baseUrl}/google`, { token });
  }
}