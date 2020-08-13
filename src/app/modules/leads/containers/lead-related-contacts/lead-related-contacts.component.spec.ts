import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadRelatedContactsComponent } from './lead-related-contacts.component';

describe('LeadRelatedContactsComponent', () => {
	let component: LeadRelatedContactsComponent;
	let fixture: ComponentFixture<LeadRelatedContactsComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [LeadRelatedContactsComponent],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(LeadRelatedContactsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
