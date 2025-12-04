import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, AppUser } from '../auth/auth.service';
import { Firestore, collection, collectionData, query, where, addDoc, orderBy } from '@angular/fire/firestore';
// Importamos 'map' para calcular el número de notificaciones
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

  // 1. Lista de Programadores
  programmers$: Observable<AppUser[]>;

  // 2. Mis Solicitudes (Citas creadas por mí)
  myAppointments$: Observable<any[]> = of([]);

  // 3. Contador de Notificaciones (Respuestas recibidas)
  unreadCount$: Observable<number>;

  // Control de Modales
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
    // A. Cargar Programadores
    const usersRef = collection(this.db, 'users');
    const q = query(usersRef, where('role', '==', 'programmer'));
    this.programmers$ = collectionData(q) as Observable<AppUser[]>;

    // B. Cargar Mis Citas (Solo si hay usuario logueado)
    this.myAppointments$ = this.auth.user$.pipe(
      switchMap(user => {
        if (!user) return of([]);
        const apptRef = collection(this.db, 'appointments');
        // Traemos las citas donde YO soy el creador (creatorUid)
        const qAppt = query(
          apptRef,
          where('creatorUid', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        return collectionData(qAppt);
      })
    );

    // C. Calcular Notificaciones
    // Contamos las citas que NO están en 'pending' (o sea, ya me respondieron)
    this.unreadCount$ = this.myAppointments$.pipe(
      map(citas => citas.filter(c => c.status !== 'pending').length)
    );
  }

  // --- MÉTODOS ---

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
        programmerId: this.selectedProgrammer.uid, // Para que le salga al programador
        programmerName: this.selectedProgrammer.displayName, // Para que yo sepa con quién es
        creatorUid: userUid, // IMPORTANTE: Mi ID para ver la respuesta después

        userName: this.appointmentForm.userName,
        userContact: this.appointmentForm.userContact,
        topic: this.appointmentForm.topic,
        date: this.appointmentForm.date,
        time: this.appointmentForm.time,
        status: 'pending', // Estado inicial
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
