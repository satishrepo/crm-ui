import { Routes } from '@angular/router';

import { AuthGuard, CRMRecords, NoItemSelectedComponent } from '@synergy/commonUI';

import { LeadsComponent } from './pages/leads/leads.component';
import { LeadDetailsComponent } from './components/lead-details/lead-details.component';
import { LeadDictionariesResolver } from './resolvers/lead.resolver';

export const leadsRoutes: Routes = [
	{
		path: 'records',
		component: LeadsComponent,
		resolve: { dictionaries: LeadDictionariesResolver },
		children: [{ path: '', component: NoItemSelectedComponent }, { path: ':id', component: LeadDetailsComponent }],
		canActivate: [AuthGuard],
		data: {
			expectedPermission: CRMRecords.Read,
		},
	},
];
