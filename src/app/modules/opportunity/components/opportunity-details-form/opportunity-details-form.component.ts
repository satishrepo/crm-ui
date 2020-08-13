import {
	Component,
	EventEmitter,
	Input,
	OnInit,
	Output,
	OnDestroy,
	Inject,
	Optional,
	SimpleChanges,
	OnChanges,
} from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar, MatDialog, MAT_DIALOG_DATA } from '@angular/material';
import { Subject, merge } from 'rxjs';
import { startWith, debounceTime, takeUntil } from 'rxjs/operators';
import * as moment from 'moment';
import { Router } from '@angular/router';

import {
	AuthService,
	CRMContacts,
	CRMOpportunities,
	CRMProperties,
	CRMRecords,
	FastEntity,
	getErrorMessage,
	LoggerService,
	MaskPhoneFormat,
	PermissionsService,
	scrollToFormError,
	CRMOpportunitySensitiveData,
} from '@synergy/commonUI';

import {
	Borrower,
	CommercialBorrower,
	ContactOpportunityOption,
	LOAN_TYPES,
	Opportunity,
	PROPERTY_TYPES,
	SensitiveDataFieldStatuses,
	SensitiveDataFields,
	SensitiveDataUpdateModel,
} from '../../models/opportunity.model';
import { OpportunitiesService, parseFormValues, toFixed2 } from '../../services/opportunities.service';
import { LeadsService } from '../../../leads/services/leads.service';
import { PropertyService } from '../../../property/services/property.service';
import { ContactsService } from '../../../contacts/services/contacts.service';
import { ValidateFastEntity } from '../../../../shared/services/form-validators';
import { Contact } from '../../../contacts/models/contacts.model';
import { CreateContactsDialogComponent } from '../../../contacts/components/create-contacts-dialog/create-contacts-dialog.component';
import {
	emailPattern,
	onlyPositiveNumbers,
	percentValidation,
	requiredFirstAndLastNameForUnderFill,
	ssnPattern,
	uniqueBorrowersNames,
	phoneNumberPattern,
} from '../../shared/validators';
import { EmptyGuid } from '../../shared/opportunity.constants';

@Component({
	selector: 'app-opportunity-details-form',
	templateUrl: './opportunity-details-form.component.html',
	styleUrls: ['./opportunity-details-form.component.scss'],
})
export class OpportunityDetailsFormComponent implements OnInit, OnDestroy, OnChanges {
	@Input() opportunity: string;
	@Input() dictionaries: string;
	@Input() incomingLead: FastEntity;
	@Output() closeDialog = new EventEmitter();
	@Output() setOpportunity = new EventEmitter();

	destroy$ = new Subject();
	initialValues: Opportunity;
	initialPropertiesValue;
	relatedLead: FastEntity;
	linkedProperties: any[] = [];

	opportunityStagesOptions: FastEntity[] = [];
	loanTypeOptions: FastEntity[] = [];
	propertyTypeOptions: FastEntity[] = [];

	leadOptions: FastEntity[] = [];
	leadsOptionsOffset = 0;
	leadsOptionsLimit = 50;

	isLoadingContactsOptions: boolean;
	contactsOptions: ContactOpportunityOption[] = [];

	propertyOptions: FastEntity[] = [];

	opportunityForm: FormGroup;

	loanToValuePercent;
	calculatedAmountDue;
	NewLoanAmount;
	MonthlyPayment;

	isViewMode = false;
	isLoading = true;
	isLoadingLeadOptions = false;
	isLoadingPropertyOptions = false;

	validProperties = true;

	martialStatuses = [
		{
			value: true,
			name: 'Married',
		},
		{
			value: false,
			name: 'Single',
		},
	];

	LOAN_TYPES: typeof LOAN_TYPES = LOAN_TYPES;
	PROPERTY_TYPES: typeof PROPERTY_TYPES = PROPERTY_TYPES;
	SensitiveDataFieldStatuses: typeof SensitiveDataFieldStatuses = SensitiveDataFieldStatuses;
	minNumberOfBorrowers = 2;

	phoneMask = MaskPhoneFormat;
	taxIdMask = '00-0000000';
	taskIdPattern = /\d{9}$/;

	sensitiveFieldDefaultValues = {
		SSN: '000-00-0000',
		DayOfBirth: new Date(),
		TaxIdNumber: '000000000',
	};

	constructor(
		private fb: FormBuilder,
		private opportunitiesService: OpportunitiesService,
		private propertyService: PropertyService,
		private leadsService: LeadsService,
		private snackBar: MatSnackBar,
		private contactsService: ContactsService,
		public dialog: MatDialog,
		public authService: AuthService,
		@Optional() @Inject(MAT_DIALOG_DATA) public data: any,
		private router: Router,
		private permissionsService: PermissionsService,
		private loggerService: LoggerService
	) {}

