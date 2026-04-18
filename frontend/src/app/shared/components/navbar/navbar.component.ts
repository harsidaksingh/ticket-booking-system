import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav class="navbar navbar-dark bg-dark">
      <div class="container-fluid">
        <a class="navbar-brand" href="#">
          {{ brandSettings.emoji }} {{ brandSettings.name }}
        </a>
        <div class="d-flex">
          <button class="btn btn-outline-light me-2" routerLink="/about">
            About Us
          </button>
          @if (!loginStatus) {
            <button class="btn btn-outline-light" routerLink="/register">
              Register
            </button>
            <button class="btn btn-outline-light" routerLink="/login">
              Login
            </button>
          } @else {
            <button class="btn btn-outline-light" (click)="logout()">
              Logout
            </button>
          }
        </div>
      </div>
    </nav>
  `,
})
export class NavbarComponent {
  brandSettings = {
    name: 'TicketX',
    emoji: '🎫',
  };
  private authService = inject(AuthService);
  get loginStatus() {
    return this.authService.isLoggedIn();
  }
  logout() {
    this.authService.logout();
  }
}
