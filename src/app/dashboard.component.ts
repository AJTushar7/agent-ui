import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AuthService } from './auth.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs/operators';
import { Observable, combineLatest } from 'rxjs';

interface Chatbot {
  chatbot_id: string;
  description: string;
}

interface ChatbotApiResponse {
  total: number;
  page: number;
  per_page: number;
  chatbots: Chatbot[];
}

interface ChatbotDetails {
  chatbot_id: string;
  description: string;
  prompt_template: string;
  vector_db_path?: string;
  vector_db_name?: string;
}

interface UserModelDetailList {
  model_name: string;
  is_active: boolean;
}

interface LLMUserModelDetailList {
  user_model_details: UserModelDetailList[];
}

// Mock Data
const MOCK_CHATBOTS: Chatbot[] = [
  {
    chatbot_id: 'cb_001',
    description: 'Customer Support Assistant - Handles customer inquiries, provides product information, and resolves common issues efficiently.'
  },
  {
    chatbot_id: 'cb_002', 
    description: 'Sales Consultant Bot - Assists with lead qualification, product recommendations, and guides users through the sales process.'
  },
  {
    chatbot_id: 'cb_003',
    description: 'Technical Documentation Assistant - Helps developers find relevant documentation, API references, and troubleshooting guides.'
  },
  {
    chatbot_id: 'cb_004',
    description: 'HR Onboarding Bot - Guides new employees through onboarding process, company policies, and initial setup tasks.'
  },
  {
    chatbot_id: 'cb_005',
    description: 'E-commerce Shopping Assistant - Provides product recommendations, answers questions about orders, and helps with returns.'
  },
  {
    chatbot_id: 'cb_006',
    description: 'Educational Tutor Bot - Offers personalized learning assistance, explains complex concepts, and provides practice exercises.'
  }
];

