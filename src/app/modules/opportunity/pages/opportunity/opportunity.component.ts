import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material';

import { CRMContacts, CRMOpportunities, CRMProperties, CRMRecords, PermissionsService } from '@synergy/commonUI';

import { OpportunitiesService } from '../../services/opportunities.service';
import {
	Opportunity,
	OpportunitiesApiQueryParams,
	OpportunitiesHeaderCol,
	OpportunityDictionaries,
	Borrower,
} from '../../models/opportunity.model';
import { HEADER_COLS, SEARCH_HEADER_COLS } from '../../shared/opportunity.constants';
import { CreateOpportunityDialogComponent } from '../../components/create-opportunity-dialog/create-opportunity-dialog.component';

@Component({
	selector: 'app-opportunity',
	templateUrl: './opportunity.component.html',
	styleUrls: ['./opportunity.component.scss'],
})
export class OpportunityComponent implements OnInit {
	headerCols: OpportunitiesHeaderCol[];
	searchHeaderCols: any[];
	opportunitiesQueryParams: OpportunitiesApiQueryParams;
	opportunities: Opportunity[];
	opportunitiesLength: number;
	isLoadingOpportunities = false;
	dictionaries: OpportunityDictionaries;

	constructor(
		private opportunityService: OpportunitiesService,
		private router: Router,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private permissionsService: PermissionsService
	) {}

	ngOnInit() {
		this.headerCols = HEADER_COLS;
		this.searchHeaderCols = SEARCH_HEADER_COLS;
		this.dictionaries = this.route.snapshot.data['dictionaries'];
	}

	getOpportunities(queryParams) {
		const opportunitiesQueryParams: OpportunitiesApiQueryParams = {
			...queryParams,
			...this.opportunitiesQueryParams,
		};

		this.opportunityService.getItems(opportunitiesQueryParams).subscribe(
			res => {
				this.opportunities = this.parseOpportunities(res.List);
				this.opportunitiesLength = res.TotalCount;
				this.isLoadingOpportunities = false;
			},
			err => {
				console.log(err);
				this.isLoadingOpportunities = false;
			}
		);
	}

	selectOpportunity(opportunity) {
		this.router.navigate(['/opportunities', opportunity.Id]);
	}

	parseOpportunities(opportunities): Opportunity[] {
		return opportunities.map(opportunity => {
			const PropertyType = this.dictionaries.PropertyTypes.find(
				propertyType => propertyType.Id === opportunity.OpportunityPropertyTypeId
			);
			opportunity = {
				...opportunity,
				PropertyType,
				Borrowers:
					opportunity.Borrowers && opportunity.Borrowers.length > 0
						? opportunity.Borrowers.sort((a, b) => a.Order - b.Order)
						: [],
			};

			//can't be more than two borrowers in crm
			if (opportunity.Borrowers.length) {
				const FirstBorrowerName = this.getBorrowerFullName(opportunity.Borrowers[0]);
				const SecondBorrowerName = this.getBorrowerFullName(opportunity.Borrowers[1]);

				return { ...opportunity, FirstBorrowerName, SecondBorrowerName };
			}

			return { ...opportunity };
		});
	}

	getBorrowerFullName(borrower): string {
		if (!borrower) {
			return '';
		}
		const fixName = (field: keyof Borrower): string => (borrower[field] ? `${borrower[field]} ` : '');

		return `${fixName('FirstName')}${fixName('MiddleName')}${fixName('LastName')}`;
	}

	openCreateDialog(): void {
		this.dialog.open(CreateOpportunityDialogComponent, {
			height: '80vh',
			disableClose: true,
			data: {
				dictionaries: this.dictionaries,
			},
		});
	}

	get permissionOpportunitiesCreate() {
		return (
			this.permissionsService.hasPermission(CRMOpportunities.Write) &&
			this.permissionsService.hasPermission(CRMRecords.Read) &&
			this.permissionsService.hasPermission(CRMProperties.Read) &&
			this.permissionsService.hasPermission(CRMContacts.Read)
		);
	}
}
