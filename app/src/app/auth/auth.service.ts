import { Injectable, inject } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, signOut, user } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { docData } from 'rxfire/firestore';
import { map, switchMap, Observable } from 'rxjs';
import { Router } from '@angular/router';


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
  private router = inject(Router);

  
  readonly user$: Observable<AppUser | null> = user(this.auth).pipe(
    switchMap(u => {
      if (!u) return [null];
      const ref = doc(this.db, 'users', u.uid);
      return docData(ref).pipe(map(d => (d ? (d as AppUser) : null)));
    })
  );

  
  private getHomeForRole(role: AppRole): string {
    switch (role) {
      case 'admin': return '/admin';
      case 'programmer': return '/programmer';
      default: return '/public';
    }
  }

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
          role: 'user',
          createdAt: Date.now(),
        };
        await setDoc(ref, nuevo);
      }


      const finalDoc = await getDoc(ref);
      const userData = finalDoc.data() as AppUser;
      

      const targetRoute = this.getHomeForRole(userData.role);
      this.router.navigateByUrl(targetRoute);

    } catch (error) {
      console.error('Error en login:', error);
    }
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    this.router.navigateByUrl('/login');
  }
}




