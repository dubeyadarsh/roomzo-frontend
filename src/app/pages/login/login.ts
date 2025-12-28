import { Component,ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  
  step: 'MOBILE' | 'OTP' = 'MOBILE';
  mobileNumber: string = '';
  otp: string = '';
  isLoading = false;
  returnUrl: string = '/list';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private cd: ChangeDetectorRef // 2. Inject it
  ) {
    // Capture where the user wanted to go
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/list';
  }

  onSendOtp() {
    if (!this.mobileNumber || this.mobileNumber.length < 10) {
      this.toastr.warning('Please enter a valid mobile number');
      return;
    }

    this.isLoading = true;
    this.authService.sendOtp(this.mobileNumber).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.status === 1) {
          this.step = 'OTP';
                    this.cd.detectChanges();
          this.toastr.success(`OTP sent to ${this.mobileNumber}`, 'Sent!');
          // Check your Backend Console for the OTP!
        }
      },
      error: () => {
        this.isLoading = false;
        this.toastr.error('Failed to send OTP. Try again.');
      }
    });
  }

  onVerifyOtp() {
    if (!this.otp || this.otp.length < 4) {
      this.toastr.warning('Please enter the 4-digit OTP');
      return;
    }

    this.isLoading = true;
    this.authService.verifyOtp(this.mobileNumber, this.otp).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.status === 1) {
          // Save Session for 10 Days
          console.log('OTP Verified. Logging in user.',res);
          this.authService.saveSession(this.mobileNumber,res.data.user);
          
          this.toastr.success('Login Successful', 'Welcome');
          this.router.navigateByUrl(this.returnUrl);
        } else {
          this.toastr.error('Invalid OTP', 'Error');
        }
      },
      error: () => {
        this.isLoading = false;
        this.toastr.error('Verification failed');
      }
    });
  }
}