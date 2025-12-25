import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';

// 1. Add RxJS Imports
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { City, State } from 'country-state-city';
import { PropertyService, ListingFilter } from '../../services/property.service';

@Component({
  selector: 'app-explore-listings',
  standalone: true,
  imports: [
    CommonModule, MatIconModule, MatButtonModule, 
    FormsModule, ReactiveFormsModule, 
    MatAutocompleteModule, MatInputModule
  ],
  templateUrl: './explore-listing.html',
  styleUrls: ['./explore-listing.css']
})
export class ExploreListingsComponent implements OnInit, OnDestroy {
  
  // Data State
  listings: any[] = [];
  totalItems = 0;
  isLoading = false;

  // Search State
  searchControl = new FormControl('');
  filteredCities: any[] = [];
  allCities: any[] = [];
  selectedLocation: { city: string, state: string } | null = null;

  // Filter State
  filters: ListingFilter = {
    minPrice: 0,
    maxPrice: 50000,
    propertyType: 'Any',
    bedrooms: 'Any'
  };

  availabilityFilter: 'available' | 'all' = 'available';

  // Pagination
  currentPage = 0;
  pageSize = 6;
  totalPages = 0;
  pagesArray: number[] = [];

  // 2. Add Subscription Variable (To track active request)
  private searchSubscription: Subscription | null = null;

  constructor(
    private propertyService: PropertyService,
    private cd: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.allCities = City.getCitiesOfCountry('IN') || [];
    
    this.searchControl.valueChanges.subscribe(val => {
      if (typeof val === 'string') {
        this.filterCities(val);
        if (!val) this.selectedLocation = null;
      }
    });

    this.loadListings();
  }

  // 3. Cleanup on component destroy
  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  // --- Search Logic ---
  filterCities(value: string) {
    const filterValue = value.toLowerCase();
    this.filteredCities = this.allCities
      .filter(city => city.name.toLowerCase().includes(filterValue))
      .slice(0, 10);
  }

  displayCity = (city: any): string => {
    if (city && city.name) {
       const stateName = this.getStateName(city.stateCode);
       return `${city.name}, ${stateName}`;
    }
    return city || '';
  }

  onCitySelected(event: any) {
    const cityData = event.option.value;
    const stateName = this.getStateName(cityData.stateCode);

    this.selectedLocation = {
      city: cityData.name,
      state: stateName
    };
    this.applyFilters();
  }

  // --- Main Data Loading (UPDATED) ---
  loadListings(): void {
    // 4. Cancel any previous running request!
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }

    this.isLoading = true;
    // Force update to show spinner immediately
    this.cd.detectChanges();

    // Prepare Params
    let isRentedParam: boolean | undefined;
    if (this.availabilityFilter === 'available') {
      isRentedParam = false;
    } else {
      isRentedParam = undefined;
    }

    let apiObservable;

    if (this.selectedLocation) {
      apiObservable = this.propertyService.searchListingsWithFilters(
        this.selectedLocation.state,
        this.selectedLocation.city,
        this.currentPage,
        this.pageSize,
        this.filters,
        isRentedParam
      );
    } else {
      apiObservable = this.propertyService.getAllListingsWithFilters(
        this.currentPage,
        this.pageSize,
        this.filters,
        isRentedParam
      );
    }

    // 5. Subscribe with 'finalize' to guarantee loader stop
    this.searchSubscription = apiObservable.pipe(
      finalize(() => {
        // This block runs when request finishes (Success OR Error)
        this.isLoading = false;
        this.cd.detectChanges(); 
      })
    ).subscribe({
      next: (response: any) => {
        // Safe check for null response or null listings
        if (!response) {
            this.listings = [];
            this.totalItems = 0;
            return;
        }

        this.listings = response.listings || [];
        this.totalItems = response.totalItems || 0;
        this.totalPages = response.totalPages || 0;
        this.calculatePagination();
      },
      error: (err: any) => {
        console.error('API Error:', err);
        // Ensure data is cleared on error so user sees "No properties" or empty state
        this.listings = []; 
        this.totalItems = 0;
      }
    });
  }

  applyFilters(): void {
    this.currentPage = 0;
    this.loadListings();
  }

  resetFilters(): void {
    this.filters = { minPrice: 0, maxPrice: 50000, propertyType: 'Any', bedrooms: 'Any' };
    this.searchControl.setValue('');
    this.selectedLocation = null;
    this.availabilityFilter = 'available';
    this.applyFilters();
  }

  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadListings();
    }
  }

  calculatePagination(): void {
    this.pagesArray = Array.from({ length: this.totalPages }, (_, i) => i);
  }

  formatPrice(price: number): string {
    return '₹' + (price ? price.toLocaleString() : '0');
  }
  
  viewDetails(id: string) {
      this.router.navigate(['/property-details', id]);
  }
  
  getStateName(stateCode: string): string {
    const state = State.getStateByCodeAndCountry(stateCode, 'IN');
    return state ? state.name : stateCode;
  }
}