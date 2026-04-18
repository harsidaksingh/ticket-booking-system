import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  
  if (token) {
    return true;  // Allow access
  }
  
  router.navigate(['/login']); // Redirect to login
  return false; // Block access
};
