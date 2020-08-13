import {
	Component,
	OnInit,
	Input,
	Output,
	EventEmitter,
	AfterViewInit,
	OnChanges,
	OnDestroy,
	SimpleChanges,
	SimpleChange,
	ViewChild,
	ElementRef,
} from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { MatDatepickerInputEvent, MatDialog, MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { takeUntil, startWith, debounceTime } from 'rxjs/operators';

import { FastEntity, stateFromListValidator } from '@synergy/commonUI';

import { SelectRecordsDialogComponent } from '../select-records-dialog/select-records-dialog.component';
import { Campaign } from '../../models/campaign.model';
import { CampaignService } from '../../services/campaign.service';
import { DictionaryService } from '../../../../shared/services/dictionary.service';
import { User } from 'src/app/shared/models/dictionary.model';

import { COMMA, ENTER } from '@angular/cdk/keycodes';

@Component({
	selector: 'app-campaign-details-form',
	templateUrl: './campaign-details-form.component.html',
	styleUrls: ['./campaign-details-form.component.scss'],
})
export class CampaignDetailsFormComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
	campaignForm: FormGroup;
	destroy$ = new Subject();
	@Input() editDisable: boolean;
	@Input() initialValues: Campaign;
	@Input() users: User[];
	@Input() allUsers: User[];
	@Input() initialUsers: User[];
	@Input() campaignTypes: FastEntity[];
	@Input() states: FastEntity[];
	@Input() generalLandUseCodes: FastEntity[];
	@Output() recordsChanged: EventEmitter<void> = new EventEmitter();
	@ViewChild('countyInput') countyInput: ElementRef;
	@ViewChild('autoCounty') matAutocomplete: MatAutocomplete;

	campaignSubTypes: FastEntity[];

	isLoadingCountyOptions = false;
	countiesOptionsOffset = 0;
	countiesOptionsLimit = 50;
	countiesOptions: FastEntity[];
	selectedCounties: FastEntity[] = [];

	filteredStates: FastEntity[];

	separatorKeysCodes: number[] = [ENTER, COMMA];

	constructor(
		private fb: FormBuilder,
		public dialog: MatDialog,
		private campaignService: CampaignService,
		private dictionaryService: DictionaryService
	) { }

	ngOnInit() {
		if (this.campaignService.openSelectRecordsDialSub && !this.campaignService.openSelectRecordsDialSub.closed) {
			this.campaignService.openSelectRecordsDialSub.unsubscribe();
		}
		this.campaignService.openSelectRecordsDialSub = this.campaignService.openSelectRecordsDial.subscribe((id: string) =>
			this.openSelectRecordsDialog(id)
		);

		this.filteredStates = [...this.states];

		this.initForm();
		this.initSubtypes(this.Type.value);
		if (this.initialValues) {
			this.selectedCounties = [...this.initialValues.Counties];
		}
	}

	getFixedFastEntityName = stateValue => {
		let fixedStateName = stateValue;

		if (typeof fixedStateName === 'object' && fixedStateName !== null && fixedStateName.hasOwnProperty('Name')) {
			fixedStateName = stateValue['Name'];
		}
		return fixedStateName;
	};

	private initForm() {
		this.campaignForm = this.fb.group({
			Name: [{ value: this.setInitialValue('Name'), disabled: this.editDisable }, Validators.required],
			Type: [{ value: this.setInitialValue('Type'), disabled: this.editDisable }, Validators.required],
			SubType: [{ value: this.setInitialValue('SubType'), disabled: this.editDisable }, Validators.required],
			CreateDate: [
				{ value: this.setInitialValue('CreateDate'), disabled: this.editDisable },
				this.initialValues && Validators.required,
			],
			TargetDate: [{ value: this.setInitialValue('TargetDate'), disabled: this.editDisable }, Validators.required],
			State: [
				{
					value: this.initialValues && this.initialValues.State ? this.initialValues.State : '',
					disabled: this.editDisable,
				},
				[Validators.required, stateFromListValidator(this.filteredStates)],
			],
			County: [
				{
					value: '',
				},
			],
			Note: [{ value: this.setInitialValue('Note'), disabled: this.editDisable }],
			Description: [{ value: this.setInitialValue('Description'), disabled: this.editDisable }],
			AssignedTo: [{ value: this.setInitialValue('AssignedTo'), disabled: this.editDisable }, Validators.required],
		});

		this.County.valueChanges
			.pipe(
				startWith(''),
				debounceTime(300),
				takeUntil(this.destroy$)
			)
			.subscribe(county => {
				if (this.State.valid) {
					const countyVal = this.getFixedFastEntityName(county);
					this.fetchCounties(countyVal);
				}
			});

		this.State.valueChanges
			.pipe(
				startWith(''),
				debounceTime(300),
				takeUntil(this.destroy$)
			)
			.subscribe(selectedStateValue => {
				if (selectedStateValue) {
					this.filteredStates = selectedStateValue ? this._filterStates(selectedStateValue) : this.states;
					this.County.setValue('');
					this.selectedCounties = [];
				}
			});
	}

	private setCampaignFormValues() {
		if (this.campaignForm) {
			this.campaignForm.setValue(
				{
					Name: this.setInitialValue('Name'),
					Type: this.setInitialValue('Type'),
					SubType: this.setInitialValue('SubType'),
					CreateDate: this.setInitialValue('CreateDate'),
					TargetDate: this.setInitialValue('TargetDate'),
					State: this.initialValues.State,
					County: '',
					Note: this.setInitialValue('Note'),
					Description: this.setInitialValue('Description'),
					AssignedTo: this.setInitialValue('AssignedTo'),
				},
				{ onlySelf: true, emitEvent: false }
			);
		}
		this.countyInput.nativeElement.value = '';
		this.selectedCounties = [...this.initialValues.Counties];
	}

	ngOnChanges(changes: SimpleChanges) {
		const users: SimpleChange = changes.users;

		if (users && users.currentValue && users.currentValue.length) {
			this.initialUsers = users.currentValue;
		}

		if (this.initialValues) {
			const assignedUser = this.initialUsers.find((user: User) => user.Id === this.initialValues.AssignedTo.Id);
			this.users = [...this.initialUsers];

			if (!assignedUser) {
				const userFromGlobalList = this.allUsers.find((user: User) => user.Id === this.initialValues.AssignedTo.Id);
				this.users = [...this.initialUsers, userFromGlobalList];
			}

			// fix sub types options after type value changed
			if (this.initialValues.Type && this.initialValues.Type.Id) {
				this.initSubtypes(this.initialValues.Type.Id);
			}
			this.setCampaignFormValues();
			this.fetchCounties('', this.initialValues.State.Id);
		}
	}

	private fetchCounties(fullSearch, stateId?) {
		const StateId = stateId || this.State.value.Id;

		this.isLoadingCountyOptions = true;

		this.dictionaryService
			.getCounties({
				'Filter.StateId': StateId,
				fullSearch: fullSearch,
				offset: this.countiesOptionsOffset,
				limit: this.countiesOptionsLimit,
				sortField: '',
				sortOrder: '',
			})
			.subscribe(
				res => {
					this.countiesOptions = res.List.filter(
						county => !this.selectedCounties.some(selectedCounty => selectedCounty.Id === county.Id)
					);

					this.isLoadingCountyOptions = false;
				},
				err => {
					this.isLoadingCountyOptions = false;
				}
			);
	}

	displayFastEntity(fastEntity?: FastEntity): string | undefined {
		return fastEntity ? fastEntity.Name : undefined;
	}

	ngAfterViewInit() { }

	get TargetDate(): any {
		return this.campaignForm.get('TargetDate');
	}

	get Name(): any {
		return this.campaignForm.get('Name');
	}

	get County(): any {
		return this.campaignForm.get('County');
	}

	get Type(): any {
		return this.campaignForm.get('Type');
	}

	get SubType(): any {
		return this.campaignForm.get('SubType');
	}

	get State(): any {
		return this.campaignForm.get('State');
	}

	get CreateDate(): any {
		return this.campaignForm.get('CreateDate');
	}

	get AssignedTo(): any {
		return this.campaignForm.get('AssignedTo');
	}

	private setInitialValue(fieldName: string) {
		if (
			this.initialValues &&
			this.initialValues[fieldName] !== null &&
			typeof this.initialValues[fieldName] !== 'undefined'
		) {
			if (
				(fieldName === 'AssignedTo' || fieldName === 'Type' || fieldName === 'SubType') &&
				this.initialValues[fieldName].hasOwnProperty('Id')
			) {
				return this.initialValues[fieldName].Id;
			}
			if (this.initialValues[fieldName] && this.initialValues[fieldName].hasOwnProperty('Name')) {
				return this.initialValues[fieldName].Name;
			}
			return this.initialValues[fieldName];
		}
		return '';
	}

	formatDateValue(formControl: string, event: MatDatepickerInputEvent<Date>) {
		this.campaignForm
			.get(formControl)
			.patchValue(moment(event.target.value).format(moment.HTML5_FMT.DATE) + 'T00:00:00');
	}

	toggleEditMode() {
		this.editDisable
			? this.campaignForm.enable({ onlySelf: true, emitEvent: false })
			: this.campaignForm.disable({ onlySelf: true, emitEvent: false });
		this.editDisable = !this.editDisable;
	}

	typeChange(id: string | number) {
		this.initSubtypes(id);
		this.campaignForm.get('SubType').setValue(null);
	}

	private initSubtypes(id: string | number) {
		if (this.campaignTypes) {
			this.campaignTypes.forEach((type: FastEntity) => {
				if (type.Id === id) {
					this.campaignSubTypes = type['Children'];
				}
			});
		}
	}

	openSelectRecordsDialog(id: string) {
		this.dialog
			.open(SelectRecordsDialogComponent, {
				disableClose: true,
				autoFocus: false,
				maxWidth: '100%',
				width: '60vw',
				data: {
					campaignId: id || this.initialValues.Id,
					generalLandUseCodes: this.generalLandUseCodes,
				},
			})
			.afterClosed()
			.subscribe(() => this.recordsChanged.next());
	}

	setState() {
		if (this.State.value) {
			if (this.State.value.hasOwnProperty('Id')) {
				this.fetchCounties('');
			} else {
				const filteredState = this.filteredStates.find(
					state => this.State.value.toLowerCase() === state.Name.toLowerCase()
				);
				if (filteredState) {
					this.County.setValue('');
					this.State.patchValue(filteredState);
				}
			}
		}

		if (this.State.invalid) {
			this.County.setValue('');
		}
	}

	private _filterStates(value): FastEntity[] {
		const filterValue = this.getFixedFastEntityName(value).toLowerCase();

		return this.states.filter(state => state.Name.toLowerCase().indexOf(filterValue) === 0);
	}

	removeCounty(county: FastEntity): void {
		this.selectedCounties = this.selectedCounties.filter(c => c.Id !== county.Id);
		this.countyInput.nativeElement.value = '';
		this.County.setValue('');
	}

	selectCounty(event: MatAutocompleteSelectedEvent): void {
		this.selectedCounties = [...this.selectedCounties, event.option.value];
		this.countyInput.nativeElement.value = '';
		this.County.setValue('');
	}

	ngOnDestroy() {
		this.destroy$.next(true);
		this.destroy$.complete();
	}
}
