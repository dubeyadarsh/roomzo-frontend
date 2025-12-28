import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = environment.apiUrl + "/api/auth";

  constructor(private http: HttpClient) {}

  sendOtp(mobileNumber: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/send-otp`, { phone:mobileNumber });
  }

  verifyOtp(mobileNumber: string, otp: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/verify-otp`, { phone:mobileNumber, otp:otp });
  }

  // Helper to save session
  saveSession(mobile: string,user: any) {
    localStorage.setItem('ownerVerifiedwWIthOtp', 'true');
    localStorage.setItem('ownerMobile', mobile);
    localStorage.setItem('ownerUser', JSON.stringify(user));
    localStorage.setItem('loginTimestamp', Date.now().toString());
  }
  getOwnerDetails(ownerId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/auth/owner-info/${ownerId}`);
  }
}