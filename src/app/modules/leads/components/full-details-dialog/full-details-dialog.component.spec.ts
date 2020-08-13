import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { MAT_DIALOG_DATA } from '@angular/material';

import { FullDetailsDialogComponent } from './full-details-dialog.component';
import { MaterialModule } from 'src/app/shared/modules/material.module';

describe('FullDetailsDialogComponent', () => {
	let component: FullDetailsDialogComponent;
	let fixture: ComponentFixture<FullDetailsDialogComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [FullDetailsDialogComponent],
			imports: [MaterialModule, ReactiveFormsModule, HttpClientModule, RouterTestingModule.withRoutes([])],
			providers: [{ provide: MAT_DIALOG_DATA, useValue: {} }],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(FullDetailsDialogComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
