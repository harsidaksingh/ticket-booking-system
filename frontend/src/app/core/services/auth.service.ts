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
  private logoutUrl = 'http://localhost:3000/auth/logout';
  login(email: string, password: string) {
    return this.http.post<{
      message: string;
    }>(this.loginUrl, { email, password });
  }
  register(name: string, email: string, password: string) {
    return this.http.post<{ message: string }>(this.registerUrl, {
      name,
      email,
      password,
    });
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('userEmail');
  }
  logout() {
    return this.http.post<{ message: string }>(this.logoutUrl, {}).subscribe({
      next: () => {
        localStorage.removeItem('userEmail');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        localStorage.removeItem('userEmail');
        this.router.navigate(['/login']);
      },
    });
  }
}
