import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportDataDumpComponent } from './export-data-dump.component';

describe('ExportDataDumpComponent', () => {
	let component: ExportDataDumpComponent;
	let fixture: ComponentFixture<ExportDataDumpComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ExportDataDumpComponent],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ExportDataDumpComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
