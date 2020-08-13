import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadOpportunitiesDetailsComponent } from './lead-opportunities-details.component';

describe('LeadOpportunitiesDetailsComponent', () => {
	let component: LeadOpportunitiesDetailsComponent;
	let fixture: ComponentFixture<LeadOpportunitiesDetailsComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [LeadOpportunitiesDetailsComponent],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(LeadOpportunitiesDetailsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
