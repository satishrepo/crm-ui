import { Component, OnInit, OnDestroy, ViewChildren, QueryList, Inject } from '@angular/core';
import { MatCheckboxChange, MatDialogRef, MatCheckbox, MAT_DIALOG_DATA } from '@angular/material';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { saveAs } from 'file-saver';

import { DumpResult, LoggerService } from '@synergy/commonUI';

import { DataDumpItem } from '../../models/campaign.model';
import { CampaignService } from '../../services/campaign.service';

@Component({
	selector: 'app-export-data-dump',
	templateUrl: './export-data-dump.component.html',
	styleUrls: ['./export-data-dump.component.scss'],
})
export class ExportDataDumpComponent implements OnInit, OnDestroy {
	dataView = 'Lead';
	eventFields = [];
	dataArr = [];
	selectAll = false;
	isLoading = false;
	noExportData = false;

	@ViewChildren('dumbCheckbox') checkboxes: QueryList<MatCheckbox>;

	constructor(
		private campaignService: CampaignService,
		public dialogRef: MatDialogRef<ExportDataDumpComponent>,
		public logerService: LoggerService,
		public http: HttpClient,
		@Inject(MAT_DIALOG_DATA) private data
	) {
		this.campaignId = data.campaignId;
	}

	private componetDestroyed$ = new Subject();
	campaignId: string;

	ngOnInit() {
		if (this.data.totalRecordsIncluded > 0) {
			this.initDumpFields();
		} else {
			this.noExportData = true;
		}
	}

	initDumpFields() {
		this.isLoading = true;
		this.campaignService.getDumpFields(this.dataView, this.campaignId).subscribe(
			(dfList: string[]) => {
				if (dfList) {
					this.eventFields = dfList.map((dumpField: string, index: number) => {
						return {
							checked: false,
							Key: dumpField,
							Order: index,
							Alias: dumpField,
						};
					});
					this.isLoading = false;
				}
			},
			(err: HttpErrorResponse) => {
				if (err.status === 404) {
					this.isLoading = false;
				}
			}
		);
	}

	drop(event: CdkDragDrop<string[]>) {
		moveItemInArray(this.eventFields, event.previousIndex, event.currentIndex);
		this.initDataArr();
	}

	check(event: MatCheckboxChange, item: DataDumpItem) {
		item.checked = event.checked;
		this.initDataArr();
		this.selectAll = this.dataArr.length === this.eventFields.length;
	}

	toggleSelectAll() {
		if (this.selectAll) {
			this.eventFields.map((eventField: DataDumpItem) => {
				eventField.checked = true;
			});
			this.checkboxes.forEach((chBox: MatCheckbox) => {
				chBox.checked = true;
			});
		} else {
			this.eventFields.map((eventField: DataDumpItem) => {
				eventField.checked = false;
			});
			this.checkboxes.forEach((chBox: MatCheckbox) => {
				chBox.checked = false;
			});
		}
		this.initDataArr();
	}

	private initDataArr() {
		this.dataArr = this.eventFields.filter(eventField => eventField.checked);
		this.dataArr.forEach((item: DataDumpItem, index: number) => (item.Order = index));
	}

	inputChange(event: any, item: DataDumpItem) {
			item.Alias = event.target.value;
			this.initDataArr();
	}

	exportData() {
		this.dataArr.forEach((item: DataDumpItem) => {
			delete item.checked;
		});
		this.isLoading = true;

		this.campaignService
			.exportDataDump(this.campaignId, this.dataView, this.dataArr)
			.pipe(switchMap((key: string) => this.campaignService.getDataDumpUrl(this.campaignId, key)))
			.subscribe(
				(data: DumpResult) => {
					const filename = data.Path.replace(/^.*[\\\/]/, '');

					this.http.get(data.Url, { responseType: 'blob' }).subscribe((response: Blob) => {
						this.isLoading = false;
						saveAs(response, filename);
						this.dialogRef.close();
					});
				},
				err => {
					this.logerService.error(err.message);
					this.isLoading = false;
				}
			);
	}

	dataViewChange() {
		this.isLoading = true;
		this.initDumpFields();
	}

	ngOnDestroy() {
		this.componetDestroyed$.next();
		this.componetDestroyed$.complete();
	}
}
