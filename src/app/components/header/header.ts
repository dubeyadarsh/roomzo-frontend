import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, RouterModule, NavigationEnd } from '@angular/router'; 
import { MatIconModule } from '@angular/material/icon';
import { SearchBarComponent } from '../search-bar/search-bar';
import { AuthService } from '../../services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, SearchBarComponent],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent implements OnInit {
  isLoggedIn = false;
  isMenuOpen = false; // Mobile bottom sheet state
  isDropdownOpen = false; // Desktop dropdown state
  userMobile = '';
  isScrolled = false;
  isHomePage = true;

  constructor(private router: Router, private authService: AuthService) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isHomePage = event.urlAfterRedirects === '/' || event.urlAfterRedirects.startsWith('/#');
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 50;
  }

  // Closes dropdowns when clicking anywhere outside
 @HostListener('document:click', ['$event'])
onDocumentClick(event: MouseEvent) { // Add the event parameter here
  this.isDropdownOpen = false;
}

  ngOnInit() {
    this.authService.isLoggedIn$.subscribe((status) => {
      this.isLoggedIn = status;
      if (status) {
        // Fallback to 'User' if email not found
        this.userMobile = localStorage.getItem('ownerEmail') || localStorage.getItem('userEmail') || 'User';
      } else {
        this.userMobile = '';
        this.isMenuOpen = false;
        this.isDropdownOpen = false;
      }
    });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    if (this.isMenuOpen) this.isDropdownOpen = false;
  }

  toggleDropdown(event: Event) {
    event.stopPropagation(); // Stop propagation to document click listener
    this.isDropdownOpen = !this.isDropdownOpen;
    if (this.isDropdownOpen) this.isMenuOpen = false;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  logout() {
  this.authService.logout(); // Ensure your service broadcasts the new status
  this.isLoggedIn = false;   // Explicitly reset local state
  this.userMobile = '';     // Clear user info
  this.isMenuOpen = false;   // Close the mobile menu
  this.isDropdownOpen = false; // Close desktop dropdown
  this.router.navigate(['/']);
}
}