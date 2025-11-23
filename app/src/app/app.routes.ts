import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  // aquí luego agregaremos /public, /programmer, /admin
];
