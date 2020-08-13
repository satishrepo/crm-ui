import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CurrencyPipe } from '@angular/common';
import { MatSnackBar } from '@angular/material';
import { Observable, BehaviorSubject, of, forkJoin } from 'rxjs';
import { finalize, map, switchMap } from 'rxjs/operators';

import { fixBackendDates, ItemsService } from '@synergy/commonUI';

import {
	OpportunitiesApi,
	OpportunitiesApiQueryParams,
	Opportunity,
	SensitiveData,
	SensitiveDataUpdateModel,
} from '../models/opportunity.model';
import { environment } from '../../../../environments/environment';
import { OpportunityHistory } from '../models/history.model';
import { EmptyGuid } from '../shared/opportunity.constants';

export const parseFormValues = (values: Opportunity) => {
	let LeadId = values.Lead || null;
	let ContactId = null;
	let AmountDue, PrePay, LenderCredit, ClosingCost, CurrentLoanBalance, ThirdPartyLoanBalance;

	if (values) {
		if (values.Lead && values.Lead.Id) {
			LeadId = values.LeadId ? values.LeadId : values.Lead.Id;
		}

		if (values.Contact && values.Contact.Id) {
			ContactId = values.Contact.Id;
		}

		AmountDue = values.AmountDue ? values.AmountDue : values.CalculatedAmountDue;
		PrePay = Number(values.PrePay) > 0 ? values.PrePay : '';
		LenderCredit = Number(values.LenderCredit) > 0 ? values.LenderCredit : '';
		ClosingCost = Number(values.ClosingCost) > 0 ? values.ClosingCost : '';
		CurrentLoanBalance = Number(values.CurrentLoanBalance) > 0 ? values.CurrentLoanBalance : '';
		ThirdPartyLoanBalance = Number(values.ThirdPartyLoanBalance) > 0 ? values.ThirdPartyLoanBalance : '';
	}
	const fixEmptyBorrowerField = borrowers =>
		borrowers && borrowers.length > 0
			? borrowers.map(borrower => {
					Object.keys(borrower).forEach(k => {
						borrower[k] = borrower[k] === '' ? null : borrower[k];
						if (k === 'Id' && borrower[k] === null) {
							borrower[k] = EmptyGuid;
						}
					});
					return borrower;
			  })
			: [];

	return {
		...values,
		AmountDue,
		LeadId,
		ContactId,
		PrePay,
		LenderCredit,
		ClosingCost,
		CurrentLoanBalance,
		ThirdPartyLoanBalance,
		Borrowers: fixEmptyBorrowerField(values.Borrowers),
		CommercialBorrowers: fixEmptyBorrowerField(values.CommercialBorrowers),
	};
};

export const toFixed2 = (val: number): string => {
	return val ? Number(val).toFixed(2) : '';
};

@Injectable({
	providedIn: 'root',
})
export class OpportunitiesService extends ItemsService<OpportunitiesApiQueryParams, OpportunitiesApi, Opportunity> {
	opportunityCommentsSub: BehaviorSubject<any>;
	opportunitySub: BehaviorSubject<any>;
	isLoading: BehaviorSubject<boolean>;

	commentsOffset;
	snackBar;
	leadsApiUrl;

	historyUrl: string;
	currencyPipe: CurrencyPipe;

	constructor(httpClient: HttpClient, snackBar: MatSnackBar, currencyPipe: CurrencyPipe) {
		const apiUrl = `${environment.crmApi}/api/opportunities`;

		super(httpClient, apiUrl, environment);

		this.historyUrl = `${environment.crmApi}/api/history/`;
		this.opportunityCommentsSub = new BehaviorSubject<any>(null);
		this.opportunitySub = new BehaviorSubject<any>(null);
		this.isLoading = new BehaviorSubject<boolean>(false);

		this.snackBar = snackBar;
		this.leadsApiUrl = `${environment.crmApi}/api/leads`;
		this.commentsOffset = 0;
		this.currencyPipe = currencyPipe;
	}

	fixOpportunity(item: Opportunity): Opportunity {
		item.Borrowers.forEach(borrower => {
			fixBackendDates(borrower, ['DateOfBirth']);
		});
		return fixBackendDates(item, ['CloseDate']);
	}

	getItems(queryParams): Observable<OpportunitiesApi> {
		return super.getItems(queryParams).pipe(
			map(items => {
				items.List = items.List.map(item => this.fixOpportunity(item));
				return items;
			})
		);
	}

