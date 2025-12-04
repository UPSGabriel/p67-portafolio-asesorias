import { Injectable, inject } from '@angular/core';
import { Firestore, collection, query, where, collectionData, doc, updateDoc, orderBy, addDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Appointment {
  id?: string;
  programmerUid: string;
  userName: string;     
  userContact: string;  
  topic: string;        
  status: 'pending' | 'approved' | 'rejected';
  date: any;           
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentsService {
  private db = inject(Firestore);

  getAppointments(programmerUid: string): Observable<Appointment[]> {
    const ref = collection(this.db, 'appointments');

    const q = query(
      ref, 
      where('programmerUid', '==', programmerUid),
      orderBy('date', 'desc') 
    );
    return collectionData(q, { idField: 'id' }) as Observable<Appointment[]>;
  }


  updateStatus(id: string, status: 'approved' | 'rejected') {
    const docRef = doc(this.db, `appointments/${id}`);
    return updateDoc(docRef, { status });
  }


  async createTestAppointment(programmerUid: string) {
    const ref = collection(this.db, 'appointments');
    await addDoc(ref, {
      programmerUid,
      userName: 'Usuario Curioso',
      userContact: 'usuario@test.com',
      topic: 'Ayuda con Angular y Firebase',
      status: 'pending',
      date: new Date()
    });
  }
}