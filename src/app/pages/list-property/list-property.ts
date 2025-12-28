import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PropertyService } from '../../services/property.service';
import { Country, State, City } from 'country-state-city';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-list-property',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './list-property.html',
  styleUrls: ['./list-property.css']
})
export class ListPropertyComponent implements OnInit {
  listingForm: FormGroup = new FormGroup({});
  currentStep = 1;
  totalSteps = 4; // Increased to 4
  imagePreviews: string[] = [];
  selectedFiles: File[] = [];
  isUploading: boolean = false;
  states: any[] = [];
  cities: any[] = [];
  selectedStateIso: string | null = null;

  // Pre-defined Quick Rules
  commonRules = [
    { label: 'No Smoking', value: 'no_smoking', icon: 'smoke_free' },
    { label: 'No Parties', value: 'no_parties', icon: 'celebration' },
    { label: 'Quiet Hours (10PM - 7AM)', value: 'quiet_hours', icon: 'bedtime' },
    { label: 'No Shoes Inside', value: 'no_shoes', icon: 'do_not_step' },
    { label: 'Check-in after 2PM', value: 'check_in_time', icon: 'schedule' }
  ];

  propertyTypes = [
    { label: 'Flat', icon: 'home', value: 'Flat' },
    { label: 'PG', icon: 'apartment', value: 'PG' },
    { label: 'Rooms', icon: 'hotel', value: 'Room' }
  ];

  amenityGroups = [
    { title: 'Essentials', items: [
      { label: 'Wi-Fi', formControlName: 'wifi', icon: 'wifi' },
      { label: 'Heating', formControlName: 'heating', icon: 'hvac' },
      { label: 'Air Conditioning', formControlName: 'ac', icon: 'ac_unit' },
      { label: 'Washer / Dryer', formControlName: 'washerDryer', icon: 'local_laundry_service' }
    ]},
    { title: 'Features', items: [
      { label: 'Parking Spot', formControlName: 'parking', icon: 'local_parking' },
      { label: 'Gym / Fitness', formControlName: 'gym', icon: 'fitness_center' },
      { label: 'Balcony / Patio', formControlName: 'balcony', icon: 'deck' },
      { label: 'Pet Friendly', formControlName: 'pets', icon: 'pets' }
    ]},
    { title: 'Safety', items: [
      { label: 'Smoke Alarm', formControlName: 'smokeAlarm', icon: 'detector_smoke' },
      { label: 'Carbon Monoxide Alarm', formControlName: 'coAlarm', icon: 'warning_amber' }
    ]}
  ];

  constructor(
    private fb: FormBuilder, 
    private propertyService: PropertyService, 
    private cd: ChangeDetectorRef,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.listingForm = this.fb.group({
      details: this.fb.group({
        propertyType: ['', Validators.required],
        bedrooms: [1, [Validators.required, Validators.min(0)]],
        bathrooms: [1, [Validators.required, Validators.min(0)]],
        propertySize: ['', Validators.required],
        address: this.fb.group({
          street: ['', Validators.required],
          city: ['', Validators.required],
          landmark: ['', Validators.required],
          state: ['', Validators.required],
          zip: ['', Validators.required]
        })
      }),
      amenities: this.fb.group({
        wifi: [false], heating: [false], ac: [false], washerDryer: [false],
        parking: [false], gym: [false], balcony: [false], pets: [false],
        smokeAlarm: [false], coAlarm: [false]
      }),
      // New Guidebook Section
      guidebook: this.fb.group({
        rules: this.fb.array([]), // Stores selected rule values
        customRules: [''], // Text area for extra rules
        nearby: this.fb.array([]) // Dynamic list of places
      }),
      final: this.fb.group({
        name: ['', [Validators.required, Validators.maxLength(200)]],
        description: ['', [Validators.required, Validators.maxLength(1000)]],
        rentAmount: ['', Validators.required],
        images: [[]]
      })
    });

    // Initialize with one empty nearby slot
    this.addNearbyPlace();

    this.states = State.getStatesOfCountry('IN');
    this.detailsGroup.get('address.state')?.valueChanges.subscribe((stateName: string) => {
      const state = this.states.find(s => s.name === stateName);
      this.selectedStateIso = state ? state.isoCode : null;
      this.cities = this.selectedStateIso ? City.getCitiesOfState('IN', this.selectedStateIso) : [];
      this.detailsGroup.get('address.city')?.reset();
    });
  }

  // Getters
  get detailsGroup(): FormGroup { return this.listingForm.get('details') as FormGroup; }
  get amenitiesGroup(): FormGroup { return this.listingForm.get('amenities') as FormGroup; }
  get guidebookGroup(): FormGroup { return this.listingForm.get('guidebook') as FormGroup; }
  get finalGroup(): FormGroup { return this.listingForm.get('final') as FormGroup; }
  
