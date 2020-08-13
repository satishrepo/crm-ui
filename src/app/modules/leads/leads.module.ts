import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { CommonUIModule } from '@synergy/commonUI';

import { SharedModule } from '../../shared/shared.module';
import { LeadDetailsComponent } from './components/lead-details/lead-details.component';
import { LeadsComponent } from './pages/leads/leads.component';
import { LeadPropertiesDetailsComponent } from './components/lead-properties-details/lead-properties-details.component';
import { FullDetailsDialogComponent } from './components/full-details-dialog/full-details-dialog.component';

@NgModule({
	declarations: [LeadsComponent, LeadDetailsComponent, LeadPropertiesDetailsComponent, FullDetailsDialogComponent],
	imports: [CommonModule, CommonUIModule, SharedModule, RouterModule],
	exports: [LeadPropertiesDetailsComponent, FullDetailsDialogComponent],
	entryComponents: [FullDetailsDialogComponent],
})
export class LeadsModule {}
