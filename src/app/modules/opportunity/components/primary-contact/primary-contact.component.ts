import { Component, Input, OnInit } from '@angular/core';
import { ParsedContact } from '../../../contacts/models/contacts.model';

@Component({
	selector: 'app-primary-contact',
	templateUrl: './primary-contact.component.html',
	styleUrls: ['./primary-contact.component.scss'],
})
export class PrimaryContactComponent implements OnInit {
	@Input() contact: ParsedContact;

	constructor() {}

	ngOnInit() {}
}
