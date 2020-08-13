import { FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

export const requiredIfChecked: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
	const rowChecked = control.get('Checked');
	const rowValue = control.get('Value');
	return rowChecked &&
		rowValue &&
		rowChecked.value &&
		(rowValue.value === '' || typeof rowValue.value === 'undefined' || rowValue.value === null)
		? { selectedRowRequired: true }
		: null;
};

export const atLeastOneChecked: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
	return typeof control.get('RuleItems').value.find(item => item.Checked) !== 'undefined'
		? null
		: { noRulesSelected: true };
};
