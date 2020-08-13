import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { forkJoin, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { DictionaryService } from './../../../shared/services/dictionary.service';

@Injectable({
	providedIn: 'root',
})
export class LeadDictionariesResolver implements Resolve<any> {
	constructor(private dictionaryService: DictionaryService) {}

	resolve() {
		return forkJoin(
			this.dictionaryService.getLoanTypes(),
			this.dictionaryService.getOpportunityStages(),
			this.dictionaryService.getPropertyTypes()
		).pipe(
			map((dictionaries: any) => {
				return {
					LoanTypes: dictionaries[0],
					OpportunityStages: dictionaries[1],
					PropertyTypes: dictionaries[2],
				};
			}),
			catchError(error => throwError(error))
		);
	}
}
