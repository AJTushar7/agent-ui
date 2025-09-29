import { Component,OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { ModelApiKeyDialog } from './model-api-key-dialog/model-api-key-dialog'; 
import { Observable } from 'rxjs';

interface UserModelDetail {
  model_name: string;
  api_key: string;
  is_active: boolean;
  is_visible: boolean;
}

interface ApiResponse {
  user_model_details: UserModelDetail[];
}

@Component({
  selector: 'app-api-keys',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
   <div class="api-keys-container">
  <div class="header">
    <h2>API Keys</h2>
    <div class="button-group">
    <button class="add-new-key-btn" (click)="addNewKey()" [disabled]="loading">
    Add New Key
  </button>
    <button class="refresh-btn" (click)="loadApiKeys()" [disabled]="loading">
      <i class="icon-refresh" [class.spinning]="loading"></i>
      Refresh
    </button>
    </div>
  </div>

  <div *ngIf="loading" class="loading">
    Loading API keys...
  </div>

  <div *ngIf="error" class="error">
    {{ error }}
  </div>

  <div *ngIf="!loading && !error && userModelDetails.length === 0" class="no-data">
    No API keys found.
  </div>

  <table *ngIf="!loading && !error && userModelDetails.length > 0" class="api-keys-table">
    <thead>
      <tr>
        <th>Model Name</th>
        <th>API Key</th>
        <th>Status</th>
        <th>Visible</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr *ngFor="let detail of userModelDetails; let i = index">
        <td>{{ detail.model_name }}</td>
        <td class="api-key-cell">
          <code class="api-key">{{ getDisplayedKey(detail.api_key, i) }}</code>
        </td>
        <td>
          <span class="status-badge" [ngClass]="{'active': detail.is_active, 'inactive': !detail.is_active}">
            {{ detail.is_active ? 'Active' : 'Inactive' }}
          </span>
        </td>
        <td>
          <span class="visibility-badge" [ngClass]="{'visible': detail.is_visible, 'hidden': !detail.is_visible}">
            {{ detail.is_visible ? 'Visible' : 'Hidden' }}
          </span>
        </td>
        <td class="actions">
          <button 
            class="action-btn view-btn" 
            (click)="toggleKeyVisibility(i)"
            [title]="isKeyVisible(i) ? 'Hide API key' : 'Show API key'">
            <i class="icon" [class.icon-eye]="!isKeyVisible(i)" [class.icon-eye-off]="isKeyVisible(i)"></i>
            {{ isKeyVisible(i) ? 'Hide' : 'View' }}
          </button>
          <button 
            class="action-btn copy-btn" 
            (click)="copyToClipboard(detail.api_key)"
            title="Copy API key">
            <i class="icon icon-copy"></i>
            Copy
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</div>
  `,
  styleUrls: ['./api-keys.component.css']
})
export class ApiKeysComponent implements OnInit {
  userModelDetails: UserModelDetail[] = [];
  private tokenKey = 'access_token';
  loading = false;
  error: string | null = null;
  visibleKeys: { [key: string]: boolean } = {};

  private readonly API_URL = 'http://localhost:8000/model/user-model-details';
  private readonly AUTH_TOKEN = 'YOUR_TOKEN'; // Replace with actual token or get from service

  constructor(private http: HttpClient, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadApiKeys();
  }

  loadApiKeys(): void {
    this.loading = true;
    this.error = null;
    const headers = this.getAuthHeaders();


    this.http.get<ApiResponse>(this.API_URL, { headers }).subscribe({
      next: (response) => {
        this.userModelDetails = response.user_model_details;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load API keys. Please try again.';
        this.loading = false;
        console.error('Error loading API keys:', error);
      }
    });
  }

  maskApiKey(apiKey: string): string {
    if (apiKey.length <= 4) return apiKey;
    return '*'.repeat(apiKey.length - 4) + apiKey.slice(-4);
  }

  toggleKeyVisibility(index: number): void {
    this.visibleKeys[index] = !this.visibleKeys[index];
  }

  isKeyVisible(index: number): boolean {
    return this.visibleKeys[index] || false;
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      // You can add a toast notification here
      console.log('API key copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  }

  getDisplayedKey(apiKey: string, index: number): string {
    return this.isKeyVisible(index) ? apiKey : this.maskApiKey(apiKey);
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

  addNewKey() {
    const dialogRef = this.dialog.open(ModelApiKeyDialog, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Dialog result:', result);
        // Here, result.modelName and result.apiKey will be available
        // Add your logic to save or process the new API key
      }
    });
  }
}