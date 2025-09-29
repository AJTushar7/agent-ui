import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-train-model',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatDialogModule, FormsModule],
  template: `
    <div class="train-model-container">
      <mat-card class="train-card">
        <mat-card-title>Train Model for Chatbot: {{ chatbotId }}</mat-card-title>
        <mat-card-content>
          <div class="train-options">
            <button mat-raised-button color="primary" (click)="trainCSV()">
              <mat-icon>upload_file</mat-icon> Train using CSV
            </button>
            <button mat-raised-button color="accent" (click)="trainPrompt()">
              <mat-icon>edit_note</mat-icon> Train using Prompt
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styleUrls: ['./train-model.component.css']
})
export class TrainModelComponent implements OnInit {
  chatbotId = '';
  
  constructor(private route: Router, private dialog: MatDialog) {
    const url = this.route.url;
    const parts = url.split('/');
    this.chatbotId = parts[parts.length - 1];
  }
  
  ngOnInit() {}
  
  trainCSV() {
    this.dialog.open(TrainCSVDialog, {
      data: { chatbot_id: this.chatbotId },
      width: '500px',
      disableClose: true
    });
  }
  
  trainPrompt() {
    this.dialog.open(TrainPromptDialog, {
      data: { chatbot_id: this.chatbotId },
      width: '500px',
      disableClose: true
    });
  }
}

@Component({
  selector: 'train-csv-dialog',
  standalone: true,
  imports: [MatDialogModule, MatIconModule, MatButtonModule, CommonModule, FormsModule, HttpClientModule],
  template: `
    <div class="details-dialog">
      <h2 mat-dialog-title>
        <mat-icon class="avatar">upload_file</mat-icon>
        Train using CSV
      </h2>
      <mat-dialog-content>
        <form #csvForm="ngForm">
          <div class="form-group">
            <label>Select CSV File</label>
            <div class="file-upload-container">
              <input type="file" #fileInput (change)="onFileSelected($event)" accept=".csv" style="display: none;" />
              <button type="button" mat-stroked-button (click)="fileInput.click()" class="file-select-btn">
                <mat-icon>attach_file</mat-icon>
                {{ selectedFile ? selectedFile.name : 'Choose File' }}
              </button>
            </div>
            <div *ngIf="selectedFile" class="file-info">
              <mat-icon>check_circle</mat-icon>
              File selected: {{ selectedFile.name }} ({{ (selectedFile.size / 1024).toFixed(1) }} KB)
            </div>
          </div>
        </form>
        <div *ngIf="loading" class="loading">Uploading and training model...</div>
        <div *ngIf="error" class="error">{{ error }}</div>
        <div *ngIf="success" class="success">{{ success }}</div>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close [disabled]="loading">Cancel</button>
        <button mat-raised-button color="primary" (click)="uploadCSV()" [disabled]="loading || !selectedFile">
          {{ loading ? 'Uploading...' : 'Upload & Train' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styleUrls: ['./train-model.component.css']
})
export class TrainCSVDialog {
  selectedFile: File | null = null;
  loading = false;
  error = '';
  success = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { chatbot_id: string },
    private http: HttpClient,
    public dialogRef: MatDialogRef<TrainCSVDialog>
  ) {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      this.selectedFile = file;
      this.error = '';
    } else {
      this.error = 'Please select a valid CSV file.';
      this.selectedFile = null;
    }
  }

  uploadCSV() {
    if (!this.selectedFile) {
      this.error = 'Please select a CSV file.';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    const formData = new FormData();
    formData.append('chatbot_id', this.data.chatbot_id);
    formData.append('file', this.selectedFile);

    this.http.post<{ message: string }>('http://127.0.0.1:8000/rag/upload_csv', formData)
      .subscribe({
        next: (res) => {
          this.loading = false;
          this.success = res.message;
          setTimeout(() => this.dialogRef.close(), 2000);
        },
        error: (err) => {
          this.loading = false;
          this.error = 'Failed to upload CSV file.';
        }
      });
  }
}

@Component({
  selector: 'train-prompt-dialog',
  standalone: true,
  imports: [MatDialogModule, MatIconModule, MatButtonModule, CommonModule, FormsModule, HttpClientModule],
  template: `
    <div class="details-dialog">
      <h2 mat-dialog-title>
        <mat-icon class="avatar">edit_note</mat-icon>
        Train using Prompt
      </h2>
      <mat-dialog-content>
        <form #promptForm="ngForm">
          <div class="form-group">
            <label>Field</label>
            <input class="form-control" [(ngModel)]="field" name="field" required placeholder="e.g., drycleaning_coat_price" />
          </div>
          <div class="form-group">
            <label>Value</label>
            <textarea class="form-control" [(ngModel)]="value" name="value" required placeholder="e.g., coat drycleaning price is INR 250"></textarea>
          </div>
        </form>
        <div *ngIf="loading" class="loading">Training model...</div>
        <div *ngIf="error" class="error">{{ error }}</div>
        <div *ngIf="success" class="success">{{ success }}</div>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close [disabled]="loading">Cancel</button>
        <button mat-raised-button color="primary" (click)="train()" [disabled]="loading || !field || !value">
          {{ loading ? 'Training...' : 'Train' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styleUrls: ['./train-model.component.css']
})
export class TrainPromptDialog {
  field = '';
  value = '';
  loading = false;
  error = '';
  success = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { chatbot_id: string },
    private http: HttpClient,
    public dialogRef: MatDialogRef<TrainPromptDialog>
  ) {}

  train() {
    this.loading = true;
    this.error = '';
    this.success = '';
    const payload = {
      chatbot_id: this.data.chatbot_id,
      field: this.field,
      value: this.value
    };
    this.http.post<{ message: string; document_id: string }>('http://127.0.0.1:8000/rag/add_field_value', payload)
      .subscribe({
        next: (res) => {
          this.loading = false;
          this.success = res.message;
          setTimeout(() => this.dialogRef.close(), 2000);
        },
        error: (err) => {
          this.loading = false;
          this.error = 'Failed to train model.';
        }
      });
  }
} 