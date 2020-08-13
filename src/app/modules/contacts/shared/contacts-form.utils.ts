import { FastEntity } from '@synergy/commonUI';

import { Contact } from '../models/contacts.model';
import { Lead } from '../../leads/models/lead.model';

export const parseSingleLeadAsFastEntity = (lead: Lead) => ({
	Id: lead.Id,
	Name: lead.AccountName,
});

export const parseLeadsAsFastEntity = (leads: Lead[]): FastEntity[] => leads.map(parseSingleLeadAsFastEntity);

export const getFixedFastEntityName = stateValue => {
	let fixedStateName = stateValue;

	if (typeof fixedStateName === 'object' && fixedStateName !== null && fixedStateName.hasOwnProperty('Name')) {
		fixedStateName = stateValue['Name'];
	}
	return fixedStateName;
};

export const parseFormValues = (values: Contact, states: FastEntity[]) => {
	let StateId = null;
	let LeadId = null;

	if (values) {
		if (values.Address && values.Address.State) {
			const state = values.Address.State;
			if (typeof state === 'string') {
				const selectedState = states.find(item => state === item.Name);
				StateId = typeof selectedState !== 'undefined' ? selectedState.Id : null;
			} else if (typeof state === 'object' && state !== null) {
				StateId = state.Id;
			}
		}

		if (values.Lead && values.Lead.Id) {
			LeadId = values.Lead.Id;
		}
	}

	return {
		...values,
		LeadId,
		Address: {
			...values.Address,
			StateId,
		},
	};
};
