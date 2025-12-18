import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, AppUser, AppRole } from '../../auth/auth.service';
import { Firestore, collection, collectionData, doc, updateDoc, deleteDoc, addDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrls: ['./admin.scss']
})
export class AdminComponent {
  auth = inject(AuthService);
  private db = inject(Firestore);

  users$: Observable<AppUser[]> = collectionData(collection(this.db, 'users'), { idField: 'uid' }) as Observable<AppUser[]>;

  selectedUser: Partial<AppUser> | null = null;
  isModalOpen = false;
  isNewUser = false;

  newScheduleInput: string = '';

  openCreateModal() {
    this.isNewUser = true;
    this.selectedUser = {
      role: 'programmer',
      displayName: '',
      email: '',
      specialty: '',
      description: '',
      availability: [],
      whatsapp: '', 
      github: ''    
    };
    this.newScheduleInput = '';
    this.isModalOpen = true;
  }

  editUser(user: AppUser) {
    this.isNewUser = false;
    this.selectedUser = {
      ...user,
      availability: user.availability || []
    };
    this.newScheduleInput = '';
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedUser = null;
  }


  addSchedule() {
    const rawInput = this.newScheduleInput.trim();
    if (!rawInput) return;

    if (!this.selectedUser!.availability) {
      this.selectedUser!.availability = [];
    }


    const exists = this.selectedUser!.availability.some(
      slot => slot.toLowerCase() === rawInput.toLowerCase()
    );

    if (exists) {
      alert('⚠️ Este horario ya ha sido registrado para este usuario.');
      return; 
    }

    this.selectedUser!.availability!.push(rawInput);
    this.newScheduleInput = '';
  }

  removeSchedule(index: number) {
    this.selectedUser!.availability!.splice(index, 1);
  }

  validateWhatsappInput(event: any) {
    const input = event.target as HTMLInputElement;

    const cleanValue = input.value.replace(/[^0-9+]/g, '');
    

    input.value = cleanValue;
    this.selectedUser!.whatsapp = cleanValue;
  }

  async saveUserChanges() {
    if (!this.selectedUser) return;


    if (this.selectedUser.role === 'programmer') {
      if (!this.selectedUser.github || this.selectedUser.github.trim() === '') {
        alert(' El enlace de GitHub es OBLIGATORIO para registrar a un programador.');
        return; 
      }
    }

    try {
      if (this.isNewUser) {
        await addDoc(collection(this.db, 'users'), {
          ...this.selectedUser,
          createdAt: Date.now(),
          photoURL: this.selectedUser.photoURL || `https://ui-avatars.com/api/?name=${this.selectedUser.displayName}`
        });
        alert('Programador registrado exitosamente.');
      } else {
        if (!this.selectedUser.uid) return;
        const userRef = doc(this.db, 'users', this.selectedUser.uid);

        await updateDoc(userRef, {
          displayName: this.selectedUser.displayName,
          email: this.selectedUser.email,
          specialty: this.selectedUser.specialty || '',
          description: this.selectedUser.description || '',
          contactEmail: this.selectedUser.contactEmail || '',
          whatsapp: this.selectedUser.whatsapp || '',
          linkedin: this.selectedUser.linkedin || '',
          github: this.selectedUser.github || '',
          availability: this.selectedUser.availability || []
        });
        alert('Datos actualizados correctamente.');
      }
      this.closeModal();
    } catch (error) {
      console.error('Error:', error);
      alert('Hubo un error al guardar.');
    }
  }

  async updateRole(uid: string, event: Event) {
    const newRole = (event.target as HTMLSelectElement).value as AppRole;
    await updateDoc(doc(this.db, 'users', uid), { role: newRole });
  }

  async deleteUser(user: AppUser) {
    if (confirm(`¿Estás seguro de eliminar a ${user.displayName}?`)) {
      await deleteDoc(doc(this.db, 'users', user.uid));
    }
  }
}
