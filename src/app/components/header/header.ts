import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { SearchBarComponent } from '../search-bar/search-bar'; // Ensure path is correct

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

  constructor(private router: Router) {}

  ngOnInit() {
    this.checkLoginStatus();
  }

  checkLoginStatus() {
    // Check if user is verified
    const isVerified = localStorage.getItem('ownerVerifiedwWIthOtp');
    this.userMobile = localStorage.getItem('ownerMobile') || '';
    this.isLoggedIn = (isVerified === 'true');
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
    // Clear session data
    localStorage.removeItem('ownerVerifiedwWIthOtp');
    localStorage.removeItem('ownerMobile');
    localStorage.removeItem('loginTimestamp');
    localStorage.removeItem('ownerUser');
    
    // Update state & redirect
    this.isLoggedIn = false;
    this.isMenuOpen = false;
    this.router.navigate(['/']);
  }
}