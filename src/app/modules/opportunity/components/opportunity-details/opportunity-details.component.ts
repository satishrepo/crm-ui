import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material';
import { finalize } from 'rxjs/operators';

import {
	CRMCampaigns,
	CRMContacts,
	CRMOpportunities,
	CRMProperties,
	CRMRecordComments,
	LoggerService,
	PermissionsService,
	CommentsComponent,
	Comment,
} from '@synergy/commonUI';

import { CreateContactsDialogComponent } from '../../../contacts/components/create-contacts-dialog/create-contacts-dialog.component';
import { Opportunity } from '../../models/opportunity.model';
import { Contact, ContactDataCell, ParsedContact } from '../../../contacts/models/contacts.model';
import { OpportunitiesService } from '../../services/opportunities.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { OpportunityDetailsFormComponent } from '../opportunity-details-form/opportunity-details-form.component';
import { LeadRelatedContactsComponent } from '../../../leads/containers/lead-related-contacts/lead-related-contacts.component';
import { LeadCommentsService } from '../../../../shared/services/lead-comments.service';

@Component({
	selector: 'app-opportunity-details',
	templateUrl: './opportunity-details.component.html',
	styleUrls: ['./opportunity-details.component.scss'],
})
export class OpportunityDetailsComponent implements OnInit, OnDestroy {
	private sub: any;
	isLoading: boolean;
	selectedOpportunityId: string;
	opportunity: Opportunity | null = null;
	isLoadingContact = false;
	primaryContact: ParsedContact | null = null;
	dictionaries = [];

	opportunityComments = [];

	@ViewChild(OpportunityDetailsFormComponent) opportunityForm: OpportunityDetailsFormComponent;

	isLoadingComments = false;
	@ViewChild(CommentsComponent) commentsComponent: CommentsComponent;
	@ViewChild(LeadRelatedContactsComponent) relatedContactsComponent: LeadRelatedContactsComponent;

	constructor(
		private route: ActivatedRoute,
		public dialog: MatDialog,
		private opportunityService: OpportunitiesService,
		private loggerService: LoggerService,
		public leadCommentsService: LeadCommentsService,
		private permissionsService: PermissionsService
	) {}

	ngOnInit() {
		this.sub = this.route.params.subscribe(params => {
			this.selectedOpportunityId = params['id'];

			if (params['id']) {
				this.opportunityService.fetchOpportunity(params['id']);
			}
		});

		if (this.permissionRecordsCommentsRead) {
			this.opportunityService.opportunityCommentsAsObservable.subscribe(oppComments => {
				this.opportunityComments = oppComments;
			});
		}

		this.opportunityService.opportunityAsObservable.subscribe(opportunity => {
			if (opportunity) {
				this.opportunity = opportunity;
				this.primaryContact = opportunity.Contact ? this.parsePrimaryContact(opportunity.Contact) : null;

				if (this.permissionRecordsCommentsRead) {
					this.getComments();
				}
			}
		});

		this.dictionaries = this.route.parent.snapshot.data['dictionaries'];
	}

	ngOnDestroy() {
		this.sub.unsubscribe();
	}

	ngOnChange() {
		this.sub.unsubscribe();
	}

	parsePrimaryContact(contact: Contact) {
		if (contact) {
			return {
				...contact,
				Type: contact.Type ? contact.Type.Name : '',
				Lead: contact.Lead ? contact.Lead.Name : '',
				Address: {
					...contact.Address,
					State: contact.Address && contact.Address.State ? contact.Address.State.Name : '',
				},
			};
		}
	}

	private prepareOpportunity(ContactId) {
		return {
			...Object.assign({}, this.opportunity, { CampaignId: undefined }), //TODO: temporary removed CampaignId to fix put
			LoanType: this.opportunity.LoanType && this.opportunity.LoanType.Id,
			Stage: this.opportunity.Stage && this.opportunity.Stage.Id,
			LeadId: this.opportunity.Lead && this.opportunity.Lead.Id,
			ContactId,
			UserId: this.opportunity.LoanOfficer.Id,
			PropertyIds: this.opportunity.Properties.map(prop => prop.Id),
		};
	}

