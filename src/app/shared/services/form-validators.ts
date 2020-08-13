import { AbstractControl, ValidatorFn } from '@angular/forms';

export function ValidateFastEntity(): ValidatorFn {
	return (control: AbstractControl): { [key: string]: any } | null => {
		const fastEntityId = typeof control.value === 'object' && control.value !== null && control.value.Id;
		return fastEntityId ? null : { notFastEntity: { value: control.value } };
	};
}
