import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs'; // <--- 1. Import BehaviorSubject
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = environment.apiUrl;

  // 2. Create a "Live" Subject to track login state
  // We initialize it by checking localStorage so it remembers state on page reload
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.checkInitialStatus());

  // 3. Expose it as an Observable for the Header to listen to
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient) {}

  // --- Helper to check status on app load ---
  private checkInitialStatus(): boolean {
    // Returns true if the 'ownerVerifiedwWIthOtp' key exists and is 'true'
    return localStorage.getItem('ownerVerifiedwWIthOtp') === 'true';
  }

  // --- Auth Methods (Updated for Email) ---

  sendOtp(email: string): Observable<any> {
    // Sending key as "email" to match your Java Backend
    return this.http.post(`${this.baseUrl}/api/auth/send-otp`, { phone: email });
  }

  verifyOtp(email: string, otp: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/auth/verify-otp`, { phone: email, otp: otp });
  }

  // --- Session Management ---

  saveSession(email: string, user: any) {
    localStorage.setItem('ownerVerifiedwWIthOtp', 'true');
    localStorage.setItem('ownerEmail', email); // Changed from mobile to email
    localStorage.setItem('ownerUser', JSON.stringify(user));
    localStorage.setItem('loginTimestamp', Date.now().toString());

    // 4. NOTIFY SUBSCRIBERS (Header will update immediately)
    this.isLoggedInSubject.next(true);
  }

  logout() {
    // Clear all session data
    localStorage.removeItem('ownerVerifiedwWIthOtp');
    localStorage.removeItem('ownerEmail');
    localStorage.removeItem('loginTimestamp');
    localStorage.removeItem('ownerUser');

    // 5. NOTIFY SUBSCRIBERS (Header will show "Login" button immediately)
    this.isLoggedInSubject.next(false);
  }

  // --- Other Methods ---

  getOwnerDetails(ownerId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/auth/owner-info/${ownerId}`);
  }

  // Kept for reference if you still use Firebase in parallel
  loginWithFirebase(token: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/auth/login`, { token });
  }

  // --- Contact Us Form ---
  sendContactForm(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/contact/send`, data);
  }
}