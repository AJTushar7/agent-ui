import { Component, signal, ViewChild } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { LeftMenuComponent } from './left-menu.component';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, LeftMenuComponent, MatIconModule, MatButtonModule, MatTooltipModule, MatDialogModule, MatMenuModule, MatDividerModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('agent-ui');
  isLoginPage = false;
  @ViewChild(LeftMenuComponent) leftMenu!: LeftMenuComponent;

  constructor(private router: Router, private authService: AuthService) {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((event: any) => {
      this.isLoginPage = event.urlAfterRedirects === '/login';
    });
  }

  toggleSidebar() {
    if (this.leftMenu) {
      this.leftMenu.toggleSidebar();
    }
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        console.log('Logout successful');
      },
      error: (error) => {
        console.error('Logout failed:', error);
      }
    });
  }
}
