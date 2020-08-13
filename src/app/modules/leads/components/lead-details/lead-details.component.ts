import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import {
	CRMCampaigns,
	CRMContacts,
	CRMOpportunities,
	CRMProperties,
	CRMRecordComments,
	LoggerService,
	PermissionsService,
} from '@synergy/commonUI';

import { Lead } from '../../models/lead.model';
import { LeadsService } from '../../services/leads.service';
import { CONTACTS_SEARCH_HEADER_COLS } from '../../../contacts/shared/contacts.constants';
import { parseSingleLeadAsFastEntity } from '../../../contacts/shared/contacts-form.utils';
import { LeadCommentsService } from '../../../../shared/services/lead-comments.service';
import { Contact, ContactDataCell, HeaderCol } from '../../../contacts/models/contacts.model';
import { CommentsComponent, Comment } from '@synergy/commonUI';
import { LeadRelatedContactsComponent } from '../../containers/lead-related-contacts/lead-related-contacts.component';
import { LeadPropertiesDetailsComponent } from '../lead-properties-details/lead-properties-details.component';
import { LeadOpportunitiesDetailsComponent } from '../lead-opportunities-details/lead-opportunities-details.component';
import { LeadCampaignsDetailsComponent } from '../lead-campaigns-details/lead-campaigns-details.component';
import { CreateContactsDialogComponent } from '../../../contacts/components/create-contacts-dialog/create-contacts-dialog.component';
import { CreateOpportunityDialogComponent } from '../../../opportunity/components/create-opportunity-dialog/create-opportunity-dialog.component';

@Component({
	selector: 'app-lead-details',
	templateUrl: './lead-details.component.html',
	styleUrls: ['./lead-details.component.scss'],
})
export class LeadDetailsComponent implements OnInit, OnDestroy {
	@ViewChild(LeadRelatedContactsComponent) leadRelatedContactsComponent: LeadRelatedContactsComponent;
	@ViewChild(LeadPropertiesDetailsComponent) leadRelatedPropertiesComponent: LeadPropertiesDetailsComponent;
	@ViewChild(LeadOpportunitiesDetailsComponent) leadRelatedOppsComponent: LeadOpportunitiesDetailsComponent;
	@ViewChild(LeadCampaignsDetailsComponent) leadRelatedCampaignsComponent: LeadCampaignsDetailsComponent;
	sub: any;
	lead: Lead;
	leadComments = [];
	contactsHeaderCols: HeaderCol[];
	contactsTableData: ContactDataCell[];
	leadId: string;

	dictionaries = {};

	isLoadingComments = false;
	@ViewChild(CommentsComponent) commentsComponent: CommentsComponent;

	constructor(
		private leadService: LeadsService,
		private route: ActivatedRoute,
		private router: Router,
		public snackBar: MatSnackBar,
		public dialog: MatDialog,
		public logerService: LoggerService,
		public leadCommentsService: LeadCommentsService,
		private permissionsService: PermissionsService
	) {}

	ngOnInit() {
		this.sub = this.route.params.subscribe(params => {
			this.leadId = params['id'];
			this.leadService.fetchLead(this.leadId);
		});
		this.dictionaries = this.route.parent.snapshot.data.dictionaries;

		this.initSubscriptions();

		this.contactsHeaderCols = CONTACTS_SEARCH_HEADER_COLS;
	}

	initSubscriptions() {
		this.leadService.currentLeadAsObservable.subscribe(lead => {
			this.lead = lead;
			if (this.permissionRecordsCommentsRead && lead && lead.Id) {
				this.getComments();
			}
		});
		if (this.permissionContactsRead) {
			this.leadService.contactsTableDataAsObservable.subscribe(contactsTableData => {
				this.contactsTableData = contactsTableData;
			});
		}
		if (this.permissionRecordsCommentsRead) {
			this.leadService.leadCommentsAsObservable.subscribe(leadComments => {
				this.leadComments = leadComments;
			});
		}
	}

	createOpportunityWithRecord() {
		this.dialog
			.open(CreateOpportunityDialogComponent, {
				autoFocus: false,
				height: '80vh',
				disableClose: true,
				data: {
					dictionaries: this.dictionaries,
					Lead: { Id: this.lead.Id, Name: this.lead.AccountName },
				},
			})
			.afterClosed()
			.subscribe(() => {
				this.leadService.fetchLead(this.leadId);
				this.leadRelatedPropertiesComponent.getProperties();
				this.leadRelatedOppsComponent.getOpportunities();
				this.leadRelatedCampaignsComponent.getCampaigns();
			});
	}

	createContact(): void {
		const dialogRef = this.dialog.open(CreateContactsDialogComponent, {
			height: '80vh',
			autoFocus: false,
			data: {
				lead: parseSingleLeadAsFastEntity(this.lead),
			},
		});

		dialogRef.afterClosed().subscribe(res => {
			if (res) {
				this.leadService.fetchLead(this.lead.Id);
				this.leadRelatedContactsComponent.fetchContacts();
			}
		});
	}

	addComment(commentData) {
		this.isLoadingComments = true;
		this.leadCommentsService.addComment(this.leadService.currentLead.Id, commentData).subscribe(
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
				this.logerService.error(err.message);
			}
		);
	}

	saveComment = (comment: Comment) => {
		this.isLoadingComments = true;
		return this.leadCommentsService.saveComment(this.leadService.currentLead.Id, comment).pipe(
			finalize(() => {
				this.isLoadingComments = false;
			})
		);
	};

	deleteComment = (comment: Comment) => {
		this.isLoadingComments = true;
		return this.leadCommentsService.deleteComment(this.leadService.currentLead.Id, comment).pipe(
			finalize(() => {
				this.isLoadingComments = false;
			})
		);
	};

	getComments(offset?) {
		this.isLoadingComments = true;
		this.leadService.fetchComments(offset).subscribe(
			(res: any) => {
				this.leadService.setLeadCommentsSub(res);
				this.isLoadingComments = false;
			},
			err => {
				this.isLoadingComments = false;
				this.logerService.error(err.message);
			}
		);
	}

	goToContactPage(row: Contact) {
		this.router.navigate(['/contacts', row.Id]);
	}

	ngOnDestroy() {
		this.sub.unsubscribe();
	}

	get permissionRecordsCommentsRead() {
		return this.permissionsService.hasPermission(CRMRecordComments.Read);
	}

	get permissionRecordsCommentsWrite() {
		return this.permissionsService.hasPermission(CRMRecordComments.Write);
	}

	get permissionContactsRead() {
		return this.permissionsService.hasPermission(CRMContacts.Read);
	}
	get permissionContactsWrite() {
		return this.permissionsService.hasPermission(CRMContacts.Write);
	}

	get permissionOpportunitiesRead() {
		return this.permissionsService.hasPermission(CRMOpportunities.Read);
	}

	get permissionCampaignsRead() {
		return this.permissionsService.hasPermission(CRMCampaigns.Read);
	}
	get permissionPropertiesRead() {
		return this.permissionsService.hasPermission(CRMProperties.Read);
	}

	get permissionOpportunitiesCreate() {
		return (
			this.permissionsService.hasPermission(CRMOpportunities.Write) &&
			this.permissionsService.hasPermission(CRMProperties.Read) &&
			this.permissionsService.hasPermission(CRMContacts.Read)
		);
	}
}
