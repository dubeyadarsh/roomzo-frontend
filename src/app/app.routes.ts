import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { ListPropertyComponent } from './pages/list-property/list-property';
import { ExploreListingsComponent } from './pages/explore-listing/explore-listing';
import { PropertyDetailsComponent } from './pages/property-details/property-details';
import { AboutComponent } from './pages/about/about';

export const routes: Routes = [
	{ path: '', component: HomeComponent },
	{ path: 'list', component: ListPropertyComponent },
	{ path: 'about', component: AboutComponent },
	{ path: 'search-listing', component: ExploreListingsComponent },
	{ path: 'property-details/:id', component: PropertyDetailsComponent },

	{ path: '**', redirectTo: '' }
];
