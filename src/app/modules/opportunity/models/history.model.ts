import { ColumnDef } from 'mat-virtual-table';

import { FastEntity } from '@synergy/commonUI';

export interface HistoryColumnCell extends ColumnDef {
	type: string;
}

export enum BorrowerTypes {
	OpportunityBorrower = 1,
	OpportunityCommercialBorrower,
}

export interface BorrowerHistory {
	BorrowerOrder: number;
	BorrowerType: BorrowerTypes;
}

export interface OpportunityHistory {
	Borrower?: BorrowerHistory;
	Field: number;
	LastUpdate: string;
	NewValue: string;
	NewValues: string;
	PreviousValue: string;
	PreviousValues: string;
	UpdatedBy: string;
	UpdatedByUserName?: string;
	FieldName?: string;
}

export interface HistoryDictionaries {
	Users: FastEntity[];
	OpportunityStages: FastEntity[];
	PropertyTypes: FastEntity[];
	LoanTypes: FastEntity[];
}

export enum FIELD_FORMAT {
	Date = 1,
	Currency,
	Percent,
	Phone,
}

export interface HistoryReviewFieldDescriptor {
	name?: string;
	commercialBorrowerName?: string;
	format?: FIELD_FORMAT;
}

export enum OpportunityHistoryFields {
	BorrowerName = 1,
	BorrowerSSN,
	BorrowerEmail,
	BorrowerCellPhone,
	BorrowerWorkPhone,
	BorrowerFax,
	BorrowerMarialStatus,
	BorrowerDateOfBirth,
	BorrowerTitle,
	BorrowerEntityName,
	BorrowerTaxIdNumber,
	CloseDate,
	CloseProbabilityPercent,
	Stage,
	LoanType,
	OriginationPercent,
	ClosingCost,
	LenderCredit,
	AmountDue,
	InterestRate,
	Term,
	PrePay,
	CurrentLoanBalance,
	ThirdPartyLoanBalance,
	PropertyType,
	PropertyAddress,
	PrimaryContactName,
}

export const HistoryFields: { [field: string]: HistoryReviewFieldDescriptor } = {
	[OpportunityHistoryFields.BorrowerName]: {
		name: 'Borrower Name',
		commercialBorrowerName: 'Authorized Signor Name',
	},
	[OpportunityHistoryFields.BorrowerSSN]: {
		name: 'Borrower SSN',
	},
	[OpportunityHistoryFields.BorrowerEmail]: {
		name: 'Borrower Email',
		commercialBorrowerName: 'Authorized Signor Email',
	},
	[OpportunityHistoryFields.BorrowerCellPhone]: {
		name: 'Borrower Cell Phone',
		commercialBorrowerName: 'Authorized Signor Cell phone',
		format: FIELD_FORMAT.Phone,
	},
	[OpportunityHistoryFields.BorrowerWorkPhone]: {
		name: 'Borrower Work Phone',
		commercialBorrowerName: 'Authorized Signor Office phone',
		format: FIELD_FORMAT.Phone,
	},
	[OpportunityHistoryFields.BorrowerFax]: {
		name: 'Borrower Fax',
		commercialBorrowerName: 'Authorized Signor Fax',
		format: FIELD_FORMAT.Phone,
	},
	[OpportunityHistoryFields.BorrowerMarialStatus]: {
		name: 'Borrower Marital Status',
	},
	[OpportunityHistoryFields.BorrowerDateOfBirth]: {
		name: 'Borrower Date Of Birth',
	},
	[OpportunityHistoryFields.BorrowerTitle]: {
		name: 'Borrower Title',
		commercialBorrowerName: 'Authorized Signor Title',
	},
	[OpportunityHistoryFields.BorrowerEntityName]: {
		name: 'Borrower Entity Name',
		commercialBorrowerName: 'Commercial Entity Borrower Entity Name',
	},
	[OpportunityHistoryFields.BorrowerTaxIdNumber]: {
		name: 'Borrower Tax Id',
		commercialBorrowerName: 'Commercial Entity Borrower TAX ID#',
	},
	[OpportunityHistoryFields.CloseDate]: {
		name: 'Close Date',
	},
	[OpportunityHistoryFields.CloseProbabilityPercent]: {
		name: 'Close Probability Percent',
		format: FIELD_FORMAT.Percent,
	},
	[OpportunityHistoryFields.Stage]: {
		name: 'Stage',
	},
	[OpportunityHistoryFields.LoanType]: {
		name: 'Loan Type',
	},
	[OpportunityHistoryFields.OriginationPercent]: {
		name: 'Origination Percent',
		format: FIELD_FORMAT.Percent,
	},
	[OpportunityHistoryFields.ClosingCost]: {
		name: 'Closing Cost',
		format: FIELD_FORMAT.Currency,
	},
	[OpportunityHistoryFields.LenderCredit]: {
		name: 'Lender Credit',
		format: FIELD_FORMAT.Currency,
	},
	[OpportunityHistoryFields.AmountDue]: {
		name: 'Amount Due',
		format: FIELD_FORMAT.Currency,
	},
	[OpportunityHistoryFields.InterestRate]: {
		name: 'Interest Rate',
		format: FIELD_FORMAT.Percent,
	},
	[OpportunityHistoryFields.Term]: {
		name: 'Term',
	},
	[OpportunityHistoryFields.PrePay]: {
		name: 'Pre Pay',
		format: FIELD_FORMAT.Currency,
	},
	[OpportunityHistoryFields.CurrentLoanBalance]: {
		name: 'Current Loan Balance',
	},
	[OpportunityHistoryFields.ThirdPartyLoanBalance]: {
		name: 'Third Party Loan Balance',
	},
	[OpportunityHistoryFields.PropertyType]: {
		name: 'Property Type',
	},
	[OpportunityHistoryFields.PropertyAddress]: {
		name: 'Properties',
	},
	[OpportunityHistoryFields.PrimaryContactName]: {
		name: 'Primary Contact Name',
	},
};
