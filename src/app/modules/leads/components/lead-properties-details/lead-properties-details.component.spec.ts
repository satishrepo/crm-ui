import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadPropertiesDetailsComponent } from './lead-properties-details.component';

describe('LeadPropertiesDetailsComponent', () => {
	let component: LeadPropertiesDetailsComponent;
	let fixture: ComponentFixture<LeadPropertiesDetailsComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [LeadPropertiesDetailsComponent],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(LeadPropertiesDetailsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
