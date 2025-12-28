import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { ListPropertyComponent } from './pages/list-property/list-property';
import { ExploreListingsComponent } from './pages/explore-listing/explore-listing';
import { PropertyDetailsComponent } from './pages/property-details/property-details';
import { AboutComponent } from './pages/about/about';
import { FaqComponent } from './pages/faq/faq';
import { authGuard } from './auth.guard';
import { LoginComponent } from './pages/login/login';
import { MyListingsComponent } from './pages/my-listings/my-listings';
import { EditListingComponent } from './pages/edit-listing/edit-listing';

export const routes: Routes = [
	{ path: 'login', component: LoginComponent },
	{ path: '', component: HomeComponent },
	{ path: 'list', component: ListPropertyComponent,canActivate: [authGuard] },
	{ path: 'about', component: AboutComponent },
	{ path: 'search-listing', component: ExploreListingsComponent },
	{ path: 'property-details/:id', component: PropertyDetailsComponent },
	{ path: 'faq', component: FaqComponent },
	{ 
		path: 'my-listings', 
		component: MyListingsComponent,
		canActivate: [authGuard] // Protect this route!
	},
	{ 
		path: 'edit-listing/:id', 
		component: EditListingComponent, 
		canActivate: [authGuard] 
	},
	{ path: '**', redirectTo: '' }
];
