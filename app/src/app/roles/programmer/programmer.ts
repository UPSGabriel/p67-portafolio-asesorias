import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';
import { ProjectsService, Project } from '../../services/projects';
import { AppointmentsService, Appointment } from '../../services/appointments'; 
import { Observable, switchMap, of, combineLatest, map } from 'rxjs';

@Component({
  selector: 'app-programmer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './programmer.html',
  styleUrls: ['./programmer.scss']
  
})

export class ProgrammerComponent {
  auth = inject(AuthService);
  projectsService = inject(ProjectsService);
  appointmentsService = inject(AppointmentsService); 

  currentView: 'projects' | 'appointments' = 'projects';

  newProject: Project = { title: '', description: '', tech: '', link: '', createdAt: null };


  data$ = this.auth.user$.pipe(
    switchMap(user => {
      if (user) {

        return combineLatest([
          this.projectsService.getProjects(user.uid),
          this.appointmentsService.getAppointments(user.uid)
        ]).pipe(
          map(([projects, appointments]) => ({ user, projects, appointments }))
        );
      }
      return of(null);
    })
  );


  async addProject(uid: string) {
    if (!this.newProject.title) return;

    try {

      this.newProject.createdAt = new Date();
      
      await this.projectsService.addProject(uid, this.newProject);
      
      alert('✅ Proyecto guardado en la nube!');
      

      this.newProject = { title: '', description: '', tech: '', link: '', createdAt: null };
    } catch (error) {
      console.error(error);
      alert('❌ Error al guardar');
    }
  }


  async deleteProject(uid: string, projectId: string) {
    if(confirm('¿Estás seguro de borrar este proyecto?')) {
      await this.projectsService.deleteProject(uid, projectId);
    }
  }

  setView(view: 'projects' | 'appointments') {
    this.currentView = view;
  }


  async respondAppointment(id: string, status: 'approved' | 'rejected') {
    await this.appointmentsService.updateStatus(id, status);
  }

  createDemo(uid: string) {
    this.appointmentsService.createTestAppointment(uid);
  }
}
