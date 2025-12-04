import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth.service';
import { FormsModule } from '@angular/forms'; // Necesario para formularios

@Component({
  selector: 'app-programmer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './programmer.html',
  styleUrls: ['./programmer.scss']
})
export class ProgrammerComponent {
  auth = inject(AuthService);
  

  newProject = {
    title: '',
    description: '',
    tech: '',
    link: ''
  };

  myProjects = [
    { title: 'E-commerce App', description: 'Tienda virtual con Angular', tech: 'Angular, Stripe', link: '#' }
  ];

  addProject() {
    if(!this.newProject.title) return;
    this.myProjects.push({...this.newProject});
    // Limpiar formulario
    this.newProject = { title: '', description: '', tech: '', link: '' };
    alert('Proyecto agregado (Simulado)');
  }
}
