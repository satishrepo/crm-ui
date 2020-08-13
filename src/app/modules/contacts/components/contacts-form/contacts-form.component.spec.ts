import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';

import { ContactsFormComponent } from './contacts-form.component';
import { MaterialModule } from 'src/app/shared/modules/material.module';

describe('ContactsFormComponent', () => {
	let component: ContactsFormComponent;
	let fixture: ComponentFixture<ContactsFormComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ContactsFormComponent],
			imports: [MaterialModule, ReactiveFormsModule, HttpClientModule, RouterTestingModule.withRoutes([])],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ContactsFormComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
