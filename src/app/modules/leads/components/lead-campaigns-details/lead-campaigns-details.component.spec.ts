import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';

import { MaterialModule } from 'src/app/shared/modules/material.module';
import { LeadCampaignsDetailsComponent } from './lead-campaigns-details.component';

describe('LeadCampaignsDetailsComponent', () => {
	let component: LeadCampaignsDetailsComponent;
	let fixture: ComponentFixture<LeadCampaignsDetailsComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [LeadCampaignsDetailsComponent],
			imports: [MaterialModule, ReactiveFormsModule, HttpClientModule, RouterTestingModule.withRoutes([])],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(LeadCampaignsDetailsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
