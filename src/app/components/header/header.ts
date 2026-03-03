import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { SearchBarComponent } from '../search-bar/search-bar';
import { AuthService } from '../../services/auth.service'; // <--- Import Service

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, SearchBarComponent],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent implements OnInit {
  
  mobileMenuOpen = false;
  isLoggedIn = false;
  isMenuOpen = false;
  userMobile = '';

  // Inject AuthService
  constructor(private router: Router, private authService: AuthService) {}
private checkAndClearExpiredStorage() {
    const loginTime = localStorage.getItem('loginTimestamp');
    
    if (loginTime) {
      // 10 Days in milliseconds
      const TEN_DAYS = 10 * 24 * 60 * 60 * 1000;
      const timeElapsed = Date.now() - parseInt(loginTime, 10);

      if (timeElapsed >= TEN_DAYS) {
        // Data has expired! Clean it up.
        localStorage.removeItem('ownerVerifiedwWIthOtp');
        localStorage.removeItem('loginTimestamp');
        localStorage.removeItem('ownerEmail'); 
        localStorage.removeItem('ownerUser'); 

     
      
      }
    }

    //check for basic user
    const userLoginTime = localStorage.getItem('userloginTimestamp');
    
    if (userLoginTime) {
      // 1 Day in milliseconds
      const ONE_DAY = 1 * 24 * 60 * 60 * 1000;
      const timeElapsed = Date.now() - parseInt(userLoginTime, 10); 
      
      if (timeElapsed >= ONE_DAY) {
        localStorage.removeItem('userVerifiedwWIthOtp');
        localStorage.removeItem('userloginTimestamp');
        localStorage.removeItem('userEmail');
      }
    }
  }
  ngOnInit() {
    this.checkAndClearExpiredStorage();
    // === THE FIX ===
    // Subscribe to the "Live" login status
    this.authService.isLoggedIn$.subscribe((status) => {
      this.isLoggedIn = status;
      
      // Update the user details if logged in
      if (status) {
        this.userMobile = localStorage.getItem('ownerEmail') || ''; // Changed to Email based on recent changes
      } else {
        this.userMobile = '';
      }
    });
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  logout() {
    // Use the Service logout (which handles localStorage + Notification)
    this.authService.logout();
    
    this.isMenuOpen = false;
    this.router.navigate(['/']);
  }
  
}