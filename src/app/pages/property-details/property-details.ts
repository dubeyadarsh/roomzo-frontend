import { Component, OnInit, ChangeDetectorRef, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router'; // Added Router
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PropertyService } from '../../services/property.service';
import { Subscription, switchMap, tap } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import { getAmenitiesMap } from '../../services/Utility';

// Import Swiper register function
import { register } from 'swiper/element/bundle';
import { AuthService } from '../../services/auth.service';

// Register Swiper custom elements immediately
register();

@Component({
  selector: 'app-property-details',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './property-details.html',
  styleUrls: ['./property-details.css']
})
export class PropertyDetailsComponent implements OnInit, OnDestroy {
  property: any | undefined;
  similarProperties: any[] = [];
  displayAmenities: any[] = [];
  
  isLoading = true;
  showFullDescription = false;
  currentId: string | null = null;
  mapUrl: SafeResourceUrl | null = null; 
  isCopied = false;

  // --- NEW: Modal State ---
  showContactModal = false;
  ownerDetails = {
    name: 'Property Owner', // Default
    phone: '+91 98XXX XXXXX',
    email: 'hidden@roomzo.com'
  };

  private routeSub: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router, // Injected Router
    private propertyService: PropertyService,
    private cd: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private toastr: ToastrService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.pipe(
      tap(() => {
        this.isLoading = true;
        this.property = undefined;
        this.similarProperties = [];
        this.mapUrl = null; 
        this.showContactModal = false; // Reset modal on nav
        window.scrollTo(0, 0);
        this.cd.detectChanges();
      }),
      switchMap(params => {
        this.currentId = params.get('id');
        if (!this.currentId) {
            this.toastr.error('Invalid Property ID', 'Error');
            throw new Error('No ID');
        }
        
        this.loadSuggestions(this.currentId);
        return this.propertyService.getListingById(this.currentId);
      })
    ).subscribe({
      next: (response: any) => {
        if (response.status === 1 && response.data) {
          this.property = response.data;
          this.mapAmenities(this.property);
          this.loadMapCoordinates(this.property.city, this.property.state);
          
          // --- NEW: Check if we returned from Login to open popup ---
          this.checkReturnFromLogin();
        } else {
            this.toastr.warning('Property data not found', 'Not Found');
        }
        this.isLoading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Error:', err);
        this.toastr.error('Failed to load property details.', 'Server Error');
        this.isLoading = false;
        this.cd.detectChanges();
      }
    });
  }

  // --- NEW: Auth Logic & Popup Trigger ---
  contactAgent() {
    if (this.isUserLoggedIn()) {
      this.openContactModal();
    } else {
      // Redirect to Login with return URL that includes '?showContact=true'
      // This ensures the popup opens automatically after they verify OTP
      const returnUrl = `/property-details/${this.currentId}?showContact=true`;
      this.router.navigate(['/login'], { queryParams: { returnUrl: returnUrl } });
    }
  }

  isUserLoggedIn(): boolean {
    const isVerified = localStorage.getItem('ownerVerifiedwWIthOtp');
    const loginTime = localStorage.getItem('loginTimestamp');
    const TEN_DAYS = 10 * 24 * 60 * 60 * 1000;

    if (isVerified === 'true' && loginTime) {
      const timeElapsed = Date.now() - parseInt(loginTime, 10);
      return timeElapsed < TEN_DAYS;
    }
    return false;
  }

  checkReturnFromLogin() {
    // Check query params for 'showContact'
    const params = this.route.snapshot.queryParams;
    if (params['showContact'] === 'true' && this.isUserLoggedIn()) {
      this.openContactModal();
      
      // Clear the query param so refresh doesn't keep opening it
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { showContact: null },
        queryParamsHandling: 'merge',
        replaceUrl: true
      });
    }
  }

  openContactModal() {
    // Check if property has ownerId
    if (!this.property || !this.property.ownerId) {
       this.toastr.error('Owner information not available');
       return;
    }

    this.isLoading = true; // Optional: Show spinner inside modal if you want

    this.authService.getOwnerDetails(this.property.ownerId).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.status === 1 && res.data) {
          this.ownerDetails = {
            name: res.data.name,
            phone: res.data.phone == null ? this.property.tempContactNo : res.data.phone,
            email: res.data.email
          };
          this.showContactModal = true;
          this.cd.detectChanges();
        } else {
          this.toastr.error('Could not fetch owner details');
        }
      },
      error: () => {
        this.isLoading = false;
        this.toastr.error('Failed to load contact info');
      }
    });
  }

  closeContactModal() {
    this.showContactModal = false;
  }
  // ---------------------------------------

  loadMapCoordinates(city: string, state: string) {
    this.propertyService.getGeocode(city, state).subscribe({
      next: (results: any[]) => {
        if (results && results.length > 0) {
          const location = results[0];
          const lat = location.lat;
          const lon = location.lon;
          const offset = 0.02; 
          const bbox = `${Number(lon)-offset},${Number(lat)-offset},${Number(lon)+offset},${Number(lat)+offset}`;
          const rawUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;
          
          this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl);
          this.cd.detectChanges();
        }
      },
      error: () => this.toastr.warning('Could not load map location', 'Map Error')
    });
  }

  shareProperty() {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl).then(() => {
      this.isCopied = true;
      this.toastr.success('Link copied to clipboard!', 'Shared');
      setTimeout(() => {
        this.isCopied = false;
        this.cd.detectChanges();
      }, 2000);
      this.cd.detectChanges();
    }).catch(() => {
      this.toastr.error('Failed to copy link', 'Error');
    });
  }

  saveProperty() { this.toastr.success('Property saved to your favorites', 'Saved'); }
  requestBooking() { this.contactAgent(); } // Redirect booking to contact as well
  scheduleTour() { this.toastr.info('Tour scheduling feature coming soon!', 'Coming Soon'); }

  ngOnDestroy(): void {
    if (this.routeSub) this.routeSub.unsubscribe();
  }
  
  loadSuggestions(currentId: string) {
    const storedLocation = localStorage.getItem('user_location');
    let apiCall = storedLocation 
        ? this.propertyService.searchListingsWithFilters(JSON.parse(storedLocation).state, JSON.parse(storedLocation).city, 0, 4, undefined, false)
        : this.propertyService.getAllListingsWithFilters(0, 4, undefined, false);

    apiCall.subscribe({
        next: (res: any) => {
            if (res.listings) {
                let filtered = res.listings.filter((p: any) => String(p.id) !== String(currentId));
                if (filtered.length > 3) filtered.splice(Math.floor(Math.random() * filtered.length), 1);
                this.similarProperties = filtered;
                this.cd.detectChanges();
            }
        },
        error: () => console.warn('Failed to load similar properties')
    });
  }

  mapAmenities(propData: any) {
    if (!propData) return;
    const config = getAmenitiesMap();
    this.displayAmenities = config.filter(c => propData[c.dbKey] === true);
  }

  formatPrice(price: number): string {
    return '₹' + (price ? price.toLocaleString() : '0');
  }
}