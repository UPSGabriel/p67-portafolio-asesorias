import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore, collection, collectionData, doc, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { AuthService, AppUser, AppRole } from '../../auth/auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin.html',
  styleUrls: ['./admin.scss']
})
export class AdminComponent {
  auth = inject(AuthService);
  private db = inject(Firestore);


  users$: Observable<AppUser[]> = collectionData(collection(this.db, 'users'), { idField: 'uid' }) as Observable<AppUser[]>;


  async updateRole(uid: string, event: Event) {
    const select = event.target as HTMLSelectElement;
    const newRole = select.value as AppRole;
    
    const userRef = doc(this.db, 'users', uid);
    await updateDoc(userRef, { role: newRole });
    alert('Rol actualizado correctamente');
  }
}