import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, RouterModule } from '@angular/router'; // Ensure RouterModule is imported for routerLinkActive
import { MatIconModule } from '@angular/material/icon';
import { SearchBarComponent } from '../search-bar/search-bar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, SearchBarComponent],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent implements OnInit {
  
  isLoggedIn = false;
  isMenuOpen = false;
  userMobile = '';

  constructor(private router: Router, private authService: AuthService) {}

  private checkAndClearExpiredStorage() {
    const loginTime = localStorage.getItem('loginTimestamp');
    if (loginTime) {
      const TEN_DAYS = 10 * 24 * 60 * 60 * 1000;
      const timeElapsed = Date.now() - parseInt(loginTime, 10);
      if (timeElapsed >= TEN_DAYS) {
        localStorage.removeItem('ownerVerifiedwWIthOtp');
        localStorage.removeItem('loginTimestamp');
        localStorage.removeItem('ownerEmail'); 
        localStorage.removeItem('ownerUser'); 
      }
    }

    const userLoginTime = localStorage.getItem('userloginTimestamp');
    if (userLoginTime) {
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
    
    this.authService.isLoggedIn$.subscribe((status) => {
      this.isLoggedIn = status;
      if (status) {
        this.userMobile = localStorage.getItem('ownerEmail') || '';
      } else {
        this.userMobile = '';
        this.isMenuOpen = false; // Close menu if logged out
      }
    });
  }

  // Opens/Closes the Profile Dropdown
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  // Closes the menu explicitly (used when clicking a link inside it)
  closeMenu() {
    this.isMenuOpen = false;
  }

  logout() {
    this.authService.logout();
    this.isMenuOpen = false;
    this.router.navigate(['/']);
  }
}