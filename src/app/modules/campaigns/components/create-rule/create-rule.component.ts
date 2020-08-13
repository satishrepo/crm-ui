import { BehaviorSubject, forkJoin, Subscription } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { FastEntity, LoggerService, getErrorMessage, noWhitespaceValidator } from '@synergy/commonUI';

import { RuleFieldsResData, RuleField, GeneralRule } from '../../models/campaign.model';
import { CampaignService } from '../../services/campaign.service';
import { atLeastOneChecked, requiredIfChecked } from '../../shared/validators';

@Component({
	selector: 'app-create-rule',
	templateUrl: './create-rule.component.html',
	styleUrls: ['./create-rule.component.scss'],
})
export class CreateRuleComponent implements OnInit {
	generalLandUseCodes: FastEntity[];
	displayedColumns: string[] = ['parameter', 'logic', 'value'];

	isLoading = true;
	formDataSource = new BehaviorSubject<AbstractControl[]>([]);
	ruleForm: FormGroup;
	ruleFormSubmitted = false;
	ruleItems: FormArray = this.fb.array([]);

	isAllSelected: boolean;

	ShortcutedLogicTextOptions = [
		{
			Id: true,
			Name: 'Yes',
		},
		{
			Id: false,
			Name: 'No',
		},
	];

	constructor(
		public dialog: MatDialog,
		private campaignService: CampaignService,
		public dialogRef: MatDialogRef<CreateRuleComponent>,
		private fb: FormBuilder,
		private loggerService: LoggerService
	) {}

	ngOnInit() {
		this.ruleForm = this.fb.group(
			{
				Name: ['', [Validators.required, noWhitespaceValidator]],
				RuleItems: this.ruleItems,
			},
			{ validator: atLeastOneChecked }
		);

		forkJoin([this.campaignService.getRuleFields(), this.campaignService.getGeneralLandUseCodes()]).subscribe(
			([rules, landUseCodes]: [RuleFieldsResData, FastEntity[]]) => {
				this.generalLandUseCodes = landUseCodes;
				const ruleParameters = rules.List;

				ruleParameters.forEach((rule: RuleField) => {
					if (rule.Name !== 'County') {
						const logicTypes =
							rule.Id === 3 ? [{ Id: 3, Name: 'Equal', FieldDataType: 'GeneralLandUseCodes' }] : rule.LogicTypes;

						this.ruleItems.push(this.createFormRule(rule.Id, rule.Name, rule.FieldDataType, logicTypes));
					}
				});

				this.updateTableData();
				this.isLoading = false;
			}
		);
	}

	masterToggle(event) {
		this.isAllSelected = event.checked;
		this.toggleAll(this.isAllSelected);
	}

	toggleAll(checkedValue) {
		this.ruleItems.controls.forEach(item => {
			item.get('Checked').patchValue(checkedValue);
		});
	}

	createFormRule(fieldId, fieldName, fieldType, logicTypes) {
		return this.fb.group(
			{
				DataCutRuleFieldId: fieldId,
				DataCutRuleFieldName: fieldName,
				LogicTypes: this.fb.array([...logicTypes]),
				DataCutLogicType: logicTypes && logicTypes[0],
				Value: '',
				Checked: false,
			},
			{ validator: requiredIfChecked }
		);
	}

	updateTableData() {
		this.formDataSource.next(this.ruleItems.controls);
	}

	addNewRule() {
		const parsedFormValues: GeneralRule = {
			RuleName: this.ruleForm.value.Name,
			RuleItems: this.ruleForm.value.RuleItems.reduce((acc, item) => {
				return item.Checked
					? [
							...acc,
							{
								Value: item.Value,
								DataCutLogicTypeId: item.DataCutLogicType.Id,
								DataCutRuleFieldId: item.DataCutRuleFieldId,
							},
					  ]
					: acc;
			}, []),
		};

		this.ruleFormSubmitted = true;
		if (this.ruleForm.invalid) return;
		this.isLoading = true;
		this.campaignService.createRule(parsedFormValues).subscribe(
			res => {
				this.isLoading = false;
				this.loggerService.success('Rule is successfully created!');
				this.dialogRef.close();
			},
			err => {
				this.isLoading = false;
				this.loggerService.error(getErrorMessage(err));
			}
		);
	}

	compareObjects(o1: any, o2: any) {
		return o1.Name === o2.Name && o1.Id === o2.Id;
	}

	get nameField(): AbstractControl {
		return this.ruleForm.get('Name');
	}
}
