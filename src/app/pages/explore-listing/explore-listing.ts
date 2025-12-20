import { Component, OnInit , ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { ListingService, PropertyListing, ListingFilter } from '../../services/property-listing.service';
import { Router } from '@angular/router'; 
@Component({
  selector: 'app-explore-listings',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, FormsModule],
  templateUrl: './explore-listing.html',
  styleUrls: ['./explore-listing.css']
})
export class ExploreListingsComponent implements OnInit {
  
  // UI State
  listings: PropertyListing[] = [];
  totalItems = 0;
  isLoading = false;

  // Filter State (Bound to UI)
  filters: ListingFilter = {
    minPrice: 0,
    maxPrice: 5000,
    propertyType: '',
    bedrooms: 'Any',
    searchQuery: ''
  };

  // Pagination State
  currentPage = 1;
  pageSize = 3; // Shows 6 items per page (2 rows of 3)
  totalPages = 1;
  pagesArray: number[] = [];

  constructor(private listingService: ListingService,private cd: ChangeDetectorRef,private router: Router) {}

  ngOnInit(): void {
    this.loadListings();
  }

 loadListings(): void {
  this.isLoading = true;

  this.listingService.getListings(this.filters, this.currentPage, this.pageSize)
    .subscribe({
      next: (response) => {
        console.log('Data received:', response); // Debug log
        this.listings = response.data;
        this.totalItems = response.total;
        this.calculatePagination();

        // Turn off loader
        this.isLoading = false;
        this.cd.detectChanges(); // Force UI update
      },
      error: (err) => {
        console.error('Error loading listings:', err);
        // Turn off loader even if there is an error
        this.isLoading = false; 
        this.cd.detectChanges();
      }
    });
}

  // Triggered by "Apply Filters" or Search Button
  applyFilters(): void {
    this.currentPage = 1; // Reset to page 1 on new filter
    this.loadListings();
  }

  // Triggered by "Reset all"
  resetFilters(): void {
    this.filters = {
      minPrice: 0,
      maxPrice: 5000,
      propertyType: '',
      bedrooms: 'Any',
      searchQuery: ''
    };
    this.applyFilters();
  }

  // Pagination Logic
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadListings();
    }
  }

  calculatePagination(): void {
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    // Create array [1, 2, 3...] for the UI loop
    this.pagesArray = Array(this.totalPages).fill(0).map((x, i) => i + 1);
  }

  // Helpers for UI Display
  formatPrice(price: number): string {
    return '₹' + price.toLocaleString();
  }
  viewDetails(id: string): void {
    this.router.navigate(['/property-details', id]);
  }
}