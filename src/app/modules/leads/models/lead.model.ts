import { Contact } from '../../contacts/models/contacts.model';

export interface Lead {
	CreatedOn?: string;
	CreatedBy?: {
		Id?: string;
		Name?: string;
	};
	ModifiedOn?: string;
	ModifiedBy?: {
		Id?: string;
		Name?: string;
	};
	DeletedOn?: string;
	DoNotContact?: boolean;
	Contacts?: Contact[];
	Id: string;
	AccountName: string;
	Address?: {
		State?: {
			Id: number;
			Name: string;
		};
		City?: string;
		Address1?: string;
		Address2?: string;
		Address3?: string;
		Zip?: string;
	};
}

export interface LeadsApiQueryParams {
	fullSearch?: string;
	limit?: number;
	offset?: number;
	'Filter.LeadIds'?: string[];
	sortField: string;
	sortOrder: string;
}

export interface LeadsApi {
	TotalCount: number;
	List: Lead[];
}

export interface LeadsHeaderCol {
	title: string;
	field: string;
}
