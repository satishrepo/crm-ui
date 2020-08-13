import { MatDialog } from '@angular/material';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { CRMCampaigns, FullSearchHeaderCol, PermissionsService } from '@synergy/commonUI';

import { CampaignService } from '../../services/campaign.service';
import { CAMPAIGN_HEADER_COLS } from '../../shared/campaign.constants';
import { CampaignsListReponseData, Campaign } from '../../models/campaign.model';
import { CreateCampaignDialogComponent } from '../../components/create-campaign-dialog/create-campaign-dialog.component';

@Component({
	selector: 'app-campaigns',
	templateUrl: './campaigns.component.html',
	styleUrls: ['./campaigns.component.scss'],
})
export class CampaignsComponent implements OnInit, OnDestroy {
	headerCols: FullSearchHeaderCol[];
	isLoadingCampaigns = false;
	campaignsLength: number;
	campaigns: Campaign[];
	dictionaries;

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private campaignService: CampaignService,
		private permissionsService: PermissionsService,
		public dialog: MatDialog
	) {}

	ngOnInit() {
		this.dictionaries = this.route.snapshot.data['dictionaries'];

		this.headerCols = CAMPAIGN_HEADER_COLS;
	}

	getCampaigns(params) {
		this.campaignService.getItems(params).subscribe((data: CampaignsListReponseData) => {
			this.campaignsLength = data.TotalCount;
			this.campaigns = data.List;
		});
	}

	selectCampaign(campaign: Campaign) {
		this.router.navigate(['/campaigns', campaign.Id]);
	}

	openNewCampaignDialog() {
		this.dialog
			.open(CreateCampaignDialogComponent, {
				disableClose: true,
				autoFocus: false,
				maxWidth: '100%',
				minWidth: '375px',
				data: {
					dictionaries: this.dictionaries,
				},
			})
			.afterClosed()
			.subscribe((id: string) => {
				if (id) {
					this.campaignService.openSelectRecordsDial.next(id);
				}
			});
	}

	get permissionCampaignsCreate() {
		return this.permissionsService.hasPermission(CRMCampaigns.Write);
	}

	ngOnDestroy() {
		if (this.campaignService.openSelectRecordsDialSub && !this.campaignService.openSelectRecordsDialSub.closed) {
			this.campaignService.openSelectRecordsDialSub.unsubscribe();
		}
	}
}
