import { map } from 'rxjs/operators';
import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { MatTableDataSource, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { CreateRuleComponent } from './../create-rule/create-rule.component';
import { CampaignService } from './../../services/campaign.service';
import { Rule, CampaignRuleItem } from '../../models/campaign.model';

import { LoggerService, getErrorMessage, FastEntity } from '@synergy/commonUI';

@Component({
	selector: 'app-select-records-dialog',
	templateUrl: './select-records-dialog.component.html',
	styleUrls: ['./select-records-dialog.component.scss'],
})
export class SelectRecordsDialogComponent implements OnInit {
	displayedColumns: string[] = ['select', 'ruleName', 'description'];
	dataSource = new MatTableDataSource<Rule>();
	isLoading = true;
	isCancelRulesBtnActive = false;
	campaignId: string;
	generalLandUseCodes: FastEntity[];

	@ViewChild('table', { read: ElementRef }) tableElement: ElementRef;

	search = '';
	searchMatchElementRefs: HTMLDivElement[] = [];
	searchTransition = 0;

	constructor(
		public dialog: MatDialog,
		private campaignService: CampaignService,
		public dialogRef: MatDialogRef<SelectRecordsDialogComponent>,
		@Inject(MAT_DIALOG_DATA) private data,
		private loggerService: LoggerService
	) {
		this.campaignId = data.campaignId;
		this.generalLandUseCodes = data.generalLandUseCodes;
	}

	ngOnInit() {
		this.getAssignedRules();
	}

	private getAssignedRules() {
		this.campaignService
			.getAssignedRules(this.campaignId)
			.pipe(map((data: { TotalCount: number; List: Rule[] }) => data.List))
			.subscribe((rules: Rule[]) => {
				this.isCancelRulesBtnActive = rules.some(rule => rule.IsAttached);
				this.dataSource.data = rules;
				this.isLoading = false;
			});
	}

	searchChange() {
		this.searchTransition = 0;
		this.removeClasslists();

		if (!this.search.length) {
			this.searchMatchElementRefs = [];
		} else {
			this.searchMatchElementRefs = Array.prototype.slice
				.call(this.tableElement.nativeElement.querySelectorAll('.rule-name-value span'))
				.filter((el: HTMLSpanElement) => el.innerText.toLowerCase().includes(this.search.toLowerCase()));
			this.scrollToSearchedElement();
		}
	}

	removeClasslists() {
		this.tableElement.nativeElement
			.querySelectorAll('.highlight')
			.forEach((el: HTMLSpanElement) => el.classList.remove('highlight'));
	}

	scrollToSearchedElement() {
		this.removeClasslists();
		if (this.searchMatchElementRefs.length) {
			this.searchMatchElementRefs[this.searchTransition].classList.add('highlight');
			this.searchMatchElementRefs[this.searchTransition].scrollIntoView({ block: 'center' });
		}
	}

	clearSearch() {
		this.search = '';
		this.searchMatchElementRefs = [];
		this.searchTransition = 0;
		this.removeClasslists();
	}

	goForward() {
		this.searchTransition++;
		this.scrollToSearchedElement();
	}

	goBackward() {
		this.searchTransition--;
		this.scrollToSearchedElement();
	}

	isAllSelected() {
		return this.dataSource.data.every(rule => rule.IsAttached);
	}

	isSomeSelected() {
		return this.dataSource.data.some(rule => rule.IsAttached);
	}

	masterToggle() {
		const value = !this.isAllSelected();
		this.dataSource.data.forEach(rule => (rule.IsAttached = value));
	}

	openCreateRuleModal() {
		this.dialog
			.open(CreateRuleComponent, {
				disableClose: true,
				autoFocus: false,
				maxWidth: '100%',
				width: '80vw',
			})
			.afterClosed()
			.subscribe(() => {
				this.getAssignedRules();
			});
	}

	private closeDialog() {
		this.dialogRef.close();
	}

	assignRulesWithCampaign() {
		this.isLoading = true;
		this.campaignService.assignRulesWithCampaign(this.campaignId, this.dataSource.data).subscribe(
			() => {
				this.closeDialog();
			},
			err => {
				this.isLoading = false;
				this.loggerService.error(getErrorMessage(err));
			}
		);
	}

	unassignRulesWithCampaign() {
		this.isLoading = true;
		this.campaignService.assignRulesWithCampaign(this.campaignId, []).subscribe(
			() => {
				this.closeDialog();
			},
			err => {
				this.isLoading = false;
				this.loggerService.error(getErrorMessage(err));
			}
		);
	}

	getCampaignRuleItemValue(ruleItem: CampaignRuleItem): string {
		if (!ruleItem) {
			return '';
		}

		if (ruleItem.CampaignRuleField.Id === 3) {
			const generalLandUseCode = this.generalLandUseCodes.find(genLandCode => genLandCode.Id === +ruleItem.Value);
			return generalLandUseCode ? generalLandUseCode.Name : '';
		}

		return ruleItem.Value;
	}
}
