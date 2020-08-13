import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { CommonUIModule } from '@synergy/commonUI';

import { LeadsModule } from '../leads/leads.module';
import { SharedModule } from '../../shared/shared.module';
import { PropertyComponent } from './pages/property/property.component';
import { PropertyDetailsComponent } from './components/property-details/property-details.component';
import { PropertyDataComponent } from './components/property-data/property-data.component';
import { PropertyDictionariesResolver } from './resolvers/property.resolver';

@NgModule({
	declarations: [PropertyDetailsComponent, PropertyComponent, PropertyDataComponent],
	imports: [CommonModule, CommonUIModule, SharedModule, LeadsModule, RouterModule],
	providers: [PropertyDictionariesResolver],
})
export class PropertyModule {}
