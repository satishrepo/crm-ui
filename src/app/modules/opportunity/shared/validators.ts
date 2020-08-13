import { FormArray, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

export const percentValidation = [
	Validators.min(0),
	Validators.max(100),
	Validators.pattern(/^100$|(^([1-9]([0-9])?|0)((\.[0-9]|[0-9]){1,2})?$)/),
];

export const onlyPositiveNumbers = [Validators.min(0), Validators.pattern(/^(\d*\.)?\d+$/)];

export const ssnPattern = /^\d{3,3}-\d{2,2}-\d{4,4}/;

export const emailPattern = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

export const phoneNumberPattern = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;

export const uniqueBorrowersNames: ValidatorFn = (form: FormGroup): ValidationErrors | null => {
	const borrowers = form.get('Borrowers') as FormArray;

	const notUniqueBorrower = borrowers.controls.findIndex((currentBorrower, borrowerIndex, borrowersArr) => {
		const currentBorrowerFirstName = currentBorrower.get('FirstName') && currentBorrower.get('FirstName').value;
		const currentBorrowerLastName = currentBorrower.get('LastName') && currentBorrower.get('LastName').value;
		return Boolean(
			borrowersArr.find((item, index) => {
				const itemFirstName = item.get('FirstName').value;
				const itemLastName = item.get('LastName').value;
				return (
					borrowerIndex !== index &&
					currentBorrowerFirstName &&
					currentBorrowerLastName &&
					itemFirstName &&
					itemLastName &&
					currentBorrowerFirstName !== '' &&
					currentBorrowerLastName !== '' &&
					itemFirstName !== '' &&
					itemLastName !== '' &&
					currentBorrowerFirstName.trim() === itemFirstName.trim() &&
					currentBorrowerLastName.trim() === itemLastName.trim()
				);
			})
		);
	});
	return notUniqueBorrower > -1 ? { notUniqueBorrower } : null;
};

export const requiredFirstAndLastNameForUnderFill: ValidatorFn = (borrower: FormGroup): ValidationErrors | null => {
	const borrowerValue = borrower.value;

	const filledFields = Object.keys(borrowerValue).filter(field => {
		return (
			field !== 'Order' &&
			field !== 'Id' &&
			(borrowerValue[field] && borrowerValue[field].hasOwnProperty('status')
				? !!borrowerValue[field]['value']
				: !!borrowerValue[field])
		);
	});

	return filledFields &&
		filledFields.length > 0 &&
		(filledFields.indexOf('FirstName') === -1 || filledFields.indexOf('LastName') === -1)
		? { requiredFirstAndLastNameForUnderFill: true }
		: null;
};
