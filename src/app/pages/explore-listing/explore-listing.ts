import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router'; // 1. Ensure ActivatedRoute is imported
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

  availabilityFilter: 'available' | 'all' = 'all';

  // Pagination
  currentPage = 0;
  pageSize = 6;
  totalPages = 0;
  pagesArray: number[] = [];

  guidebook = {
    customRules: '',
    rules: [] as string[],           // Array of strings
    nearby: [] as any[]              // Array of objects { name, type, distance }
  };
  placeTypes = ['transport', 'restaurant', 'shopping', 'attraction', 'hospital', 'other'];
  // 2. Add Subscription Variable (To track active request)
  private searchSubscription: Subscription | null = null;

  constructor(
    private propertyService: PropertyService,
    private cd: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.allCities = City.getCitiesOfCountry('IN') || [];
    
    this.searchControl.valueChanges.subscribe(val => {
      if (typeof val === 'string') {
        this.filterCities(val);
        if (!val) this.selectedLocation = null;
      }
    });

    // 3. LISTEN FOR QUERY PARAMS FROM HOME PAGE
    this.route.queryParams.subscribe(params => {
      
      // If there are parameters in the URL, apply them to our local filters
      if (Object.keys(params).length > 0) {
        
        // A. Handle Location (City, State, Lat, Lng)
        if (params['city'] && params['state']) {
          const city = params['city'];
          const state = params['state'];
          this.selectedLocation = { city, state };
          this.searchControl.setValue(`${city}, ${state}`, { emitEvent: false });
          
          this.filters.city = city;
          this.filters.state = state;
        }

        if (params['lat'] && params['lng']) {
          this.filters.lat = Number(params['lat']);
          this.filters.lng = Number(params['lng']);
        }

        // B. Handle Property Type Dropdown
        if (params['propertyType']) {
          this.filters.propertyType = params['propertyType'];
        }

        // C. Handle Max Price Dropdown
        if (params['maxPrice']) {
          this.filters.maxPrice = Number(params['maxPrice']);
        }
      }

      // Automatically fetch listings with whatever filters we gathered
      this.loadListings();
    });
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

    // Extract exact coordinates from the country-state-city library
    this.filters.lat = cityData.latitude ? Number(cityData.latitude) : undefined;
    this.filters.lng = cityData.longitude ? Number(cityData.longitude) : undefined;
    
    // Set fallback names just in case backend needs them
    this.filters.city = cityData.name;
    this.filters.state = stateName;

    this.selectedLocation = { city: cityData.name, state: stateName };
    this.applyFilters();
  }

  loadListings(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }

    this.isLoading = true;
    this.cd.detectChanges();

    let isRentedParam = this.availabilityFilter === 'available' ? false : undefined;

    // SMART GPS LOGIC: 
    // If user hasn't actively searched for a city, try to use their GPS location 
    // from the Home page so their raw browsing experience is ordered by distance!
    if (!this.filters.city && !this.filters.lat) {
      const storedLocation = localStorage.getItem('user_geo_location');
      if (storedLocation) {
        const parsed = JSON.parse(storedLocation);
        this.filters.lat = parsed.lat;
        this.filters.lng = parsed.lng;
      }
    }

    this.searchSubscription = this.propertyService.searchListingsWithFilters(
        this.currentPage,
        this.pageSize,
        this.filters,
        isRentedParam
      ).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cd.detectChanges(); 
      })
    ).subscribe({
      next: (response: any) => {
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
  isMobileFiltersOpen = false; 
  
  toggleMobileFilters(): void {
    this.isMobileFiltersOpen = !this.isMobileFiltersOpen;
  }

}