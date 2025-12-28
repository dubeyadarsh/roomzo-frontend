import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations'; // REQUIRED
import { provideToastr } from 'ngx-toastr';
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes,withInMemoryScrolling({
        anchorScrolling: 'enabled', // <--- ENABLE THIS
        scrollPositionRestoration: 'enabled' // Optional: Scrolls to top on new pages
      })) ,
    provideAnimations(), 
    
    // 2. Enable Toastr
    provideToastr({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }),
  ]
};
