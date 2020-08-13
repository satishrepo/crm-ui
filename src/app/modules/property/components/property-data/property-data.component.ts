import { Component, OnInit, Input } from '@angular/core';

import { CRMContacts, PermissionsService, MaskPhoneFormat } from '@synergy/commonUI';

import { Property } from '../../models/property.model';

@Component({
	selector: 'app-property-data',
	templateUrl: './property-data.component.html',
	styleUrls: ['./property-data.component.scss'],
})
export class PropertyDataComponent implements OnInit {
	@Input() selectedProperty: Property;
	taxDelinquencyColumns: string[] = ['Year', 'CollectingEntity', 'AmountDue'];
	valuationsColumns: string[] = ['Year', 'LandValue', 'ImprovementValue', 'AppraisedValue'];

	booleanSelectOptions: {
		Id: boolean;
		Name: string;
	}[] = [
		{
			Id: true,
			Name: 'Yes',
		},
		{
			Id: false,
			Name: 'No',
		},
	];

	phoneMask = MaskPhoneFormat;

	constructor(private permissionsService: PermissionsService) {}

	ngOnInit() {}

	getTaxTotalAmount() {
		return this.selectedProperty && this.selectedProperty.TaxDelinquencies.length
			? this.selectedProperty.TaxDelinquencies.map(t => t.AmountDue).reduce((acc, value) => acc + value, 0)
			: 0;
	}

	get permissionContactsRead() {
		return this.permissionsService.hasPermission(CRMContacts.Read);
	}
}
