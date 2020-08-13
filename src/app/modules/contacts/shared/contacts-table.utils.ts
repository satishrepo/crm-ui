import { Contact, ContactDataCell } from '../models/contacts.model';

export const parseContactsTableData = (items: Contact[]): ContactDataCell[] =>
	items.map((item: Contact) => {
		const { Type, Lead, ...rest } = item;

		return {
			...rest,
			Lead: Lead.Name,
			Type: Type.Name,
			Address: {
				...item.Address,
				State: item.Address.State && item.Address.State.Name,
			},
		};
	});
