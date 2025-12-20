import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ListingService, PropertyListing } from '../../services/property-listing.service';

@Component({
  selector: 'app-property-details',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, RouterLink],
  templateUrl: './property-details.html',
  styleUrls: ['./property-details.css']
})
export class PropertyDetailsComponent implements OnInit {
  property: PropertyListing | undefined;
  similarProperties: PropertyListing[] = [];
  displayAmenities: any[] = [];
  
  isLoading = true;
  showFullDescription = false;

  constructor(
    private route: ActivatedRoute,
    private listingService: ListingService,
    private cd: ChangeDetectorRef // Inject CD to force update
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      console.log('Loading ID:', id); // Debug: Check console to see if ID exists
      
      if (id) {
        this.loadProperty(id);
      } else {
        this.isLoading = false;
        this.cd.detectChanges();
      }
    });
  }

  loadProperty(id: string) {
    this.isLoading = true;
    this.property = undefined; // Reset current property
    
    this.listingService.getListingById(id).subscribe({
      next: (data) => {
        try {
          this.property = data;
          console.log('Property Loaded:', data); // Debug

          if (this.property) {
            // 1. Map Amenities
            this.mapAmenities(this.property.amenities);

            // 2. Load Similar Homes
            this.listingService.getSimilarListings(id).subscribe(similar => {
              this.similarProperties = similar;
              this.isLoading = false; 
              this.cd.detectChanges(); // FORCE UI UPDATE
            });

          } else {
            // Property ID not found in mock data
            console.warn('Property not found for ID:', id);
            this.isLoading = false;
            this.cd.detectChanges();
          }

        } catch (error) {
          console.error('Error processing property data:', error);
          this.isLoading = false;
          this.cd.detectChanges();
        }
      },
      error: (err) => {
        console.error('Service Error:', err);
        this.isLoading = false;
        this.cd.detectChanges();
      }
    });
    
    window.scrollTo(0, 0);
  }

  mapAmenities(amenities: any) {
    if (!amenities) return;
    const config = this.listingService.getAmenitiesMap();
    this.displayAmenities = config.filter(c => amenities[c.key] === true);
    
    // Fallback for demo
    if (this.displayAmenities.length === 0) {
      this.displayAmenities = config.slice(0, 4);
    }
  }
}