import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, doc, deleteDoc, query, orderBy } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Project {
  id?: string;
  title: string;
  description: string;
  tech: string;
  link: string;
  createdAt: any;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {
  private db = inject(Firestore);

  addProject(uid: string, project: Project) {
    
    const projectsRef = collection(this.db, `users/${uid}/projects`);
    return addDoc(projectsRef, project);
  }

  getProjects(uid: string): Observable<Project[]> {
    const projectsRef = collection(this.db, `users/${uid}/projects`);

    const q = query(projectsRef, orderBy('createdAt', 'desc')); 
    return collectionData(q, { idField: 'id' }) as Observable<Project[]>;
  }


  deleteProject(uid: string, projectId: string) {
    const projectDocRef = doc(this.db, `users/${uid}/projects/${projectId}`);
    return deleteDoc(projectDocRef);
  }
}