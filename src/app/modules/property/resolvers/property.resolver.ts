import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { forkJoin, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { DictionaryService } from './../../../shared/services/dictionary.service';

@Injectable({
	providedIn: 'root',
})
export class PropertyDictionariesResolver implements Resolve<any> {
	constructor(private dictionaryService: DictionaryService) {}

	resolve() {
		return forkJoin(this.dictionaryService.getCollectingEntityTypes()).pipe(
			map((dictionaries: any) => {
				return {
					CollectingEntityTypes: dictionaries[0],
				};
			}),
			catchError(error => throwError(error))
		);
	}
}
