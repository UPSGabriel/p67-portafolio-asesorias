import { Injectable, inject } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, signOut, user } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { docData } from 'rxfire/firestore';
import { map, switchMap, of, Observable } from 'rxjs';
import { Router } from '@angular/router';

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

  /** 🔹 Stream del usuario autenticado + su documento en Firestore */
  readonly user$: Observable<AppUser | null> = user(this.auth).pipe(
    switchMap(u => {
      if (!u) return of(null);
      const ref = doc(this.db, 'users', u.uid);
      return docData(ref).pipe(map(data => data as AppUser));
    })
  );

  /** 🔹 Página inicial según rol */
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

  /** 🔹 Login con Google usando solo popup + redirección por rol */
  async loginWithGoogle(): Promise<void> {
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(this.auth, provider);
      const u = cred.user;

      if (!u) return;

      const ref = doc(this.db, 'users', u.uid);
      const snap = await getDoc(ref);

      let userData: AppUser;

      // Si el usuario no existe en Firestore, créalo
      if (!snap.exists()) {
        userData = {
          uid: u.uid,
          displayName: u.displayName,
          email: u.email,
          photoURL: u.photoURL,
          role: 'user',          // 👈 por defecto
          createdAt: Date.now(),
        };
        await setDoc(ref, userData);
      } else {
        userData = snap.data() as AppUser;
      }

      console.log('✅ Sesión iniciada con:', userData.displayName, 'rol:', userData.role);

      // 👇 Aquí redirigimos según el rol
      const target = this.getHomeForRole(userData.role);
      this.router.navigateByUrl(target);

    } catch (error: any) {
      console.error('❌ Error al iniciar sesión con Google:', error);
    }
  }

  /** 🔹 Cerrar sesión */
  logout(): Promise<void> {
    return signOut(this.auth);
  }
}
