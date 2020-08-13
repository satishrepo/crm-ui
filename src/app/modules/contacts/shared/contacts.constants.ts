import { HeaderCol } from '../models/contacts.model';

export const CONTACTS_SEARCH_HEADER_COLS: HeaderCol[] = [
	{
		title: 'Contact Type',
		field: 'Type',
		type: 'string',
		sortField: 'ContactType',
	},
	{
		title: 'First Name',
		field: 'FirstName',
		type: 'string',
		sortDisabled: true,
	},
	{
		title: 'Last Name',
		field: 'LastName',
		type: 'string',
		sortField: 'Name',
	},
	{
		title: 'Title',
		field: 'Title',
		type: 'string',
	},
	{
		title: 'Сell Phone',
		field: 'CellPhone',
		type: 'phone',
	},
	{
		title: 'Office Phone',
		field: 'OfficePhone',
		type: 'phone',
		sortField: 'WorkPhone',
	},
	{
		title: 'Email',
		field: 'Email',
		type: 'string',
	},
];
