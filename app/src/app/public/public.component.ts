import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-public',
  imports: [CommonModule],
  templateUrl: './public.component.html',
  styleUrl: './public.component.scss',
})
export class Public {
  proyectos = [
    {
      titulo: 'Sistema de Gestión',
      descripcion: 'Proyecto escolar con Angular y Firebase.',
      imagen: 'https://source.unsplash.com/random/400x300?code'
    },
    {
      titulo: 'Portfolio Web',
      descripcion: 'Página personal con diseño responsive.',
      imagen: 'https://source.unsplash.com/random/400x300?developer'
    },
    {
      titulo: 'E-Commerce Demo',
      descripcion: 'Tienda online usando Angular + Stripe.',
      imagen: 'https://source.unsplash.com/random/400x300?shop'
    }
  ];

  habilidades = [
    'Angular',
    'Firebase',
    'TypeScript',
    'HTML',
    'CSS / SCSS',
    'Responsive Design',
  ];
}