	ngOnInit() {
		this.loanTypeOptions = this.dictionaries ? this.dictionaries['LoanTypes'] : this.data['dictionaries']['LoanTypes'];
		this.propertyTypeOptions = this.dictionaries
			? this.dictionaries['PropertyTypes']
			: this.data['dictionaries']['PropertyTypes'];

		this.opportunityStagesOptions = this.dictionaries
			? this.dictionaries['OpportunityStages']
			: this.data['dictionaries']['OpportunityStages'];

		this.opportunitiesService.getIsLoadingAsObservable().subscribe(isLoading => {
			this.isLoading = isLoading;
		});

		this.opportunityForm = this.fb.group(
			{
				Lead: [{ value: '', disabled: this.isViewMode }, ValidateFastEntity()],
				Property: [{ value: '', disabled: this.isViewMode }],
				Contact: [{ value: '', disabled: this.isViewMode }, ValidateFastEntity()],
				LoanType: [{ value: '', disabled: this.isViewMode }],
				OpportunityPropertyTypeId: [{ value: '', disabled: this.isViewMode }],
				Stage: [{ value: '', disabled: this.isViewMode }],
				CloseDate: [{ value: '', disabled: this.isViewMode }],
				CloseProbabilityPercent: [{ value: '', disabled: this.isViewMode }, [...percentValidation]],
				ClosingCost: [{ value: '', disabled: this.isViewMode }, [...onlyPositiveNumbers]],
				OriginationPercent: [{ value: '', disabled: this.isViewMode }, [...percentValidation]],
				LenderCredit: [{ value: '', disabled: this.isViewMode }, [...onlyPositiveNumbers]],
				AmountDue: [{ value: '', disabled: this.isViewMode }, [...onlyPositiveNumbers]],

				CurrentLoanBalance: [{ value: '', disabled: this.isViewMode }, [...onlyPositiveNumbers]],
				ThirdPartyLoanBalance: [{ value: '', disabled: this.isViewMode }, [...onlyPositiveNumbers]],
				NewLoanAmount: [{ value: '', disabled: this.isViewMode }, [...onlyPositiveNumbers]],
				MonthlyPayment: [{ value: '', disabled: this.isViewMode }, [...onlyPositiveNumbers]],

				CalculatedAmountDue: [{ value: '', disabled: this.isViewMode }],
				isAdjustedDisabled: ['true'],
				InterestRate: [{ value: '', disabled: this.isViewMode }, [...percentValidation]],
				Term: [{ value: '', disabled: this.isViewMode }, [Validators.pattern(/^\d+$/)]],
				PrePay: [{ value: '', disabled: this.isViewMode }, [...onlyPositiveNumbers]],
				LoanToValuePercent: [{ value: '', disabled: this.isViewMode }],
				Borrowers: this.fb.array([this.createBorrower(0), this.createBorrower(1)]),
				CommercialBorrowers: this.fb.array([this.createCommercialBorrower(0)]),
			},
			{ validator: uniqueBorrowersNames }
		);

		if (this.permissionRecordsRead && this.data && this.data['dictionaries']) {
			this.Lead.valueChanges
				.pipe(
					startWith(''),
					debounceTime(300),
					takeUntil(this.destroy$)
				)
				.subscribe(lead => {
					const leadVal = this.getFixedFastEntityName(lead);
					if (leadVal) {
						this.contactsOptions = [];
						this.propertyOptions = [];
						this.Contact.setValue('');
						this.Property.setValue('');
						this.linkedProperties = [];
					}
					this.fetchLeads(leadVal);
				});
		}

		if (this.incomingLead) {
			this.Lead.setValue(this.incomingLead);
		}

		if (this.permissionPropertiesRead) {
			this.Property.valueChanges
				.pipe(
					debounceTime(300),
					takeUntil(this.destroy$)
				)
				.subscribe(property => {
					const propertyVal = this.getFixedFastEntityName(property);
					this.fetchProperties(propertyVal);
				});
		}

		merge(
			this.AmountDue.valueChanges,
			this.OriginationPercent.valueChanges,
			this.ClosingCost.valueChanges,
			this.LenderCredit.valueChanges,
			this.Term.valueChanges,
			this.InterestRate.valueChanges,
			this.ThirdPartyLoanBalance.valueChanges,
			this.CurrentLoanBalance.valueChanges,
			this.PrePay.valueChanges
		)
			.pipe(takeUntil(this.destroy$))
			.subscribe(() => {
				this.updateCalculatedFields();
			});

		if (this.permissionContactsRead) {
			this.Contact.valueChanges
				.pipe(
					startWith(''),
					debounceTime(300),
					takeUntil(this.destroy$)
				)
				.subscribe(contact => {
					const contactVal = this.getFixedFastEntityName(contact);
					this.fetchContacts(contactVal);
				});
		}

		this.isAdjustedDisabled.valueChanges
			.pipe(
				startWith(''),
				debounceTime(300),
				takeUntil(this.destroy$)
			)
			.subscribe(val => {
				if (val !== '') {
					let disableStatus;
					if (this.isViewMode) {
						disableStatus = 'disable';
					} else {
						// tslint:disable-next-line:triple-equals
						disableStatus = val == 'true' ? 'disable' : 'enable';
					}
					this.opportunityForm.controls['AmountDue'][disableStatus]();
					this.updateCalculatedFields();
				}
			});

		this.LoanType.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
			const LoanTypeValue = this.LoanType.value;

			if (
				LoanTypeValue !== this.LOAN_TYPES.NewConsolidation &&
				LoanTypeValue !== this.LOAN_TYPES.RefiConsolidation &&
				LoanTypeValue !== this.LOAN_TYPES.SylConsolidation
			) {
				this.ThirdPartyLoanBalance.patchValue('');
			}
			if (LoanTypeValue !== this.LOAN_TYPES.Refi && LoanTypeValue !== this.LOAN_TYPES.RefiConsolidation) {
				this.CurrentLoanBalance.patchValue('');
			}
			this.updateCalculatedFields();
		});
	}

	requiredBorrower(order: number) {
		return order === 0;
	}

	createBorrower(order: number, borrower?) {
		const requiredFirstBorrower = this.requiredBorrower(order) ? Validators.required : null;

		return this.fb.group(
			{
				Id: borrower && borrower.Id ? borrower.Id : null,
				FirstName: [
					{ value: borrower && borrower.FirstName ? borrower.FirstName : null, disabled: this.isViewMode },
					requiredFirstBorrower,
				],
				LastName: [
					{ value: borrower && borrower.LastName ? borrower.LastName : null, disabled: this.isViewMode },
					requiredFirstBorrower,
				],
				MiddleName: [
					{ value: borrower && borrower.MiddleName ? borrower.MiddleName : null, disabled: this.isViewMode },
				],
				SSN: this.fb.group({
					value: [
						{
							value: this.initialValues && borrower ? this.sensitiveFieldDefaultValues.SSN : null,
							disabled: this.isSensitiveFieldDisabled,
						},
						Validators.pattern(ssnPattern),
					],
					status:
						borrower && borrower.Id ? this.SensitiveDataFieldStatuses.hidden : this.SensitiveDataFieldStatuses.visible,
					isChanged: false,
				}),
				Email: [
					{ value: borrower && borrower.Email ? borrower.Email : null, disabled: this.isViewMode },
					Validators.pattern(emailPattern),
				],
				CellPhone: [
					{ value: borrower && borrower.CellPhone ? borrower.CellPhone : null, disabled: this.isViewMode },
					Validators.pattern(phoneNumberPattern),
				],
				WorkPhone: [
					{ value: borrower && borrower.WorkPhone ? borrower.WorkPhone : null, disabled: this.isViewMode },
					Validators.pattern(phoneNumberPattern),
				],
				Fax: [{ value: borrower && borrower.Fax ? borrower.Fax : null, disabled: this.isViewMode }],
				IsMarried: [
					{ value: borrower && borrower.IsMarried !== null ? borrower.IsMarried : null, disabled: this.isViewMode },
				],
				DayOfBirth: this.fb.group({
					value: [
						{
							value: this.initialValues && borrower ? this.sensitiveFieldDefaultValues.DayOfBirth : null,
							disabled: this.isSensitiveFieldDisabled,
						},
					],
					status:
						borrower && borrower.Id ? this.SensitiveDataFieldStatuses.hidden : this.SensitiveDataFieldStatuses.visible,

					isChanged: false,
				}),
				Order: order,
			},
			{ validator: requiredFirstAndLastNameForUnderFill }
		);
	}

	createCommercialBorrower(order, borrower?) {
		return this.fb.group({
			Id: borrower && borrower.Id ? borrower.Id : null,
			EntityName: [
				{ value: borrower && borrower.EntityName ? borrower.EntityName : null, disabled: this.isViewMode },
				Validators.required,
			],
			TaxIdNumber: this.fb.group({
				value: [
					{
						value: this.initialValues && borrower ? this.sensitiveFieldDefaultValues.TaxIdNumber : null,
						disabled: this.isSensitiveFieldDisabled,
					},
					Validators.pattern(this.taskIdPattern),
				],
				status:
					borrower && borrower.Id ? this.SensitiveDataFieldStatuses.hidden : this.SensitiveDataFieldStatuses.visible,

				isChanged: false,
			}),
			FirstName: [
				{ value: borrower && borrower.FirstName ? borrower.FirstName : null, disabled: this.isViewMode },
				Validators.required,
			],
			MiddleName: [{ value: borrower && borrower.MiddleName ? borrower.MiddleName : null, disabled: this.isViewMode }],
			LastName: [
				{ value: borrower && borrower.LastName ? borrower.LastName : null, disabled: this.isViewMode },
				Validators.required,
			],
			Email: [
				{ value: borrower && borrower.Email ? borrower.Email : null, disabled: this.isViewMode },
				Validators.pattern(emailPattern),
			],
			WorkPhone: [
				{ value: borrower && borrower.WorkPhone ? borrower.WorkPhone : null, disabled: this.isViewMode },
				Validators.pattern(phoneNumberPattern),
			],
			CellPhone: [
				{ value: borrower && borrower.CellPhone ? borrower.CellPhone : null, disabled: this.isViewMode },
				Validators.pattern(phoneNumberPattern),
			],
			Fax: [{ value: borrower && borrower.Fax ? borrower.Fax : null, disabled: this.isViewMode }],
			Title: [
				{ value: borrower && borrower.Title ? borrower.Title : null, disabled: this.isViewMode },
				Validators.required,
			],
			Order: order,
		});
	}

	initBorrowers(borrowers: Borrower[]) {
		const sortedBorrowers = borrowers.sort((a, b) => a.Order - b.Order);
		//set hardcoded number of borrowers
		const fixedBorrowers =
			borrowers.length < this.minNumberOfBorrowers
				? [...sortedBorrowers, ...new Array(this.minNumberOfBorrowers - borrowers.length).fill(null)]
				: sortedBorrowers;

		fixedBorrowers.forEach((b, i) => {
			this.BorrowersFormArray.push(this.createBorrower(i, b));
		});
	}

	initCommercialBorrowers(borrowers: CommercialBorrower[]) {
		borrowers
			.sort((a, b) => {
				return a.Order - b.Order;
			})
			.forEach((b, i) => {
				this.CommercialBorrowersFormArray.push(this.createCommercialBorrower(i, b));
			});
	}

	toggleBorrowerSensitiveData(borrowerId: string, borrowerIndex: number, field: SensitiveDataFields) {
		const status = this.getSensitiveFieldValue(borrowerIndex, field).status;

		if (status === SensitiveDataFieldStatuses.hidden) {
			this.showBorrowerSensitiveData(borrowerId, borrowerIndex, field);
		} else if (status === SensitiveDataFieldStatuses.visible) {
			this.hideBorrowerSensitiveData(borrowerIndex, field);
		}
	}

	showBorrowerSensitiveData(borrowerId: string, borrowerIndex: number, field: SensitiveDataFields) {
		this.setSensitiveData(borrowerIndex, field, { status: SensitiveDataFieldStatuses.loading });
		const sensitiveDataField = this.getSensitiveFieldValue(borrowerIndex, field);

		if (
			(!sensitiveDataField.value || sensitiveDataField.value === this.sensitiveFieldDefaultValues[field]) &&
			borrowerId
		) {
			this.opportunitiesService.getSensitiveData(this.initialValues.Id, borrowerId, field).subscribe(
				res => {
					if (field === SensitiveDataFields.DayOfBirth) {
						res = res ? moment(new Date(res)).format(moment.HTML5_FMT.DATE + 'T00:00:00') : '';
					}

					this.setSensitiveData(borrowerIndex, field, {
						status: SensitiveDataFieldStatuses.visible,
						value: res,
					});
				},
				err => {
					this.loggerService.error(err);

					this.setSensitiveData(borrowerIndex, field, {
						status: SensitiveDataFieldStatuses.hidden,
					});
				}
			);
		} else {
			this.setSensitiveData(borrowerIndex, field, { status: SensitiveDataFieldStatuses.visible });
		}
	}

	hideBorrowerSensitiveData(borrowerIndex: number, field: SensitiveDataFields) {
		const isChangedValue = this.getSensitiveFieldValue(borrowerIndex, field).isChanged;
		if (isChangedValue) {
			this.setSensitiveData(borrowerIndex, field, {
				status: SensitiveDataFieldStatuses.hidden,
			});
		} else {
			this.setSensitiveData(borrowerIndex, field, {
				status: SensitiveDataFieldStatuses.hidden,
				value: this.sensitiveFieldDefaultValues[field],
			});
		}
	}

	setSensitiveData(borrowerIndex: number, field: SensitiveDataFields, data) {
		const borrowersType = this.isCommercialBorrowerActive ? 'CommercialBorrowers' : 'Borrowers';

		const sField = this.opportunityForm.get(`${borrowersType}.${borrowerIndex}.${field}`);
		const sensitiveData = {
			...sField.value,
			...data,
		};

		sField.patchValue(sensitiveData);
	}

	getSensitiveFieldValue(borrowerIndex: number, field: SensitiveDataFields) {
		const borrowersType = this.isCommercialBorrowerActive ? 'CommercialBorrowers' : 'Borrowers';

		const sField = this.opportunityForm.get(`${borrowersType}.${borrowerIndex}.${field}`);

		return sField.value;
	}

	updateBorrowerSensitiveData(data) {
		this.isLoading = true;

		return this.opportunitiesService.updateSensitiveData(this.initialValues.Id, data);
	}

	sensitiveFieldChanged(borrowerIndex, field) {
		this.setSensitiveData(borrowerIndex, field, { isChanged: true });
	}

	getSensitiveFieldsUpdateData(borrowers): SensitiveDataUpdateModel[] {
		return borrowers.map(borrower => {
			return {
				Order: borrower.Order,
				SSN: borrower.SSN ? borrower.SSN.value : null,
				DayOfBirth: borrower.DayOfBirth ? borrower.DayOfBirth.value : null,
				TaxIdNumber: borrower.TaxIdNumber ? borrower.TaxIdNumber.value : null,
				IsSSNChanged: borrower.SSN ? borrower.SSN.isChanged : false,
				IsDayOfBirthChanged: borrower.DayOfBirth ? borrower.DayOfBirth.isChanged : false,
				IsTaxIdNumberChanged: borrower.TaxIdNumber ? borrower.TaxIdNumber.isChanged : false,
			};
		});
	}

	dayOfBirthChanged(borrowerIndex, field, formControl: AbstractControl, event) {
		this.sensitiveFieldChanged(borrowerIndex, field);
		this.formatDateValue(formControl, event);
	}

	clearDayOfBirth(borrowerIndex, formControl: AbstractControl) {
		formControl.setValue('');
		this.sensitiveFieldChanged(borrowerIndex, SensitiveDataFields.DayOfBirth);
	}

	clearFormArray(formArray: FormArray) {
		while (formArray.length !== 0) {
			formArray.removeAt(0);
		}
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes.opportunity && changes.opportunity.currentValue) {
			const opportunity = changes.opportunity.currentValue;

			this.relatedLead = opportunity.Lead;

			this.initialValues = {
				...opportunity,
			};

			this.initialPropertiesValue = opportunity.Properties.map(item => ({
				...item,
				Name: item.Address.Address1,
			}));

			this._setOpportunityFormValues();

			this.updateCalculatedFields();

			if (!this.isViewMode) {
				this.toggleViewMode();
			}
		}
	}

	ngOnDestroy() {
		this.destroy$.next(true);
		this.destroy$.complete();
	}

	private fetchLeads(fullSearch) {
		this.isLoadingLeadOptions = true;

		this.leadsService
			.getItems({
				fullSearch: fullSearch,
				offset: this.leadsOptionsOffset,
				limit: this.leadsOptionsLimit,
				sortField: '',
				sortOrder: '',
			})
			.subscribe(res => {
				this.leadOptions = res.List.map(item => ({
					Id: item.Id,
					Name: item.AccountName,
				}));
				this.isLoadingLeadOptions = false;
			});
	}

	private fetchProperties(fullSearch) {
		let leadParams = null;

		if (this.relatedLead) {
			leadParams = [this.relatedLead.Id];
		} else if (this.Lead.value.Id) {
			leadParams = [this.Lead.value.Id];
		}

		if (leadParams) {
			this.isLoadingPropertyOptions = true;

			this.propertyService
				.getItems({
					'Filter.LeadIds': leadParams,
					fullSearch: fullSearch,
					offset: this.leadsOptionsOffset,
					limit: this.leadsOptionsLimit,
					sortField: '',
					sortOrder: '',
				})
				.subscribe(res => {
					const propertyFilter = this.linkedProperties.map(prop => prop.Id);
					const filteredProperties = res.List.filter(prop => !propertyFilter.includes(prop.Id));

					this.propertyOptions = filteredProperties.map(item => ({
						...item,
						Name: item.Address.Address1,
					}));

					this.isLoadingPropertyOptions = false;
				});
		}
	}

	private fetchContacts(fullSearch) {
		this.isLoadingContactsOptions = true;
		let leadParams;

		if (this.Lead.valid && this.Lead.value.Id) {
			leadParams = {
				'Filter.LeadIds': [this.Lead.value.Id],
			};
		} else {
			this.isLoadingContactsOptions = false;
			return;
		}

		this.contactsService
			.getItems({
				...leadParams,
				fullSearch: fullSearch,
				offset: 0,
				limit: 50,
				sortField: '',
				sortOrder: '',
			})
			.subscribe(res => {
				if (res.List && res.List) {
					this.contactsOptions = this.parseContactsAsFastEntity(res.List);
				} else {
					this.contactsOptions = [];
				}

				this.isLoadingContactsOptions = false;
			});
	}

	private parseContactsAsFastEntity(FastEntityContacts: Contact[]): ContactOpportunityOption[] {
		return FastEntityContacts.map(this.parseSingleContactAsFastEntity);
	}

	private parseSingleContactAsFastEntity(contact: Contact): ContactOpportunityOption {
		const contactTypeName = typeof contact.Type === 'string' ? contact.Type : contact.Type.Name;
		return {
			Id: contact.Id,
			Name: `${contact.FirstName} ${contact.LastName} ${contactTypeName}`,
			originalContact: { ...contact },
		};
	}

	private _setOpportunityFormValues() {
		if (this.opportunityForm) {
			if (this.initialValues.Borrowers.length) {
				this.clearFormArray(this.BorrowersFormArray);
				this.initBorrowers(this.initialValues.Borrowers);
				this.resetBorrowers(this.CommercialBorrowersFormArray);
				this.CommercialBorrowersFormArray.disable();
			} else {
				this.clearFormArray(this.CommercialBorrowersFormArray);
				this.initCommercialBorrowers(this.initialValues.CommercialBorrowers);
				this.resetBorrowers(this.BorrowersFormArray);
				this.BorrowersFormArray.disable();
			}

			this.opportunityForm.patchValue({
				Lead: this.initialValues.Lead,
				Contact: this.initialValues.Contact ? this.parseSingleContactAsFastEntity(this.initialValues.Contact) : '',
				Property: '',
				LoanType: this.setInitialValues('LoanType'),
				OpportunityPropertyTypeId: this.setInitialValues('OpportunityPropertyTypeId'),
				Stage: this.setInitialValues('Stage'),
				CloseDate: this.setInitialValues('CloseDate'),
				CloseProbabilityPercent: this.setInitialValues('CloseProbabilityPercent'),
				ClosingCost: this.setInitialValues('ClosingCost', undefined, toFixed2),
				OriginationPercent: this.setInitialValues('OriginationPercent'),
				LenderCredit: this.setInitialValues('LenderCredit', undefined, toFixed2),

				CurrentLoanBalance: this.setInitialValues('CurrentLoanBalance', undefined, toFixed2),
				ThirdPartyLoanBalance: this.setInitialValues('ThirdPartyLoanBalance', undefined, toFixed2),
				NewLoanAmount: this.getNewLoanAmount(),
				MonthlyPayment: this.getMonthlyPayment(),

				AmountDue: this.setInitialValues('AmountDue', undefined, toFixed2),
				CalculatedAmountDue: this.calculatedAmountDue ? Number(this.calculatedAmountDue).toFixed(2) : '',
				InterestRate: this.setInitialValues('InterestRate'),
				isAdjustedDisabled: 'false',
				Term: this.setInitialValues('Term'),
				PrePay: this.setInitialValues('PrePay', undefined, toFixed2),
				LoanToValuePercent: this.loanToValuePercent ? this.loanToValuePercent.toFixed(2) : '',
			});
		}
		this.linkedProperties = this.initialPropertiesValue;
	}

	get isCommercialBorrowerActive() {
		return this.OpportunityPropertyTypeId.value === this.PROPERTY_TYPES.CommercialEntityOwned;
	}

	private resetBorrowers(formArray: FormArray) {
		formArray.controls.forEach(item => {
			Object.keys(item.value).forEach(k => {
				if (k !== 'Order') {
					item.get(k).reset();
				}

				if (k === 'SSN' || k === 'DayOfBirth' || k === 'TaxIdNumber') {
					const borrowerId = item.get(`Id`).value;
					item.get(`${k}.value`).patchValue(borrowerId ? this.sensitiveFieldDefaultValues : null);
					item
						.get(`${k}.status`)
						.patchValue(borrowerId ? this.SensitiveDataFieldStatuses.hidden : this.SensitiveDataFieldStatuses.visible);
					item.get(`${k}.isChanged`).patchValue(false);
				}
			});
		});
	}

	formSubmitHandler() {
		let borrowersSensitiveFieldsUpdateData;

		if (this.isCommercialBorrowerActive) {
			this.BorrowersFormArray.disable();
			this.CommercialBorrowersFormArray.enable();
			borrowersSensitiveFieldsUpdateData = this.getSensitiveFieldsUpdateData(this.CommercialBorrowersFormArray.value);
		} else {
			this.BorrowersFormArray.enable();
			this.CommercialBorrowersFormArray.disable();
			borrowersSensitiveFieldsUpdateData = this.getSensitiveFieldsUpdateData(this.BorrowersFormArray.value);
		}

		borrowersSensitiveFieldsUpdateData = borrowersSensitiveFieldsUpdateData.filter(data => {
			return data.IsSSNChanged || data.IsDayOfBirthChanged || data.IsTaxIdNumberChanged;
		});

		this.validProperties = this.linkedProperties.length > 0;

		if (this.opportunityForm.invalid) {
			scrollToFormError();
			return;
		}

		if (!this.validProperties) {
			const linkedPropertiesWrapper = document.querySelector('.linked-properties-wrapper');
			linkedPropertiesWrapper.scrollIntoView({ behavior: 'smooth' });
		}

		if (this.opportunityForm.valid && this.validProperties) {
			const currentUser = this.authService.currentUserValue;
			const parsedValues = parseFormValues({ ...this.opportunityForm.value });

			//remove unfilled borrowers
			parsedValues.Borrowers = this.isCommercialBorrowerActive
				? []
				: parsedValues.Borrowers.filter(
						borrower =>
							Object.keys(borrower).filter(
								k =>
									k !== 'Order' &&
									k !== 'Id' &&
									(borrower[k] && borrower[k].hasOwnProperty('status') ? !!borrower[k]['value'] : !!borrower[k])
							).length > 0
				  );

			const linkedPropertiesIds = this.linkedProperties.map(prop => prop.Id);
			const UserId =
				this.initialValues && this.initialValues.LoanOfficer ? this.initialValues.LoanOfficer.Id : currentUser.userId;

			this.isLoading = true;

			if (this.initialValues) {
				this.opportunitiesService
					.updateOpportunity(
						this.initialValues.Id,
						{ ...parsedValues, PropertyIds: linkedPropertiesIds, UserId },
						borrowersSensitiveFieldsUpdateData
					)
					.subscribe(
						res => {
							this.isLoading = false;

							this.opportunitiesService.setOpportunity({
								...this.initialValues,
								...res,
								Contact: parsedValues.Contact.originalContact,
								PropertyIds: linkedPropertiesIds,
								Properties: [...this.linkedProperties],
							});

							this.toggleViewMode();
							this.loggerService.success('Opportunity is successfully updated!');
							if (this.isCommercialBorrowerActive) {
								this.resetBorrowers(this.BorrowersFormArray);
							} else {
								this.resetBorrowers(this.CommercialBorrowersFormArray);
							}
						},
						err => {
							this.loggerService.error(getErrorMessage(err));
							this.isLoading = false;
						}
					);
			} else {
				this.opportunitiesService
					.createOpportunity({ ...parsedValues, PropertyIds: linkedPropertiesIds }, borrowersSensitiveFieldsUpdateData)
					.subscribe(
						res => {
							this.loggerService.success('Opportunity is successfully created!');

							this.closeDialog.emit();
							this.isLoading = false;
							if (!this.incomingLead) {
								this.router.navigate(['/opportunities', res.Id]);
							}
						},
						err => {
							this.loggerService.error(getErrorMessage(err));

							if (err.error && err.error.Lead) {
								this.Lead.setErrors({ invalidLeadId: true });
							}
							this.isLoading = false;
						}
					);
			}
		}
	}

	displayFastEntity(fastEntity?: FastEntity): string | undefined {
		return fastEntity ? fastEntity.Name : undefined;
	}

	toggleViewMode() {
		if (this.opportunityForm) {
			this.isViewMode ? this.opportunityForm.enable() : this.opportunityForm.disable();
			this.isViewMode = !this.isViewMode;
		}
	}

	resetFormHandler() {
		if (this.initialValues) {
			this._setOpportunityFormValues();
		} else {
			this.closeDialog.emit();
		}

		this.toggleViewMode();
		this.opportunityForm.markAsPristine();
		this.opportunityForm.markAsUntouched();
	}

	formatDateValue(formControl: AbstractControl, event) {
		const date = new Date(event.target.value);
		formControl.patchValue(moment(event.target.value).format(moment.HTML5_FMT.DATE + 'T00:00:00'));
	}

	addProperty() {
		this.linkedProperties.push(this.Property.value);
		this.opportunityForm.patchValue({ Property: '' });
		this.updateCalculatedFields();
	}

	removeProperty(Id) {
		this.linkedProperties = this.linkedProperties.filter(property => property.Id !== Id);
		this.opportunityForm.patchValue({ Property: '' });
		this.opportunityForm.markAsDirty();
		this.updateCalculatedFields();
	}

	getFixedFastEntityName = stateValue => {
		let fixedStateName = stateValue;

		if (typeof fixedStateName === 'object' && fixedStateName !== null && fixedStateName.hasOwnProperty('Name')) {
			fixedStateName = stateValue['Name'];
		}
		return fixedStateName;
	};

	updateCalculatedFields() {
		if (this.opportunityForm) {
			this.opportunityForm.patchValue({
				LoanToValuePercent: this.getLoanToValuePercent(),
			});
			this.opportunityForm.patchValue({
				CalculatedAmountDue: this.getCalculatedAmountDue(),
			});

			this.opportunityForm.patchValue({
				NewLoanAmount: this.getNewLoanAmount(),
			});
			this.opportunityForm.patchValue({
				MonthlyPayment: this.getMonthlyPayment(),
			});
		}
	}

	addNewPrimaryContact() {
		const dialogRef = this.dialog.open(CreateContactsDialogComponent, {
			height: '80vh',
			autoFocus: false,
			disableClose: true,
			data: {
				lead: this.Lead.value,
				leadReadOnly: true,
			},
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.Contact.patchValue(this.parseSingleContactAsFastEntity(result));
			}
		});
	}

	setInitialValues(fieldName: string, subField?: string, formatter?): string {
		let initialValue = '';
		if (this.initialValues && typeof this.initialValues[fieldName] !== 'undefined') {
			initialValue = subField ? this.initialValues[fieldName][subField] : this.initialValues[fieldName];
			if (initialValue && initialValue['Id']) {
				initialValue = initialValue['Id'];
			}

			if (typeof formatter === 'function') {
				initialValue = formatter(this.initialValues[fieldName]);
			}
		}
		return initialValue;
	}

	//calculated fields
	private getCurrentAmountDueVal(): string {
		if (this.isAdjustedDisabled.value === 'true') {
			return this.getCalculatedAmountDue();
		} else {
			return this.AmountDue.value ? Number(this.AmountDue.value).toFixed(2) : '';
		}
	}

	private getCalculatedAmountDue(): string {
		const TotalPropertiesAmountDue = this.linkedProperties.length
			? this.linkedProperties.map(p => p.AmountDue).reduce((acc, value) => acc + value, 0)
			: 0;

		return TotalPropertiesAmountDue ? Number(TotalPropertiesAmountDue).toFixed(2) : '';
	}

	private getLoanToValuePercent(): string {
		const TotalPropertiesAppraised = Number(this.getTotalPropertiesAppraisedValues());
		const NewLoanAmount = Number(this.getNewLoanAmount());
		const LoanToValuePercent = TotalPropertiesAppraised ? (NewLoanAmount / TotalPropertiesAppraised) * 100 : 0;

		return LoanToValuePercent ? Number(LoanToValuePercent).toFixed(2) : '';
	}

	private getTotalPropertiesAppraisedValues(): string {
		const TotalPropertiesAppraisedValues = this.linkedProperties.length
			? this.linkedProperties.map(p => p.AppraisedValue).reduce((acc, value) => acc + value, 0)
			: 0;

		return TotalPropertiesAppraisedValues ? TotalPropertiesAppraisedValues.toFixed(2) : '';
	}

	private getNewLoanAmount(): string {
		const AmountDue = this.getCurrentAmountDueVal() ? Number(this.getCurrentAmountDueVal()) : 0;
		const Origination = this.OriginationPercent.value ? Number(this.OriginationPercent.value) : 0;
		const CurrentLoanBalance = this.CurrentLoanBalance.value ? Number(this.CurrentLoanBalance.value) : 0;
		const ThirdPartyLoanBalance = this.ThirdPartyLoanBalance.value ? Number(this.ThirdPartyLoanBalance.value) : 0;
		const ClosingCost = this.ClosingCost.value ? Number(this.ClosingCost.value) : 0;
		const LenderCredit = this.LenderCredit.value ? Number(this.LenderCredit.value) : 0;
		const NewLoanAmount =
			AmountDue +
			(AmountDue * Origination) / 100 +
			CurrentLoanBalance +
			ThirdPartyLoanBalance +
			ClosingCost -
			LenderCredit;

		return NewLoanAmount ? Number(NewLoanAmount).toFixed(2) : '';
	}

	private getMonthlyPayment(): string {
		const NewLoanAmount = Number(this.getNewLoanAmount());
		const n = Number(this.Term.value ? this.Term.value : 0) * 12;
		const r = Number(this.InterestRate.value) / 100 / 12;
		const r1 = 1 + r;
		const pow = Math.pow(r1, n);

		const MonthlyPayment = n > 0 ? (NewLoanAmount * (r * pow)) / (pow - 1) : null;

		return MonthlyPayment ? Number(MonthlyPayment).toFixed(2) : '';
	}

	get Lead(): AbstractControl {
		return this.opportunityForm.get('Lead');
	}
	get Property(): AbstractControl {
		return this.opportunityForm.get('Property');
	}
	get CloseDate(): AbstractControl {
		return this.opportunityForm.get('CloseDate');
	}
	get AmountDue(): AbstractControl {
		return this.opportunityForm.get('AmountDue');
	}
	get Contact(): AbstractControl {
		return this.opportunityForm.get('Contact');
	}
	get isAdjustedDisabled(): AbstractControl {
		return this.opportunityForm.get('isAdjustedDisabled');
	}
	get CloseProbabilityPercent(): AbstractControl {
		return this.opportunityForm.get('CloseProbabilityPercent');
	}
	get ClosingCost(): AbstractControl {
		return this.opportunityForm.get('ClosingCost');
	}
	get OriginationPercent(): AbstractControl {
		return this.opportunityForm.get('OriginationPercent');
	}
	get LenderCredit(): AbstractControl {
		return this.opportunityForm.get('LenderCredit');
	}
	get InterestRate(): AbstractControl {
		return this.opportunityForm.get('InterestRate');
	}
	get PrePay(): AbstractControl {
		return this.opportunityForm.get('PrePay');
	}
	get Term(): AbstractControl {
		return this.opportunityForm.get('Term');
	}
	get LoanType(): AbstractControl {
		return this.opportunityForm.get('LoanType');
	}
	get OpportunityPropertyTypeId(): AbstractControl {
		return this.opportunityForm.get('OpportunityPropertyTypeId');
	}
	get CurrentLoanBalance(): AbstractControl {
		return this.opportunityForm.get('CurrentLoanBalance');
	}
	get ThirdPartyLoanBalance(): AbstractControl {
		return this.opportunityForm.get('ThirdPartyLoanBalance');
	}
	get NewLoanAmountField(): AbstractControl {
		return this.opportunityForm.get('NewLoanAmount');
	}
	get MonthlyPaymentField(): AbstractControl {
		return this.opportunityForm.get('MonthlyPayment');
	}

	get permissionOpportunitiesWrite() {
		return this.permissionsService.hasPermission(CRMOpportunities.Write);
	}
	get permissionRecordsRead() {
		return this.permissionsService.hasPermission(CRMRecords.Read);
	}
	get permissionPropertiesRead() {
		return this.permissionsService.hasPermission(CRMProperties.Read);
	}
	get permissionContactsRead() {
		return this.permissionsService.hasPermission(CRMContacts.Read);
	}
	get permissionSensitiveDataRead() {
		return this.permissionsService.hasPermission(CRMOpportunitySensitiveData.Read);
	}
	get permissionSensitiveDataWrite() {
		return this.permissionsService.hasPermission(CRMOpportunitySensitiveData.Write);
	}

	get BorrowersFormArray(): FormArray {
		return this.opportunityForm.get('Borrowers') as FormArray;
	}
	get CommercialBorrowersFormArray(): FormArray {
		return this.opportunityForm.get('CommercialBorrowers') as FormArray;
	}

	get isSensitiveFieldDisabled(): boolean {
		return this.isViewMode || !this.permissionSensitiveDataWrite;
	}

	isSensitiveFieldToggleButtonDisabled(borrowerId, fieldValue): boolean {
		return (
			!this.permissionSensitiveDataRead ||
			(!this.initialValues && !this.permissionSensitiveDataWrite) ||
			((borrowerId === null || borrowerId === EmptyGuid) && !fieldValue)
		);
	}

	invalidBorrowerName(borrowerIndex) {
		return (
			this.opportunityForm.errors &&
			this.opportunityForm.errors.notUniqueBorrower !== null &&
			this.opportunityForm.errors.notUniqueBorrower === borrowerIndex &&
			(this.opportunityForm.touched || this.opportunityForm.dirty)
		);
	}
}
