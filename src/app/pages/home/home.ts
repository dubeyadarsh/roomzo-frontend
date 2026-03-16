import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroComponent } from "../../components/hero/hero";
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { ContactComponent } from '../../components/contact/contact';
import { HttpClient } from '@angular/common/http';
import { PropertyService } from '../../services/property.service';
import { ChangeDetectorRef } from '@angular/core'; // Import
import { RouterModule } from '@angular/router';
import { mapBackendListingsToUi } from '../../services/Utility';



interface Listing {
  id: number;
  title: string;
  location: string;
  price: number;
  priceUnit?: string; // e.g. '/month' or 'Total Price'
  image: string;
  badge: { text: string; color: 'blue' | 'green' | 'purple' };
  specs: { beds: number; baths: number; area: number };
  rating?: number;
  isFavorite: boolean;
}
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HeroComponent, MatIconModule, MatButtonModule, ContactComponent, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent {
  constructor(private router: Router, private http: HttpClient, private propertyService: PropertyService, private cd: ChangeDetectorRef) { }
  ngOnInit(): void {
    this.checkAndGetLocation();
  }
  listings: Listing[] = [];
isLoading: boolean = true; 
  checkAndGetLocation() {
    // 1. Check LocalStorage
    const storedData = localStorage.getItem('user_geo_location');

    if (storedData) {
      const location = JSON.parse(storedData);
      console.log('Using stored location:', location);
      this.fetchDataUsingLocation(location);
    } else {
      // 2. Ask Browser (Native GPS)
      this.requestBrowserLocation();
    }
  }

  requestBrowserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // --- SUCCESS: User Clicked "Allow" ---
          console.log('GPS Location obtained:', position.coords);
          this.propertyService.getLocationFromCoords(position.coords.latitude, position.coords.longitude).subscribe(locationData => {
            console.log('Location data from coordinates:', locationData);
            const coords = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              city: locationData.address.city,
              state: locationData.address.state,
              source: 'gps' // Optional: Track where data came from

            };

            this.saveAndUseLocation(coords);
          });

        },
        (error) => {
          // --- ERROR/DENIED: User Clicked "Block" ---
          console.warn('GPS Denied or Error. Falling back to IP Location...');
          this.getIpLocation();
        },
        {
          enableHighAccuracy: true,
          timeout: 6000, // Wait 6 seconds. If no response, trigger Error callback
          maximumAge: 0
        }
      );
    } else {
      // Browser doesn't support GPS
      this.getIpLocation();
    }
  }

  // 3. Fallback: Get Location from IP Address
  getIpLocation() {
    // Using free API: https://ipapi.co/json/
    this.http.get('https://ipapi.co/json/').subscribe({
      next: (data: any) => {
        const coords = {
          lat: data.latitude,
          lng: data.longitude,
          city: data.city, // IP APIs usually give city names too!
          source: 'ip',
          state: data.region
        };
        console.log('Location fetched via IP:', coords);
        this.saveAndUseLocation(coords);
      },
      error: (err) => {
        console.error('IP Location failed. Loading default Mumbai view.', err);
        this.fetchDataWithoutLocation();
      }
    });
  }

  saveAndUseLocation(coords: any) {
    // A. Save to LocalStorage
    localStorage.setItem('user_geo_location', JSON.stringify(coords));

    // B. Call API
    this.fetchDataUsingLocation(coords);
  }

// Replace your existing fetch methods in home.ts with these:

  fetchDataUsingLocation(coords: any) {
    this.isLoading = true;
    
    // Pass the user's exact GPS coordinates to get the NEAREST 3 properties
    const locationFilter: any = {
      lat: coords.lat,
      lng: coords.lng
    };

    // Page 0, Size 3
    this.propertyService.searchListingsWithFilters(0, 3, locationFilter).subscribe((response: any) => {
      if (response.listings && response.listings.length > 0) {
        this.listings = mapBackendListingsToUi(response.listings);
        this.isLoading = false;
        this.cd.detectChanges();
      } else {
        // If zero properties exist nearby, gracefully fallback to latest
        this.fetchDataWithoutLocation(); 
      }
    });
  }

  fetchDataWithoutLocation() {
    this.isLoading = true;

    // Passing an empty filter object triggers the backend to return the LATEST 3 properties
    this.propertyService.searchListingsWithFilters(0, 3, {}).subscribe((response: any) => {
      if (response.listings) {
        this.listings = mapBackendListingsToUi(response.listings);
      }
      this.isLoading = false;
      this.cd.detectChanges();
    });
  }

  formatPrice(price: number): string {
    return price >= 10000
      ? '₹' + (price / 1000).toFixed(0) + 'k'
      : '₹' + price.toLocaleString();
  }
  viewDetails(id: any): void {
    this.router.navigate(['/property-details', id]);
  }


}