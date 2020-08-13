import { AbstractControl, ValidatorFn } from '@angular/forms';

import { FastEntity } from '@synergy/commonUI';

import { getFixedFastEntityName } from './contacts-form.utils';

export function stateFromListValidator(states: FastEntity[]): ValidatorFn {
	return (control: AbstractControl): { [key: string]: any } | null => {
		const fixedValue = getFixedFastEntityName(control.value);
		const isFieldEmpty = fixedValue === null || fixedValue === '';

		let selectedState;

		if (!isFieldEmpty) {
			selectedState = states.find(item => item.Name === fixedValue);
		}

		return typeof selectedState !== 'undefined' || isFieldEmpty
			? null
			: { stateNotInTheList: { value: control.value } };
	};
}
