import { Injectable, inject } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  user
} from '@angular/fire/auth';
import {
  Firestore,
  doc,
  getDoc,
  setDoc
} from '@angular/fire/firestore';
import { docData } from 'rxfire/firestore';
import { map, switchMap, of, Observable } from 'rxjs';
import { Router } from '@angular/router';

// 🔹 Modelo de usuario que usaremos en toda la app
export type AppUser = {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  role: 'admin' | 'programmer' | 'user';
  createdAt?: number;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private db = inject(Firestore);
  private router = inject(Router);

  /**
   * Stream reactivo del usuario autenticado + su documento en Firestore.
   * Si no hay sesión, emite null.
   */
  readonly user$: Observable<AppUser | null> = user(this.auth).pipe(
    switchMap(u => {
      if (!u) return of(null);

      const ref = doc(this.db, 'users', u.uid);
      return docData(ref).pipe(
        map(data => (data ? (data as AppUser) : null))
      );
    })
  );

  /**
   * Según el rol del usuario, devuelve a dónde debería ir después de login.
   * (Lo usaremos más adelante, de momento solo lo dejamos listo.)
   */
  private getHomeForRole(role: AppUser['role']): string {
    switch (role) {
      case 'admin':
        return '/admin';
      case 'programmer':
        return '/programmer';
      default:
        return '/public';
    }
  }

  /**
   * Login con Google usando popup.
   * - Crea el documento en Firestore si no existe.
   * - No redirige aún (eso lo haremos en otro paso).
   */
  async loginWithGoogle(): Promise<void> {
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(this.auth, provider);
      const u = cred.user;
      if (!u) return;

      const ref = doc(this.db, 'users', u.uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        const nuevo: AppUser = {
          uid: u.uid,
          displayName: u.displayName,
          email: u.email,
          photoURL: u.photoURL,
          role: 'user',        // 👈 por defecto todos entran como 'user'
          createdAt: Date.now()
        };

        await setDoc(ref, nuevo);
      }

      console.log('✅ Sesión iniciada con:', u.displayName);
    } catch (error) {
      console.error('❌ Error al iniciar sesión con Google:', error);
      throw error;
    }
  }

  /**
   * Logout simple.
   */
  logout(): Promise<void> {
    return signOut(this.auth);
  }
}
