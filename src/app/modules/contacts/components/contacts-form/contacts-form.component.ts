import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChange, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { debounceTime, mergeMap, startWith } from 'rxjs/operators';

import {
	CRMContacts,
	CRMRecords,
	FastEntity,
	PermissionsService,
	scrollToFormError,
	LoggerService,
	getErrorMessage,
	MaskPhoneFormat,
} from '@synergy/commonUI';

import { Contact } from '../../models/contacts.model';
import { getFixedFastEntityName, parseFormValues, parseLeadsAsFastEntity } from '../../shared/contacts-form.utils';
import { stateFromListValidator } from '../../shared/contacts-form.validators';
import { DictionaryService } from '../../../../shared/services/dictionary.service';
import { ContactsService } from '../../services/contacts.service';
import { LeadsService } from '../../../leads/services/leads.service';
import { phoneNumberPattern, emailPattern } from '../../../opportunity/shared/validators';

@Component({
	selector: 'app-contacts-form',
	templateUrl: './contacts-form.component.html',
	styleUrls: ['./contacts-form.component.scss'],
})
export class ContactsFormComponent implements OnInit, OnChanges {
	@Input() contactId: string;
	@Input() preselectedLead: FastEntity;
	@Input() preselectedLeadReadOnly: boolean;
	@Output() closeDialog = new EventEmitter();
	@Output() setLeadId = new EventEmitter();
	initialValues: Contact;
	recordLink: FastEntity | null = null;

	contactTypesOptions: FastEntity[] = [];
	statesOptions: FastEntity[] = [];
	filteredStates: FastEntity[];

	leadOptions: FastEntity[] = [];
	leadsOptionsOffset = 0;
	leadsOptionsLimit = 50;

	contactsForm: FormGroup;

	isViewMode = false;
	isLoading = true;
	isLoadingLeadOptions = false;

	phoneMask = MaskPhoneFormat;

	constructor(
		private fb: FormBuilder,
		private contactsService: ContactsService,
		private dictionaryService: DictionaryService,
		private permissionsService: PermissionsService,
		private leadsService: LeadsService,
		private loggerService: LoggerService
	) {}

	private _setInitialValues(fieldName: string, subField?: string): string {
		let initialValue = '';
		if (this.initialValues && typeof this.initialValues[fieldName] !== 'undefined') {
			initialValue = subField ? this.initialValues[fieldName][subField] : this.initialValues[fieldName];
			if (initialValue && initialValue['Id']) {
				initialValue = initialValue['Id'];
			}
		}
		return initialValue;
	}

