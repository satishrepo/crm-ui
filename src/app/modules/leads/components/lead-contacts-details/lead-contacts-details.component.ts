import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ContactDataCell, ContactsApiQueryParams, HeaderCol } from '../../../contacts/models/contacts.model';
import { ContactsService } from '../../../contacts/services/contacts.service';
import { MatDialog } from '@angular/material';
import { CONTACTS_SEARCH_HEADER_COLS } from '../../../contacts/shared/contacts.constants';
import { FullDetailsDialogComponent } from '../full-details-dialog/full-details-dialog.component';
import { parseContactsTableData } from '../../../contacts/shared/contacts-table.utils';

@Component({
	selector: 'app-lead-contacts-details',
	templateUrl: './lead-contacts-details.component.html',
	styleUrls: ['./lead-contacts-details.component.scss'],
})
export class LeadContactsDetailsComponent implements OnInit, OnChanges {
	@Input() leadId: string;

	data: ContactDataCell[] = [];
	isLoading = false;
	contactsTotal = 0;
	headerCols: HeaderCol[];
	displayedColumns: string[] = [];
	contactsQueryParams: ContactsApiQueryParams = {
		'Filter.LeadIds': [this.leadId],
		limit: 2,
		offset: 0,
		sortField: 'Title',
		sortOrder: 'desc',
	};

	constructor(private contactsService: ContactsService, public detailsDialog: MatDialog) {}

	ngOnInit() {
		this.headerCols = CONTACTS_SEARCH_HEADER_COLS;
		this.displayedColumns = this.headerCols.map(item => item.field);
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes.leadId.currentValue !== changes.leadId.previousValue) {
			this.getContacts();
		}
	}

	getContacts() {
		const contactsQueryParams: ContactsApiQueryParams = {
			...this.contactsQueryParams,
			'Filter.LeadIds': [this.leadId],
		};

		this.isLoading = true;

		this.contactsService.getItems(contactsQueryParams).subscribe(
			res => {
				this.data = parseContactsTableData(res.List);
				this.contactsTotal = res.TotalCount;
				this.isLoading = false;
			},
			() => {
				this.isLoading = false;
			}
		);
	}

	openFullDetailsDialog(): void {
		this.detailsDialog.open(FullDetailsDialogComponent, {
			data: {
				leadId: [this.leadId],
				headerCols: CONTACTS_SEARCH_HEADER_COLS,
				title: 'Related Contacts',
				service: this.contactsService,
				queryParams: this.contactsService,
			},
			width: '800px',
		});
	}
}
