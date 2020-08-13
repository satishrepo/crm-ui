import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { forkJoin, throwError } from 'rxjs';

import { DictionaryService } from '../../../shared/services/dictionary.service';
import { map, catchError } from 'rxjs/operators';
import { OpportunityDictionaries } from '../models/opportunity.model';
import { FastEntity } from '@synergy/commonUI';

@Injectable()
export class OpportunityDictionariesResolver implements Resolve<any> {
	constructor(private dictionaryService: DictionaryService) {}

	resolve() {
		return forkJoin(
			this.dictionaryService.getLoanTypes(),
			this.dictionaryService.getOpportunityStages(),
			this.dictionaryService.getPropertyTypes(),
			this.dictionaryService.getUsers()
		).pipe(
			map(
				(dictionaries): OpportunityDictionaries => {
					return {
						LoanTypes: dictionaries[0],
						OpportunityStages: dictionaries[1],
						PropertyTypes: dictionaries[2],
						Users: dictionaries[3],
					};
				}
			),
			catchError(error => throwError(error))
		);
	}
}
