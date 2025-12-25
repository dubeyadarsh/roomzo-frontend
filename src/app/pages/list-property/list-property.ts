import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
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
  totalSteps = 3;
  imagePreviews: string[] = [];
  selectedFiles: File[] = []; // ✅ Real files for upload
  isUploading: boolean = false;
states: any[] = [];
cities: any[] = [];
selectedStateIso: string | null = null;

  propertyTypes = [
    { label: 'House', icon: 'home', value: 'house' },
    { label: 'Apartment', icon: 'apartment', value: 'apartment' },
    { label: 'Private Room', icon: 'hotel', value: 'private_room' }
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

  constructor(private fb: FormBuilder, private propertyService: PropertyService, private cd: ChangeDetectorRef,
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
    final: this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', [Validators.required, Validators.maxLength(1000)]],
      rentAmount: ['', Validators.required],
      images: [[]]
    })
  });

  // ✅ Load Indian states
  this.states = State.getStatesOfCountry('IN');

 this.detailsGroup
  .get('address.state')
  ?.valueChanges.subscribe((stateName: string) => {

    const state = this.states.find(s => s.name === stateName);

    this.selectedStateIso = state ? state.isoCode : null;

    this.cities = this.selectedStateIso
      ? City.getCitiesOfState('IN', this.selectedStateIso)
      : [];

    this.detailsGroup.get('address.city')?.reset();
  });

}


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
      for (const file of Array.from(files)) {
        this.selectedFiles.push(file); // ✅ Keep file for upload
        const preview = await this.readFileAsDataURL(file);
        this.imagePreviews.push(preview);
      }
      this.finalGroup.patchValue({ images: this.selectedFiles });
      this.cd.detectChanges();
    } catch (err) {
      console.error('Error reading files:', err);
    } finally {
      this.isUploading = false;
      input.value = '';
      this.cd.detectChanges();
    }
  }

  removeImage(index: number): void {
    this.imagePreviews.splice(index, 1);
    this.selectedFiles.splice(index, 1);
    this.finalGroup.patchValue({ images: this.selectedFiles });
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
    const rawData = this.listingForm.value;
     const files: File[] = rawData.final.images || [];
     if (files.length < 2) {
      this.toastr.error('Please upload at least two images.', 'Error');
      return;
     }
    this.propertyService.saveListing(rawData).subscribe({
      next: (response) => {
        console.log('Success:', response);

        // ✅ Show success toast
        // this.toast.show('Listing and Photos uploaded successfully!', 'success');
        this.toastr.success('Listing and Photos uploaded successfully!', 'Success');
        // ✅ Reset form
        this.listingForm.reset();

        // ✅ Clear image previews and files
        this.imagePreviews = [];
        this.selectedFiles = [];

        // ✅ Reset stepper to step 1
        this.currentStep = 1;

        // ✅ Scroll to top after reset
        window.scrollTo(0, 0);
      },
      error: (error) => {

        console.error('Error:', error);
        // ✅ Show error toast
        this.toastr.error('Failed to save listing.', 'Error');
      }
    });
  } else {
    this.listingForm.markAllAsTouched();
    this.toastr.error('Please fill in all required fields.');
    // ✅ Show warning toast for invalid form
    // this.toast.show('Please fill in all required fields.', 'error');
  }
}

}
