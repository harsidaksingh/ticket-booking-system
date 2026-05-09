import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toastService = inject(ToastService);
  const authService = inject(AuthService);

  req = req.clone({
    withCredentials: true,
  });
  if (req.url.includes('/auth/refresh')) return next(req);
  return next(req).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse) {
        if (error.status === 401 || error.status === 403) {
          return authService.refreshToken().pipe(
            switchMap(() => {
              return next(req);
            }),
            catchError((error) => {
              console.error('Refreshing access token failed:', error);
              authService.logout();
              router.navigate(['/login']);
              toastService.show('Session expired', 'danger');
              return throwError(() => error);
            }),
          );
        }
      }
      return throwError(() => error);
    }),
  );
};
