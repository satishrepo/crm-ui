import { TestBed } from '@angular/core/testing';

import { OpportunitiesService } from './opportunities.service';

describe('OpportunitiesService', () => {
	beforeEach(() => TestBed.configureTestingModule({}));

	it('should be created', () => {
		const service: OpportunitiesService = TestBed.get(OpportunitiesService);
		expect(service).toBeTruthy();
	});
});
