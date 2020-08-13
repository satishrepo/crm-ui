import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { CampaignDetailsFormComponent } from './campaign-details-form.component';
import { MaterialModule } from 'src/app/shared/modules/material.module';

describe('CampaignDetailsFormComponent', () => {
	let component: CampaignDetailsFormComponent;
	let fixture: ComponentFixture<CampaignDetailsFormComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [CampaignDetailsFormComponent],
			imports: [MaterialModule, ReactiveFormsModule, HttpClientModule],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(CampaignDetailsFormComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
