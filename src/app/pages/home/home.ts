import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroComponent } from "../../components/hero/hero";
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router'; 
import { ContactComponent } from '../../components/contact/contact';
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
  imports: [CommonModule, HeroComponent,MatIconModule, MatButtonModule,ContactComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent {
  constructor(private router: Router) {}

  listings: Listing[] = [
    {
      id: 1,
      title: 'Sunnyvale Heights',
      location: 'San Francisco, CA',
      price: 3200,
      priceUnit: '/month',
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      badge: { text: 'FOR RENT', color: 'blue' },
      specs: { beds: 2, baths: 2, area: 1100 },
      rating: 4.9,
      isFavorite: false
    },
    {
      id: 2,
      title: 'The Garden House',
      location: 'Austin, TX',
      price: 450000,
      priceUnit: 'Total Price',
      image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      badge: { text: 'FOR SALE', color: 'green' },
      specs: { beds: 3, baths: 2.5, area: 2400 },
      isFavorite: true // This one has the heart filled in the design? (or empty with white bg)
    },
    {
      id: 3,
      title: 'Urban Loft 92',
      location: 'New York, NY',
      price: 4100,
      priceUnit: '/month',
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      badge: { text: 'SUBLET', color: 'purple' },
      specs: { beds: 1, baths: 1, area: 850 },
      isFavorite: false
    }
  ];

  formatPrice(price: number): string {
    return price >= 10000 
      ? '$' + (price / 1000).toFixed(0) + 'k' 
      : '$' + price.toLocaleString();
  }
   viewDetails(id: any): void {
    this.router.navigate(['/property-details', id]);
  }
}