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
  notificationsRead = false; 

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

 
  openMyAppointmentsModal() {
    this.showMyAppointments = true;
    this.notificationsRead = true; 
  }

  openSchedule(dev: AppUser) {
    this.selectedProgrammer = dev;
    this.appointmentForm = { userName: '', userContact: '', topic: '', date: '', time: '' };
  }

  closeModal() {
    this.selectedProgrammer = null;
  }


  async submitAppointment(userUid: string) {

    if (!this.appointmentForm.userName || !this.appointmentForm.date || !this.appointmentForm.time || !this.selectedProgrammer) {
      alert('Por favor completa todos los campos, incluyendo fecha y hora.');
      return;
    }

    const selectedDate = this.appointmentForm.date; 
    const selectedTime = this.appointmentForm.time; 
    const availability = this.selectedProgrammer.availability || [];

 
    const dateObj = new Date(selectedDate + 'T12:00:00'); 
    const days = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
    const dayName = days[dateObj.getDay()]; 

    const matchingSlot = availability.find(slot => slot.toLowerCase().includes(dayName.toLowerCase()));

    if (!matchingSlot) {
      alert(`⛔ El programador no atiende los días ${dayName}. Por favor revisa sus horarios en la tarjeta.`);
      return;
    }

    if (!this.isTimeWithinRange(selectedTime, matchingSlot)) {
      alert(`⛔ La hora seleccionada (${selectedTime}) está fuera del rango de atención del ${dayName} (${matchingSlot}).`);
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

      alert('¡Solicitud enviada exitosamente! ✅');
      this.closeModal();

    } catch (error) {
      console.error('Error al agendar:', error);
      alert('Error al enviar solicitud.');
    }
  }

  isTimeWithinRange(selectedTime: string, slotString: string): boolean {
    const times = slotString.match(/(\d{1,2}:\d{2})/g);
    
    if (times && times.length >= 2) {
      const startTime = times[0]; // Ej: 14:00
      const endTime = times[1];   // Ej: 16:00

      return selectedTime >= startTime && selectedTime <= endTime;
    }
    
    return true; 
  }

  scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  logout() {
    this.auth.logout();
  }
}