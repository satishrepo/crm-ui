import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { map, finalize } from 'rxjs/operators';
import { MatDialog } from '@angular/material';

import {
	CRMCampaignComments,
	CRMCampaigns,
	CRMCampaignsDataDump,
	CRMMailMerge,
	FastEntity,
	getErrorMessage,
	LoggerService,
	MailMergeDialogComponent,
	markFormTouched,
	OperationsService,
	PermissionsService,
	scrollToFormError,
	CommentsComponent,
	Comment,
} from '@synergy/commonUI';

import { Campaign, CampaignResolver } from '../../models/campaign.model';
import { CampaignService } from '../../services/campaign.service';
import { CampaignDetailsFormComponent } from '../campaign-details-form/campaign-details-form.component';
import { ExportDataDumpComponent } from '../export-data-dump/export-data-dump.component';

@Component({
	selector: 'app-campaign-details',
	templateUrl: './campaign-details.component.html',
	styleUrls: ['./campaign-details.component.scss'],
})
export class CampaignDetailsComponent implements OnInit {
	@ViewChild(CampaignDetailsFormComponent) formComp: CampaignDetailsFormComponent;
	campaignDetails: Campaign;
	loanDepartmentUsers: any = [];
	users: any = [];
	campaignTypes: FastEntity[];
	editDisable = true;
	campaignComments = [];
	currentCounties: FastEntity[];
	dictionaries: CampaignResolver;
	mailmergeStatus;
	states: FastEntity[];
	generalLandUseCodes: FastEntity[];

	isLoadingComments = false;
	isLoading = true;

	@ViewChild(CommentsComponent) commentsComponent: CommentsComponent;

	constructor(
		private route: ActivatedRoute,
		private campaignService: CampaignService,
		public dialog: MatDialog,
		public loggerService: LoggerService,
		private permissionsService: PermissionsService,
		private operationsService: OperationsService
	) {}

	ngOnInit() {
		this.dictionaries = this.route.parent.snapshot.data['dictionaries'];
		this.initCampaign();
		this.loanDepartmentUsers = this.dictionaries.LoanDepartment.Users;
		this.users = this.dictionaries.Users;
		this.states = this.dictionaries.States;
		this.campaignTypes = this.dictionaries.CampaignTypes;
		this.generalLandUseCodes = this.dictionaries.GeneralLandUseCodes;

		if (this.permissionCampaignCommentsRead) {
			this.campaignService.campaignCommentsAsObservable.subscribe(campComments => {
				this.campaignComments = campComments ? campComments : [];
			});
		}
		this.operationsService.mailmergeOperationsAsObservable.subscribe(operations => {
			this.mailmergeStatus = operations.find(operation => operation.id === this.campaignDetails.Id);
		});
	}

	private initCampaign() {
		this.route.params.pipe(map((param: Params) => param.id)).subscribe((id: string) => {
			this.reloadCampaign(id);
		});
	}

	reloadCampaign(id: string) {
		this.isLoading = true;
		this.campaignService.getItemById(id).subscribe(
			(campaign: Campaign) => {
				this.campaignDetails = campaign;
				this.currentCounties = campaign.Counties;

				if (this.permissionCampaignCommentsRead) {
					this.getComments();
				}

				if (!this.editDisable) {
					this.toggleEditMode();
				}
				this.isLoading = false;
			},
			err => {
				this.isLoading = false;
				this.loggerService.error(getErrorMessage(err));
			}
		);
	}

	reloadRecords(id: string) {
		this.isLoading = true;
		this.campaignService.getItemById(id).subscribe(
			(campaign: Campaign) => {
				this.campaignDetails.TotalRecords = campaign.TotalRecords;
				this.campaignDetails.TotalAmountRecords = campaign.TotalAmountRecords;
				this.isLoading = false;
			},
			err => {
				this.loggerService.error(getErrorMessage(err));
				this.isLoading = false;
			}
		);
	}

	toggleEditMode() {
		this.formComp.toggleEditMode();
		this.editDisable = !this.editDisable;
	}

	cancelEditing() {
		this.toggleEditMode();
	}

