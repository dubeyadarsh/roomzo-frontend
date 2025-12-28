import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // 1. Import ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PropertyService } from '../../services/property.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-my-listings',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, RouterLink],
  templateUrl: './my-listings.html',
  styleUrls: ['./my-listings.css']
})
export class MyListingsComponent implements OnInit {

  listings: any[] = [];
  isLoading = true; // Starts as true
  ownerId: number | null = null;

  constructor(
    private propertyService: PropertyService,
    private router: Router,
    private toastr: ToastrService,
    private cd: ChangeDetectorRef // 2. Inject ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const storedId = localStorage.getItem('ownerId'); 
    
    // DEBUG: Check what ID we are using
    console.log('Stored Owner ID:', storedId);

    if (storedId) {
      this.ownerId = parseInt(storedId, 10);
    } else {
      // Fallback for testing (if no login found)
      console.warn('No Owner ID found, using default: 1');
      this.ownerId = 1; 
    }

    this.loadMyListings();
  }

  loadMyListings() {
    if (!this.ownerId) {
      console.error('Cannot load listings: Owner ID is missing');
      this.isLoading = false; // Stop loading if no ID
      return;
    }

    this.isLoading = true;
    
    this.propertyService.getMyListings(this.ownerId).subscribe({
      next: (res: any) => {
        // DEBUG: See exactly what backend sent
        console.log('Backend Response:', res);

        this.isLoading = false; 

        if (res && res.status === 1) {
          this.listings = res.data || [];
          console.log('Listings set to:', this.listings);
        } else {
          this.toastr.warning('Could not fetch listings');
        }
        
        // 3. FORCE UI UPDATE
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('API Error:', err);
        this.isLoading = false;
        this.toastr.error('Server error fetching listings');
        
        // 3. FORCE UI UPDATE
        this.cd.detectChanges();
      }
    });
  }

  editProperty(id: number) {
    this.router.navigate(['/edit-listing', id]);
  }
  
  formatPrice(price: number): string {
    return '₹' + (price ? price.toLocaleString() : '0');
  }
}