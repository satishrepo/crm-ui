import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { Comment } from '@synergy/commonUI';

import { environment } from '../../../environments/environment';

@Injectable({
	providedIn: 'root',
})
export class LeadCommentsService {
	apiUrl = `${environment.crmApi}/api/leads`;

	constructor(private httpClient: HttpClient) {}

	addComment(leadId: string, commentData: Comment): Observable<any> {
		const requestUrl = `${this.apiUrl}/${leadId}/Comments`;

		return this.httpClient.post(requestUrl, JSON.stringify(commentData.Comment), {
			headers: { 'Content-Type': 'application/json' },
		});
	}

	saveComment(leadId: string, comment: Comment): Observable<any> {
		const requestUrl = `${this.apiUrl}/${leadId}/Comments/${comment.Id}`;

		return this.httpClient.put(requestUrl, JSON.stringify(comment.Comment), {
			headers: { 'Content-Type': 'application/json' },
		});
	}

	deleteComment(leadId: string, comment: Comment): Observable<any> {
		const requestUrl = `${this.apiUrl}/${leadId}/Comments/${comment.Id}`;

		return this.httpClient.delete(requestUrl);
	}
}
