import { Component, OnInit, Inject, ViewChild, AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatPaginator } from '@angular/material';

import { LeadsService } from '../../services/leads.service';

@Component({
	selector: 'app-full-details-dialog',
	templateUrl: './full-details-dialog.component.html',
	styleUrls: ['./full-details-dialog.component.scss'],
})
export class FullDetailsDialogComponent implements OnInit, AfterViewInit {
	@ViewChild(MatPaginator) paginator: MatPaginator;

	displayedColumns: string[] = [];
	totalCount = 0;

	pageSizeOptions: number[] = [5, 10];

	constructor(
		private dialogRef: MatDialogRef<FullDetailsDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private leadsService: LeadsService
	) {}

	ngOnInit() {
		this.data.headerCols.forEach(item => {
			this.displayedColumns = [...this.displayedColumns, item.field];
		});
	}

	ngAfterViewInit() {
		this.getData();
	}

	changePage() {
		this.getData();
	}

	rowClick(row) {
		this.dialogRef.close(row);
	}

	getData() {
		this.data.queryParams = {
			...this.data.queryParams,
			'Filter.LeadIds': [this.data.leadId],
			limit: this.paginator.pageSize,
			offset: this.paginator.pageSize * this.paginator.pageIndex,
		};

		this.data.service.getItems(this.data.queryParams).subscribe(
			res => {
				this.data.list = this.data.filterId ? res.List.filter(el => el.Id !== this.data.filterId) : res.List;
				this.totalCount = this.data.filterId ? res.TotalCount - 1 : res.TotalCount;

				this.data.list = this.data.list.map(opp => {
					const propertiesNumber = opp.Properties ? opp.Properties.length : 0;
					return { ...opp, PropertiesNumber: propertiesNumber };
				});
			},
			err => {
				console.log(err);
			}
		);
	}
}
