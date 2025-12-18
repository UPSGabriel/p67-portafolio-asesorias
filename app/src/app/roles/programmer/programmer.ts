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


  editingProjectId: string | null = null;

  newProject: Partial<Project> = {
    section: 'Academico',
    participation: 'Full Stack',
    name: '',
    description: '',
    technologies: '',
    repoUrl: '',
    demoUrl: ''
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


  startEditing(project: Project) {
    this.editingProjectId = project.id!;

    this.newProject = {
      name: project.name,
      description: project.description,
      section: project.section,
      participation: project.participation,
      technologies: project.technologies,
      repoUrl: project.repoUrl,
      demoUrl: project.demoUrl
    };

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }


  cancelEdit() {
    this.editingProjectId = null;
    this.resetForm();
  }

 
  async saveProject(userUid: string) {

    if (!this.newProject.name) return alert('Falta el nombre del proyecto');
    

    if (!this.newProject.repoUrl) return alert('⚠️ El enlace al repositorio de GitHub es OBLIGATORIO.');

    try {
      if (this.editingProjectId) {
   
        const projectRef = doc(this.db, 'projects', this.editingProjectId);
        await updateDoc(projectRef, {
          ...this.newProject,
     
        });
        alert('✅ Proyecto actualizado correctamente');
      } else {

        await addDoc(collection(this.db, 'projects'), {
          ...this.newProject,
          ownerUid: userUid,
          createdAt: Date.now()
        });
        alert('✅ Proyecto agregado al portafolio');
      }

 
      this.cancelEdit();

    } catch (e) {
      console.error(e);
      alert('Error al guardar el proyecto');
    }
  }

  resetForm() {
    this.newProject = { 
      section: 'Academico', 
      participation: 'Full Stack', 
      name: '', 
      description: '', 
      technologies: '', 
      repoUrl: '', 
      demoUrl: '' 
    };
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
