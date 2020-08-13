import { Component, OnInit } from '@angular/core';

import { LeadsService } from '../../services/leads.service';
import { Lead, LeadsApiQueryParams, LeadsHeaderCol } from '../../models/lead.model';
import { HEADER_COLS } from '../../shared/leads.constants';

import { Router } from '@angular/router';
import { getErrorMessage, LoggerService } from '@synergy/commonUI';

@Component({
	selector: 'app-leads',
	templateUrl: './leads.component.html',
	styleUrls: ['./leads.component.scss'],
})
export class LeadsComponent implements OnInit {
	headerCols: LeadsHeaderCol[];
	leadsQueryParams: LeadsApiQueryParams = {
		sortField: '',
		sortOrder: 'desc',
	};
	leads: Lead[] = [];
	leadsLength = 0;
	isLoadingLeads = false;

	constructor(private leadsService: LeadsService, private router: Router, private loggerService: LoggerService) {}

	ngOnInit() {
		this.headerCols = HEADER_COLS;
	}

	getLeads(queryParams) {
		const leadsQueryParams: LeadsApiQueryParams = {
			...queryParams,
			...this.leadsQueryParams,
		};

		this.isLoadingLeads = true;

		this.leadsService.getItems(leadsQueryParams).subscribe(
			res => {
				this.leads = res.List.map(lead => {
					return { ...lead, ...lead.Address };
				});

				this.leadsLength = res.TotalCount;
				this.isLoadingLeads = false;
			},
			err => {
				this.loggerService.error(getErrorMessage(err));
				this.isLoadingLeads = false;
			}
		);
	}

	selectLead(lead: Lead) {
		this.router.navigate(['/records', lead.Id]);
	}
}
