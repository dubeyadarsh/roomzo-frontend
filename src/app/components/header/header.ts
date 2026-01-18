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

  ngOnInit() {
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