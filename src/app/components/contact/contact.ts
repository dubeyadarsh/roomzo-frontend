import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatButtonModule],
  templateUrl: './contact.html',
  styleUrls: ['./contact.css']
})
export class ContactComponent {
  contactForm: FormGroup;
  isSubmitting = false;

  // Contact Info Data
  contactInfo = [
    { 
      icon: 'phone', 
      title: 'Phone', 
      content: '+1 (555) 123-4567', 
      sub: '' 
    },
    { 
      icon: 'email', 
      title: 'Email', 
      content: 'hello@propertylisting.com', 
      sub: '' 
    },
    { 
      icon: 'location_on', 
      title: 'Office', 
      content: '123 Market Street, Suite 400', 
      sub: 'Cityville, ST 90210' 
    }
  ];

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required],
      message: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.contactForm.valid) {
      this.isSubmitting = true;
      // Simulate API call
      setTimeout(() => {
        console.log('Form Submitted', this.contactForm.value);
        alert('Message sent successfully!');
        this.contactForm.reset();
        this.isSubmitting = false;
      }, 1500);
    } else {
      this.contactForm.markAllAsTouched();
    }
  }
}