import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChange, SimpleChanges } from '@angular/core';

import { DataTableOptions } from '@synergy/commonUI';

import { Contact, ContactDataCell, ContactsApiQueryParams, HeaderCol } from '../../../contacts/models/contacts.model';
import { ContactsService } from '../../../contacts/services/contacts.service';
import { CONTACTS_SEARCH_HEADER_COLS } from '../../../contacts/shared/contacts.constants';
import { parseContactsTableData } from '../../../contacts/shared/contacts-table.utils';

@Component({
	selector: 'app-lead-related-contacts',
	templateUrl: './lead-related-contacts.component.html',
	styleUrls: ['./lead-related-contacts.component.scss'],
})
export class LeadRelatedContactsComponent implements OnInit, OnChanges {
	@Input() leadId: string;
	@Input() selectedContactId: string;
	@Output() rowClick = new EventEmitter();
	extraContact: Contact;

	data: ContactDataCell[] = [];
	isLoading = false;
	error: string;
	contactsTotal = 0;
	dataTableHeaders: HeaderCol[];
	displayedColumns: string[] = [];

	pageOptions = {
		offset: 0,
		limit: 5,
	};

	sortOptions = {
		sortActive: 'Title',
		sortDirection: 'asc',
	};

	searchState: ContactsApiQueryParams;

	constructor(private contactsService: ContactsService) {}

	ngOnInit() {
		this.dataTableHeaders = [...CONTACTS_SEARCH_HEADER_COLS];

		this.displayedColumns = this.dataTableHeaders.map(item => item.field);
	}

	ngOnChanges(changes: SimpleChanges) {
		const leadId: SimpleChange = changes.leadId;

		if (leadId && leadId.currentValue !== leadId.previousValue) {
			this.searchState = {
				offset: 0,
				limit: 5,
				sortField: 'Title',
				sortOrder: 'asc',
				'Filter.LeadIds': [this.leadId],
			};

			this.fetchContacts();
		}
	}

	updateDataTableParams(event: DataTableOptions) {
		const { pageSize, pageIndex, sortActive, sortDirection } = event;

		this.searchState = {
			offset: pageSize * pageIndex,
			limit: pageSize,
			sortField: sortActive,
			sortOrder: sortDirection,
			'Filter.LeadIds': [this.leadId],
		};

		this.fetchContacts();
	}

	fetchContacts() {
		this.isLoading = true;

		const correctedSearchParams = {
			...this.searchState,
			limit: this.selectedContactId ? this.searchState.limit + 1 : this.searchState.limit,
		};

		this.contactsService.getItems(correctedSearchParams).subscribe(
			res => {
				this.contactsTotal = this.selectedContactId ? res.TotalCount - 1 : res.TotalCount;
				let correctedContacts = [];

				if (this.selectedContactId) {
					this.extraContact = undefined;

					const lastPage =
						this.searchState.offset + this.searchState.limit >= this.contactsTotal && this.searchState.offset !== 0;

					res.List.forEach((item, index) => {
						if (
							item.Id === this.selectedContactId ||
							(!lastPage && typeof this.extraContact === 'undefined' && index === this.searchState.limit) ||
							(lastPage && index === 0)
						) {
							if (
								lastPage &&
								item.Id === this.selectedContactId &&
								index !== 0 &&
								typeof this.extraContact !== 'undefined'
							) {
								correctedContacts = [this.extraContact, ...correctedContacts];
							}
							this.extraContact = { ...item };
						} else {
							correctedContacts = [...correctedContacts, item];
						}
					});
				}

				this.data = parseContactsTableData(this.selectedContactId ? correctedContacts : res.List);
				this.isLoading = false;
				this.error = undefined;
			},
			err => {
				this.isLoading = false;
				this.error = err.message;
			}
		);
	}

	rowClickHandler(row: Contact) {
		this.rowClick.emit(row);

		if (this.selectedContactId) {
			this.fetchContacts();
		}
	}
}
