import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from './auth.service';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-maindashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, RouterModule],
  template: `
    <div *ngIf="!hasLeftMenuDashboardPermission" class="no-permission">
      <mat-card>
        <h2>Access Denied</h2>
        <p>You don't have permission to access the Left Menu Dashboard.</p>
      </mat-card>
    </div>
    
      <div *ngIf="hasLeftMenuDashboardPermission">
        <ng-container *ngIf="!isChildRouteActive">
        <!--  <mat-card>
            <h2>Welcome to the Main Dashboard!</h2>
            <p>You are now logged in.</p>
          </mat-card> -->
        </ng-container>
        <router-outlet></router-outlet>
      </div> 
  `,
  styleUrls: ['./maindashboard.component.css']
})
export class MainDashboardComponent implements OnInit {
  hasLeftMenuDashboardPermission = false;
  isChildRouteActive = false;

  constructor(private authService: AuthService, private router: Router) {
    this.hasLeftMenuDashboardPermission = this.authService.hasPermission('LEFT_MENU_DASHBOARD');
  }

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.isChildRouteActive = event.urlAfterRedirects !== '/configuration';
    });
  }
}