import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from './auth.service';
import { AppUser } from './auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const expectedRoles = route.data['roles'] as AppUser['role'][] | undefined;

  return auth.user$.pipe(
    map(user => {
      // Si no se pide rol específico, solo verificar que esté logueado
      if (!expectedRoles || expectedRoles.length === 0) {
        return !!user || router.createUrlTree(['/login']);
      }

      // Si sí se pide rol y el usuario lo tiene
      if (user && expectedRoles.includes(user.role)) {
        return true;
      }

      // No autorizado → al login
      return router.createUrlTree(['/login']);
    })
  );
};
