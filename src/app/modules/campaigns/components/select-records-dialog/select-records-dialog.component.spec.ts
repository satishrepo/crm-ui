import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatDialogRef } from '@angular/material';

import { SelectRecordsDialogComponent } from './select-records-dialog.component';
import { CreateRuleComponent } from '../create-rule/create-rule.component';
import { MaterialModule } from 'src/app/shared/modules/material.module';

describe('SelectRecordsDialogComponent', () => {
	let component: SelectRecordsDialogComponent;
	let fixture: ComponentFixture<SelectRecordsDialogComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [SelectRecordsDialogComponent, CreateRuleComponent],
			imports: [MaterialModule, FormsModule, ReactiveFormsModule, HttpClientModule],
			providers: [{ provide: MatDialogRef, useValue: {} }],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(SelectRecordsDialogComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
