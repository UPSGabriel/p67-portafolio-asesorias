import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, AppUser } from '../auth/auth.service';
import { Firestore, collection, collectionData, query, where, addDoc, orderBy } from '@angular/fire/firestore';
import { Observable, switchMap, of, map } from 'rxjs';

@Component({
  selector: 'app-public',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './public.component.html',
  styleUrls: ['./public.component.scss']
})
export class PublicComponent {
  auth = inject(AuthService);
  private db = inject(Firestore);

  programmers$: Observable<AppUser[]>;

  myAppointments$: Observable<any[]> = of([]);

  unreadCount$: Observable<number>;

  showMyAppointments = false;
  selectedProgrammer: AppUser | null = null;

  appointmentForm = {
    userName: '',
    userContact: '',
    topic: '',
    date: '',
    time: ''
  };

  constructor() {
    const usersRef = collection(this.db, 'users');
    const q = query(usersRef, where('role', '==', 'programmer'));
    this.programmers$ = collectionData(q) as Observable<AppUser[]>;

    this.myAppointments$ = this.auth.user$.pipe(
      switchMap(user => {
        if (!user) return of([]);
        const apptRef = collection(this.db, 'appointments');
        const qAppt = query(
          apptRef,
          where('creatorUid', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        return collectionData(qAppt);
      })
    );

    this.unreadCount$ = this.myAppointments$.pipe(
      map(citas => citas.filter(c => c.status !== 'pending').length)
    );
  }


  openSchedule(dev: AppUser) {
    this.selectedProgrammer = dev;
    this.appointmentForm = { userName: '', userContact: '', topic: '', date: '', time: '' };
  }

  closeModal() {
    this.selectedProgrammer = null;
  }

  async submitAppointment(userUid: string) {
    if (!this.appointmentForm.userName || !this.appointmentForm.date || !this.selectedProgrammer) {
      alert('Por favor completa los campos obligatorios.');
      return;
    }

    try {
      const appointmentsRef = collection(this.db, 'appointments');
      await addDoc(appointmentsRef, {
        programmerId: this.selectedProgrammer.uid, 
        programmerName: this.selectedProgrammer.displayName, 
        creatorUid: userUid, 

        userName: this.appointmentForm.userName,
        userContact: this.appointmentForm.userContact,
        topic: this.appointmentForm.topic,
        date: this.appointmentForm.date,
        time: this.appointmentForm.time,
        status: 'pending', 
        createdAt: Date.now()
      });

      alert('¡Solicitud enviada! Te avisaremos cuando el mentor responda.');
      this.closeModal();

    } catch (error) {
      console.error('Error al agendar:', error);
      alert('Error al enviar solicitud.');
    }
  }

  scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  logout() {
    this.auth.logout();
  }
}
