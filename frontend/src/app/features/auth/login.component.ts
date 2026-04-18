import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    @if (errorMessage) {
      <div class="alert alert-danger">{{ errorMessage }}</div>
    }
    <form (ngSubmit)="onSubmit()">
      <div class="mb-2">
        <label>Email: </label>
        <input
          name="email"
          class="ms-2"
          [(ngModel)]="loginData.email"
          placeholder="Enter Email"
        />
      </div>
      <div>
        <label>Password: </label>
        <input
          name="password"
          type="password"
          class="ms-2"
          [(ngModel)]="loginData.password"
          placeholder="Password"
        />
      </div>
      <button type="submit" class="btn btn-primary">Submit</button>
    </form>
  `,
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  errorMessage: string = '';
  loginData = { email: '', password: '' };
  onSubmit() {
    this.authService
      .login(this.loginData.email, this.loginData.password)
      .subscribe({
        next: (token: string) => {
          this.authService.saveToken(token);
          localStorage.setItem('userEmail', this.loginData.email);
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.error('Unable to Login', err);
          this.errorMessage = 'Invalid Email or Password';
        },
      });
  }
}
