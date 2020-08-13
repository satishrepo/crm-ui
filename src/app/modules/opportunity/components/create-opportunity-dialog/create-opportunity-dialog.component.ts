import { Component, OnInit, Optional, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
	selector: 'app-create-opportunity-dialog',
	templateUrl: './create-opportunity-dialog.component.html',
	styleUrls: ['./create-opportunity-dialog.component.scss'],
})
export class CreateOpportunityDialogComponent implements OnInit {
	constructor(
		public dialogRef: MatDialogRef<CreateOpportunityDialogComponent>,
		@Optional() @Inject(MAT_DIALOG_DATA) public data: any
	) {}

	ngOnInit() {}

	closeDialog() {
		this.dialogRef.close();
	}
}
