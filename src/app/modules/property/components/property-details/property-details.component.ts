import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { finalize } from 'rxjs/operators';

import {
	CRMCampaigns,
	CRMOpportunities,
	CRMRecordComments,
	LoggerService,
	PermissionsService,
	CommentsComponent,
	Comment,
} from '@synergy/commonUI';

import { Property, PropertyDictionaries } from '../../models/property.model';
import { PropertyService } from '../../services/property.service';
import { LeadCommentsService } from '../../../../shared/services/lead-comments.service';

@Component({
	selector: 'app-property-details',
	templateUrl: './property-details.component.html',
	styleUrls: ['./property-details.component.scss'],
})
export class PropertyDetailsComponent implements OnInit, OnDestroy {
	private sub: any;
	property: Property;
	propertyComments = [];
	isLoadingComments = false;
	@ViewChild(CommentsComponent) commentsComponent: CommentsComponent;
	dictionaries: PropertyDictionaries;

	constructor(
		private route: ActivatedRoute,
		private propertyService: PropertyService,
		private loggerService: LoggerService,
		public leadCommentsService: LeadCommentsService,
		public snackBar: MatSnackBar,
		private permissionsService: PermissionsService
	) {}

	ngOnInit() {
		this.dictionaries = this.route.snapshot.data['dictionaries'];

		this.sub = this.route.params.subscribe(params => {
			this.propertyService.fetchProperty(params['id']);
		});

		this.initServiceSubscriptions();
	}

	initServiceSubscriptions() {
		this.propertyService.currentPropertyAsObservable.subscribe(property => {
			this.property = this.parsePropertyData(property);
			if (this.permissionRecordsCommentsRead && property && property.Id) {
				this.getComments();
			}
		});

		this.propertyService.propertyCommentsAsObservable.subscribe(propertyComments => {
			this.propertyComments = propertyComments;
		});
	}

	ngOnDestroy() {
		this.sub.unsubscribe();
	}

	addComment(commentData) {
		this.isLoadingComments = true;
		this.leadCommentsService.addComment('' + this.property.Lead.Id, commentData).subscribe(
			() => {
				this.getComments(0);
				if (this.commentsComponent.paginator && this.commentsComponent.paginator.pageIndex !== 0) {
					this.commentsComponent.paginator.pageIndex = 0;
				}
				this.commentsComponent.newCommentValue = '';
				this.isLoadingComments = false;
			},
			err => {
				this.isLoadingComments = false;
				this.loggerService.error(err.message);
			}
		);
	}

	saveComment = (comment: Comment) => {
		this.isLoadingComments = true;
		return this.leadCommentsService.saveComment('' + this.property.Lead.Id, comment).pipe(
			finalize(() => {
				this.isLoadingComments = false;
			})
		);
	};

	deleteComment = (comment: Comment) => {
		this.isLoadingComments = true;
		return this.leadCommentsService.deleteComment('' + this.property.Lead.Id, comment).pipe(
			finalize(() => {
				this.isLoadingComments = false;
			})
		);
	};

	getComments(offset?) {
		this.isLoadingComments = true;
		this.propertyService.fetchComments(offset).subscribe(
			(res: any) => {
				this.propertyService.setPropertyCommentsSub(res);
				this.isLoadingComments = false;
			},
			err => {
				this.isLoadingComments = false;
				this.loggerService.error(err.message);
			}
		);
	}

	parsePropertyData(property: Property) {
		let TaxDelinquenciesList = [];

		if (!property) {
			return null;
		}

		if (property.TaxDelinquencies.length) {
			const TaxDelinquenciesLists = property.TaxDelinquencies.map(tdByYear => {
				return tdByYear.CollectingEntities.map(collectingEntity => {
					return {
						Year: tdByYear.Year,
						CollectingEntity: this.getCollectingEntityType(collectingEntity.CollectingEntityTypeId),
						AmountDue: collectingEntity.AmountDue,
					};
				});
			});
			TaxDelinquenciesList = [].concat(...TaxDelinquenciesLists);
		}

		return {
			...property,
			TaxDelinquenciesList,
		};
	}

	getCollectingEntityType(id: number) {
		if (!id) {
			return null;
		}

		return this.dictionaries.CollectingEntityTypes.find(item => item.Id === id);
	}

	get permissionRecordsCommentsRead() {
		return this.permissionsService.hasPermission(CRMRecordComments.Read);
	}

	get permissionRecordsCommentsWrite() {
		return this.permissionsService.hasPermission(CRMRecordComments.Write);
	}

	get permissionOpportunitiesRead() {
		return this.permissionsService.hasPermission(CRMOpportunities.Read);
	}

	get permissionCampaignsRead() {
		return this.permissionsService.hasPermission(CRMCampaigns.Read);
	}
}
