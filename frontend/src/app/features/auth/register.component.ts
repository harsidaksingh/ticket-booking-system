import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="row justify-content-center mt-5">
      <div class="col-md-6 col-lg-4">
        <div class="card p-4 shadow-lg border-0 mt-5">
          <h3 class="text-center fw-bold mb-4">Create Account</h3>

          @if (errorMessage) {
            <div class="alert alert-danger px-3 py-2">{{ errorMessage }}</div>
          }

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <!-- Floating Name Input -->
            <div class="form-floating mb-3">
              <input
                type="text"
                class="form-control bg-dark"
                id="name"
                placeholder="Your Name"
                formControlName="name"
              />
              <label for="name">Full Name</label>
              @if (nameInvalid) {
                <small class="text-danger mt-1 d-block px-1"
                  >Name must be at least 3 characters.</small
                >
              }
            </div>

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
              @if (emailInvalid) {
                <small class="text-danger mt-1 d-block px-1"
                  >Please enter a valid email.</small
                >
              }
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
              @if (passwordInvalid) {
                <small class="text-danger mt-1 d-block px-1"
                  >Password must be at least 6 characters.</small
                >
              }
            </div>

            <button
              type="submit"
              class="btn btn-primary w-100 py-2"
              [disabled]="registerForm.invalid"
            >
              Create Account
            </button>
          </form>

          <div class="text-center mt-4">
            <p class="text-muted mb-0">
              Already have an account?
              <a
                routerLink="/login"
                class="text-primary text-decoration-none fw-bold"
                >Sign In</a
              >
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);
  errorMessage: string = '';
  registerForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
  });
  onSubmit() {
    if (this.registerForm.valid) {
      const { name, email, password } = this.registerForm.value as {
        name: string;
        email: string;
        password: string;
      };
      this.authService.register(name, email, password).subscribe({
        next: () => {
          this.toastService.show('Successfully Registered!', 'success');
          this.router.navigate(['/login']);
        },
        error: (err: string) => {
          console.error('Unable to Login', err);
          this.errorMessage = 'Email Already present';
        },
      });
    }
  }
  get nameInvalid() {
    const ctrl = this.registerForm.get('name');
    return ctrl?.invalid && ctrl?.touched;
  }
  get emailInvalid() {
    const ctrl = this.registerForm.get('email');
    return ctrl?.invalid && ctrl?.touched;
  }
  get passwordInvalid() {
    const ctrl = this.registerForm.get('password');
    return ctrl?.invalid && ctrl?.touched;
  }
}
