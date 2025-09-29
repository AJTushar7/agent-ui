import { CommonModule } from "@angular/common";
import { HttpClient, HttpClientModule } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatDialogActions, MatDialogContent, MatDialogModule } from "@angular/material/dialog";
import { MatDivider } from "@angular/material/divider";
import { MatIcon } from "@angular/material/icon";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatTableModule } from "@angular/material/table";
import { AuthService } from "../auth.service";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Inject } from "@angular/core";

interface IntegrationKeys {
    integrationKey: string;
    totalApiQuota: number;
    apiQuotaLeft: number;
    totalTokenQuota: number;
    tokenQuotaLeft: number;
}

interface UsageReport{
    chatbotId: string;
    hits: number;
    tokenUsed: number;
    lastUsed:  string;
}

  
interface ReportRow {
    chatbot_id: string;
    hits: number;
    tokens_used: number;
    last_used_at: string;
}

@Component({
    selector: 'app-curl-dialog',
    imports: [MatDialogContent, MatDialogActions],
    template: `
      <h2 mat-dialog-title>cURL Request</h2>
      <mat-dialog-content>
        <pre>{{ data.curl }}</pre>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button (click)="copyCurl()">Copy</button>
        <button mat-button (click)="close()">Close</button>
      </mat-dialog-actions>
    `,
    styles: [`
      h2 {
        padding: 1.25rem 1.5rem;
        margin: 0;
        background: white;
        border-bottom: 1px solid var(--border-light);
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--text-primary);
      }
      mat-dialog-content {
        padding: 1.5rem;
        background: var(--background);
      }
      pre {
        background: #f5f5f5;
        padding: 12px;
        border-radius: 8px;
        white-space: pre-wrap;
        word-wrap: break-word;
        max-height: 400px;
        overflow-y: auto;
        margin: 0;
      }
      mat-dialog-actions {
        padding: 1rem 1.5rem;
        background: white;
        border-top: 1px solid var(--border-light);
      }
    `]
})
export class CurlDialogComponent {
    constructor(
      public dialogRef: MatDialogRef<CurlDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: { curl: string }
    ) {}
  
    copyCurl() {
        navigator.clipboard.writeText(this.data.curl);
        alert('Curl request copied!');
    }
    
    close() {
        this.dialogRef.close();
    }
}


@Component({
    selector: 'app-integration-keys',
    standalone: true,
    imports: [CommonModule, MatCardModule, MatTableModule, MatButtonModule, MatPaginatorModule, MatDialogModule, HttpClientModule,MatDivider,MatIcon],
    template: `
    <div class="api-keys-container">
        <mat-card class="key-card mat-elevation-z3">
            <div class="key-card-header">
                <h2>Integration Keys</h2>
                <button 
                    mat-raised-button 
                    color="primary" 
                    (click)="createUserKey()" 
                    [disabled]="loading">
                    Add New Key
                </button>
            </div>
            <mat-divider></mat-divider>
            <table mat-table [dataSource]="integrationKeyData" class="mat-elevation-z1 key-table">

                <ng-container matColumnDef="integrationKey">
                    <th mat-header-cell *matHeaderCellDef> Integration API Key </th>
                    <td mat-cell *matCellDef="let element">
                        <span class="key-value">
                            {{ visibleKeys.has(element.integrationKey) ? element.integrationKey : (element.integrationKey | slice:0:7) + '****' }}
                        </span>
                    </td>
                </ng-container>
                <ng-container matColumnDef="totalApiQuota">
                    <th mat-header-cell *matHeaderCellDef> Total API Quota </th>
                    <td mat-cell *matCellDef="let element">{{ element.totalApiQuota | number }}</td>
                </ng-container>
                <ng-container matColumnDef="apiQuotaLeft">
                    <th mat-header-cell *matHeaderCellDef> API Quota Left </th>
                    <td mat-cell *matCellDef="let element">
                        <span [ngClass]="getQuotaClass(element.apiQuotaLeft, element.totalApiQuota)" class="quota-badge">
                            {{ element.apiQuotaLeft | number }}
                        </span>
                    </td>
                </ng-container>
                <ng-container matColumnDef="totalTokenQuota">
                    <th mat-header-cell *matHeaderCellDef> Total Token Quota </th>
                    <td mat-cell *matCellDef="let element">{{ element.totalTokenQuota | number }}</td>
                </ng-container>
                <ng-container matColumnDef="tokenQuotaLeft">
                    <th mat-header-cell *matHeaderCellDef> Token Quota Left </th>
                    <td mat-cell *matCellDef="let element">
                        <span [ngClass]="getQuotaClass(element.tokenQuotaLeft, element.totalTokenQuota)" class="quota-badge">
                        {{ element.tokenQuotaLeft | number }}
                        </span>
                    </td>
                </ng-container>
                <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef> Actions </th>
                    <td mat-cell *matCellDef="let element">
                    <button mat-icon-button matTooltip="View" (click)="viewKey(element.integrationKey)">
                        <mat-icon>{{ visibleKeys.has(element.integrationKey) ? 'visibility_off' : 'visibility' }}</mat-icon>
                    </button>
                    <button mat-icon-button matTooltip="Copy" (click)="copyKey(element.integrationKey)">
                        <mat-icon>content_copy</mat-icon>
                    </button>
                    <button mat-icon-button matTooltip="Delete" color="warn" (click)="deleteKey()">
                        <mat-icon>delete</mat-icon>
                    </button>
                    <button mat-icon-button matTooltip="View Curl" (click)="openCurlDialog(element.integrationKey)">
                        <mat-icon>terminal</mat-icon>
                    </button>
                    </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="['integrationKey','totalApiQuota','apiQuotaLeft','totalTokenQuota','tokenQuotaLeft','actions']"></tr>
                <tr mat-row *matRowDef="let row; columns: ['integrationKey','totalApiQuota','apiQuotaLeft','totalTokenQuota','tokenQuotaLeft','actions']"></tr>
            </table>
        </mat-card>

        <mat-card class="report-card mat-elevation-z3">
            <h3>Usage Report</h3>
            <table mat-table [dataSource]="usageReport" class="mat-elevation-z2 report-table">
            <ng-container matColumnDef="sno">
                <th mat-header-cell *matHeaderCellDef> S.No </th>
                <td mat-cell *matCellDef="let element; let i = index">{{ i + 1 }}</td>
            </ng-container>
            <ng-container matColumnDef="chatbot_id">
                <th mat-header-cell *matHeaderCellDef> Chatbot ID </th>
                <td mat-cell *matCellDef="let element">{{ element.chatbotId }}</td>
            </ng-container>
            <ng-container matColumnDef="hits">
                <th mat-header-cell *matHeaderCellDef> Hits </th>
                <td mat-cell *matCellDef="let element">{{ element.hits }}</td>
            </ng-container>
            <ng-container matColumnDef="tokens_used">
                <th mat-header-cell *matHeaderCellDef> Token Used </th>
                <td mat-cell *matCellDef="let element">{{ element.tokenUsed }}</td>
            </ng-container>
            <ng-container matColumnDef="last_used_at">
                <th mat-header-cell *matHeaderCellDef> Last Used At </th>
                <td mat-cell *matCellDef="let element">{{ element.lastUsed }}</td>
            </ng-container>
            

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
        </mat-card>
    </div>


            `,
    styleUrl: './integration-key.css'
})
export class IntegrationKeysComponent implements OnInit {
    loading = false;
    showKey = false;
    error = '';
    integrationKeyData: IntegrationKeys[]=[]
    visibleKeys = new Set<string>();
    usageReport : UsageReport[]=[];
    
