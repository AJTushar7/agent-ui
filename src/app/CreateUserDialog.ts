

import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-user-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatDialogModule],
  template: `
    <div class="create-user-dialog">
      <h2 mat-dialog-title>Create User</h2>
      <form #f="ngForm">
        <div class="form-group">
          <label>Email</label>
          <input class="form-control" type="email" [(ngModel)]="email" name="email" required />
        </div>
        <div class="form-group">
          <label>Password</label>
          <input class="form-control" type="password" [(ngModel)]="password" name="password" required />
        </div>
      </form>
      <div *ngIf="error" class="error">{{ error }}</div>
      <div *ngIf="success" class="success">{{ success }}</div>
      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()" [disabled]="loading">Cancel</button>
        <button mat-raised-button color="primary" (click)="createUser()" [disabled]="loading || !email || !password">
          {{ loading ? 'Creating...' : 'Create' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styleUrls: ['./createuserdialog.css']
})
export class CreateUserDialogComponent {
  email = '';
  password = '';
  loading = false;
  error = '';
  success = '';

  constructor(
    public dialogRef: MatDialogRef<CreateUserDialogComponent>,
    private http: HttpClient
  ) {}

  createUser() {
    this.loading = true;
    this.error = '';
    this.success = '';
    const payload = { email: this.email, password: this.password };
    this.http.post<string>('http://localhost:8000/auth/register', payload)
      .subscribe({
        next: (res) => {
          this.loading = false;
          this.success = 'User created successfully!';
          setTimeout(() => this.dialogRef.close('created'), 1000);
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error || 'Failed to create user.';
        }
      });
  }

  onCancel() {
    this.dialogRef.close(null);
  }
}
