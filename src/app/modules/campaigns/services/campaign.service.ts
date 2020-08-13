import { saveAs } from 'file-saver';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, Subject, Subscription } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import {
	DumpResult,
	FastEntity,
	fixBackendDates,
	getErrorMessage,
	ItemsService,
	LoggerService,
	Comment,
} from '@synergy/commonUI';

import {
	Campaign,
	CampaignsApiQueryParams,
	CampaignsListReponseData,
	FastEntityListReponseData,
	Rule,
	RuleFieldsResData,
	RuleField,
	RuleFieldLogicType,
	GeneralRule,
} from '../models/campaign.model';
import { environment } from '../../../../environments/environment';

const apiUrl = `${environment.crmApi}/api/campaigns`;

@Injectable({
	providedIn: 'root',
})
export class CampaignService extends ItemsService<CampaignsApiQueryParams, CampaignsListReponseData, Campaign> {
	openSelectRecordsDial: Subject<{}>;
	openSelectRecordsDialSub: Subscription;
	campaignCommentsSub: BehaviorSubject<any>;
	commentsOffset;

	constructor(httpClient: HttpClient, private logger: LoggerService) {
		super(httpClient, apiUrl, environment);
		this.openSelectRecordsDial = new Subject();

		this.campaignCommentsSub = new BehaviorSubject<any>(null);
		this.commentsOffset = 0;
	}

	getItems(queryParams): Observable<CampaignsListReponseData> {
		return super.getItems(queryParams).pipe(
			map(items => {
				items.List = items.List.map(item => {
					return fixBackendDates(item, ['TargetDate']);
				});
				return items;
			})
		);
	}

	getItemById(Id: string): Observable<Campaign> {
		return super.getItemById(Id).pipe(map(event => fixBackendDates(event, ['TargetDate'])));
	}

	getCampaignTypes() {
		const url = `${environment.crmApi}/api/Dictionaries/CampaignTypes`;
		return this.httpClient.get<FastEntityListReponseData>(url);
	}

	editCampaign(id: string, body: any) {
		const url = `${environment.crmApi}/api/Campaigns/${id}`;
		const headers = new HttpHeaders();
		headers.set('Content-Type', 'application/json');
		return this.httpClient.put(url, body, { headers });
	}

	createCampaign(campaignModel) {
		const url = `${environment.crmApi}/api/Campaigns`;
		return this.httpClient.post(url, campaignModel);
	}

	getRuleFields(): Observable<RuleFieldsResData> {
		const url = `${environment.crmApi}/api/Dictionaries/RuleFields`;
		return this.httpClient.get<RuleFieldsResData>(url).pipe(
			map((data: RuleFieldsResData) => {
				data.List.sort((a: RuleField, b: RuleField) => a.Id - b.Id).map((rule: RuleField) => {
					rule.LogicTypes.sort((a: RuleFieldLogicType, b: RuleFieldLogicType) => a.Id - b.Id);
					return rule;
				});
				return data;
			})
		);
	}

	assignRulesWithCampaign(campaignId: string, rules: Rule[]) {
		const rulesIds = rules.filter(rule => rule.IsAttached).map(rule => rule.Id);

		const url = `${environment.crmApi}/api/Campaigns/${campaignId}/Rules`;
		return this.httpClient.put(url, rulesIds);
	}

	getAssignedRules(campaignId: string) {
		const url = `${environment.crmApi}/api/Campaigns/${campaignId}/Rules`;
		return this.httpClient.get<{
			TotalCount: number;
			List: Rule[];
		}>(url);
	}

	createRule(rule: GeneralRule) {
		const url = `${environment.crmApi}/api/Campaigns/Rules`;
		return this.httpClient.post(url, rule);
	}

	getDumpFields(context: string, id: string) {
		const url = `${environment.crmApi}/api/Campaigns/${id}/dump/${context}/fields`;
		return this.httpClient.get<string[]>(url);
	}
	getGeneralLandUseCodes(): Observable<FastEntity[]> {
		const url = `${environment.crmApi}/api/Dictionaries/GeneralLandUseCodes`;
		return this.httpClient
			.get<FastEntityListReponseData>(url)
			.pipe(map((data: FastEntityListReponseData) => data.List));
	}

	exportDataDump(id: string, context: string, model: any) {
		const url = `${environment.crmApi}/api/Campaigns/${id}/dump/${context}`;
		return this.httpClient.post(url, model, { responseType: 'text' });
	}

	getDataDumpUrl(id: string, key: string) {
		const url = `${environment.crmApi}/api/Campaigns/${id}/dump/${key}`;
		return this.httpClient.get(url);
	}

	fetchComments(campaignId, offset?) {
		this.commentsOffset = offset !== undefined ? offset : this.commentsOffset;

		const requestUrl = `${this.apiUrl}/${campaignId}/Comments?Offset=${this.commentsOffset}&Limit=5`;

		return this.httpClient.get<any>(requestUrl);
	}

	addComment(CampaignId, commentData: Comment) {
		const requestUrl = `${this.apiUrl}/${CampaignId}/comments`;

		return this.httpClient.post(requestUrl, JSON.stringify(commentData.Comment), {
			headers: { 'Content-Type': 'application/json' },
		});
	}

	saveComment(CampaignId: string, comment: Comment): Observable<any> {
		const requestUrl = `${this.apiUrl}/${CampaignId}/Comments/${comment.Id}`;

		return this.httpClient.put(requestUrl, JSON.stringify(comment.Comment), {
			headers: { 'Content-Type': 'application/json' },
		});
	}

	deleteComment(CampaignId: string, comment: Comment): Observable<any> {
		const requestUrl = `${this.apiUrl}/${CampaignId}/Comments/${comment.Id}`;

		return this.httpClient.delete(requestUrl);
	}

	public get campaignComments() {
		return this.campaignCommentsSub.value;
	}
	public get campaignCommentsAsObservable() {
		return this.campaignCommentsSub.asObservable();
	}
	public setCampaignCommentsSub(campaignCommentsSub) {
		this.campaignCommentsSub.next(campaignCommentsSub);
	}

	getUploadDelinquenciesInfo(campaignId: string): Observable<any> {
		return this.httpClient.get(`${environment.crmApi}/api/mailmerge/properties`, { params: { campaignId } });
	}

	generateMailMerge(templateId: string, fileId: string) {
		let filename: string;

		this.httpClient
			.post(`${environment.crmApi}/api/Mailmerge/${templateId}`, null, {
				params: { propertyFileId: fileId },
				responseType: 'text',
			})
			.pipe(
				switchMap(resFileId => this.httpClient.get(`${environment.crmApi}/api/Mailmerge/${resFileId}`)),
				switchMap((data: DumpResult) => {
					filename = data.Path.replace(/^.*[\\\/]/, '');
					return this.httpClient.get(data.Url, { responseType: 'blob' });
				})
			)
			.subscribe(
				(response: Blob) => {
					saveAs(response, filename || `MailMerge.zip`);
				},
				err => {
					console.log(err);
					this.logger.error(getErrorMessage(err));
				}
			);
	}
}
