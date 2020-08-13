import { TestBed } from '@angular/core/testing';

import { ContactsService } from './contacts.service';
import { HttpClientModule } from '@angular/common/http';

describe('ContactsService', () => {
	beforeEach(() =>
		TestBed.configureTestingModule({
			imports: [HttpClientModule],
		})
	);

	it('should be created', () => {
		const service: ContactsService = TestBed.get(ContactsService);
		expect(service).toBeTruthy();
	});
});
