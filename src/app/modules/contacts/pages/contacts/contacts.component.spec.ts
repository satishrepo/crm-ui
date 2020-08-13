import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ContactsComponent } from './contacts.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';

import { MaterialModule } from 'src/app/shared/modules/material.module';
import { FullSearchComponent } from './../../../../shared/components/full-search/full-search.component';

describe('ContactsComponent', () => {
	let component: ContactsComponent;
	let fixture: ComponentFixture<ContactsComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ContactsComponent, FullSearchComponent],
			imports: [MaterialModule, ReactiveFormsModule, FormsModule, HttpClientModule, RouterTestingModule.withRoutes([])],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ContactsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
