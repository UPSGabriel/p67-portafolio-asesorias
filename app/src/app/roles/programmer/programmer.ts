import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';
import { Firestore, collection, addDoc, collectionData, query, where, deleteDoc, doc, updateDoc, orderBy } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

// Interfaz para Proyectos
export interface Project {
  id?: string;
  ownerUid: string;
  name: string;
  description: string;
  section: 'Academico' | 'Laboral';
  participation: string;
  technologies: string;
  repoUrl: string;
  demoUrl: string;
}

// Interfaz para Asesorías (NUEVO)
export interface Appointment {
  id?: string;
  programmerId: string;
  userName: string;
  userContact: string;
  topic: string;
  date: string;
  time: string;
  status: 'pending' | 'approved' | 'rejected';
  replyMessage?: string; // Para la respuesta del programador
}

@Component({
  selector: 'app-programmer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './programmer.html',
  styleUrls: ['./programmer.scss']
})
export class ProgrammerComponent {
  auth = inject(AuthService);
  private db = inject(Firestore);

  currentUser$ = this.auth.user$;

  // Observables de datos
  projects$: Observable<Project[]> | null = null;
  appointments$: Observable<Appointment[]> | null = null;

  // Estado de la vista: 'projects' o 'appointments'
  currentView: 'projects' | 'appointments' = 'projects';

  // Modelo para formulario de proyecto
  newProject: Partial<Project> = {
    section: 'Academico',
    participation: 'Full Stack'
  };

  constructor() {
    this.currentUser$.subscribe(user => {
      if (user) {
        // 1. Cargar Proyectos
        const projectsRef = collection(this.db, 'projects');
        const qProjects = query(projectsRef, where('ownerUid', '==', user.uid));
        this.projects$ = collectionData(qProjects, { idField: 'id' }) as Observable<Project[]>;

        // 2. Cargar Asesorías (NUEVO)
        const appointmentsRef = collection(this.db, 'appointments');
        // Traemos solo las citas dirigidas a ESTE programador
        const qAppointments = query(
          appointmentsRef,
          where('programmerId', '==', user.uid)
        );
        this.appointments$ = collectionData(qAppointments, { idField: 'id' }) as Observable<Appointment[]>;
      }
    });
  }

  // Cambiar entre pestañas del menú lateral
  switchView(view: 'projects' | 'appointments') {
    this.currentView = view;
  }

  // --- LÓGICA DE PROYECTOS ---
  async saveProject(userUid: string) {
    if (!this.newProject.name) return alert('Falta el nombre');
    try {
      await addDoc(collection(this.db, 'projects'), {
        ...this.newProject,
        ownerUid: userUid,
        createdAt: Date.now()
      });
      this.newProject = { section: 'Academico', participation: 'Full Stack', name: '', description: '', technologies: '', repoUrl: '', demoUrl: '' };
      alert('Proyecto guardado');
    } catch (e) { console.error(e); }
  }

  async deleteProject(id: string) {
    if(confirm('¿Borrar?')) await deleteDoc(doc(this.db, 'projects', id));
  }

  // --- LÓGICA DE ASESORÍAS (NUEVO) ---

  async respondAppointment(appt: Appointment, status: 'approved' | 'rejected') {
    if (!appt.replyMessage) {
      alert('Por favor escribe un mensaje de respuesta antes de confirmar.');
      return;
    }

    try {
      const apptRef = doc(this.db, 'appointments', appt.id!);
      await updateDoc(apptRef, {
        status: status,
        replyMessage: appt.replyMessage
      });
      alert(`Cita ${status === 'approved' ? 'Aprobada' : 'Rechazada'} correctamente.`);
    } catch (error) {
      console.error(error);
      alert('Error al responder la cita.');
    }
  }
}
