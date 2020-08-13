import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';

import { MaterialModule } from 'src/app/shared/modules/material.module';
import { ContactsFormComponent } from './../contacts-form/contacts-form.component';
import { ContactsDetailsComponent } from './contacts-details.component';
import { LeadContactsDetailsComponent } from 'src/app/modules/leads/components/lead-contacts-details/lead-contacts-details.component';
import { LeadOpportunitiesDetailsComponent } from 'src/app/modules/leads/components/lead-opportunities-details/lead-opportunities-details.component';

describe('ContactsDetailsComponent', () => {
	let component: ContactsDetailsComponent;
	let fixture: ComponentFixture<ContactsDetailsComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [
				ContactsDetailsComponent,
				ContactsFormComponent,
				LeadContactsDetailsComponent,
				LeadOpportunitiesDetailsComponent,
			],
			imports: [MaterialModule, ReactiveFormsModule, HttpClientModule, RouterTestingModule.withRoutes([])],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ContactsDetailsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
