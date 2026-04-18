import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. Get the token from localStorage (or your AuthService)
  const token = localStorage.getItem('jwt_token');

  // 2. If we have a token, clone the request and add the Authorization header
  if (token) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    });
    // Send the modified request
    return next(authReq);
  }

  // 3. If no token, just send the original request
  return next(req);
};
