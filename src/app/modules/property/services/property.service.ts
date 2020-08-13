import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ItemsService, getErrorMessage, LoggerService } from '@synergy/commonUI';

import { PropertiesApi, PropertiesApiQueryParams, Property } from '../models/property.model';
import { environment } from '../../../../environments/environment';

@Injectable({
	providedIn: 'root',
})
export class PropertyService extends ItemsService<PropertiesApiQueryParams, PropertiesApi, Property> {
	currentPropertySub: BehaviorSubject<Property>;
	propertyCommentsSub: BehaviorSubject<any>;
	leadsApiUrl;

	commentsOffset;
	loggerService;

	constructor(httpClient: HttpClient, loggerService: LoggerService) {
		const apiUrl = `${environment.crmApi}/api/properties`;
		super(httpClient, apiUrl, environment);

		this.currentPropertySub = new BehaviorSubject<Property>(null);
		this.propertyCommentsSub = new BehaviorSubject<any>(null);
		this.commentsOffset = 0;
		this.leadsApiUrl = `${environment.crmApi}/api/leads`;

		this.loggerService = loggerService;
	}

	fetchProperty(id: string) {
		return this.getItemById(id)
			.pipe(
				catchError(err => {
					this.loggerService.error(getErrorMessage(err));
					return of({});
				})
			)
			.subscribe((res: Property) => {
				if (res) {
					res.TaxDelinquencies.sort((taxD1: any, taxD2: any) => {
						return taxD2.Year - taxD1.Year;
					});

					res.Valuations.sort((v1: any, v2: any) => {
						return v2.Year - v1.Year;
					});

					this.setCurrentProperty(res);
				}
			});
	}

	fetchComments(offset?) {
		const LeadId = this.currentProperty.Lead.Id;
		this.commentsOffset = offset !== undefined ? offset : this.commentsOffset;

		const requestUrl = `${this.leadsApiUrl}/${LeadId}/Comments?Offset=${this.commentsOffset}&Limit=5`;

		return this.httpClient.get<any>(requestUrl);
	}

	public get currentProperty() {
		return this.currentPropertySub.value;
	}
	public get propertyComments() {
		return this.propertyCommentsSub.value;
	}

	public get currentPropertyAsObservable() {
		return this.currentPropertySub.asObservable();
	}
	public get propertyCommentsAsObservable() {
		return this.propertyCommentsSub.asObservable();
	}

	public setCurrentProperty(property) {
		this.currentPropertySub.next(property);
	}
	public setPropertyCommentsSub(propertyCommentsSub) {
		this.propertyCommentsSub.next(propertyCommentsSub);
	}
}
