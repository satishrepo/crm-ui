import { FastEntity } from '@synergy/commonUI';

export interface Property {
	Id: string;
	LeadId?: string;
	Lead: FastEntity;
	County?: FastEntity;
	GeneralLandUseCode?: FastEntity;
	ParcelId?: string;
	CadId?: string;
	TaxId?: string;
	LegalDescription?: string;
	LandStateCode?: string;
	ImprovementStateCode?: string;
	LandUseCode?: string;
	Address?: PropertyAddress;
	SurvivingSpouse?: boolean;
	DisabilityExemption?: boolean;
	Mortgage?: boolean;
	PaymentPlan?: boolean;
	Veteran?: boolean;
	Bankruptcy?: boolean;
	ThirdPartyForeclosure?: boolean;
	AmountDue?: number;
	AppraisedValue?: number;
	LatestYearDue?: number;
	Valuations?: Valuation[];
	TaxDelinquencies?: TaxDelinquency[];
	TaxDelinquenciesList?: TaxDelinquencyList[];
	Contacts?: Contact[];
}

interface PropertyAddress {
	State?: FastEntity;
	City?: string;
	Address1?: string;
	Address2?: string;
	Address3?: string;
	Zip?: string;
}

interface Contact {
	Type?: string;
	Name?: string;
	Title?: string;
	CellPhone?: string;
	OfficePhone?: string;
	Email?: string;
}

export interface TaxDelinquency {
	Year?: number;
	CollectingEntities?: CollectingEntity[];
	AmountDue?: number;
}

interface TaxDelinquencyList {
	Year: number;
	CollectinyEntity: FastEntity;
	AmountDue: number;
}

interface CollectingEntity {
	Id: string;
	CollectingEntityTypeId: number;
	AmountDue: number;
}

interface Valuation {
	Year?: number;
	LandValue?: number;
	ImprovementValue?: number;
	AppraisedValue?: number;
}

export interface PropertiesApiQueryParams {
	fullSearch?: string;
	limit?: number;
	offset?: number;
	'Filter.LeadIds'?: string[];
	sortField?: string;
	sortOrder?: string;
}

export interface PropertiesApi {
	TotalCount: number;
	List: Property[];
}

export interface PropertiesHeaderCol {
	title: string;
	field: string;
}

export interface PropertyDictionaries {
	CollectingEntityTypes: FastEntity[];
}
