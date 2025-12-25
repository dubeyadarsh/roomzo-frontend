import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PropertyService } from '../../services/property.service';
import { Subscription, switchMap, tap } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

// 1. Import Toastr
import { ToastrService } from 'ngx-toastr';
import { getAmenitiesMap } from '../../services/Utility';

@Component({
  selector: 'app-property-details',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, RouterLink],
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

  private routeSub: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private propertyService: PropertyService,
    private cd: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private toastr: ToastrService // 2. Inject Toastr
  ) {}

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.pipe(
      tap(() => {
        this.isLoading = true;
        this.property = undefined;
        this.similarProperties = [];
        this.mapUrl = null; 
        window.scrollTo(0, 0);
        this.cd.detectChanges();
      }),
      switchMap(params => {
        this.currentId = params.get('id');
        if (!this.currentId) {
            this.toastr.error('Invalid Property ID', 'Error'); // Toast for bad URL
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
        } else {
            this.toastr.warning('Property data not found', 'Not Found');
        }
        this.isLoading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Error:', err);
        this.toastr.error('Failed to load property details. Please try again.', 'Server Error');
        this.isLoading = false;
        this.cd.detectChanges();
      }
    });
  }

  // --- Map Logic with Error Toast ---
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
        } else {
            // If map fails, just log it, don't annoy user with a toast unless crucial
            console.warn('Could not geocode location for map.');
        }
      },
      error: () => this.toastr.warning('Could not load map location', 'Map Error')
    });
  }

  // --- Share Logic with Success Toast ---
  shareProperty() {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl).then(() => {
      this.isCopied = true;
      this.toastr.success('Link copied to clipboard!', 'Shared'); // Success Toast
      
      setTimeout(() => {
        this.isCopied = false;
        this.cd.detectChanges();
      }, 2000);
      
      this.cd.detectChanges();
    }).catch(() => {
      this.toastr.error('Failed to copy link', 'Error');
    });
  }

  // --- Placeholder Actions (Mock Interactions) ---
  saveProperty() {
    // Logic to save to Favorites (Mock)
    this.toastr.success('Property saved to your favorites', 'Saved');
  }

  requestBooking() {
    this.toastr.info('Booking request sent to agent!', 'Request Sent');
  }

  scheduleTour() {
    this.toastr.info('Tour scheduling feature coming soon!', 'Coming Soon');
  }

  contactAgent() {
    this.toastr.success('Agent has been notified. They will contact you shortly.', 'Contacted');
  }

  // --- Rest of Logic ---
  ngOnDestroy(): void {
    if (this.routeSub) this.routeSub.unsubscribe();
  }
  
  loadSuggestions(currentId: string) {
    const storedLocation = localStorage.getItem('user_location');
    let apiCall;

    if (storedLocation) {
        const loc = JSON.parse(storedLocation);
        apiCall = this.propertyService.searchListingsWithFilters(loc.state, loc.city, 0, 4, undefined, false);
    } else {
        apiCall = this.propertyService.getAllListingsWithFilters(0, 4, undefined, false);
    }

    apiCall.subscribe({
        next: (res: any) => {
            if (res.listings) {
                let filtered = res.listings.filter((p: any) => String(p.id) !== String(currentId));
                if (filtered.length > 3) {
                   filtered.splice(Math.floor(Math.random() * filtered.length), 1);
                }
                this.similarProperties = filtered;
                this.cd.detectChanges();
            }
        },
        error: () => {
            // Silent fail for suggestions is usually better than an error popup
            console.warn('Failed to load similar properties'); 
        }
    });
  }

  mapAmenities(propData: any) {
    if (!propData) return;
    const config = getAmenitiesMap();
    this.displayAmenities = config.filter(c => propData[c.key] === true);
  }

  formatPrice(price: number): string {
    return '₹' + (price ? price.toLocaleString() : '0');
  }
}