  // Getter for nearby FormArray
  get nearbyPlaces(): FormArray {
    return this.guidebookGroup.get('nearby') as FormArray;
  }
  
  // Getter for rules FormArray
  get rulesArray(): FormArray {
    return this.guidebookGroup.get('rules') as FormArray;
  }

  // --- Rules Logic ---
  toggleRule(ruleValue: string): void {
    const index = this.rulesArray.controls.findIndex(x => x.value === ruleValue);
    if (index === -1) {
      this.rulesArray.push(this.fb.control(ruleValue));
    } else {
      this.rulesArray.removeAt(index);
    }
  }

  isRuleSelected(ruleValue: string): boolean {
    return this.rulesArray.controls.some(x => x.value === ruleValue);
  }

  // --- Nearby Places Logic ---
  addNearbyPlace(): void {
    const placeGroup = this.fb.group({
      name: ['', Validators.required],
      distance: ['', Validators.required], // e.g., "5 mins walk"
      type: ['attraction'] // optional: could be 'transport', 'dining', etc.
    });
    this.nearbyPlaces.push(placeGroup);
  }

  removeNearbyPlace(index: number): void {
    this.nearbyPlaces.removeAt(index);
  }

  updateCounter(controlName: string, change: number): void {
    const control = this.detailsGroup.get(controlName);
    if (control) {
      const newValue = (control.value || 0) + change;
      if (newValue >= 0) control.setValue(newValue);
    }
  }

  // ... File Upload Logic (Same as before) ...
  private readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: any) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  }

  async onFileSelected(event: any): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (!files || files.length === 0) return;

    this.isUploading = true;

    try {
      // 1. Create temporary arrays so we can update in one batch
      const newFiles: File[] = [];
      const newPreviews: string[] = [];

      for (const file of Array.from(files)) {
        newFiles.push(file);
        // Wait for the image to be read
        const preview = await this.readFileAsDataURL(file);
        newPreviews.push(preview);
      }

      // 2. IMMUTABLE UPDATE: Assign a new array reference
      // This tells Angular "Hey! The data has definitely changed!"
      this.selectedFiles = [...this.selectedFiles, ...newFiles];
      this.imagePreviews = [...this.imagePreviews, ...newPreviews];

      // 3. Update Form
      this.finalGroup.patchValue({ images: this.selectedFiles });

      // 4. Force UI Update immediately
      this.cd.detectChanges();

    } catch (err) {
      console.error('Error reading files:', err);
    } finally {
      this.isUploading = false;
      input.value = ''; // Reset input so you can select the same file again if needed
      this.cd.detectChanges(); // Final check to ensure spinner hides
    }
  }

  removeImage(index: number): void {
    this.imagePreviews.splice(index, 1);
    this.selectedFiles.splice(index, 1);
    this.finalGroup.patchValue({ images: this.selectedFiles });
  }

  // --- Navigation Logic ---
  nextStep(): void {
    let groupName = '';
    if (this.currentStep === 1) groupName = 'details';
    else if (this.currentStep === 2) groupName = 'amenities';
    else if (this.currentStep === 3) groupName = 'guidebook';
    else groupName = 'final';

    const group = this.listingForm.get(groupName);

    if (group && group.valid) {
      if (this.currentStep < this.totalSteps) {
        this.currentStep++;
        window.scrollTo(0, 0);
      }
    } else {
      group?.markAllAsTouched();
      this.toastr.warning('Please complete all required fields.', 'Step Incomplete');
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      window.scrollTo(0, 0);
    }
  }
// Add this variable inside your class
isSubmitting = false;

// Updated onSubmit Method
onSubmit(): void {
  if (this.listingForm.valid) {
    
    // Prevent double-clicking while request is in progress
    if (this.isSubmitting) return;

    const rawData = this.listingForm.value;
    const files: File[] = rawData.final.images || [];

    if (files.length < 2) {
      this.toastr.error('Please upload at least two images.', 'Error');
      return;
    }

    // 1. DISABLE BUTTON (Start Loading)
    this.isSubmitting = true;

    this.propertyService.saveListing(rawData).subscribe({
      next: (response) => {
        this.toastr.success('Listing uploaded successfully!', 'Success');
        
        // Reset everything
        this.listingForm.reset();
        this.imagePreviews = [];
        this.selectedFiles = [];
        this.currentStep = 1;
        window.scrollTo(0, 0);

        // 2. ENABLE BUTTON (Success)
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error:', error);
        this.toastr.error('Failed to save listing.', 'Error');
        
        // 2. ENABLE BUTTON (Error)
        this.isSubmitting = false; 
      }
    });

  } else {
    this.listingForm.markAllAsTouched();
    this.toastr.error('Please fill in all required fields.');
  }
}
}