import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { gsap } from 'gsap';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero.html',
  styleUrls: ['./hero.css']
})
export class HeroComponent implements AfterViewInit {
  constructor(private router: Router) {}
location: any;
propertyType: any;
onSearch() {
throw new Error('Method not implemented.');
}
  @ViewChild('heroText', { static: false }) heroText?: ElementRef<HTMLDivElement>;
  @ViewChild('lottieContainer', { static: false }) lottieContainer?: ElementRef<HTMLDivElement>;

  ngAfterViewInit(): void {
    const tl = gsap.timeline();

    // Only animate if elements are present
    if (this.heroText?.nativeElement) {
      tl.from(this.heroText.nativeElement, { y: 20, autoAlpha: 0, duration: 0.7, ease: 'power2.out' });
    }

    if (this.lottieContainer?.nativeElement) {
      tl.from(this.lottieContainer.nativeElement, { x: 40, autoAlpha: 0, duration: 0.9, ease: 'power2.out' }, '-=0.4');

      // gentle floating on the visual
      gsap.to(this.lottieContainer.nativeElement, { y: -8, repeat: -1, yoyo: true, duration: 3, ease: 'sine.inOut', delay: 0.6 });
    }

    // load lottie from CDN if available; fallback if already present
    const initLottie = (lottieLib: any) => {
      try {
        if (!this.lottieContainer?.nativeElement) return;
        lottieLib.loadAnimation({
          container: this.lottieContainer.nativeElement,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          // public Lottie sample - replace with your custom exported JSON later
          path: 'https://assets10.lottiefiles.com/packages/lf20_jcikwtux.json'
        });
      } catch (e) {
        // ignore
      }
    };

    const win = window as any;
    if (win.lottie) {
      initLottie(win.lottie);
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.10.1/lottie.min.js';
      script.async = true;
      script.onload = () => initLottie((window as any).lottie);
      document.body.appendChild(script);
    }
  }
   goToExploreListing() {
    this.router.navigate(['/search-listing']);
  }
}