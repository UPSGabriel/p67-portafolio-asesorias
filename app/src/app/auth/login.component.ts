import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, AppUser } from './auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  

})
export class LoginComponent {
  private auth = inject(AuthService);

  user$: Observable<AppUser | null> = this.auth.user$;

  login(): void {
    this.auth.loginWithGoogle();
  }

  logout(): void {
    this.auth.logout();
  }
}
