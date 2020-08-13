import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { CommonUIModule } from '@synergy/commonUI';

import { SharedModule } from '../../shared/shared.module';
import { OpportunityComponent } from './pages/opportunity/opportunity.component';
import { OpportunityDetailsComponent } from './components/opportunity-details/opportunity-details.component';
import { OpportunityDetailsFormComponent } from './components/opportunity-details-form/opportunity-details-form.component';
import { CreateOpportunityDialogComponent } from './components/create-opportunity-dialog/create-opportunity-dialog.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { PrimaryContactComponent } from './components/primary-contact/primary-contact.component';
import { OpportunityDictionariesResolver } from './resolvers/opportunity.resolver';
import { HistoryComponent } from './components/history/history.component';

@NgModule({
	declarations: [
		OpportunityComponent,
		OpportunityDetailsComponent,
		OpportunityDetailsFormComponent,
		CreateOpportunityDialogComponent,
		ConfirmDialogComponent,
		PrimaryContactComponent,
		HistoryComponent,
	],
	imports: [CommonModule, ReactiveFormsModule, CommonUIModule, SharedModule, RouterModule],
	entryComponents: [CreateOpportunityDialogComponent, ConfirmDialogComponent],
	providers: [OpportunityDictionariesResolver, CurrencyPipe],
})
export class OpportunityModule {}
