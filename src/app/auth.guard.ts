import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  const isVerified = localStorage.getItem('ownerVerifiedwWIthOtp');
  const loginTime = localStorage.getItem('loginTimestamp');
  
  // 10 Days in milliseconds
  const TEN_DAYS = 10 * 24 * 60 * 60 * 1000;

  if (isVerified === 'true' && loginTime) {
    const timeElapsed = Date.now() - parseInt(loginTime, 10);
    
    if (timeElapsed < TEN_DAYS) {
      return true; // Allowed
    }
  }

  // If not verified or expired, redirect to login
  // We pass the returnUrl so we can go back after logging in
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};