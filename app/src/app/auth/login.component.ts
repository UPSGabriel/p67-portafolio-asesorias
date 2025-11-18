import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, AppUser } from './auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {

  private auth = inject(AuthService);

  user$: Observable<AppUser | null> = this.auth.user$;

  login() {
    this.auth.loginWithGoogle();
  }

  logout() {
    this.auth.logout();
  }
}
