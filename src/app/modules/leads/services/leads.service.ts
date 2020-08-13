import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, BehaviorSubject } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ItemsService, getErrorMessage, LoggerService } from '@synergy/commonUI';

import { LeadsApi, LeadsApiQueryParams, Lead } from '../models/lead.model';
import { parseContactsTableData } from '../../contacts/shared/contacts-table.utils';
import { environment } from '../../../../environments/environment';

@Injectable({
	providedIn: 'root',
})
export class LeadsService extends ItemsService<LeadsApiQueryParams, LeadsApi, Lead> {
	currentLeadSub: BehaviorSubject<Lead>;
	contactsTableDataSub: BehaviorSubject<any>;
	leadCommentsSub: BehaviorSubject<any>;

	commentsOffset;
	loggerService;

	constructor(httpClient: HttpClient, loggerService: LoggerService) {
		const apiUrl = `${environment.crmApi}/api/leads`;
		super(httpClient, apiUrl, environment);

		this.currentLeadSub = new BehaviorSubject<Lead>(null);
		this.contactsTableDataSub = new BehaviorSubject<any>(null);
		this.leadCommentsSub = new BehaviorSubject<any>(null);
		this.commentsOffset = 0;

		this.loggerService = loggerService;
	}

	fetchLead(id: string) {
		return this.getItemById(id)
			.pipe(
				catchError(err => {
					this.loggerService.error(getErrorMessage(err));
					return of({});
				})
			)
			.subscribe((res: Lead) => {
				this.setCurrentLead(res);
				if (res && res.Contacts) {
					const parsedContactData = parseContactsTableData(res.Contacts);
					this.setContactsTableData(parsedContactData);
				}
			});
	}

	fetchComments(offset?) {
		const LeadId = this.currentLead.Id;
		this.commentsOffset = offset !== undefined ? offset : this.commentsOffset;

		const requestUrl = `${this.apiUrl}/${LeadId}/Comments?Offset=${this.commentsOffset}&Limit=5`;

		return this.httpClient.get<any>(requestUrl);
	}

	public get currentLead() {
		return this.currentLeadSub.value;
	}
	public get contactsTableData() {
		return this.contactsTableDataSub.value;
	}
	public get leadComments() {
		return this.leadCommentsSub.value;
	}

	public get currentLeadAsObservable() {
		return this.currentLeadSub.asObservable();
	}
	public get contactsTableDataAsObservable() {
		return this.contactsTableDataSub.asObservable();
	}
	public get leadCommentsAsObservable() {
		return this.leadCommentsSub.asObservable();
	}

	public setCurrentLead(lead) {
		this.currentLeadSub.next(lead);
	}
	public setContactsTableData(contactsTableData) {
		this.contactsTableDataSub.next(contactsTableData);
	}
	public setLeadCommentsSub(leadCommentsSub) {
		this.leadCommentsSub.next(leadCommentsSub);
	}
}
