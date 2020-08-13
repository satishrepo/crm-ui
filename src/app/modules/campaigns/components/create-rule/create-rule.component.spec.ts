import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatDialogRef } from '@angular/material';

import { MaterialModule } from 'src/app/shared/modules/material.module';
import { CreateRuleComponent } from './create-rule.component';

describe('CreateRuleComponent', () => {
	let component: CreateRuleComponent;
	let fixture: ComponentFixture<CreateRuleComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [CreateRuleComponent],
			imports: [MaterialModule, FormsModule, ReactiveFormsModule, HttpClientModule],
			providers: [{ provide: MatDialogRef, useValue: {} }],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(CreateRuleComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
