import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-model-api-key-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatSelectModule,
  ],

  template: `
    <div class="dialog-header">
      <h2 mat-dialog-title>Add New API Key</h2>
      <button mat-icon-button mat-dialog-close class="close-button">
        <mat-icon>close</mat-icon>
      </button>
    </div>
    <form [formGroup]="form" (ngSubmit)="submitForm()">
      <mat-dialog-content>
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Model Type</mat-label>
          <mat-select formControlName="modelType" required>
            <mat-option value="GPT">GPT</mat-option>
            <mat-option value="MISTRAL">MISTRAL</mat-option>
             <mat-option value="GOOGLE">GOOGLE</mat-option>
             <mat-option value="GROK">GROK</mat-option>
          </mat-select>
          <mat-error *ngIf="form.controls['modelType'].invalid && form.controls['modelType'].touched">
            Model Type is required
          </mat-error>
        </mat-form-field>
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Model Name</mat-label>
          <input matInput formControlName="modelName" required />
          <mat-error *ngIf="form.controls['modelName'].invalid && form.controls['modelName'].touched">
            Model Name is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>API Key</mat-label>
          <input matInput formControlName="apiKey" required />
          <mat-error *ngIf="form.controls['apiKey'].invalid && form.controls['apiKey'].touched">
            API Key is required
          </mat-error>
        </mat-form-field>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="onCancel()">Cancel</button>
        <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">Save</button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`
    .full-width { width: 100%; }
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.5rem;
      background: white;
      color: var(--text-primary);
      border-radius: 12px 12px 0 0;
      border-bottom: 1px solid var(--border-light);
      min-height: 60px;
    }
    .dialog-header h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary);
    }
    .close-button {
      color: var(--text-secondary);
      width: 32px;
      height: 32px;
      background: var(--background-alt);
      border-radius: 8px;
      transition: var(--transition-fast);
    }
    .close-button:hover {
      background: var(--error-color);
      color: white;
    }
    mat-dialog-content {
      padding: 1.5rem;
      background: var(--background);
    }
    mat-dialog-actions {
      padding: 1rem 1.5rem;
      background: white;
      border-top: 1px solid var(--border-light);
    }
  `]
})

export class ModelApiKeyDialog {
  form!: FormGroup;  // Declare without initialization here

  modelName='';
  apiKey='';
  loading = false;
  error = '';
  success = '';
  private tokenKey = 'access_token';
 
  ngOnInit(): void {
    // Initialize form here after fb is available
    this.form = this.fb.group({
      modelName: ['', Validators.required],
      apiKey: ['', Validators.required],
      modelType: ['', Validators.required]

    });
  }

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ModelApiKeyDialog>,
    private http: HttpClient,
    
  ) {}

  

  submitForm() {
    if (this.form.valid) {
      this.loading = true;
      const payload = {
        model_name: this.form.value.modelName,
        api_key: this.form.value.apiKey
      };
      const headers = this.getAuthHeaders();
      this.http.post<{ message: string }>('http://127.0.0.1:8000/model/user-model-details', payload,{headers})
      .subscribe({
        next: (res) => {
          this.loading = false;
          this.success = res.message;
          setTimeout(() => this.dialogRef.close('created'), 1000);
        },
        error: (err) => {
          this.loading = false;
          this.error = 'Failed to create chatbot.';
        }
      });
    }
  }

  onCancel() {
    this.dialogRef.close(null);
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
}

