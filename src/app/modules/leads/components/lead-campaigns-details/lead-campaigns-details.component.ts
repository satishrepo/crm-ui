import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';

import { CampaignService } from '../../../campaigns/services/campaign.service';

import { FullDetailsDialogComponent } from '../full-details-dialog/full-details-dialog.component';
import { Campaign, CampaignsApiQueryParams, CampaignsHeaderCol } from '../../../campaigns/models/campaign.model';
import { HEADER_COLS } from '../../shared/campaign.constants';

@Component({
	selector: 'app-lead-campaigns-details',
	templateUrl: './lead-campaigns-details.component.html',
	styleUrls: ['./lead-campaigns-details.component.scss'],
})
export class LeadCampaignsDetailsComponent implements OnInit, OnChanges {
	@Input() leadId: string;

	data: Campaign[] = [];
	isLoadingCampaigns = false;
	campaignsTotal = 0;
	headerCols: CampaignsHeaderCol[];
	displayedColumns: string[] = [];
	campaignsQueryParams: CampaignsApiQueryParams = {
		'Filter.LeadIds': [this.leadId],
		limit: 2,
		offset: 0,
	};

	constructor(protected campaignService: CampaignService, public detailsDialog: MatDialog, private router: Router) {}

	ngOnInit() {
		this.headerCols = HEADER_COLS;
		this.headerCols.forEach(item => {
			this.displayedColumns = [...this.displayedColumns, item.field];
		});
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes.leadId.currentValue !== changes.leadId.previousValue && changes.leadId.currentValue) {
			this.getCampaigns();
		}
	}

	getCampaigns() {
		const campaignsQueryParams: CampaignsApiQueryParams = {
			...this.campaignsQueryParams,
			'Filter.LeadIds': [this.leadId],
		};

		this.isLoadingCampaigns = true;

		this.campaignService.getItems(campaignsQueryParams).subscribe(
			res => {
				this.data = res.List;
				this.campaignsTotal = res.TotalCount;
				this.isLoadingCampaigns = false;
			},
			err => {
				console.log(err);
				this.isLoadingCampaigns = false;
			}
		);
	}

	rowClick(row: Campaign) {
		this.router.navigate(['campaigns', row.Id]);
	}

	openFullDetailsDialog(): void {
		this.detailsDialog
			.open(FullDetailsDialogComponent, {
				data: {
					leadId: [this.leadId],
					headerCols: HEADER_COLS,
					title: 'Related Campaigns',
					service: this.campaignService,
					queryParams: this.campaignsQueryParams,
				},
				width: '700px',
			})
			.afterClosed()
			.subscribe((selected: Campaign) => {
				if (selected) {
					this.rowClick(selected);
				}
			});
	}
}
