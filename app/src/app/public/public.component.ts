import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PublicService } from '../services/public'; 
import { AuthService } from '../auth/auth.service';
import { AppUser } from '../auth/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-public',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './public.component.html',
  styleUrls: ['./public.component.scss']
})
export class PublicComponent {
  publicService = inject(PublicService);
  authService = inject(AuthService);

  programmers$: Observable<AppUser[]> = this.publicService.getProgrammers();


  selectedProgrammer: AppUser | null = null;
  appointmentForm = {
    userName: '',
    userContact: '',
    topic: '',
    date: '',
    time: ''
  };

  scrollTo(section: string) {
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
  }


  openSchedule(programmer: AppUser) {
    this.selectedProgrammer = programmer;
  }


  closeModal() {
    this.selectedProgrammer = null;

    this.appointmentForm = { userName: '', userContact: '', topic: '', date: '', time: '' };
  }

 
  async submitAppointment() {
    if (!this.selectedProgrammer) return;
    

    if (!this.appointmentForm.userName || !this.appointmentForm.topic) {
      alert('Por favor completa los campos obligatorios');
      return;
    }

    try {

      const fullDate = new Date(this.appointmentForm.date + 'T' + this.appointmentForm.time);

      const request = {
        programmerUid: this.selectedProgrammer.uid,
        programmerName: this.selectedProgrammer.displayName,
        userName: this.appointmentForm.userName,
        userContact: this.appointmentForm.userContact,
        topic: this.appointmentForm.topic,
        status: 'pending', 
        date: fullDate,
        createdAt: new Date()
      };

      await this.publicService.requestAppointment(request);
      
      alert('✅ Solicitud enviada con éxito. El programador te contactará.');
      this.closeModal();

    } catch (error) {
      console.error(error);
      alert('❌ Error al enviar solicitud');
    }
  }
  logout() {
    this.authService.logout();
  }
}