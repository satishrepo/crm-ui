import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { MatDialogRef } from '@angular/material';

import { CampaignDetailsFormComponent } from './../campaign-details-form/campaign-details-form.component';
import { CreateCampaignDialogComponent } from './create-campaign-dialog.component';

describe('CreateCampaignDialogComponent', () => {
	let component: CreateCampaignDialogComponent;
	let fixture: ComponentFixture<CreateCampaignDialogComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [CreateCampaignDialogComponent, CampaignDetailsFormComponent],
			imports: [ReactiveFormsModule, HttpClientModule, RouterTestingModule.withRoutes([])],
			providers: [{ provide: MatDialogRef, useValue: {} }],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(CreateCampaignDialogComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
