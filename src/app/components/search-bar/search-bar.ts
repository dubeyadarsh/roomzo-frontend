import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { City, State } from 'country-state-city';
import { MatAutocomplete, MatAutocompleteModule, MatOption } from "@angular/material/autocomplete";

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule, MatAutocomplete, MatOption,ReactiveFormsModule, MatAutocompleteModule],
  templateUrl: './search-bar.html',
  styleUrls: ['./search-bar.css']
})
export class SearchBarComponent {
  query = '';
searchControl = new FormControl('');
  allCities: any[] = [];
  filteredCities: any[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    this.allCities = City.getCitiesOfCountry('IN') || [];

    this.searchControl.valueChanges.subscribe(val => {
      // Ensure we only filter if val is a string (not when an object is selected)
      if (typeof val === 'string') {
        const filterValue = val.toLowerCase();
        this.filteredCities = this.allCities
          .filter(city => city.name.toLowerCase().includes(filterValue))
          .slice(0, 10);
      }
    });
  }

  displayCity = (city: any): string => {
    if (city && city.name) {
       const state = State.getStateByCodeAndCountry(city.stateCode, 'IN');
       return `${city.name}, ${state ? state.name : city.stateCode}`;
    }
    return city || '';
  }

  // --- 1. HANDLE DROPDOWN SELECTION ---
  onCitySelected(event: any) {
    const cityData = event.option.value;
    // this.navigateToExplore(cityData);
  }

  // --- 2. HANDLE SEARCH BUTTON CLICK ---
  search(event?: Event) {
    if (event) event.preventDefault(); // Prevent form refresh

    const val = this.searchControl.value;

    // Case A: User selected a city from dropdown (Value is Object)
    if (val && typeof val === 'object') {
       this.navigateToExplore(val);
       return;
    }

    // Case B: User typed text (Value is String) -> Find best match
    if (typeof val === 'string' && val.trim()) {
      
      // 1. Try to find exact match in filtered list
      const match = this.filteredCities.find(c => c.name.toLowerCase() === val.toLowerCase());
      
      if (match) {
        this.navigateToExplore(match);
      } 
      // 2. If no exact match, grab the first suggestion (Auto-select)
      else if (this.filteredCities.length > 0) {
        this.navigateToExplore(this.filteredCities[0]);
      }
    }
  }

  // --- Helper to Navigate ---
  private navigateToExplore(cityData: any) {
    const state = State.getStateByCodeAndCountry(cityData.stateCode, 'IN');
    
    this.router.navigate(['/search-listing'], { 
      queryParams: { 
        city: cityData.name, 
        state: state?.name 
      } 
    });
  }
}