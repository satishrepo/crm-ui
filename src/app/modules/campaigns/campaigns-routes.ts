import { Routes } from '@angular/router';

import { AuthGuard, CRMCampaigns } from '@synergy/commonUI';

import { CampaignsComponent } from './pages/campaigns/campaigns.component';
import { CampaignDetailsComponent } from './components/campaign-details/campaign-details.component';
import { CampaignDictionariesResolver } from './resolvers/campaign.resolver';

export const campaignRoutes: Routes = [
	{
		path: 'campaigns',
		component: CampaignsComponent,
		resolve: { dictionaries: CampaignDictionariesResolver },
		children: [{ path: ':id', component: CampaignDetailsComponent }],
		canActivate: [AuthGuard],
		data: {
			expectedPermission: CRMCampaigns.Read,
		},
	},
];
