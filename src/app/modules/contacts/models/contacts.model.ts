import { FastEntity } from '@synergy/commonUI';

export interface HeaderCol {
	title: string;
	field: string;
	type: 'string' | 'currency' | 'date' | 'template' | 'phone';
	sortField?: string;
	sortDisabled?: boolean;
}
export interface Contact {
	Id: string;
	Lead: FastEntity;
	Type: FastEntity;
	FirstName: string;
	LastName: string;
	MiddleName: string;
	Title: string;
	CellPhone: string;
	OfficePhone: string;
	Email: string;
	Address: {
		State: FastEntity;
		City: string;
		Address1: string;
		Address2: string;
		Address3: string;
		Zip: string;
	};
}

export interface ContactDataCell {
	Id: string;
	Lead: string;
	Type: string;
	FirstName: string;
	LastName: string;
	MiddleName: string;
	Title: string;
	CellPhone: string;
	OfficePhone: string;
	Email: string;
	Address: {
		State: string;
		City: string;
		Address1: string;
		Address2: string;
		Address3: string;
		Zip: string;
	};
}

export interface ParsedContact {
	Id: string;
	Lead: string;
	Type: string;
	FirstName: string;
	LastName: string;
	MiddleName: string;
	Title: string;
	CellPhone: string;
	OfficePhone: string;
	Email: string;
	Address: {
		State: string;
		City: string;
		Address1: string;
		Address2: string;
		Address3: string;
		Zip: string;
	};
}

export interface ContactDataCell {
	Id: string;
	Lead: string;
	Type: string;
	FirstName: string;
	LastName: string;
	MiddleName: string;
	Title: string;
	CellPhone: string;
	OfficePhone: string;
	Email: string;
}

export interface ContactsApi {
	List: Contact[];
	TotalCount: number;
}
export interface ContactsApiQueryParams {
	fullSearch?: string;
	limit?: number;
	offset?: number;
	'Filter.LeadIds'?: string[];
	sortField: string;
	sortOrder: string;
}

export interface OpenCreateDialogData {
	lead: FastEntity;
	leadReadOnly: boolean;
	result?: string;
}
