import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/auth/login.component';
import { AboutComponent } from './features/about/about.component';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';
import { SeatMapComponent } from './features/seat-map/seat-map.component';
import { authGuard } from './core/guards/auth.guard';
import { RegisterComponent } from './features/auth/register.component';
import { EventDetailComponent } from './features/event-detail/event-detail.component';
import { CheckoutComponent } from './features/checkout/checkout.component';

export const routes: Routes = [
  // When the path is empty (localhost:4200), show the HomeComponent
  { path: '', component: HomeComponent },

  // When the path is /login (localhost:4200/login), show the LoginComponent
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'events/:id', component: EventDetailComponent },
  { path: 'about', component: AboutComponent },
  { path: 'seats', component: SeatMapComponent, canActivate: [authGuard] },
  { path: 'checkout', component: CheckoutComponent, canActivate: [authGuard] },
  { path: '**', component: NotFoundComponent },
];
