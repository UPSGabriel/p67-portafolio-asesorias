import { Component, inject } from '@angular/core';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-programmer',
  standalone: true,
  templateUrl: './programmer.html'
})
export class ProgrammerComponent {
  private auth = inject(AuthService);
  logout() { this.auth.logout(); }
}