const MOCK_API_RESPONSE: ChatbotApiResponse = {
  total: MOCK_CHATBOTS.length,
  page: 1,
  per_page: 9,
  chatbots: MOCK_CHATBOTS
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, HttpClientModule, MatCardModule, MatPaginatorModule,
    MatIconModule, MatButtonModule, MatDialogModule, FormsModule, ReactiveFormsModule, MatSelectModule, MatSlideToggleModule,
    MatInputModule, MatFormFieldModule
  ],
  template: `
    <div *ngIf="!hasDashboardPermission" class="no-permission">
      <mat-card>
        <h2>Access Denied</h2>
        <p>You don't have permission to access the Dashboard.</p>
      </mat-card>
    </div>
    
    <div *ngIf="hasDashboardPermission">
      <div class="dashboard-header">
        <div class="header-left">
          <div *ngIf="usingMockData" class="mock-data-indicator">
            <mat-icon>info</mat-icon>
            <span>Demo Mode: Showing sample chatbots</span>
          </div>
          <div class="search-container">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search chatbots</mat-label>
              <input matInput 
                     [formControl]="searchControl" 
                     placeholder="Search by ID or description">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
          </div>
        </div>
        <button mat-raised-button color="primary" (click)="openCreate()">
          <mat-icon>add</mat-icon> Create New Chatbot
        </button>
      </div>
      <div *ngIf="loading" class="loading">
        <mat-icon>hourglass_empty</mat-icon>
        <span>Loading chatbots...</span>
      </div>
      
      <div *ngIf="error" class="error">{{ error }}</div>
      
      <!-- Empty State for Search Results -->
      <ng-template #noResults>
        <div *ngIf="!loading && !error && chatbots.length > 0 && searchControl.value" class="empty-state">
          <mat-card class="empty-state-card">
            <mat-card-content>
              <div class="empty-state-content">
                <mat-icon class="empty-state-icon">search_off</mat-icon>
                <h2>No Results Found</h2>
                <p>No chatbots match your search criteria. Try adjusting your search terms.</p>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </ng-template>
      
      <!-- Empty State - No Chatbots -->
      <div *ngIf="!loading && !error && chatbots.length === 0" class="empty-state">
        <mat-card class="empty-state-card">
          <mat-card-content>
            <div class="empty-state-content">
              <mat-icon class="empty-state-icon">smart_toy</mat-icon>
              <h2>No Chatbots Found</h2>
              <p>Get started by creating your first AI chatbot. Build intelligent conversational agents tailored to your specific needs.</p>
              <button mat-raised-button color="primary" (click)="openCreate()" class="empty-state-button">
                <mat-icon>add</mat-icon>
                Create Your First Chatbot
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
      
      <!-- Cards Carousel -->
      <div *ngIf="(filteredChatbots$ | async) as filteredBots; else noResults" class="carousel-container" [hidden]="filteredBots?.length === 0">
        <button mat-icon-button class="carousel-nav left" (click)="scrollLeft()" [disabled]="!canScrollLeft">
          <mat-icon>chevron_left</mat-icon>
        </button>
        <div class="dashboard-carousel" #carouselContainer>
          <mat-card *ngFor="let bot of filteredBots" class="chatbot-card">
            <mat-card-header>
              <div mat-card-avatar class="chatbot-avatar">
                <mat-icon>smart_toy</mat-icon>
              </div>
              <mat-card-title>Chatbot</mat-card-title>
              <mat-card-subtitle>{{ bot.chatbot_id }}</mat-card-subtitle>
              <div class="card-actions">
                <button mat-icon-button (click)="openTryNow(bot)" matTooltip="Try Now">
                  <mat-icon>play_circle</mat-icon>
                </button>
                <button mat-icon-button (click)="openDetails(bot)" matTooltip="View & Edit Details">
                  <mat-icon>info</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="openDelete(bot)" matTooltip="Delete Chatbot">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </mat-card-header>
            <mat-card-content>
              <div class="desc">{{ bot.description }}</div>
            </mat-card-content>
          </mat-card>
        </div>
        <button mat-icon-button class="carousel-nav right" (click)="scrollRight()" [disabled]="!canScrollRight">
          <mat-icon>chevron_right</mat-icon>
        </button>
      </div>
      
      <!-- Pagination - only show when there are chatbots and no search -->
      <mat-paginator
        *ngIf="chatbots.length > 0 && total > perPage && !searchControl.value"
        [length]="total"
        [pageSize]="perPage"
        [pageIndex]="page - 1"
        [pageSizeOptions]="[9]"
        (page)="onPageChange($event)">
      </mat-paginator>
    </div>
  `,
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  chatbots: Chatbot[] = [];
  total = 0;
  page = 1;
  perPage = 9;
  loading = false;
  error = '';
  hasDashboardPermission = false;
  usingMockData = false;
  
  // Search functionality
  searchControl = new FormControl('');
  filteredChatbots$: Observable<Chatbot[]>;
  
  // Carousel navigation
  canScrollLeft = false;
  canScrollRight = true;
  
  @ViewChild('carouselContainer') carouselContainer!: ElementRef;

  constructor(
    private http: HttpClient, 
    private dialog: MatDialog,
    private authService: AuthService
  ) {
    // Initialize filtered chatbots observable with search functionality
    this.filteredChatbots$ = this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      startWith(''),
      map((searchTerm: string | null) => {
        const term = searchTerm?.trim() || '';
        if (!term) {
          return this.chatbots;
        }
        const searchLower = term.toLowerCase();
        return this.chatbots.filter(bot => 
          bot.chatbot_id.toLowerCase().includes(searchLower) ||
          bot.description.toLowerCase().includes(searchLower)
        );
      })
    );
  }

  ngOnInit() {
    this.hasDashboardPermission = this.authService.hasPermission('DASHBOARD');
    if (this.hasDashboardPermission) {
      this.fetchChatbots(this.page);
    }
  }

  fetchChatbots(page: number) {
    this.loading = true;
    this.error = '';
    this.usingMockData = false;
    const headers = this.authService.getAuthHeaders();
    
    this.http.get<ChatbotApiResponse>(`http://127.0.0.1:8000/chatbot?page=${page}&per_page=${this.perPage}`,{headers})
      .subscribe({
        next: (res) => {
          this.chatbots = res.chatbots;
          this.total = res.total;
          this.page = res.page;
          this.loading = false;
          this.usingMockData = false;
        },
        error: (err) => {
          console.log('API failed, using mock data for demo purposes');
          // Use mock data when API fails
          this.chatbots = MOCK_API_RESPONSE.chatbots;
          this.total = MOCK_API_RESPONSE.total;
          this.page = MOCK_API_RESPONSE.page;
          this.loading = false;
          this.usingMockData = true;
        }
      });
  }

  onPageChange(event: PageEvent) {
    this.fetchChatbots(event.pageIndex + 1);
  }

  openDetails(bot: Chatbot) {
    this.dialog.open(ChatbotDetailsDialog, {
      data: { chatbot_id: bot.chatbot_id },
      width: '500px',
      disableClose: true
    });
  }

  openDelete(bot: Chatbot) {
    const dialogRef = this.dialog.open(ChatbotDeleteDialog, {
      data: { chatbot_id: bot.chatbot_id },
      width: '400px',
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'deleted') {
        this.fetchChatbots(this.page);
      }
    });
  }

  openCreate() {
    const dialogRef = this.dialog.open(ChatbotCreateDialog, {
      width: '500px',
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'created') {
        this.fetchChatbots(this.page);
      }
    });
  }

  openTryNow(bot: Chatbot) {
    this.dialog.open(ChatbotTryNowDialog, {
      data: { chatbot_id: bot.chatbot_id },
      width: '500px',
      disableClose: true
    });
  }
  
  // Carousel navigation methods
  scrollLeft() {
    if (this.carouselContainer) {
      const cardWidth = 380; // Card width + gap
      this.carouselContainer.nativeElement.scrollBy({
        left: -cardWidth * 3,
        behavior: 'smooth'
      });
      this.updateScrollButtons();
    }
  }
  
  scrollRight() {
    if (this.carouselContainer) {
      const cardWidth = 380; // Card width + gap
      this.carouselContainer.nativeElement.scrollBy({
        left: cardWidth * 3,
        behavior: 'smooth'
      });
      this.updateScrollButtons();
    }
  }
  
  private updateScrollButtons() {
    if (this.carouselContainer) {
      const container = this.carouselContainer.nativeElement;
      this.canScrollLeft = container.scrollLeft > 0;
      this.canScrollRight = container.scrollLeft < (container.scrollWidth - container.clientWidth);
    }
  }
}

