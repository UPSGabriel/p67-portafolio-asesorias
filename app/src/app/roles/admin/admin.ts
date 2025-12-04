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

  // Lista de todos los usuarios
  users$: Observable<AppUser[]> = collectionData(collection(this.db, 'users'), { idField: 'uid' }) as Observable<AppUser[]>;

  // Variables para el Modal
  selectedUser: Partial<AppUser> | null = null;
  isModalOpen = false;
  isNewUser = false; // Bandera para saber si creamos o editamos

  // Variable temporal para el input de horarios
  newScheduleInput: string = '';

  // 1. Abrir Modal para CREAR (Registrar Programador)
  openCreateModal() {
    this.isNewUser = true;
    this.selectedUser = {
      role: 'programmer',
      displayName: '',
      email: '',
      specialty: '',
      description: '',
      availability: [] // Inicializamos array vacío
    };
    this.newScheduleInput = '';
    this.isModalOpen = true;
  }

  // 2. Abrir Modal para EDITAR
  editUser(user: AppUser) {
    this.isNewUser = false;
    // Creamos una copia para no editar en tiempo real la tabla
    this.selectedUser = {
      ...user,
      availability: user.availability || [] // Aseguramos que sea array
    };
    this.newScheduleInput = '';
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedUser = null;
  }

  // --- MÉTODOS DE HORARIOS ---
  addSchedule() {
    if (!this.newScheduleInput.trim()) return;
    if (!this.selectedUser!.availability) {
      this.selectedUser!.availability = [];
    }
    this.selectedUser!.availability!.push(this.newScheduleInput.trim());
    this.newScheduleInput = '';
  }

  removeSchedule(index: number) {
    this.selectedUser!.availability!.splice(index, 1);
  }
  // ---------------------------

  // 3. GUARDAR (Crear o Actualizar)
  async saveUserChanges() {
    if (!this.selectedUser) return;

    try {
      if (this.isNewUser) {
        // CREAR
        await addDoc(collection(this.db, 'users'), {
          ...this.selectedUser,
          createdAt: Date.now(),
          photoURL: this.selectedUser.photoURL || `https://ui-avatars.com/api/?name=${this.selectedUser.displayName}`
        });
        alert('Programador registrado exitosamente.');
      } else {
        // ACTUALIZAR
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
          availability: this.selectedUser.availability || [] // Guardamos los horarios
        });
        alert('Datos actualizados correctamente.');
      }
      this.closeModal();
    } catch (error) {
      console.error('Error:', error);
      alert('Hubo un error al guardar.');
    }
  }

  // 4. Cambiar Rol Rápido
  async updateRole(uid: string, event: Event) {
    const newRole = (event.target as HTMLSelectElement).value as AppRole;
    await updateDoc(doc(this.db, 'users', uid), { role: newRole });
  }

  // 5. Eliminar Usuario
  async deleteUser(user: AppUser) {
    if(confirm(`¿Estás seguro de eliminar a ${user.displayName}?`)) {
      await deleteDoc(doc(this.db, 'users', user.uid));
    }
  }
}
