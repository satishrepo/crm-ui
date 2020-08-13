import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { CommonUIModule } from '@synergy/commonUI';

import { LeadOpportunitiesDetailsComponent } from '../modules/leads/components/lead-opportunities-details/lead-opportunities-details.component';
import { LeadContactsDetailsComponent } from '../modules/leads/components/lead-contacts-details/lead-contacts-details.component';
import { LeadCampaignsDetailsComponent } from '../modules/leads/components/lead-campaigns-details/lead-campaigns-details.component';
import { CreateContactsDialogComponent } from '../modules/contacts/components/create-contacts-dialog/create-contacts-dialog.component';
import { ContactsFormComponent } from '../modules/contacts/components/contacts-form/contacts-form.component';
import { LeadRelatedContactsComponent } from '../modules/leads/containers/lead-related-contacts/lead-related-contacts.component';
import { CRMDataTableComponent } from './components/data-table/data-table.component';

@NgModule({
	declarations: [
		LeadOpportunitiesDetailsComponent,
		LeadContactsDetailsComponent,
		LeadCampaignsDetailsComponent,
		CreateContactsDialogComponent,
		ContactsFormComponent,
		LeadRelatedContactsComponent,
		CRMDataTableComponent,
	],
	imports: [CommonModule, FormsModule, RouterModule, ReactiveFormsModule, CommonUIModule],
	exports: [
		CommonModule,
		FormsModule,
		LeadOpportunitiesDetailsComponent,
		LeadContactsDetailsComponent,
		LeadCampaignsDetailsComponent,
		ContactsFormComponent,
		LeadRelatedContactsComponent,
		CRMDataTableComponent,
	],
	entryComponents: [CreateContactsDialogComponent],
})
export class SharedModule {}
