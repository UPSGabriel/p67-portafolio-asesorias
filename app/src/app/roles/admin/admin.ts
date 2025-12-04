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

  selectedUser: Partial<AppUser> | null = null; // Usamos Partial para permitir que no tenga UID al inicio
  isModalOpen = false;
  isNewUser = false; // Bandera para saber si estamos creando

  // 1. Abrir modal para CREAR nuevo usuario
  openCreateModal() {
    this.isNewUser = true;
    this.selectedUser = {
      role: 'programmer', // Por defecto creamos programadores
      displayName: '',
      email: '',
      photoURL: '',
      specialty: '',
      description: ''
    };
    this.isModalOpen = true;
  }

  // 2. Abrir modal para EDITAR usuario existente
  editUser(user: AppUser) {
    this.isNewUser = false;
    this.selectedUser = { ...user };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedUser = null;
  }

  // 3. GUARDAR (Sirve para Crear y Editar)
  async saveUserChanges() {
    if (!this.selectedUser) return;

    try {
      if (this.isNewUser) {
        // --- LÓGICA DE CREAR (INSERT) ---
        const usersCollection = collection(this.db, 'users');
        await addDoc(usersCollection, {
          ...this.selectedUser,
          createdAt: Date.now(),
          // Asignamos una foto por defecto si no pone nada
          photoURL: this.selectedUser.photoURL || 'https://ui-avatars.com/api/?name=' + this.selectedUser.displayName
        });
        alert('Usuario programador registrado correctamente.');

      } else {
        // --- LÓGICA DE EDITAR (UPDATE) ---
        if (!this.selectedUser.uid) return;
        const userRef = doc(this.db, 'users', this.selectedUser.uid);

        await updateDoc(userRef, {
          displayName: this.selectedUser.displayName,
          email: this.selectedUser.email, // Permitimos editar email también
          specialty: this.selectedUser.specialty || '',
          description: this.selectedUser.description || '',
          contactEmail: this.selectedUser.contactEmail || '',
          whatsapp: this.selectedUser.whatsapp || '',
          linkedin: this.selectedUser.linkedin || '',
          github: this.selectedUser.github || ''
        });
        alert('Usuario actualizado correctamente.');
      }

      this.closeModal();

    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error al guardar. Revisa la consola.');
    }
  }

  // 4. Cambiar rol rápido desde la tabla
  async updateRole(uid: string, event: Event) {
    const select = event.target as HTMLSelectElement;
    const newRole = select.value as AppRole;
    const userRef = doc(this.db, 'users', uid);
    await updateDoc(userRef, { role: newRole });
  }

  // 5. Eliminar usuario
  async deleteUser(user: AppUser) {
    if(!confirm(`¿Eliminar a ${user.displayName}?`)) return;
    try {
      const userRef = doc(this.db, 'users', user.uid);
      await deleteDoc(userRef);
    } catch (error) {
      console.error(error);
    }
  }
}
