import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { CommonUIModule } from '@synergy/commonUI';

import { SharedModule } from '../../shared/shared.module';
import { CampaignsComponent } from './pages/campaigns/campaigns.component';
import { CampaignDetailsComponent } from './components/campaign-details/campaign-details.component';
import { CampaignDetailsFormComponent } from './components/campaign-details-form/campaign-details-form.component';
import { SelectRecordsDialogComponent } from './components/select-records-dialog/select-records-dialog.component';
import { CreateRuleComponent } from './components/create-rule/create-rule.component';
import { CreateCampaignDialogComponent } from './components/create-campaign-dialog/create-campaign-dialog.component';
import { ExportDataDumpComponent } from './components/export-data-dump/export-data-dump.component';
import { CampaignDictionariesResolver } from './resolvers/campaign.resolver';

@NgModule({
	declarations: [
		CampaignsComponent,
		CampaignDetailsComponent,
		CampaignDetailsFormComponent,
		SelectRecordsDialogComponent,
		CreateRuleComponent,
		CreateCampaignDialogComponent,
		ExportDataDumpComponent,
	],
	imports: [CommonModule, CommonUIModule, SharedModule, ReactiveFormsModule, RouterModule],
	entryComponents: [
		SelectRecordsDialogComponent,
		CreateRuleComponent,
		CreateCampaignDialogComponent,
		ExportDataDumpComponent,
	],
	providers: [CampaignDictionariesResolver],
})
export class CampaignsModule {}
