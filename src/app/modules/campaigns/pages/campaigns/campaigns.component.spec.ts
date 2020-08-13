import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { MaterialModule } from 'src/app/shared/modules/material.module';
import { FullSearchComponent } from './../../../../shared/components/full-search/full-search.component';
import { CampaignsComponent } from './campaigns.component';

describe('CampaignsComponent', () => {
	let component: CampaignsComponent;
	let fixture: ComponentFixture<CampaignsComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [CampaignsComponent, FullSearchComponent],
			imports: [RouterTestingModule.withRoutes([]), MaterialModule, HttpClientModule, FormsModule],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(CampaignsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
