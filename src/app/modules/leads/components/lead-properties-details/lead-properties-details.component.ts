import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';

import { PropertyService } from '../../../property/services/property.service';
import { FullDetailsDialogComponent } from '../full-details-dialog/full-details-dialog.component';
import { Property, PropertiesApiQueryParams, PropertiesHeaderCol } from '../../../property/models/property.model';
import { RELATED_HEADER_COLS } from '../../../property/shared/property.constants';

@Component({
	selector: 'app-lead-properties-details',
	templateUrl: './lead-properties-details.component.html',
	styleUrls: ['./lead-properties-details.component.scss'],
})
export class LeadPropertiesDetailsComponent implements OnInit, OnChanges {
	@Input() leadId: string;
	@Input() filterPropId: String;

	data: Property[] = [];
	isLoadingProperties = false;
	propertiesTotal = 0;
	headerCols: PropertiesHeaderCol[];
	displayedColumns: string[] = [];
	propertiesQueryParams: PropertiesApiQueryParams = {
		'Filter.LeadIds': [this.leadId],
		limit: 3,
		offset: 0,
	};
	totalLatestYearDue: string;
	totalAmountDue: string;

	constructor(private propertyService: PropertyService, public detailsDialog: MatDialog, private router: Router) {}

	ngOnInit() {
		this.headerCols = RELATED_HEADER_COLS;
		this.headerCols.forEach(item => {
			this.displayedColumns = [...this.displayedColumns, item.field];
		});
	}

	ngOnChanges(changes: SimpleChanges) {
		if (
			(changes.leadId && changes.leadId.currentValue) ||
			(changes.filterPropId && changes.filterPropId.currentValue)
		) {
			this.getProperties();
		}
	}

	getProperties() {
		const propertiesQueryParams: PropertiesApiQueryParams = {
			...this.propertiesQueryParams,
			'Filter.LeadIds': [this.leadId],
		};

		this.isLoadingProperties = true;

		this.propertyService.getItems(propertiesQueryParams).subscribe(
			res => {
				this.data = this.filterPropId ? res.List.filter(property => property.Id !== this.filterPropId) : res.List;
				if (this.data.length === 3) {
					this.data.pop();
				}
				this.propertiesTotal = this.filterPropId ? res.TotalCount - 1 : res.TotalCount;
				this.isLoadingProperties = false;
				this.getAllProperties(res.TotalCount);
			},
			err => {
				console.log(err);
				this.isLoadingProperties = false;
			}
		);
	}

	//get all properties for calculating total amounts
	getAllProperties(totalCount) {
		const propertiesQueryParams: PropertiesApiQueryParams = {
			limit: totalCount,
			offset: 0,
			'Filter.LeadIds': [this.leadId],
		};

		this.isLoadingProperties = true;

		this.propertyService.getItems(propertiesQueryParams).subscribe(
			res => {
				const data = this.filterPropId ? res.List.filter(property => property.Id !== this.filterPropId) : res.List;
				this.totalAmountDue = data
					.map(p => p.AmountDue)
					.reduce((acc, value) => acc + value, 0)
					.toFixed(2);
				this.totalLatestYearDue = data
					.map(p => p.LatestYearDue)
					.reduce((acc, value) => acc + value, 0)
					.toFixed(2);

				this.isLoadingProperties = false;
			},
			err => {
				console.log(err);
				this.isLoadingProperties = false;
			}
		);
	}

	rowClick(row: Property) {
		this.router.navigate(['properties', row.Id]);
	}

	openFullDetailsDialog(): void {
		this.detailsDialog
			.open(FullDetailsDialogComponent, {
				data: {
					leadId: [this.leadId],
					headerCols: RELATED_HEADER_COLS,
					title: 'Related Properties',
					service: this.propertyService,
					queryParams: this.propertiesQueryParams,
					filterId: this.filterPropId,
				},
				width: '835px',
			})
			.afterClosed()
			.subscribe((selected: Property) => {
				if (selected) {
					this.rowClick(selected);
				}
			});
	}
}
