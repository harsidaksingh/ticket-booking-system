import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private loginUrl = 'http://localhost:3000/auth/login';
  private registerUrl = 'http://localhost:3000/auth/registerUser';
  login(email: string, password: string) {
    return this.http
      .post<{
        message: string;
        token: string;
      }>(this.loginUrl, { email, password })
      .pipe(map((response) => response.token));
  }
  register(name: string, email: string, password: string) {
    return this.http.post<{ message: string }>(this.registerUrl, {
      name,
      email,
      password,
    });
  }
  saveToken(token: string) {
    localStorage.setItem('jwt_token', token);
  }
  getToken() {
    return localStorage.getItem('jwt_token');
  }
  isLoggedIn(): boolean {
    return !!localStorage.getItem('jwt_token');
  }
  logout() {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('userEmail');
    this.router.navigate(['/login']);
  }
}
