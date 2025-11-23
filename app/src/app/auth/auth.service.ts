import { Injectable, inject } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  user
} from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { docData } from 'rxfire/firestore';
import { map, switchMap, of, Observable } from 'rxjs';

// 🔹 Modelo tipado del usuario de la app
export type AppRole = 'admin' | 'programmer' | 'user';

export interface AppUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  role: AppRole;
  createdAt?: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private db = inject(Firestore);

  /** Stream del usuario logueado + su documento en Firestore */
  readonly user$: Observable<AppUser | null> = user(this.auth).pipe(
    switchMap(u => {
      if (!u) return of(null);
      const ref = doc(this.db, 'users', u.uid);
      return docData(ref).pipe(map(data => data as AppUser));
    })
  );

  /** Login con Google */
  async loginWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(this.auth, provider);
    const u = cred.user;
    if (!u) return;

    const ref = doc(this.db, 'users', u.uid);
    const snap = await getDoc(ref);

    // Si es la primera vez que entra, lo creo en la colección "users"
    if (!snap.exists()) {
      const nuevo: AppUser = {
        uid: u.uid,
        displayName: u.displayName,
        email: u.email,
        photoURL: u.photoURL,
        role: 'user',           // por defecto todos son "user"
        createdAt: Date.now(),
      };
      await setDoc(ref, nuevo);
    }
  }

  /** Logout */
  logout(): Promise<void> {
    return signOut(this.auth);
  }
}

