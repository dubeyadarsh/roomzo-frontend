import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router'; // <--- 1. Import this
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';
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
      content: '+91 72378 83145', 
      sub: '' 
    },
    { 
      icon: 'email', 
      title: 'Email', 
      content: 'support@roomzo.in', 
      sub: '' 
    },
    // { 
    //   icon: 'location_on', 
    //   title: 'Office', 
    //   content: '123 Market Street, Suite 400', 
    //   sub: 'Cityville, ST 90210' 
    // }
  ];

  constructor(private fb: FormBuilder,private router: Router, private toastr: ToastrService, private authService: AuthService) {
    this.contactForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required],
      message: ['', Validators.required]
    });
  }

 onSubmit() {
    // 1. Check if form is valid
    if (this.contactForm.valid) {
      this.isSubmitting = true;

      // 2. Prepare Data
      const payload = {
        name: this.contactForm.value.fullName,
        email: this.contactForm.value.email,
        subject: this.contactForm.value.subject,
        message: this.contactForm.value.message
      };

      // 3. Call Service
      this.authService.sendContactForm(payload).subscribe({
        next: (res: any) => {
          this.isSubmitting = false;
          
          if (res.status === 1) {
            // SUCCESS TOASTER
            this.toastr.success('Message sent! We will contact you soon.', 'Success');
            this.contactForm.reset(); // Clear the form
          } else {
            // BACKEND LOGIC ERROR TOASTER
            this.toastr.error(res.message || 'Something went wrong.', 'Error');
          }
        },
        error: (err) => {
          this.isSubmitting = false;
          console.error('Contact Form Error:', err);
          
          // SERVER DOWN / NETWORK ERROR TOASTER
          this.toastr.error('Failed to send message. Please try again later.', 'Server Error');
        }
      });
      
    } else {
      // INVALID FORM TOASTER
      this.contactForm.markAllAsTouched(); // Highlight red fields
      this.toastr.warning('Please fill in all required fields.', 'Invalid Form');
    }
  }
  goToFaq() {
    this.router.navigate(['/faq']);
  }
}