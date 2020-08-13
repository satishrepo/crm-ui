import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';

import { OpportunitiesService } from '../../../opportunity/services/opportunities.service';

import { FullDetailsDialogComponent } from '../full-details-dialog/full-details-dialog.component';
import {
	Opportunity,
	OpportunitiesApiQueryParams,
	OpportunitiesHeaderCol,
} from '../../../opportunity/models/opportunity.model';
import { HEADER_COLS } from '../../../opportunity/shared/opportunity.constants';

@Component({
	selector: 'app-lead-opportunities-details',
	templateUrl: './lead-opportunities-details.component.html',
	styleUrls: ['./lead-opportunities-details.component.scss'],
})
export class LeadOpportunitiesDetailsComponent implements OnInit, OnChanges {
	@Input() leadId: string;
	@Input() selectedOpportunityId: string;

	data: Opportunity[] = [];
	isLoadingOpportunities = false;
	opportunitiesTotal = 0;
	headerCols: OpportunitiesHeaderCol[];
	displayedColumns: string[] = [];
	opportunitiesQueryParams: OpportunitiesApiQueryParams = {
		'Filter.LeadIds': [this.leadId],
		limit: 3,
		offset: 0,
		sortField: '',
		sortOrder: 'desc',
	};

	constructor(
		private opportunitiesService: OpportunitiesService,
		public detailsDialog: MatDialog,
		private router: Router
	) {}

	ngOnInit() {
		this.headerCols = HEADER_COLS;
		this.headerCols.forEach(item => {
			this.displayedColumns = [...this.displayedColumns, item.field];
		});
	}

	ngOnChanges(changes: SimpleChanges) {
		if (
			(changes.leadId && changes.leadId.currentValue) ||
			(changes.selectedOpportunityId && changes.selectedOpportunityId.currentValue)
		) {
			this.getOpportunities();
		}
	}

	getOpportunities() {
		const opportunitiesQueryParams: OpportunitiesApiQueryParams = {
			...this.opportunitiesQueryParams,
			'Filter.LeadIds': [this.leadId],
		};

		this.isLoadingOpportunities = true;

		this.opportunitiesService.getItems(opportunitiesQueryParams).subscribe(
			res => {
				this.data = this.selectedOpportunityId
					? res.List.filter(opportunity => opportunity.Id !== this.selectedOpportunityId)
					: res.List;

				if (this.data.length === 3) {
					this.data.pop();
				}

				this.data = this.data.map(opp => {
					const propertiesNumber = opp.Properties ? opp.Properties.length : 0;
					return { ...opp, PropertiesNumber: propertiesNumber };
				});

				// if there are opportunity id provided it should be excluded from total count
				this.opportunitiesTotal = this.selectedOpportunityId ? res.TotalCount - 1 : res.TotalCount;
				this.isLoadingOpportunities = false;
			},
			err => {
				console.log(err);
				this.isLoadingOpportunities = false;
			}
		);
	}

	rowClick(row: Opportunity) {
		this.router.navigate(['opportunities', row.Id]);
	}

	openFullDetailsDialog(): void {
		this.detailsDialog
			.open(FullDetailsDialogComponent, {
				data: {
					leadId: [this.leadId],
					headerCols: HEADER_COLS,
					title: 'Related Opportunities',
					service: this.opportunitiesService,
					queryParams: this.opportunitiesQueryParams,
					filterId: this.selectedOpportunityId,
				},
				width: '600px',
			})
			.afterClosed()
			.subscribe((selected: Opportunity) => {
				if (selected) {
					this.rowClick(selected);
				}
			});
	}
}
