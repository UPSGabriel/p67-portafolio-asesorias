import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-public',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './public.component.html',
  styleUrls: ['./public.component.scss']
})
export class PublicComponent {

  programmers = [
    {
      name: 'Daniel Dev',
      specialty: 'Full Stack Developer',
      desc: 'Experto en Angular y Firebase. Creo soluciones escalables.',
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Daniel',
      skills: ['Angular', 'TypeScript', 'Firebase']
    },
    {
      name: 'Gabriel Tech',
      specialty: 'Backend Specialist',
      desc: 'Arquitectura de software y seguridad en la nube.',
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Gabriel',
      skills: ['Node.js', 'Python', 'Google Cloud']
    },
    {
      name: 'Ana UX',
      specialty: 'UI/UX Designer',
      desc: 'Diseño interfaces intuitivas y centradas en el usuario.',
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
      skills: ['Figma', 'CSS', 'Prototyping']
    }
  ];

  scrollTo(section: string) {
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
  }
}