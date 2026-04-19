import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="row justify-content-center mt-5">
      <div class="col-md-6 col-lg-4">
        <div class="card p-4 shadow-lg border-0 mt-5">
          <h3 class="text-center fw-bold mb-4">Welcome Back</h3>

          @if (errorMessage) {
            <div class="alert alert-danger px-3 py-2">{{ errorMessage }}</div>
          }

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <!-- Floating Email Input -->
            <div class="form-floating mb-3">
              <input
                type="email"
                class="form-control bg-dark"
                id="email"
                placeholder="name@example.com"
                formControlName="email"
              />
              <label for="email">Email address</label>
            </div>

            <!-- Floating Password Input -->
            <div class="form-floating mb-4">
              <input
                type="password"
                class="form-control bg-dark"
                id="password"
                placeholder="Password"
                formControlName="password"
              />
              <label for="password">Password</label>
            </div>

            <button
              type="submit"
              class="btn btn-primary w-100 py-2"
              [disabled]="loginForm.invalid"
            >
              Sign In
            </button>
          </form>

          <div class="text-center mt-4">
            <p class="text-muted mb-0">
              Don't have an account?
              <a
                routerLink="/register"
                class="text-primary text-decoration-none fw-bold"
                >Register</a
              >
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);
  errorMessage: string = '';

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value as {
        email: string;
        password: string;
      };

      this.authService.login(email, password).subscribe({
        next: (token: string) => {
          this.authService.saveToken(token);
          localStorage.setItem('userEmail', email);
          this.toastService.show('Successfully logged in!', 'success');
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.error('Unable to Login', err);
          this.errorMessage = 'Invalid Email or Password';
        },
      });
    }
  }
}
