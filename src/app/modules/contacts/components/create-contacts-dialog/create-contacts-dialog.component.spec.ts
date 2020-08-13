import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { MatDialogRef } from '@angular/material';

import { CreateContactsDialogComponent } from './create-contacts-dialog.component';
import { MaterialModule } from 'src/app/shared/modules/material.module';
import { ContactsFormComponent } from '../contacts-form/contacts-form.component';

describe('CreateContactsDialogComponent', () => {
	let component: CreateContactsDialogComponent;
	let fixture: ComponentFixture<CreateContactsDialogComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [CreateContactsDialogComponent, ContactsFormComponent],
			imports: [MaterialModule, ReactiveFormsModule, HttpClientModule, RouterTestingModule.withRoutes([])],
			providers: [{ provide: MatDialogRef, useValue: {} }],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(CreateContactsDialogComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
