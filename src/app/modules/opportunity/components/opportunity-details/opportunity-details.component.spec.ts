import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OpportunityDetailsComponent } from './opportunity-details.component';

describe('OpportunityDetailsComponent', () => {
	let component: OpportunityDetailsComponent;
	let fixture: ComponentFixture<OpportunityDetailsComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [OpportunityDetailsComponent],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(OpportunityDetailsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