	editCampaign() {
		markFormTouched(this.formComp.campaignForm);
		if (this.formComp.campaignForm.invalid) {
			scrollToFormError();
			return;
		}

		const {
			AssignedTo,
			CreateDate,
			Description,
			Name,
			Note,
			Type,
			SubType,
			TargetDate,
			State,
		} = this.formComp.campaignForm.value;

		const { selectedCounties } = this.formComp;

		const campainEditData = {
			Name,
			CreateDate,
			TypeId: Type,
			SubTypeId: SubType,
			TargetDate,
			AssignedToUserId: AssignedTo,
			Note,
			Description,
			CountyIds: selectedCounties.map(county => county.Id),
			StateId: State.Id,
		};

		if (
			!this.compareIdsArrays(this.currentCounties.map((county: FastEntity) => county.Id), campainEditData.CountyIds) ||
			this.campaignDetails.State.Id !== campainEditData.StateId
		) {
			this.loggerService.info(
				'State/Counties were changed. Records will be reselected. It might take a few minutes. Please refresh the page afterwards'
			);
		}

		this.isLoading = true;
		this.campaignService
			.editCampaign(this.campaignDetails.Id, campainEditData)
			.pipe(
				finalize(() => {
					this.toggleEditMode();
					this.isLoading = false;
				})
			)
			.subscribe(() => {
				this.initCampaign();
				this.loggerService.success('Campaign is successfully updated!');
			});
	}

	openDataDumpsDialog() {
		this.dialog.open(ExportDataDumpComponent, {
			disableClose: true,
			autoFocus: false,
			maxWidth: '100%',
			data: {
				campaignId: this.campaignDetails.Id,
				totalRecordsIncluded: this.campaignDetails.TotalRecords,
			},
		});
	}

	openMailMergeDialog() {
		this.dialog
			.open(MailMergeDialogComponent, {
				disableClose: true,
				autoFocus: false,
				maxWidth: '100%',
				width: '650px',
				data: {
					filters: {
						'Filter.CountyIds': this.currentCounties.map((county: FastEntity) => county.Id),
						'Filter.StateId': (this.campaignDetails.State && this.campaignDetails.State.Id) || '',
					},
					uploadCallback: this.onUploadDelinquencies,
				},
			})
			.afterClosed()
			.subscribe(formData => {
				if (formData) {
					this.campaignService.generateMailMerge(formData.Template.Id, formData.FileId);
				}
			});
	}

	private onUploadDelinquencies = () => {
		return this.campaignService.getUploadDelinquenciesInfo(this.campaignDetails.Id);
	};

	addComment(commentData) {
		this.isLoadingComments = true;
		this.campaignService.addComment(this.campaignDetails.Id, commentData).subscribe(
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
		return this.campaignService.saveComment(this.campaignDetails.Id, comment).pipe(
			finalize(() => {
				this.isLoadingComments = false;
			})
		);
	};

	deleteComment = (comment: Comment) => {
		this.isLoadingComments = true;
		return this.campaignService.deleteComment(this.campaignDetails.Id, comment).pipe(
			finalize(() => {
				this.isLoadingComments = false;
			})
		);
	};

	getComments(offset?) {
		this.isLoadingComments = true;
		this.campaignService.fetchComments(this.campaignDetails.Id, offset).subscribe(
			(res: any) => {
				this.campaignService.setCampaignCommentsSub(res);
				this.isLoadingComments = false;
			},
			err => {
				this.isLoadingComments = false;
				this.loggerService.error(err.message);
			}
		);
	}

	compareIdsArrays = (arr1, arr2) => {
		if (arr1.length !== arr2.length) {
			return false;
		}
		const arr1Sorted = arr1.sort();
		const arr2Sorted = arr2.sort();

		return arr1Sorted.map((val, i) => arr2Sorted[i] === val).every(isSame => isSame);
	};

	get permissionCampaignsWrite() {
		return this.permissionsService.hasPermission(CRMCampaigns.Write);
	}

	get permissionCampaignCommentsRead() {
		return this.permissionsService.hasPermission(CRMCampaignComments.Read);
	}

	get permissionCampaignCommentsWrite() {
		return this.permissionsService.hasPermission(CRMCampaignComments.Write);
	}

	get permissionCampaignsDataDumpRead() {
		return this.permissionsService.hasPermission(CRMCampaignsDataDump.Read);
	}

	get permissionMailMergeRead() {
		return this.permissionsService.hasPermission(CRMMailMerge.Read);
	}

	get isMailMergeProcessing() {
		return this.mailmergeStatus && this.mailmergeStatus.statusCode === 202;
	}
	get isMailMergeQueued() {
		return this.mailmergeStatus && this.mailmergeStatus.statusCode === 307;
	}

	get isActionsInProgress() {
		return this.isMailMergeProcessing || this.isMailMergeQueued;
	}
}
