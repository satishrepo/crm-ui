import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateOpportunityDialogComponent } from './create-opportunity-dialog.component';

describe('CreateOpportunityDialogComponent', () => {
	let component: CreateOpportunityDialogComponent;
	let fixture: ComponentFixture<CreateOpportunityDialogComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [CreateOpportunityDialogComponent],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(CreateOpportunityDialogComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
