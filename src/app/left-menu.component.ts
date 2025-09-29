import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from './auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-left-menu',
  standalone: true,
  imports: [
    CommonModule, 
    MatSidenavModule, 
    MatListModule, 
    MatIconModule, 
    MatButtonModule, 
    RouterModule,
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav #drawer mode="side" [(opened)]="opened" class="sidenav">
        <mat-nav-list>
          <a mat-list-item 
             routerLink="/dashboard" 
             routerLinkActive="active"
             *ngIf="hasLeftMenuDashboardPermission">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Dashboard</span>
          </a>

          <div *ngIf="hasLeftMenuConfigPermission">
            <a mat-list-item
               (click)="toggleConfigMenu()"
               [class.active]="isConfigurationRouteActive()"
               class="menu-item-with-submenu">
              <mat-icon matListItemIcon>settings</mat-icon>
              <span matListItemTitle>Configuration</span>
              <mat-icon class="menu-toggle-icon">{{ configMenuOpen ? 'expand_less' : 'expand_more' }}</mat-icon>
            </a>
            <div *ngIf="configMenuOpen" class="submenu-list">
              <a mat-list-item 
                 routerLink="/configuration/api-keys" 
                 routerLinkActive="active"
                 *ngIf="hasLeftMenuApiKeysPermission">
                <span class="submenu-item-indent"></span>
                <span matListItemTitle>API Keys</span>
              </a>
              <a mat-list-item 
                 routerLink="/integration-keys" 
                 routerLinkActive="active"
                 *ngIf="hasLeftMenuApiKeysPermission">
                <span class="submenu-item-indent"></span>
                <span matListItemTitle>Integration Keys</span>
              </a>
            </div>
          </div>
          <a mat-list-item 
             routerLink="/admin" 
             routerLinkActive="active"
             *ngIf="hasLeftMenuAdminPermission">
            <mat-icon matListItemIcon>admin_panel_settings</mat-icon>
            <span matListItemTitle>Admin</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>
      <mat-sidenav-content>
        <button mat-icon-button (click)="opened = !opened" class="toggle-btn">
          <mat-icon>{{ opened ? 'chevron_left' : 'menu' }}</mat-icon>
        </button>
        <ng-content></ng-content>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styleUrls: ['./left-menu.component.css']
})
export class LeftMenuComponent implements OnInit {
  opened = true;
  hasLeftMenuDashboardPermission = false;
  hasLeftMenuConfigPermission = false;
  hasLeftMenuApiKeysPermission = false;
  configMenuOpen = false;
  hasLeftMenuAdminPermission = false;

  constructor(private authService: AuthService, private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.checkPermissions();
      this.configMenuOpen = this.isConfigurationRouteActive();
    });
  }

  ngOnInit() {
    this.checkPermissions();
    this.configMenuOpen = this.isConfigurationRouteActive();
  }

  checkPermissions() {
    this.hasLeftMenuDashboardPermission = this.authService.hasPermission('LEFT_MENU_DASHBOARD');
    this.hasLeftMenuConfigPermission = this.authService.hasPermission('LEFT_MENU_CONFIG');
    this.hasLeftMenuApiKeysPermission = this.authService.hasPermission('LEFT_MENU_API_KEYS');
    this.hasLeftMenuAdminPermission = this.authService.hasPermission('LEFT_MENU_ADMIN')
    
    console.log('Left Menu Permissions:', {
      hasLeftMenuDashboardPermission: this.hasLeftMenuDashboardPermission,
      hasLeftMenuConfigPermission: this.hasLeftMenuConfigPermission,
      hasLeftMenuApiKeysPermission: this.hasLeftMenuApiKeysPermission,
      hasLeftMenuAdminPermission: this.hasLeftMenuAdminPermission
    });

    const userDetails = this.authService.getUserDetailsFromStorage();
    console.log('User Details from Storage:', userDetails);
    
    if (userDetails) {
      console.log('User Screen Permissions:', userDetails.screen_permissions);
    }
  }

  toggleConfigMenu() {
    this.configMenuOpen = !this.configMenuOpen;
  }

  isConfigurationRouteActive(): boolean {
    return this.router.url.includes('/configuration') || this.router.url.includes('/integration-keys');
  }
}