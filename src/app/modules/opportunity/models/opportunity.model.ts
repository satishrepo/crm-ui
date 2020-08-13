import { Property } from '../../property/models/property.model';
import { FastEntity } from '@synergy/commonUI';
import { Contact } from '../../contacts/models/contacts.model';
import { User } from 'src/app/shared/models/dictionary.model';

export interface Borrower {
	SSN: SensitiveData;
	IsMarried: boolean;
	DayOfBirth: SensitiveData;
	Id: string;
	FirstName: string;
	LastName: string;
	MiddleName: string;
	Email: string;
	CellPhone: string;
	WorkPhone: string;
	Fax: string;
	Order: number;
}

export interface SensitiveData {
	value: string;
	status: SensitiveDataFieldStatuses;
	isChanged: boolean;
}

export enum SensitiveDataFieldStatuses {
	hidden = 'hidden',
	visible = 'visible',
	loading = 'loading',
}

export enum SensitiveDataFields {
	SSN = 'SSN',
	DayOfBirth = 'DayOfBirth',
	TaxId = 'TaxId',
}

export interface SensitiveDataUpdateModel {
	Order?: number;
	Id: string;
	SSN: string;
	DayOfBirth: string;
	TaxIdNumber: string;
	IsSSNChanged: boolean;
	IsDayOfBirthChanged: boolean;
	IsTaxIdNumberChanged: boolean;
}

export interface CommercialBorrower {
	EntityName: string;
	TaxIdNumber: SensitiveData;
	Title: string;
	Id: string;
	FirstName: string;
	LastName: string;
	MiddleName: string;
	Email: string;
	CellPhone: string;
	WorkPhone: string;
	Fax: string;
	Order: number;
}

export interface Opportunity {
	PropertyAmount?: number;
	CalculatedAmountDue?: number;
	PropertyType?: any;

	OpportunityPropertyTypeId: number;
	CloseDate: string;
	LoanToValuePercent: number;
	Properties: Property[];
	LoanOfficer: FastEntity;
	LoanType?: any;
	Stage?: any;
	AmountDue: number;
	CampaignId: string;
	Contact?: any;
	Lead?: any;
	OpportunityNumber: string;
	Year: string;
	Id: string;
	PrePay: number;
	Term: number;
	ThirdPartyLoanBalance: number;
	CurrentLoanBalance: number;
	InterestRate: number;
	LenderCredit: number;
	ClosingCost: number;
	OriginationPercent: number;
	CloseProbabilityPercent: number;
	Borrowers: Borrower[];
	CommercialBorrowers: CommercialBorrower[];
	FirstBorrowerName?: string;
	SecondBorrowerName?: string;
	LeadId?: string;
	UserId?: any;
	PropertyIds?: string[];
	ContactId?: string;
}

export interface OpportunitiesApiQueryParams {
	fullSearch?: string;
	limit?: number;
	offset?: number;
	'Filter.LeadIds'?: string[];
	sortField: string;
	sortOrder: string;
}

export interface OpportunitiesApi {
	TotalCount: number;
	List: Opportunity[];
}

export interface OpportunitiesHeaderCol {
	title: string;
	field: string;
}

export enum LOAN_TYPES {
	New = 1,
	NewConsolidation,
	Refi,
	RefiConsolidation,
	Syl,
	SylConsolidation,
}

export enum PROPERTY_TYPES {
	ResidentialOwnerOccupied = 1,
	ResidentialNonOwnerOccupied,
	CommercialIndividuallyOwned,
	CommercialEntityOwned,
	CommercialLand,
}

export interface ContactOpportunityOption {
	Id: string;
	Name: string;
	originalContact: Contact;
}

export interface OpportunityDictionaries {
	LoanTypes: FastEntity[];
	OpportunityStages: FastEntity[];
	PropertyTypes: FastEntity[];
	Users: User[];
}
