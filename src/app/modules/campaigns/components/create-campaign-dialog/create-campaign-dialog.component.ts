import { Router } from '@angular/router';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material';
import { Component, OnInit, ViewChild, OnDestroy, Inject } from '@angular/core';

import { FastEntity, LoggerService, markFormTouched, scrollToFormError } from '@synergy/commonUI';

import { CampaignService } from '../../services/campaign.service';
import { CampaignDetailsFormComponent } from '../campaign-details-form/campaign-details-form.component';
import { DictionaryService } from 'src/app/shared/services/dictionary.service';
import { User, DepartmentWithUsers } from 'src/app/shared/models/dictionary.model';

@Component({
	selector: 'app-create-campaign-dialog',
	templateUrl: './create-campaign-dialog.component.html',
	styleUrls: ['./create-campaign-dialog.component.scss'],
})
export class CreateCampaignDialogComponent implements OnInit, OnDestroy {
	@ViewChild(CampaignDetailsFormComponent) formComp: CampaignDetailsFormComponent;
	users: User[];
	departmentUsers: DepartmentWithUsers;
	campaignTypes: FastEntity[];
	isSaving = false;
	states: FastEntity[];
	generalLandUseCodes;

	constructor(
		private campaignService: CampaignService,
		public dialogRef: MatDialogRef<CreateCampaignDialogComponent>,
		private router: Router,
		public dialog: MatDialog,
		public loggerService: LoggerService,
		public dictionaryService: DictionaryService,
		@Inject(MAT_DIALOG_DATA) private data
	) {}

	ngOnInit() {
		this.users = this.data.dictionaries.LoanDepartment.Users;
		this.states = this.data.dictionaries.States;
		this.campaignTypes = this.data.dictionaries.CampaignTypes;
		this.generalLandUseCodes = this.data.dictionaries.GeneralLandUseCodes;
	}
	createCampaign() {
		markFormTouched(this.formComp.campaignForm);
		if (this.formComp.campaignForm.invalid) {
			scrollToFormError();
			return;
		}

		const { Name, Type, SubType, TargetDate, AssignedTo, Note, Description, State } = this.formComp.campaignForm.value;

		const { selectedCounties } = this.formComp;

		const newCampaign = {
			Name,
			TypeId: Type,
			SubTypeId: SubType || '0',
			TargetDate,
			AssignedToUserId: AssignedTo,
			Note,
			Description,
			CountyIds: selectedCounties.map(county => county.Id),
			StateId: State.Id,
		};

		this.isSaving = true;
		this.campaignService.createCampaign(newCampaign).subscribe(
			(id: string) => {
				this.router.navigate(['/campaigns', id]);
				this.loggerService.success('Campaign is successfully created!');
				this.dialogRef.close(id);
				this.isSaving = false;
			},
			err => {
				console.log(err);
				this.isSaving = false;
			}
		);
	}

	ngOnDestroy() {
		this.formComp.campaignForm.reset();
	}
}