	markContactAsPrimary(event: ContactDataCell) {
		const opportunity = this.prepareOpportunity(event.Id);

		const dialogRef = this.dialog.open(ConfirmDialogComponent, {
			data: {
				message: 'Do you want to mark this contact as primary?',
			},
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.isLoadingContact = true;

				this.opportunityService
					.updateOpportunity(
						this.selectedOpportunityId,
						{
							...opportunity,
							UserId: opportunity.LoanOfficer.Id,
							PropertyIds: opportunity.Properties.map(prop => prop.Id),
						},
						null
					)
					.subscribe(
						() => {
							this.isLoadingContact = false;
						},
						err => {
							this.isLoadingContact = false;
							this.loggerService.error(err.message);
						}
					);

				this.primaryContact = event;

				this.opportunityService.setOpportunity({
					...this.opportunity,
					Contact: {
						...event,
					},
				});
			}
		});
	}

	createContact(): void {
		const dialogRef = this.dialog.open(CreateContactsDialogComponent, {
			height: '80vh',
			autoFocus: false,
			disableClose: true,
			data: {
				lead: this.opportunity.Lead,
				leadReadOnly: true,
				result: 'markContactAsPrimary',
			},
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				const opportunity = this.prepareOpportunity(result.Id);

				this.isLoading = true;
				this.relatedContactsComponent.fetchContacts();

				this.opportunityService.updateOpportunity(this.selectedOpportunityId, opportunity, null).subscribe(
					() => {
						this.primaryContact = this.parsePrimaryContact(result);
						this.isLoading = false;

						this.opportunityService.setOpportunity({
							...this.opportunity,
							Contact: {
								...result,
							},
						});
					},
					err => {
						this.isLoading = false;
						this.loggerService.error(err.message);
					}
				);
			}
		});
	}

	addComment(commentData) {
		this.isLoadingComments = true;
		this.leadCommentsService.addComment(this.opportunity.Lead.Id, commentData).subscribe(
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
		return this.leadCommentsService.saveComment(this.opportunity.Lead.Id, comment).pipe(
			finalize(() => {
				this.isLoadingComments = false;
			})
		);
	};

	deleteComment = (comment: Comment) => {
		this.isLoadingComments = true;
		return this.leadCommentsService.deleteComment(this.opportunity.Lead.Id, comment).pipe(
			finalize(() => {
				this.isLoadingComments = false;
			})
		);
	};

	getComments(offset?) {
		this.isLoadingComments = true;
		this.opportunityService.fetchComments(this.opportunity.Lead.Id, offset).subscribe(
			(res: any) => {
				this.opportunityService.setOpportunityCommentsSub(res);
				this.isLoadingComments = false;
			},
			err => {
				this.isLoadingComments = false;
				this.loggerService.error(err.message);
			}
		);
	}
	get permissionOpportunitiesWrite() {
		return this.permissionsService.hasPermission(CRMOpportunities.Write);
	}

	get permissionContactsRead() {
		return this.permissionsService.hasPermission(CRMContacts.Read);
	}
	get permissionContactsWrite() {
		return this.permissionsService.hasPermission(CRMContacts.Write);
	}

	get permissionPropertiesRead() {
		return this.permissionsService.hasPermission(CRMProperties.Read);
	}

	get permissionCampaignsRead() {
		return this.permissionsService.hasPermission(CRMCampaigns.Read);
	}

	get permissionRecordsCommentsRead() {
		return this.permissionsService.hasPermission(CRMRecordComments.Read);
	}

	get permissionRecordsCommentsWrite() {
		return this.permissionsService.hasPermission(CRMRecordComments.Write);
	}
}
