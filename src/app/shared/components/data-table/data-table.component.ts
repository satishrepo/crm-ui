import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';
import { HeaderCol } from '../../../modules/contacts/models/contacts.model';
import { merge } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { MaskPhoneFormat } from '@synergy/commonUI';

@Component({
	selector: 'app-crm-data-table',
	templateUrl: './data-table.component.html',
	styleUrls: ['./data-table.component.scss'],
})
export class CRMDataTableComponent implements OnInit, AfterViewInit {
	@Input() headerCols: HeaderCol[];
	@Input() dataSource;
	@Input() totalCount;

	@Input() pageOptions;
	@Input() sortOptions;
	@Input() loadOnInit = true;

	@Output() rowClick = new EventEmitter();
	@Output() fetchData = new EventEmitter();

	availablePageSizes = [5, 10, 15];
	displayedColumns: string[] = [];

	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;

	isLoading = false;

	phoneMask = MaskPhoneFormat;

	constructor() {}

	ngOnInit() {
		this.displayedColumns = this.headerCols.map(item => item.field);
	}

	ngAfterViewInit() {
		this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

		merge(this.sort.sortChange, this.paginator.page)
			.pipe(startWith(this.loadOnInit && this.tableOptions))
			.subscribe(res => {
				if (res) {
					this.fetchData.emit(this.tableOptions);
				}
			});
	}

	get tableOptions() {
		return {
			pageSize: this.paginator.pageSize,
			pageIndex: this.paginator.pageIndex,
			sortActive: this.sort.active,
			sortDirection: this.sort.direction,
		};
	}

	onRowClickHandler(row) {
		this.rowClick.emit(row);
	}
}
