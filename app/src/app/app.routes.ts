import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login.component';
import { roleGuard } from './auth/role.guard';

export const routes: Routes = [

  { path: 'login', component: LoginComponent },
  

  {
    path: 'public',
    loadComponent: () => import('./public/public.component').then(m => m.PublicComponent)
  },


  {
    path: 'admin',
    loadComponent: () => import('./roles/admin/admin').then(m => m.AdminComponent),
    canActivate: [roleGuard(['admin'])] 
  },


  {
    path: 'programmer',
    loadComponent: () => import('./roles/programmer/programmer').then(m => m.ProgrammerComponent),
    canActivate: [roleGuard(['programmer', 'admin'])]
  },

  
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];
