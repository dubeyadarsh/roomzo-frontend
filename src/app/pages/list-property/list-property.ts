import { Component, OnInit , ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PropertyService } from '../../services/property.service';
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
  styleUrls: ['./list-property.css'] // Points to CSS file
})
export class ListPropertyComponent implements OnInit {
  listingForm: FormGroup = new FormGroup({});
  currentStep = 1;
  totalSteps = 3;
  imagePreviews: string[] = [];

  // Data for the view
  propertyTypes = [
    { label: 'House', icon: 'home', value: 'house' },
    { label: 'Apartment', icon: 'apartment', value: 'apartment' },
    { label: 'Private Room', icon: 'hotel', value: 'private_room' }
  ];

  amenityGroups = [
    {
      title: 'Essentials',
      items: [
        { label: 'Wi-Fi', formControlName: 'wifi', icon: 'wifi' },
        { label: 'Heating', formControlName: 'heating', icon: 'hvac' },
        { label: 'Air Conditioning', formControlName: 'ac', icon: 'ac_unit' },
        { label: 'Washer / Dryer', formControlName: 'washerDryer', icon: 'local_laundry_service' }
      ]
    },
    {
      title: 'Features',
      items: [
        { label: 'Parking Spot', formControlName: 'parking', icon: 'local_parking' },
        { label: 'Gym / Fitness', formControlName: 'gym', icon: 'fitness_center' },
        { label: 'Balcony / Patio', formControlName: 'balcony', icon: 'deck' },
        { label: 'Pet Friendly', formControlName: 'pets', icon: 'pets' }
      ]
    },
    {
      title: 'Safety',
      items: [
        { label: 'Smoke Alarm', formControlName: 'smokeAlarm', icon: 'detector_smoke' },
        { label: 'Carbon Monoxide Alarm', formControlName: 'coAlarm', icon: 'warning_amber' }
      ]
    }
  ];
  isUploading: boolean  = false;

  constructor(private fb: FormBuilder,private propertyService: PropertyService, private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
   // inside ngOnInit() ...

this.listingForm = this.fb.group({
  // STEP 1: Details
  details: this.fb.group({
    propertyType: ['', Validators.required],
    bedrooms: [1, [Validators.required, Validators.min(0)]],
    bathrooms: [1, [Validators.required, Validators.min(0)]],
    propertySize: ['', Validators.required],
    
    // --- NEW ADDRESS SECTION ---
    address: this.fb.group({
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zip: ['', Validators.required] // Zip/Postal Code
    })
  }),

  // STEP 2: Amenities (No changes)
  amenities: this.fb.group({
    wifi: [false], heating: [false], ac: [false], washerDryer: [false],
    parking: [false], gym: [false], balcony: [false], pets: [false],
    smokeAlarm: [false], coAlarm: [false]
  }),

  // STEP 3: Final (No changes)
  final: this.fb.group({
    description: ['', [Validators.required, Validators.maxLength(1000)]],
    rentAmount: ['', Validators.required],
    images: [[]]
  })
});
  }

  // Getters for easier access in HTML
  get detailsGroup(): FormGroup { return this.listingForm.get('details') as FormGroup; }
  get amenitiesGroup(): FormGroup { return this.listingForm.get('amenities') as FormGroup; }
  get finalGroup(): FormGroup { return this.listingForm.get('final') as FormGroup; }

  updateCounter(controlName: string, change: number): void {
    const control = this.detailsGroup.get(controlName);
    if (control) {
      const newValue = (control.value || 0) + change;
      if (newValue >= 0) control.setValue(newValue);
    }
  }
// Helper to wrap FileReader in a Promise
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

  if (files && files.length > 0) {
    this.isUploading = true;

    try {
      const filePromises = Array.from(files).map(file => {
        return this.readFileAsDataURL(file);
      });

      const results = await Promise.all(filePromises);
      const validImages = results.filter(res => res !== null) as string[];
      
      // Update the data
      this.imagePreviews.push(...validImages);
      this.finalGroup.patchValue({ images: this.imagePreviews });

      // CRITICAL FIX: Force the screen to update RIGHT NOW
      this.cd.detectChanges(); 

    } catch (error) {
      console.error('Error reading files:', error);
    } finally {
      this.isUploading = false;
      input.value = ''; 
      
      // Run detection one last time to remove the loading overlay
      this.cd.detectChanges();
    }
  }
}

  // 2. Remove Specific Image
  removeImage(index: number): void {
    // Remove from the array at the specific index
    this.imagePreviews.splice(index, 1);
    
    // Update the form control to match
    this.finalGroup.patchValue({ images: this.imagePreviews });
  }

  nextStep(): void {
    const groupName = this.currentStep === 1 ? 'details' : (this.currentStep === 2 ? 'amenities' : 'final');
    const group = this.listingForm.get(groupName);

    if (group && group.valid) {
      if (this.currentStep < this.totalSteps) {
        this.currentStep++;
        window.scrollTo(0, 0);
      }
    } else {
      group?.markAllAsTouched();
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      window.scrollTo(0, 0);
    }
  }

onSubmit(): void {
    if (this.listingForm.valid) {
      
      // Get the raw form value
      const formData = this.listingForm.value;

      // Call the service to save data
      this.propertyService.saveListing(formData);

      // Show success message
      alert('Listing submitted successfully and saved to Local Storage!');
      
      // Optional: Reset form or navigate away
      // this.listingForm.reset();
      // this.currentStep = 1;
    } else {
      this.listingForm.markAllAsTouched();
      alert('Please fill in all required fields.');
    }
  }
}