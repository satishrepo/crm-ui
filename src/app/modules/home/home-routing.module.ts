import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '@synergy/commonUI';

import { HomeComponent } from './components/home/home.component';
import { campaignRoutes } from '../campaigns/campaigns-routes';
import { contactsRoutes } from '../contacts/contacts-routes';
import { leadsRoutes } from '../leads/leads-routes';
import { propertyRoutes } from '../property/property-routes';
import { opportunityRoutes } from '../opportunity/opportunity-routes';

const routes: Routes = [
	{
		path: '',
		redirectTo: 'records',
		pathMatch: 'full',
	},
	{
		path: '',
		component: HomeComponent,
		canActivate: [AuthGuard],
		children: [...campaignRoutes, ...contactsRoutes, ...leadsRoutes, ...propertyRoutes, ...opportunityRoutes],
	},
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class HomeRoutingModule {}