	ngOnInit() {
		this.contactsForm = this.fb.group({
			Lead: [{ value: '', disabled: this.isViewMode }],

			FirstName: [{ value: '', disabled: this.isViewMode }],
			MiddleName: [{ value: '', disabled: this.isViewMode }],
			LastName: [{ value: '', disabled: this.isViewMode }],
			Type: [{ value: '', disabled: this.isViewMode }],

			Title: [{ value: '', disabled: this.isViewMode }],

			CellPhone: [{ value: '', disabled: this.isViewMode }, Validators.pattern(phoneNumberPattern)],
			OfficePhone: [{ value: '', disabled: this.isViewMode }, Validators.pattern(phoneNumberPattern)],
			Email: [{ value: '', disabled: this.isViewMode }, Validators.pattern(emailPattern)],
			Address: this.fb.group({
				State: [{ value: '', disabled: this.isViewMode }],
				City: [{ value: '', disabled: this.isViewMode }],
				Address1: [{ value: '', disabled: this.isViewMode }],
				Address2: [{ value: '', disabled: this.isViewMode }],
				Address3: [{ value: '', disabled: this.isViewMode }],
				Zip: [{ value: '', disabled: this.isViewMode }],
			}),
		});

		this.State.valueChanges.subscribe(state => {
			this.filteredStates = state ? this._filterStates(state) : this.statesOptions;
		});

		if (typeof this.contactId === 'undefined') {
			this.Lead.valueChanges
				.pipe(
					startWith(''),
					debounceTime(300)
				)
				.subscribe(lead => {
					const leadVal = encodeURIComponent(getFixedFastEntityName(lead));

					this.fetchLeads(leadVal);
				});

			this._fetchFormDictionary().subscribe(([states, contactTypes]) => {
				this.statesOptions = states;
				this.filteredStates = states;
				this.contactTypesOptions = contactTypes;

				this.State.setValidators(stateFromListValidator(this.statesOptions));

				this.isLoading = false;
			});
		}

		if (typeof this.preselectedLead !== 'undefined') {
			this.Lead.patchValue(this.preselectedLead);
		}
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
				this.leadOptions = parseLeadsAsFastEntity(res.List);
				this.isLoadingLeadOptions = false;
			});
	}

	ngOnChanges(changes: SimpleChanges) {
		const contactId: SimpleChange = changes.contactId;

		if (contactId && contactId.previousValue !== contactId.currentValue) {
			this.isLoading = true;

			this._fetchFormDictionary()
				.pipe(
					mergeMap(([states, contactTypes]) => {
						this.statesOptions = states;
						this.filteredStates = states;

						this.contactTypesOptions = contactTypes;

						return this.contactsService.getItemById(this.contactId);
					})
				)
				.subscribe(contact => {
					this.initialValues = contact;
					this.recordLink = contact.Lead;
					this.setLeadId.emit(contact.Lead.Id);

					this._setUpForm();

					if (!this.isViewMode) {
						this.toggleViewMode();
					}
					this.isLoading = false;
				});
		}
	}

	private _fetchFormDictionary() {
		return forkJoin(this.dictionaryService.getStates(), this.dictionaryService.getContactTypes());
	}

	get Lead() {
		return this.contactsForm.get('Lead');
	}

	get State() {
		return this.contactsForm.get('Address').get('State');
	}

	private _setContactsValues() {
		this.contactsForm.patchValue({
			Lead: this.initialValues.Lead,

			FirstName: this._setInitialValues('FirstName'),
			MiddleName: this._setInitialValues('MiddleName'),
			LastName: this._setInitialValues('LastName'),
			Type: this._setInitialValues('Type'),

			Title: this._setInitialValues('Title'),

			CellPhone: this._setInitialValues('CellPhone'),
			OfficePhone: this._setInitialValues('OfficePhone'),
			Email: this._setInitialValues('Email'),
			Address: {
				State: this.initialValues.Address.State,
				City: this._setInitialValues('Address', 'City'),
				Address1: this._setInitialValues('Address', 'Address1'),
				Address2: this._setInitialValues('Address', 'Address2'),
				Address3: this._setInitialValues('Address', 'Address3'),
				Zip: this._setInitialValues('Address', 'Zip'),
			},
		});
	}

	private _setUpForm() {
		this._setContactsValues();
		this.State.setValidators(stateFromListValidator(this.statesOptions));
	}

	private _filterStates(value): FastEntity[] {
		const filterValue = getFixedFastEntityName(value).toLowerCase();

		return this.statesOptions.filter(state => state.Name.toLowerCase().indexOf(filterValue) === 0);
	}

	formSubmitHandler() {
		if (this.contactsForm.invalid) {
			scrollToFormError();
			return;
		}
		const parsedValues = parseFormValues(this.contactsForm.value, this.statesOptions);

		this.isLoading = true;

		if (this.contactId) {
			this.contactsService.updateContacts(this.contactId, parsedValues).subscribe(
				() => {
					this.loggerService.success('Contact is successfully updated!');

					this.toggleViewMode();
					this._setUpdatedInitialValues();

					this.isLoading = false;
				},
				err => {
					this.loggerService.error(getErrorMessage(err));
					this.isLoading = false;
				}
			);
		} else {
			this.contactsService.createContacts(parsedValues).subscribe(
				res => {
					this.loggerService.success('Contact is successfully created!');

					this.closeDialog.emit({
						...parsedValues,
						Type: this.contactTypesOptions.find(item => item.Id === this.contactsForm.value.Type),
						Id: res,
					});
					this.isLoading = false;
				},
				err => {
					this.loggerService.error(getErrorMessage(err));

					if (err.error && err.error.LeadId) {
						this.Lead.setErrors({ invalidLeadId: true });
					}
					this.isLoading = false;
				}
			);
		}
	}

	private _setUpdatedInitialValues() {
		this.initialValues = {
			...this.contactsForm.value,
			Type: this.contactTypesOptions.find(item => item.Id === this.contactsForm.value.Type),
		};
	}

	displayFastEntity(fastEntity?: FastEntity): string | undefined {
		return fastEntity ? fastEntity.Name : undefined;
	}

	toggleViewMode() {
		this.isViewMode ? this.contactsForm.enable() : this.contactsForm.disable();
		this.isViewMode = !this.isViewMode;
	}

	resetFormHandler() {
		if (this.contactId) {
			this._setContactsValues();
			this.toggleViewMode();
			this.contactsForm.markAsPristine();
			this.contactsForm.markAsUntouched();
		} else {
			this.closeDialog.emit();
		}
	}

	get permissionContactsWrite() {
		return this.permissionsService.hasPermission(CRMContacts.Write);
	}
	get permissionRecordsRead() {
		return this.permissionsService.hasPermission(CRMRecords.Read);
	}
}