@Component({
  selector: 'chatbot-details-dialog',
  standalone: true,
  imports: [MatDialogModule, MatIconModule, MatButtonModule, CommonModule, FormsModule, HttpClientModule],
  template: `
    <div class="details-dialog">
      <h2 mat-dialog-title>
        <mat-icon class="avatar">smart_toy</mat-icon>
        Chatbot Details
        <button mat-mini-fab color="accent" class="train-btn" matTooltip="Train Model (RAG)" (click)="goToTrain()">
          TRAIN
        </button>
      </h2>
      <mat-dialog-content>
        <div *ngIf="loading" class="loading">Loading details...</div>
        <div *ngIf="error" class="error">{{ error }}</div>
        <form *ngIf="!loading && !error" #editForm="ngForm">
          <div class="form-group">
            <label>ID</label>
            <input class="form-control" [(ngModel)]="details.chatbot_id" name="chatbot_id" disabled />
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea class="form-control" [(ngModel)]="details.description" name="description"></textarea>
          </div>
          <div class="form-group">
            <label>Prompt Template</label>
            <textarea class="form-control" [(ngModel)]="details.prompt_template" name="prompt_template"></textarea>
          </div>
          <div class="form-group">
            <label>Vector DB Path</label>
            <input class="form-control" [(ngModel)]="details.vector_db_path" name="vector_db_path" [placeholder]="details.vector_db_name || ''" />
          </div>
        </form>
        <div *ngIf="saveError" class="error">{{ saveError }}</div>
        <div *ngIf="saveSuccess" class="success">Saved successfully!</div>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close [disabled]="saving">Close</button>
        <button mat-raised-button color="primary" (click)="save()" [disabled]="loading || error || saving">{{ saving ? 'Saving...' : 'Save' }}</button>
      </mat-dialog-actions>
    </div>
  `,
  styleUrls: ['./dashboard.component.css']
})
export class ChatbotDetailsDialog implements OnInit {
  details: ChatbotDetails = {
    chatbot_id: '',
    description: '',
    prompt_template: '',
    vector_db_path: '',
    vector_db_name: ''
  };
  loading = true;
  error = '';
  saving = false;
  saveError = '';
  saveSuccess = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { chatbot_id: string },
    private http: HttpClient,
    public dialogRef: MatDialogRef<ChatbotDetailsDialog>,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const headers=this.authService.getAuthHeaders();
    this.http.get<ChatbotDetails>(`http://127.0.0.1:8000/chatbot/${this.data.chatbot_id}`,{headers})
      .subscribe({
        next: (res) => {
          this.details = res;
          if (!this.details.vector_db_path && this.details.vector_db_name) {
            this.details.vector_db_path = this.details.vector_db_name;
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load chatbot details.';
          this.loading = false;
        }
      });
  }

