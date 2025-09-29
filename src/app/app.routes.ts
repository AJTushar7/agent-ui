import { Routes } from '@angular/router';
import { LoginComponent } from './login.component';
import { DashboardComponent } from './dashboard.component';
import { MainDashboardComponent } from './maindashboard.component';
import { TrainModelComponent } from './train-model.component';
import { ApiKeysComponent } from './api-keys.component';
import { authGuard } from './auth.guard';
import { AdminComponent } from './admin.component';
import { IntegrationKeysComponent } from './model-api-key-dialog/integration-key';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  {path: 'admin', component: AdminComponent, canActivate: [authGuard]},
  {path: 'integration-keys', component: IntegrationKeysComponent, canActivate: [authGuard]},
  {
    path: 'configuration',
    component: MainDashboardComponent,
    canActivate: [authGuard],
    children: [
      { path: 'api-keys', component: ApiKeysComponent, canActivate: [authGuard] }
    ]
  },
  { path: 'train/:chatbotId', component: TrainModelComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '/login' }
];
