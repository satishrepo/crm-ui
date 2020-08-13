import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CampaignDetailsFormComponent } from './../campaign-details-form/campaign-details-form.component';
import { MaterialModule } from 'src/app/shared/modules/material.module';
import { CampaignDetailsComponent } from './campaign-details.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('CampaignDetailsComponent', () => {
	let component: CampaignDetailsComponent;
	let fixture: ComponentFixture<CampaignDetailsComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [CampaignDetailsComponent, CampaignDetailsFormComponent],
			imports: [MaterialModule, ReactiveFormsModule, HttpClientModule, RouterTestingModule.withRoutes([])],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(CampaignDetailsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
