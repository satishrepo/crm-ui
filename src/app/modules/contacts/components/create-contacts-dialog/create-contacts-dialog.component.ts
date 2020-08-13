import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

import { FastEntity } from '@synergy/commonUI';

import { OpenCreateDialogData } from '../../models/contacts.model';

@Component({
	selector: 'app-create-contacts-dialog',
	templateUrl: './create-contacts-dialog.component.html',
	styleUrls: ['./create-contacts-dialog.component.scss'],
})
export class CreateContactsDialogComponent implements OnInit {
	preselectedLead: FastEntity;
	leadReadOnly: boolean;

	constructor(
		public dialogRef: MatDialogRef<CreateContactsDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: OpenCreateDialogData
	) {}

	ngOnInit() {
		if (this.data) {
			if (this.data.lead) {
				this.preselectedLead = this.data.lead;
			}
			if (this.data.leadReadOnly) {
				this.leadReadOnly = this.data.leadReadOnly;
			}
		}
	}

	closeDialog(event: string) {
		this.dialogRef.close(event);
	}
}
