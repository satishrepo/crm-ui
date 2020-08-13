import { HistoryColumnCell } from '../models/history.model';

export const HistoryColumns: HistoryColumnCell[] = [
	{
		title: 'Username',
		field: 'UpdatedBy',
		type: 'string',
		isSortable: false,
	},
	{
		title: 'Date/Time',
		field: 'LastUpdate',
		type: 'date',
		isSortable: false,
	},
	{
		title: 'Field',
		field: 'FieldName',
		type: 'string',
		isSortable: false,
	},
	{
		title: 'Previous Value',
		field: 'PreviousValue',
		type: 'string',
		isSortable: false,
	},
	{
		title: 'New Value',
		field: 'NewValue',
		type: 'string',
		isSortable: false,
	},
];
