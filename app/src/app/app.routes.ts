// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login.component'; // <-- esta es la buena

export const routes: Routes = [
  { path: '', component: LoginComponent },
];
