import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, RouterLink],
  templateUrl: './about.html',
  styleUrls: ['./about.css']
})
export class AboutComponent {

  // Stats Data
  stats = [
    { label: 'Properties Sold', value: '5k+' },
    { label: 'Years Experience', value: '12+' },
    { label: 'Client Satisfaction', value: '98%' },
    { label: 'Active Agents', value: '250+' }
  ];

  // Values Data
  values = [
    { 
      icon: 'visibility', 
      title: 'Transparency', 
      desc: 'No hidden fees, no surprises. We believe in clear, open communication at every step of your journey.' 
    },
    { 
      icon: 'verified_user', 
      title: 'Integrity', 
      desc: 'Honest dealings are the foundation of our business. We put your interests first, always.' 
    },
    { 
      icon: 'lightbulb', 
      title: 'Innovation', 
      desc: 'Using modern technology to smooth the process, from virtual tours to digital paperwork.' 
    }
  ];

  // Team Data
  team = [
    { 
      name: 'David Chen', 
      role: 'Co-Founder & CEO', 
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80' 
    },
    { 
      name: 'Sarah Jenkins', 
      role: 'Head of Sales', 
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80' 
    },
    { 
      name: 'Marcus Johnson', 
      role: 'Senior Broker', 
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80' 
    },
    { 
      name: 'Elena Rodriguez', 
      role: 'Marketing Director', 
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80' 
    }
  ];
}