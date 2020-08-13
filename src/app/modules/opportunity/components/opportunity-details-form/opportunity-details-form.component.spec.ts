import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OpportunityDetailsFormComponent } from './opportunity-details-form.component';

describe('OpportunityDetailsFormComponent', () => {
	let component: OpportunityDetailsFormComponent;
	let fixture: ComponentFixture<OpportunityDetailsFormComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [OpportunityDetailsFormComponent],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(OpportunityDetailsFormComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
