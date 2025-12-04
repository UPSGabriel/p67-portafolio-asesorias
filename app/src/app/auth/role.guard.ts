import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { map, take } from 'rxjs';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    return auth.user$.pipe(
      take(1), 
      map(user => {

        if (!user) {
          return router.createUrlTree(['/login']);
        }


        if (allowedRoles.includes(user.role)) {
          return true;
        }

        if (user.role === 'programmer') return router.createUrlTree(['/programmer']);
        if (user.role === 'admin') return router.createUrlTree(['/admin']);
        
        return router.createUrlTree(['/public']);
      })
    );
  };
};
