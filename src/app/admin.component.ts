import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CreateUserDialogComponent } from './CreateUserDialog';
import { AuthService } from './auth.service';

interface User {
  user_id: string;
  email: string;
  password: string;
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatPaginatorModule,
    MatDialogModule,
    HttpClientModule,
    CreateUserDialogComponent,
  ],
  template: `
    <div class="admin-container">
      <div class="header">
        <h2>Users</h2>
        <div class="button-group">
          <button
            class="create-user-btn"
            mat-raised-button
            color="primary"
            (click)="addNewUser()"
            [disabled]="loading"
          >
            Create User
          </button>
        </div>
      </div>

      <div *ngIf="loading" class="loading">Loading users...</div>
      <div *ngIf="error" class="error">{{ error }}</div>

      <mat-card>
        <table mat-table [dataSource]="users" class="user-table" *ngIf="!loading">
          <ng-container matColumnDef="user_id">
            <th mat-header-cell *matHeaderCellDef>User ID</th>
            <td mat-cell *matCellDef="let user">{{ user.user_id }}</td>
          </ng-container>

          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef>Email</th>
            <td mat-cell *matCellDef="let user">{{ user.email }}</td>
          </ng-container>

          <ng-container matColumnDef="password">
            <th mat-header-cell *matHeaderCellDef>Password</th>
            <td mat-cell *matCellDef="let user">{{ getMaskedPassword(user.password) }}</td>
          </ng-container>

          <ng-container matColumnDef="created_at">
            <th mat-header-cell *matHeaderCellDef>Created</th>
            <td mat-cell *matCellDef="let user">{{ user.created_at }}</td>
          </ng-container>

          <ng-container matColumnDef="updated_at">
            <th mat-header-cell *matHeaderCellDef>Updated</th>
            <td mat-cell *matCellDef="let user">{{ user.updated_at }}</td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
        </table>
        <mat-paginator
          [length]="total"
          [pageSize]="perPage"
          [pageIndex]="page - 1"
          [pageSizeOptions]="[perPage]"
          (page)="onPageChange($event)"
        >
        </mat-paginator>
      </mat-card>
    </div>
  `,
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent implements OnInit {
  users: User[] = [];
  displayedColumns: string[] = ['user_id', 'email', 'password', 'created_at', 'updated_at'];
  loading = false;
  error = '';
  total = 0;
  page = 1;
  perPage = 10;

  constructor(
    private dialog: MatDialog,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  addNewUser() {
    const dialogRef = this.dialog.open(CreateUserDialogComponent, {
      width: '550px',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'created') {
        this.loadUsers();
      }
    });
  }

  loadUsers(page: number = 1) {
    this.loading = true;
    this.error = '';
    const headers = this.authService.getAuthHeaders();
    this.http
      .get<{ users: User[]; total: number }>(
        `http://localhost:8000/auth/login-user-list?page=${page}&per_page=${this.perPage}`,
        { headers }
      )
      .subscribe({
        next: (res) => {
          this.users = res.users;
          this.total = res.total;
          this.page = page;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load users.';
          this.loading = false;
        },
      });
  }

  onPageChange(event: PageEvent) {
    this.loadUsers(event.pageIndex + 1);
  }

  getMaskedPassword(password: string): string {
    if (!password) return '';
    const visibleLength = 8;
    return '*'.repeat(5) + password.slice(-visibleLength);
  }
}
