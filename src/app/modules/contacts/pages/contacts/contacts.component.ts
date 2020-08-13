import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { CRMContacts, CRMRecords, PermissionsService } from '@synergy/commonUI';

import { ContactsService } from '../../services/contacts.service';
import { CONTACTS_SEARCH_HEADER_COLS } from '../../shared/contacts.constants';
import { Contact, ContactsApi, HeaderCol } from '../../models/contacts.model';
import { CreateContactsDialogComponent } from '../../components/create-contacts-dialog/create-contacts-dialog.component';
import { MatDialog } from '@angular/material';
import { parseContactsTableData } from '../../shared/contacts-table.utils';

@Component({
	selector: 'app-contacts',
	templateUrl: './contacts.component.html',
	styleUrls: ['./contacts.component.scss'],
})
export class ContactsComponent implements OnInit {
	headerCols: HeaderCol[];
	contacts;
	contactsTotalLength = 0;
	isLoadingContacts = false;

	constructor(
		private contactsService: ContactsService,
		private permissionsService: PermissionsService,
		private router: Router,
		public dialog: MatDialog
	) {}

	ngOnInit() {
		this.headerCols = CONTACTS_SEARCH_HEADER_COLS;
	}

	getContacts(filter) {
		this.isLoadingContacts = true;
		this.contactsService.getItems(filter).subscribe((res: ContactsApi) => {
			this.isLoadingContacts = false;
			this.contacts = parseContactsTableData(res.List);
			this.contactsTotalLength = res.TotalCount;
		});
	}

	selectContact(contact: Contact) {
		this.router.navigate(['/contacts', contact.Id]);
	}

	openCreateDialog(): void {
		this.dialog.open(CreateContactsDialogComponent, {
			height: '80vh',
		});
	}

	get permissionContactsCreate() {
		return (
			this.permissionsService.hasPermission(CRMContacts.Write) && this.permissionsService.hasPermission(CRMRecords.Read)
		);
	}
}
