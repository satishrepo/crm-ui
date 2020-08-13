import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material';
import { BehaviorSubject } from 'rxjs';

import { ItemsService } from '@synergy/commonUI';

import { Contact, ContactsApi, ContactsApiQueryParams } from '../models/contacts.model';
import { environment } from '../../../../environments/environment';

@Injectable({
	providedIn: 'root',
})
export class ContactsService extends ItemsService<ContactsApiQueryParams, ContactsApi, Contact> {
	contactCommentsSub: BehaviorSubject<any>;
	commentsOffset;
	snackBar;
	leadsApiUrl;

	constructor(httpClient: HttpClient, snackBar: MatSnackBar) {
		const apiUrl = `${environment.crmApi}/api/Contacts`;

		super(httpClient, apiUrl, environment);

		this.contactCommentsSub = new BehaviorSubject<any>(null);
		this.snackBar = snackBar;
		this.leadsApiUrl = `${environment.crmApi}/api/leads`;
		this.commentsOffset = 0;
	}

	updateContacts(id: string, contact: Contact) {
		return this.httpClient.put<Contact>(`${this.apiUrl}/${id}`, contact);
	}

	createContacts(contact: Contact) {
		return this.httpClient.post<Contact>(`${this.apiUrl}`, contact);
	}

	fetchComments(leadId, offset?) {
		this.commentsOffset = offset !== undefined ? offset : this.commentsOffset;

		const requestUrl = `${this.leadsApiUrl}/${leadId}/Comments?Offset=${this.commentsOffset}&Limit=5`;

		return this.httpClient.get<any>(requestUrl);
	}

	public get contactComments() {
		return this.contactCommentsSub.value;
	}
	public get contactCommentsAsObservable() {
		return this.contactCommentsSub.asObservable();
	}
	public setContactCommentsSub(contactCommentsSub) {
		this.contactCommentsSub.next(contactCommentsSub);
	}
}
