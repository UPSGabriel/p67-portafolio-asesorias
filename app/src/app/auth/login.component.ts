import { Component, inject } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, signOut, user } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="display:grid;place-items:center;min-height:70vh;gap:1rem">
      <ng-container *ngIf="(user$ | async) as u; else loginBtn">
        <img [src]="u.photoURL || ''" width="64" height="64" style="border-radius:50%" />
        <div>{{ u.displayName }} ({{ u.email }})</div>
        <button (click)="logout()">Cerrar sesión</button>
      </ng-container>
      <ng-template #loginBtn>
        <button (click)="login()">Iniciar sesión con Google</button>
      </ng-template>
    </div>
  `
})
export class LoginComponent {
  private auth = inject(Auth);
  user$: Observable<any> = user(this.auth);

  async login(){ await signInWithPopup(this.auth, new GoogleAuthProvider()); }
  async logout(){ await signOut(this.auth); }
}