	fetchOpportunity(id: string) {
		this.isLoading.next(true);

		return this.getItemById(id)
			.pipe(map(item => this.fixOpportunity(item)))
			.subscribe(
				opportunity => {
					const parsedOpportunity = parseFormValues(opportunity);

					this.setOpportunity(parsedOpportunity);

					this.isLoading.next(false);

					return parsedOpportunity;
				},
				err => this.isLoading.next(false)
			);
	}

	updateOpportunity(
		id: string,
		opportunity: Opportunity,
		borrowersSensitiveFieldsUpdateData: SensitiveDataUpdateModel[]
	): Observable<any> {
		return this.httpClient.patch(`${environment.crmApi}/api/opportunities/${id}`, opportunity).pipe(
			switchMap((res: Opportunity) => {
				return this.getItemById(id).pipe(map(item => this.fixOpportunity(item)));
			}),
			switchMap(res => {
				let borrowers;

				if (res.Borrowers.length) {
					borrowers = res.Borrowers.sort((a, b) => a.Order - b.Order);
				} else {
					borrowers = res.CommercialBorrowers.sort((a, b) => a.Order - b.Order);
				}

				borrowersSensitiveFieldsUpdateData = borrowersSensitiveFieldsUpdateData
					.map(sensitivedata => {
						const borrowerId = borrowers[sensitivedata.Order] && borrowers[sensitivedata.Order].Id;
						return { ...sensitivedata, Id: borrowerId };
					})
					.filter(sensitiveData => sensitiveData.Id);

				return borrowersSensitiveFieldsUpdateData.length
					? forkJoin(this.updateSensitiveData(id, borrowersSensitiveFieldsUpdateData)).pipe(
							map(() => {
								return res;
							})
					  )
					: of(res);
			})
		);
	}

	createOpportunity(
		opportunity: Opportunity,
		borrowersSensitiveFieldsUpdateData: SensitiveDataUpdateModel[]
	): Observable<any> {
		return this.httpClient.post(`${environment.crmApi}/api/opportunities`, opportunity).pipe(
			switchMap((res: string) => this.getItemById(res).pipe(map(item => this.fixOpportunity(item)))),
			switchMap(res => {
				let borrowers;

				if (res.Borrowers.length) {
					borrowers = res.Borrowers.sort((a, b) => a.Order - b.Order);
				} else {
					borrowers = res.CommercialBorrowers.sort((a, b) => a.Order - b.Order);
				}

				borrowersSensitiveFieldsUpdateData = borrowersSensitiveFieldsUpdateData.map(sensitivedata => {
					const borrowerId = borrowers[sensitivedata.Order].Id;
					return { ...sensitivedata, Id: borrowerId };
				});

				return borrowersSensitiveFieldsUpdateData.length
					? forkJoin(this.updateSensitiveData(res.Id, borrowersSensitiveFieldsUpdateData)).pipe(
							map(() => {
								return res;
							})
					  )
					: of(res);
			})
		);
	}

	fetchComments(leadId, offset?) {
		this.commentsOffset = offset !== undefined ? offset : this.commentsOffset;

		const requestUrl = `${this.leadsApiUrl}/${leadId}/Comments?Offset=${this.commentsOffset}&Limit=5`;

		return this.httpClient.get<any>(requestUrl);
	}

	getOpportunityHistory(id: string, period): Observable<OpportunityHistory[]> {
		const encode = (value: string) => value.replace('+', '%2B');
		const requestUrl = `${this.historyUrl}opportunity/${id}?DateFrom=${encode(period.begin)}&DateTo=${encode(
			period.end
		)}`;

		return this.httpClient.get<any>(requestUrl);
	}

	getSensitiveData(opportunityId, borrowerId, field) {
		const requestUrl = `${this.apiUrl}/${opportunityId}/borrower/${borrowerId}/sensitivedata`;
		return this.httpClient.get(requestUrl, { params: { field }, responseType: 'text' });
	}

	updateSensitiveData(opportunityId, data) {
		const requestUrl = `${this.apiUrl}/${opportunityId}/borrower/sensitivedata`;

		return this.httpClient.patch<any>(requestUrl, data);
	}

	public get opportunityComments() {
		return this.opportunityCommentsSub.value;
	}
	public get opportunity() {
		return this.opportunitySub.value;
	}

	public get opportunityCommentsAsObservable() {
		return this.opportunityCommentsSub.asObservable();
	}
	public get opportunityAsObservable() {
		return this.opportunitySub.asObservable();
	}
	public getIsLoadingAsObservable(): Observable<boolean> {
		return this.isLoading.asObservable();
	}

	public setOpportunityCommentsSub(opportunityCommentsSub) {
		this.opportunityCommentsSub.next(opportunityCommentsSub);
	}
	public setOpportunity(opportunity) {
		this.opportunitySub.next(opportunity);
	}
}
