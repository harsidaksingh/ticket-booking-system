import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toastService = inject(ToastService);
  const authService = inject(AuthService);
  // 1. Get the token from localStorage (or your AuthService)
  const token = localStorage.getItem('jwt_token');

  // 2. If we have a token, clone the request and add the Authorization header
  if (token) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    });
    // Send the modified request
    req = authReq;
  }

  // 3. If no token, just send the original request
  return next(req).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse) {
        if (error.status === 401 || error.status === 403) {
          authService.logout();
          router.navigate(['/login'], {
            queryParams: { returnUrl: router.url },
          });
          toastService.show('Session Expired', 'danger');
        }
      }
      return throwError(() => error);
    }),
  );
};
