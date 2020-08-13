import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import {
	CRMOpportunities,
	CRMRecordComments,
	LoggerService,
	PermissionsService,
	getErrorMessage,
	CommentsComponent,
	Comment,
} from '@synergy/commonUI';

import { Contact } from '../../models/contacts.model';
import { ContactsService } from '../../services/contacts.service';
import { LeadCommentsService } from '../../../../shared/services/lead-comments.service';

@Component({
	selector: 'app-contacts-details',
	templateUrl: './contacts-details.component.html',
	styleUrls: ['./contacts-details.component.scss'],
})
export class ContactsDetailsComponent implements OnInit, OnDestroy {
	private sub: any;
	isLoading = true;
	selectedContactId: string;
	leadId: string | null = null;

	contactComments = [];

	isLoadingComments = false;
	@ViewChild(CommentsComponent) commentsComponent: CommentsComponent;

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private contactsService: ContactsService,
		public loggerService: LoggerService,
		public leadCommentsService: LeadCommentsService,
		private permissionsService: PermissionsService
	) {}

	ngOnInit() {
		this.isLoading = true;
		this.sub = this.route.params.subscribe(params => {
			this.selectedContactId = params['id'];
		});

		if (this.permissionRecordsCommentsRead) {
			this.contactsService.contactCommentsAsObservable.subscribe(contactComments => {
				this.contactComments = contactComments;
			});
		}
	}

	ngOnDestroy() {
		this.sub.unsubscribe();
	}

	setLeadId(event: string) {
		this.leadId = event;
		if (this.permissionRecordsCommentsRead) {
			this.getComments();
		}
	}

	addComment(commentData) {
		this.isLoadingComments = true;
		this.leadCommentsService.addComment(this.leadId, commentData).subscribe(
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
				this.loggerService.error(getErrorMessage(err));
			}
		);
	}

	saveComment = (comment: Comment) => {
		this.isLoadingComments = true;
		return this.leadCommentsService.saveComment(this.leadId, comment).pipe(
			finalize(() => {
				this.isLoadingComments = false;
			})
		);
	};

	deleteComment = (comment: Comment) => {
		this.isLoadingComments = true;
		return this.leadCommentsService.deleteComment(this.leadId, comment).pipe(
			finalize(() => {
				this.isLoadingComments = false;
			})
		);
	};

	getComments(offset?) {
		this.isLoadingComments = true;
		this.contactsService.fetchComments(this.leadId, offset).subscribe(
			(res: any) => {
				this.contactsService.setContactCommentsSub(res);
				this.isLoadingComments = false;
			},
			err => {
				this.isLoadingComments = false;
				this.loggerService.error(getErrorMessage(err));
			}
		);
	}

	goToContactPage(row: Contact) {
		this.router.navigate(['/contacts', row.Id]);
	}

	get permissionOpportunitiesRead() {
		return this.permissionsService.hasPermission(CRMOpportunities.Read);
	}

	get permissionRecordsCommentsRead() {
		return this.permissionsService.hasPermission(CRMRecordComments.Read);
	}

	get permissionRecordsCommentsWrite() {
		return this.permissionsService.hasPermission(CRMRecordComments.Write);
	}
}
