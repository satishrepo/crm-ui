import { AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChange, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import * as moment from 'moment';
import { SatDatepickerInputEvent } from 'saturn-datepicker';
import { ActivatedRoute } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { MaskPipe } from 'ngx-mask';

import { getErrorMessage, LoggerService } from '@synergy/commonUI';

import {
	BorrowerTypes,
	FIELD_FORMAT,
	HistoryColumnCell,
	HistoryDictionaries,
	HistoryFields,
	OpportunityHistory,
	OpportunityHistoryFields,
} from '../../models/history.model';
import { HistoryColumns } from '../../constants/history.columns';
import { OpportunitiesService } from '../../services/opportunities.service';

@Component({
	selector: 'app-history',
	templateUrl: './history.component.html',
	styleUrls: ['./history.component.scss'],
	providers: [CurrencyPipe, MaskPipe],
})
export class HistoryComponent implements OnInit, AfterViewInit, OnChanges {
	@Input() opportunityId: string;

	isLoading = false;
	headerCols: HistoryColumnCell[] = [];
	historyData: OpportunityHistory[] = [];
	displayedColumns: string[] = [];

	filterPeriod = new FormControl({ value: { begin: null, end: null } });

	dictionaries: HistoryDictionaries = {
		Users: [],
		OpportunityStages: [],
		PropertyTypes: [],
		LoanTypes: [],
	};

	constructor(
		private opportunitiesService: OpportunitiesService,
		private loggerService: LoggerService,
		private route: ActivatedRoute,
		private currencyPipe: CurrencyPipe,
		private maskPipe: MaskPipe
	) {}

	ngOnInit() {
		this.dictionaries = this.route.parent.snapshot.data['dictionaries'];
	}

	ngAfterViewInit() {
		this.headerCols = HistoryColumns;
		this.displayedColumns = this.headerCols.map(item => item.field);
	}

	ngOnChanges(changes: SimpleChanges) {
		const opportunityId: SimpleChange = changes.opportunityId;

		if (opportunityId && opportunityId.currentValue !== opportunityId.previousValue) {
			this.historyData = [];
			this.filterPeriod.setValue({ begin: null, end: null });
		}
	}

	formatDateValue(event: SatDatepickerInputEvent<any>) {
		if (event.target.value) {
			this.filterPeriod.patchValue({
				begin: moment(event.target.value.begin).format(moment.HTML5_FMT.DATE) + 'T00:00:00',
				end: moment(event.target.value.end).format(moment.HTML5_FMT.DATE) + 'T00:00:00',
			});
		}
	}

	fetchHistory() {
		const beginDate = moment(this.filterPeriod.value.begin);
		const endDate = moment(this.filterPeriod.value.end);

		if (beginDate.isValid() && endDate.isValid()) {
			const period = {
				begin: beginDate.format('YYYY-MM-DDTHH:mm:ss.SSSZZ'),
				end: endDate.add(1, 'days').format('YYYY-MM-DDTHH:mm:ss.SSSZZ'),
			};

			this.isLoading = true;
			this.opportunitiesService.getOpportunityHistory(this.opportunityId, period).subscribe(
				history => {
					this.isLoading = false;
					const sortedHistory = history.sort(
						(a, b) => new Date(b.LastUpdate).getTime() - new Date(a.LastUpdate).getTime()
					);
					this.historyData = this.formatHistory(sortedHistory);
				},
				err => {
					this.isLoading = false;
					this.loggerService.error(getErrorMessage(err));
				}
			);
		}
	}

	private formatValue(fieldId: number, value, descriptorFormat?: FIELD_FORMAT) {
		if (descriptorFormat) {
			if (descriptorFormat === FIELD_FORMAT.Currency) {
				return value ? this.currencyPipe.transform(value) : '';
			}
			if (descriptorFormat === FIELD_FORMAT.Date) {
				return value ? value.substr(0, 10) : '';
			}
			if (descriptorFormat === FIELD_FORMAT.Percent) {
				return value ? value + '%' : '';
			}
			if (descriptorFormat === FIELD_FORMAT.Phone) {
				return value ? this.maskPipe.transform(value, '(000) 000-0000') : '';
			}
		}
		if (fieldId === OpportunityHistoryFields.Stage) {
			const val = this.dictionaries.OpportunityStages.find(stage => stage.Id === Number(value));
			return val && val.Name ? val.Name : '';
		}
		if (fieldId === OpportunityHistoryFields.PropertyType) {
			const val = this.dictionaries.PropertyTypes.find(property => property.Id === Number(value));
			return val && val.Name ? val.Name : '';
		}
		if (fieldId === OpportunityHistoryFields.LoanType) {
			const val = this.dictionaries.LoanTypes.find(loan => loan.Id === Number(value));
			return val && val.Name ? val.Name : '';
		}
		if (fieldId === OpportunityHistoryFields.PropertyAddress) {
			return value && Array.isArray(value) ? value.join(', ') : '';
		}
		return value;
	}

	private getUserName(id: string): string {
		const user = this.dictionaries.Users.find(u => u.Id === id);
		return user && user.Name ? user.Name : '';
	}

	private getFieldName(history: OpportunityHistory): string {
		const descriptor = HistoryFields[history.Field];
		const fieldName = descriptor && descriptor.name ? descriptor.name : '';
		let fixedBorrowerName = '';

		if (history.Borrower) {
			if (history.Borrower.BorrowerType === BorrowerTypes.OpportunityCommercialBorrower) {
				fixedBorrowerName = descriptor && descriptor.commercialBorrowerName ? descriptor.commercialBorrowerName : '';
			}
			if (history.Borrower.BorrowerType === BorrowerTypes.OpportunityBorrower) {
				fixedBorrowerName = fieldName.replace('Borrower', `Borrower ${history.Borrower.BorrowerOrder + 1}`);
			}
		}

		return fixedBorrowerName ? fixedBorrowerName : fieldName;
	}

	private formatHistory(history: OpportunityHistory[]) {
		return history.map(h => {
			const descriptor = HistoryFields[h.Field];
			const previousValue = h.PreviousValues !== null ? h.PreviousValues : h.PreviousValue;
			const newValue = h.NewValues !== null ? h.NewValues : h.NewValue;

			return {
				...h,
				FieldName: this.getFieldName(h),
				UpdatedBy: this.getUserName(h.UpdatedBy),
				PreviousValue: this.formatValue(h.Field, previousValue, descriptor.format),
				NewValue: this.formatValue(h.Field, newValue, descriptor.format),
			};
		});
	}
}
