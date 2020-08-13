import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { PropertyService } from '../../services/property.service';
import { Property, PropertiesApiQueryParams, PropertiesHeaderCol } from '../../models/property.model';
import { HEADER_COLS } from '../../shared/property.constants';
import { getErrorMessage, LoggerService } from '@synergy/commonUI';

@Component({
	selector: 'app-property',
	templateUrl: './property.component.html',
	styleUrls: ['./property.component.scss'],
})
export class PropertyComponent implements OnInit {
	headerCols: PropertiesHeaderCol[];
	propertiesQueryParams: PropertiesApiQueryParams;
	properties: Property[];
	propertiesLength = 0;
	isLoadingProperties = false;

	constructor(private propertyService: PropertyService, private loggerService: LoggerService, private router: Router) {}

	ngOnInit() {
		this.headerCols = HEADER_COLS;
	}

	getProperties(queryParams) {
		const propertyQueryParams: PropertiesApiQueryParams = {
			...queryParams,
			...this.propertiesQueryParams,
		};

		this.isLoadingProperties = true;

		this.propertyService.getItems(propertyQueryParams).subscribe(
			res => {
				this.properties = res.List;
				this.propertiesLength = res.TotalCount;
				this.isLoadingProperties = false;
			},
			err => {
				this.loggerService.error(getErrorMessage(err));
				this.isLoadingProperties = false;
			}
		);
	}

	selectOpportunity(property) {
		this.router.navigate(['/properties', property.Id]);
	}
}
