import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';
import { Observable, map } from 'rxjs';
import { Firestore, collection, addDoc, collectionData, query, where, deleteDoc, doc, updateDoc } from '@angular/fire/firestore';

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

export interface Appointment {
  id?: string;
  programmerId: string;
  userName: string;
  userContact: string;
  topic: string;
  date: string;
  time: string;
  status: 'pending' | 'approved' | 'rejected';
  replyMessage?: string;
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

  projects$: Observable<Project[]> | null = null;
  appointments$: Observable<Appointment[]> | null = null;
  pendingCount$: Observable<number> | null = null; 

  currentView: 'projects' | 'appointments' = 'projects';

  newProject: Partial<Project> = {
    section: 'Academico',
    participation: 'Full Stack'
  };

  constructor() {
    this.currentUser$.subscribe(user => {
      if (user) {
        const projectsRef = collection(this.db, 'projects');
        const qProjects = query(projectsRef, where('ownerUid', '==', user.uid));
        this.projects$ = collectionData(qProjects, { idField: 'id' }) as Observable<Project[]>;

        const appointmentsRef = collection(this.db, 'appointments');
        const qAppointments = query(appointmentsRef, where('programmerId', '==', user.uid));
        this.appointments$ = collectionData(qAppointments, { idField: 'id' }) as Observable<Appointment[]>;

        this.pendingCount$ = this.appointments$.pipe(
          map(citas => citas.filter(c => c.status === 'pending').length)
        );
      }
    });
  }

  switchView(view: 'projects' | 'appointments') {
    this.currentView = view;
  }

  async saveProject(userUid: string) {
    if (!this.newProject.name) return alert('Falta el nombre del proyecto');
    try {
      await addDoc(collection(this.db, 'projects'), {
        ...this.newProject,
        ownerUid: userUid,
        createdAt: Date.now()
      });
      this.newProject = { section: 'Academico', participation: 'Full Stack', name: '', description: '', technologies: '', repoUrl: '', demoUrl: '' };
      alert('Proyecto agregado al portafolio');
    } catch (e) { console.error(e); }
  }

  async deleteProject(id: string) {
    if(confirm('¿Borrar este proyecto?')) await deleteDoc(doc(this.db, 'projects', id));
  }

  async respondAppointment(appt: Appointment, status: 'approved' | 'rejected') {
    if (!appt.replyMessage) return alert('Escribe un mensaje de respuesta.');

    try {
      await updateDoc(doc(this.db, 'appointments', appt.id!), {
        status: status,
        replyMessage: appt.replyMessage
      });
      alert(`Solicitud ${status === 'approved' ? 'Aceptada' : 'Rechazada'}`);
    } catch (error) { console.error(error); }
  }
}