  save() {
    this.saving = true;
    this.saveError = '';
    this.saveSuccess = false;
    const payload = {
      prompt_template: this.details.prompt_template,
      vector_db_path: this.details.vector_db_path,
      vector_db_name: this.details.vector_db_name || this.details.vector_db_path,
      description: this.details.description
    };
    this.http.put(`http://127.0.0.1:8000/chatbot/${this.details.chatbot_id}`, payload)
      .subscribe({
        next: () => {
          this.saving = false;
          this.saveSuccess = true;
        },
        error: (err) => {
          this.saving = false;
          this.saveError = 'Failed to save changes.';
        }
      });
  }

  goToTrain() {
    this.dialogRef.close();
    this.router.navigate(['/train', this.details.chatbot_id]);
  }
}

@Component({
  selector: 'chatbot-delete-dialog',
  standalone: true,
  imports: [MatDialogModule, MatIconModule, MatButtonModule, CommonModule, HttpClientModule],
  template: `
    <div class="delete-dialog">
      <h2 mat-dialog-title>
        <mat-icon color="warn">delete</mat-icon>
        Confirm Delete
      </h2>
      <mat-dialog-content>
        <div>Are you sure you want to delete chatbot <strong>{{ data.chatbot_id }}</strong>?</div>
        <div *ngIf="error" class="error">{{ error }}</div>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close [disabled]="loading">Cancel</button>
        <button mat-raised-button color="warn" (click)="deleteChatbot()" [disabled]="loading">{{ loading ? 'Deleting...' : 'Delete' }}</button>
      </mat-dialog-actions>
    </div>
  `,
  styleUrls: ['./dashboard.component.css']
})
export class ChatbotDeleteDialog {
  loading = false;
  error = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { chatbot_id: string },
    private http: HttpClient,
    public dialogRef: MatDialogRef<ChatbotDeleteDialog>
  ) {}

  deleteChatbot() {
    this.loading = true;
    this.error = '';
    this.http.delete(`http://127.0.0.1:8000/chatbot/${this.data.chatbot_id}`)
      .subscribe({
        next: () => {
          this.loading = false;
          this.dialogRef.close('deleted');
        },
        error: (err) => {
          this.loading = false;
          this.error = 'Failed to delete chatbot.';
        }
      });
  }
}

