import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { CommonUIModule } from '@synergy/commonUI';

import { HomeComponent } from './components/home/home.component';
import { HomeRoutingModule } from './home-routing.module';
import { LeadsModule } from '../leads/leads.module';
import { CampaignsModule } from '../campaigns/campaigns.module';
import { PropertyModule } from '../property/property.module';
import { OpportunityModule } from '../opportunity/opportunity.module';
import { ContactsModule } from '../contacts/contacts.module';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
	declarations: [HomeComponent],
	imports: [
		CommonModule,
		CommonUIModule,
		SharedModule,
		RouterModule,
		HomeRoutingModule,
		LeadsModule,
		CampaignsModule,
		PropertyModule,
		OpportunityModule,
		ContactsModule,
	],
})
export class HomeModule {}
