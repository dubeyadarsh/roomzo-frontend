import { Injectable } from '@angular/core';

// Interface for type safety (optional but recommended)
export interface PropertyListing {
  id: string;
  dateCreated: Date;
  details: {
    propertyType: string;
    // Add Address Here
    address: {
        street: string;
        city: string;
        state: string;
        zip: string;
    };
    bedrooms: number;
    bathrooms: number;
    propertySize: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  private storageKey = 'rental_properties';

  constructor() { }

  // Get all listings from Local Storage
  getListings(): PropertyListing[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  // Save a new listing
  saveListing(formData: any): void {
    // 1. Get existing data
    const currentListings = this.getListings();

    // 2. Prepare the new object with an ID and Timestamp
    const newListing: PropertyListing = {
      id: this.generateId(),
      dateCreated: new Date(),
      ...formData // Spread the form data (details, amenities, final)
    };

    // 3. Add to array
    currentListings.push(newListing);

    // 4. Save back to Local Storage
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(currentListings));
      console.log('Saved to Local Storage:', newListing);
    } catch (e) {
      console.error('Error saving to local storage', e);
      // Note: LocalStorage has a 5MB limit. Large images might crash it.
      alert('Storage full! Try uploading smaller images or fewer photos.');
    }
  }

  // Helper to generate a random ID
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}