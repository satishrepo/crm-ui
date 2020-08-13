import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadContactsDetailsComponent } from './lead-contacts-details.component';

describe('LeadContactsDetailsComponent', () => {
	let component: LeadContactsDetailsComponent;
	let fixture: ComponentFixture<LeadContactsDetailsComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [LeadContactsDetailsComponent],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(LeadContactsDetailsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
