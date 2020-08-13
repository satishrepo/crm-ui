import { Routes } from '@angular/router';

import { AuthGuard, CRMOpportunities, NoItemSelectedComponent } from '@synergy/commonUI';

import { OpportunityComponent } from './pages/opportunity/opportunity.component';
import { OpportunityDetailsComponent } from './components/opportunity-details/opportunity-details.component';
import { OpportunityDictionariesResolver } from './resolvers/opportunity.resolver';

export const opportunityRoutes: Routes = [
	{
		path: 'opportunities',
		component: OpportunityComponent,
		resolve: { dictionaries: OpportunityDictionariesResolver },
		children: [
			{ path: '', component: NoItemSelectedComponent },
			{ path: ':id', component: OpportunityDetailsComponent },
		],
		canActivate: [AuthGuard],
		data: {
			expectedPermission: CRMOpportunities.Read,
		},
	},
];
