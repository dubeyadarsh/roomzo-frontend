import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.html',
  styleUrls: ['./search-bar.css']
})
export class SearchBarComponent {
  query = '';
  constructor(private router: Router) {}

  submit(e?: Event) {
    if (e) e.preventDefault();
    const q = this.query.trim();
    this.router.navigate(['/search'], { queryParams: { q } });
  }
}