@Component({
  selector: 'chatbot-create-dialog',
  standalone: true,
  imports: [MatDialogModule, MatIconModule, MatButtonModule, CommonModule, FormsModule, HttpClientModule],
  template: `
    <div class="details-dialog">
      <div class="dialog-header">
        <h2 mat-dialog-title>
          <mat-icon class="avatar">add</mat-icon>
          Create New Chatbot
        </h2>
        <button mat-icon-button mat-dialog-close class="close-button">
          <mat-icon>close</mat-icon>
        </button>
      </div>
      <mat-dialog-content>
        <form #createForm="ngForm">
          <div class="form-group">
            <label>ID</label>
            <input class="form-control" [(ngModel)]="chatbot_id" name="chatbot_id" required  placeholder="No special character or space allowed"/>
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea class="form-control" [(ngModel)]="description" name="description" required placeholder="Description of the chatbot"></textarea>
          </div>
          <div class="form-group">
            <label>Prompt Template</label>
            <textarea class="form-control prompt-template" [(ngModel)]="prompt_template" name="prompt_template" required rows="8"></textarea>
          </div>
          <div class="form-group">
            <label>Vector DB Path</label>
            <input class="form-control" [(ngModel)]="vector_db_path" name="vector_db_path" required />
          </div>
        </form>
        <div *ngIf="error" class="error">{{ error }}</div>
        <div *ngIf="success" class="success">{{ success }}</div>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close [disabled]="loading">Cancel</button>
        <button mat-raised-button color="primary" (click)="create()" [disabled]="loading || !chatbot_id || !description || !prompt_template || !vector_db_path">
          {{ loading ? 'Creating...' : 'Create' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styleUrls: ['./dashboard.component.css']
})
export class ChatbotCreateDialog {
  chatbot_id = '';
  description = '';
  vector_db_path = '';
  loading = false;
  error = '';
  success = '';
  prompt_template: string = `
You are CRM AI assistant for (your company name). 
Your role is to help with CRM services by answering only from the knowledge base provided (retrieved documents).  

### Guidelines:
- Always base your answers strictly on the retrieved context.
- If the answer is not found in the context, politely say: 
  "I don’t have that information right now. Please contact Company name customer care at +91-XXXXXXXXXX."
- Keep answers clear, concise, and customer-friendly.
- Format responses with bullet points, headings, or step-by-step instructions if it improves readability.
- Never invent details (like prices, services, or locations) if they are not explicitly in the context.
- If customers ask about services, pricing, locations, or policies, use the retrieved data to give accurate details.
- For unrelated queries (e.g., jokes, philosophy), politely explain that you can only help with CRM-related information.

Here are some details: {details}
Question: {question}
`;

  constructor(
    private http: HttpClient,
    public dialogRef: MatDialogRef<ChatbotCreateDialog>,
    private authService: AuthService
  ) {}

  create() {
    this.loading = true;
    this.error = '';
    this.success = '';
    const payload = {
      chatbot_id: this.chatbot_id,
      description: this.description,
      prompt_template: this.prompt_template,
      vector_db_path: this.vector_db_path,
      vector_db_name: this.vector_db_path
    };
    const headers=this.authService.getAuthHeaders();
    this.http.post<{ message: string }>('http://127.0.0.1:8000/chatbot', payload,{headers})
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

@Component({
  selector: 'chatbot-try-now-dialog',
  standalone: true,
  imports: [MatDialogModule, MatIconModule, MatButtonModule, CommonModule, FormsModule, HttpClientModule, MatSelectModule, MatSlideToggleModule, MatProgressSpinnerModule],
  template: `
    <div class="details-dialog">
      <h2 mat-dialog-title>
        <mat-icon class="avatar">play_circle</mat-icon>
        Try Chatbot
      </h2>
      <mat-dialog-content>
        <form #tryForm="ngForm">
          <div class="form-group">
            <label>{{data.chatbot_id}}</label>
            <mat-select [(ngModel)]="selectedModel" name="selectedModel" required class="form-control">
              <mat-option *ngFor="let model of availableModels" [value]="model.model_name">
                {{ model.model_name }}
              </mat-option>
            </mat-select>
          </div>
          <div class="form-group">
            <label class="toggle-label">
              <mat-slide-toggle [(ngModel)]="enableRAG" name="enableRAG">
                Enable RAG Vector Search
              </mat-slide-toggle>
            </label>
          </div>
          <div class="form-group">
            <label>Question</label>
            <textarea class="form-control" [(ngModel)]="question" name="question" required placeholder="Type your question..."></textarea>
          </div>
        </form>
        <div *ngIf="loading" class="loading">
          <mat-progress-spinner diameter="20" mode="indeterminate"></mat-progress-spinner>
          <span style="margin-left: 8px;">{{ thinkingText }}</span>
        </div>

        <div *ngIf="error" class="error">{{ error }}</div>
        <div *ngIf="answer" class="success"><strong>Answer:</strong> {{ answer }}</div>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close [disabled]="loading">Close</button>
        <button mat-raised-button color="primary"
                (click)="tryChatbot()"
                [disabled]="loading || !question || !selectedModel">
          {{ loading ? 'Thinking...' : 'Try Now' }}
        </button>

      </mat-dialog-actions>
    </div>
  `,
  styleUrls: ['./dashboard.component.css']
})
export class ChatbotTryNowDialog implements OnInit {
  question = '';
  answer = '';
  loading = false;
  error = '';
  availableModels: UserModelDetailList[] = [];
  selectedModel = '';
  enableRAG = true;
  thinkingText = '🤖 Thinking';
  private thinkingInterval: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { chatbot_id: string },
    private http: HttpClient,
    public dialogRef: MatDialogRef<ChatbotTryNowDialog>,
    private authservice: AuthService
  ) {}

  ngOnInit() {
    this.loadModels();
  }

  loadModels() {
    const headers=this.authservice.getAuthHeaders();
    this.http.get<LLMUserModelDetailList>('http://localhost:8000/model/user-model-details-list',{headers})
      .subscribe({
        next: (res) => {
          this.availableModels = res.user_model_details.filter(model => model.is_active);
          if (this.availableModels.length > 0) {
            this.selectedModel = this.availableModels[0].model_name;
          }
        },
        error: (err) => {
          this.error = 'Failed to load available models.';
        }
      });
  }

  tryChatbot() {
    this.loading = true;
    this.error = '';
    this.answer = '';
    this.startThinkingAnimation();
  
    const payload = {
      chatbot_id: this.data.chatbot_id,
      question: this.question,
      llm_model: this.selectedModel,
      use_vector_db: this.enableRAG
    };
    const headers = this.authservice.getAuthHeaders();
  
    this.http.post<{ answer: string }>('http://localhost:8000/chat', payload, { headers })
      .subscribe({
        next: (res) => {
          this.loading = false;
          this.stopThinkingAnimation();
          this.typeWriterEffect(res.answer);
        },
        error: () => {
          this.loading = false;
          this.stopThinkingAnimation();
          this.error = 'Failed to get answer.';
        }
      });
  }
  

  typeWriterEffect(fullText: string) {
    this.answer = '';
    let i = 0;
    const interval = setInterval(() => {
      this.answer += fullText[i];
      i++;
      if (i >= fullText.length) {
        clearInterval(interval);
      }
    }, 30); // speed in ms (lower = faster)
  }

  startThinkingAnimation() {
    let dots = 0;
    this.thinkingInterval = setInterval(() => {
      dots = (dots + 1) % 4; // cycles 0 → 3
      this.thinkingText = '🤖 Thinking' + '.'.repeat(dots);
    }, 500);
  }
  
  stopThinkingAnimation() {
    clearInterval(this.thinkingInterval);
    this.thinkingText = '🤖 Thinking';
  }
  
  
}