    constructor(private http: HttpClient, private authService : AuthService, private dialog: MatDialog) {}
    

  // Table data
  displayedColumns: string[] = [
    'sno',
    'chatbot_id',
    'hits',
    'tokens_used',
    'last_used_at'
  ];

  reportData: ReportRow[] = [
    {
      chatbot_id: 'cb01',
      hits: 34,
      tokens_used: 2350,
      last_used_at: '2025-09-05 10:20'
    },

    {
      chatbot_id: 'cb02',
      hits: 12,
      tokens_used: 480,
      last_used_at: '2025-09-04 18:55'
    }
  ];

  ngOnInit(): void {
    this.loaduserkeys();
    this.loadUsageReport()
  }

  createUserKey() {
    this.loading = true;
    this.error = '';
    const headers = this.authService.getAuthHeaders();
    const body = { desc: "create user" };
    this.http.post<{ message: string }>(
        `http://localhost:8000/integration/user-integration-keys`, 
        body,
        { headers }
      ).subscribe({
        next: (res) => {
          console.log(res.message); // "User integration key created successfully"
          // Reload keys after success
          this.loaduserkeys();
        },
        error: (err) => {
          console.error(err);
          this.error = 'Failed to create integration key.';
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        }
      });
    }

  loaduserkeys() {
    this.loading = true;
      this.error = '';

      const headers=this.authService.getAuthHeaders();
      this.http.get<{ integrationKeys: IntegrationKeys[]}>(`http://localhost:8000/integration/user-integration-keys`,{headers})
      .subscribe({
        next: (res) => {
          this.integrationKeyData = res.integrationKeys;
          this.loading=false;
        },
        error: (err) => {
          this.error = 'Failed to load users.';
          this.loading = false;
        }
      });

  }

  loadUsageReport() {
    this.loading = true;
      this.error = '';

      const headers=this.authService.getAuthHeaders();
      this.http.get<{ usageReport: UsageReport[]}>(`http://localhost:8000/integration/user-usage-report`,{headers})
      .subscribe({
        next: (res) => {
          this.usageReport = res.usageReport;
          this.loading=false;
        },
        error: (err) => {
          this.error = 'Failed to load users.';
          this.loading = false;
        }
      });

  }

  viewKey(key: string) {
    if (this.visibleKeys.has(key)) {
        this.visibleKeys.delete(key);
      } else {
        this.visibleKeys.add(key);
      }
  }

  copyKey(key: string) {
    navigator.clipboard.writeText(key);
    alert('Key copied!');
  }

  deleteKey() {
    // Implement delete logic
  }

  openCurlDialog(integrationKey: string) {
    const curl = `curl --location 'http://127.0.0.1:8000/user/chat' \
  --header 'x-api-key: ${integrationKey}' \
  --header 'Content-Type: application/json' \
  --data '{
      "chatbot_id": "dhobilite",
      "question": "what is the price of drycleaning a coat",
      "llm_model": "mistral",
      "use_vector_db": true
    }'`;
  
    this.dialog.open(CurlDialogComponent, {
      width: '700px',
      data: { curl }
    });
  }

  getQuotaClass(left: number, total: number): string {
    if (total === 0) return 'quota-red';
    const percent = (left / total) * 100;
    if (percent > 50) return 'quota-green';
    if (percent > 20) return 'quota-orange';
    return 'quota-red';
  }
}

