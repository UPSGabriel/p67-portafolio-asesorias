import { Injectable, inject } from '@angular/core';
import { Firestore, collection, query, where, collectionData, addDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { AppUser } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PublicService {
  private db = inject(Firestore);


  getProgrammers(): Observable<AppUser[]> {
    const usersRef = collection(this.db, 'users');

    const q = query(usersRef, where('role', '==', 'programmer'));
    return collectionData(q, { idField: 'uid' }) as Observable<AppUser[]>;
  }


  requestAppointment(appointmentData: any) {
    const appointmentsRef = collection(this.db, 'appointments');
    return addDoc(appointmentsRef, appointmentData);
  }
}
