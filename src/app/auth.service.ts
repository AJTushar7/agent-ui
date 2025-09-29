import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

interface LoginResponse {
  access_token: string;
  token_type: string;
  message: string;
}

interface UserRole {
  role_name: string;
  created_at: string;
  updated_at: string;
}

interface ScreenPermission {
  screen_name: string;
  isvalid: boolean;
  created_at: string;
  updated_at: string;
}

interface UserDetails {
  user_id: string;
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  attributes: any[];
  roles: UserRole[];
  screen_permissions: ScreenPermission[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8000';
  private tokenKey = 'access_token';
  private userKey = 'user_details';

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string): Observable<boolean> {
    const loginData = { email, password };
    
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, loginData)
      .pipe(
        switchMap(response => {
          // Store the token in localStorage
          localStorage.setItem(this.tokenKey, response.access_token);
          console.log('Token stored:', response.access_token);
          // Fetch user details after successful login
          return this.getUserDetails().pipe(
            map(() => {
              console.log('User details fetched and stored');
              return true;
            })
          );
        }),
        catchError(error => {
          console.error('Login error:', error);
          return throwError(() => new Error(error.error?.message || 'Login failed'));
        })
      );
  }

  getUserDetails(): Observable<UserDetails> {
    const headers = this.getAuthHeaders();
    
    return this.http.get<UserDetails>(`${this.apiUrl}/auth/user-details`, { headers })
      .pipe(
        map(userDetails => {
          // Store user details in localStorage
          localStorage.setItem(this.userKey, JSON.stringify(userDetails));
          console.log('User details stored:', userDetails);
          return userDetails;
        }),
        catchError(error => {
          console.error('Get user details error:', error);
          return throwError(() => new Error('Failed to fetch user details'));
        })
      );
  }

  logout(): Observable<boolean> {
    const headers = this.getAuthHeaders();
    
    return this.http.post(`${this.apiUrl}/auth/logout`, {}, { headers })
      .pipe(
        tap(() => {
          // Clear local storage regardless of API response
          this.clearLocalStorage();
        }),
        map(() => {
          // Navigate to login page
          this.router.navigate(['/login']);
          return true;
        }),
        catchError(error => {
          console.error('Logout error:', error);
          // Even if API fails, clear local storage and navigate to login
          this.clearLocalStorage();
          this.router.navigate(['/login']);
          return of(true);
        })
      );
  }

  private clearLocalStorage() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  isLoggedIn(): boolean {
    const hasToken = !!this.getToken();
    const hasUserDetails = !!this.getUserDetailsFromStorage();
    console.log('isLoggedIn check:', { hasToken, hasUserDetails });
    return hasToken && hasUserDetails;
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUserDetailsFromStorage(): UserDetails | null {
    const userDetails = localStorage.getItem(this.userKey);
    return userDetails ? JSON.parse(userDetails) : null;
  }

  hasPermission(screenName: string): boolean {
    const userDetails = this.getUserDetailsFromStorage();
    console.log(`Checking permission for ${screenName}:`, { userDetails });
    
    if (!userDetails) {
      console.log(`No user details found for ${screenName}`);
      return false;
    }
    
    const hasPermission = userDetails.screen_permissions.some(
      permission => permission.screen_name === screenName && permission.isvalid
    );
    
    console.log(`Permission check for ${screenName}:`, {
      screenPermissions: userDetails.screen_permissions,
      hasPermission: hasPermission
    });
    
    return hasPermission;
  }

  hasRole(roleName: string): boolean {
    const userDetails = this.getUserDetailsFromStorage();
    if (!userDetails) return false;
    
    return userDetails.roles.some(role => role.role_name === roleName);
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }
}