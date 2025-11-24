import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login.component';



export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', pathMatch: 'full', redirectTo: 'login' },

  // RUTA PÚBLICA (la tuya)
   {
    path: 'public',
    loadComponent: () =>
      import('./public/public.component').then(m => m.Public),
  }


  // más rutas vendrán luego:
  // { path: 'admin', ... }
  // { path: 'programmer', ... }
];
