import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Importante para ngModel
import { AuthService, AppUser } from '../auth/auth.service';
import { Firestore, collection, collectionData, query, where, addDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

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

  // 1. Cargar solo usuarios con rol 'programmer'
  programmers$: Observable<AppUser[]>;

  // Variables para el Modal
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
  }

  // Abrir el modal al hacer click en "Agendar"
  openSchedule(dev: AppUser) {
    this.selectedProgrammer = dev;
    // Limpiamos el formulario
    this.appointmentForm = { userName: '', userContact: '', topic: '', date: '', time: '' };
  }

  // Cerrar el modal
  closeModal() {
    this.selectedProgrammer = null;
  }

  // --- ESTA ES LA FUNCIÓN CLAVE QUE FALTABA ---
  async submitAppointment() {
    if (!this.appointmentForm.userName || !this.appointmentForm.date || !this.selectedProgrammer) {
      alert('Por favor completa los datos obligatorios.');
      return;
    }

    try {
      // 1. Referencia a la colección de citas
      const appointmentsRef = collection(this.db, 'appointments');

      // 2. Guardamos el documento con los campos EXACTOS que espera el panel del programador
      await addDoc(appointmentsRef, {
        programmerId: this.selectedProgrammer.uid, // ¡Muy importante! Para que le llegue a ÉL
        userName: this.appointmentForm.userName,
        userContact: this.appointmentForm.userContact,
        topic: this.appointmentForm.topic,
        date: this.appointmentForm.date,
        time: this.appointmentForm.time,
        status: 'pending', // Estado inicial
        createdAt: Date.now()
      });

      alert('¡Solicitud enviada con éxito! El programador te contactará.');
      this.closeModal();

    } catch (error) {
      console.error('Error al agendar:', error);
      alert('Hubo un error al enviar la solicitud.');
    }
  }

  // Función para scroll suave (opcional, si la usas en el HTML)
  scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  logout() {
    this.auth.logout();
  }
}
