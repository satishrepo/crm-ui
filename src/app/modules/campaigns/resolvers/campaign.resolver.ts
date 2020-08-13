import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { forkJoin, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { DictionaryService } from './../../../shared/services/dictionary.service';
import { DEPARTMENT_IDS, DepartmentWithUsers } from 'src/app/shared/models/dictionary.model';
import { CampaignService } from '../services/campaign.service';
import { CampaignResolver } from '../models/campaign.model';

@Injectable({
	providedIn: 'root',
})
export class CampaignDictionariesResolver implements Resolve<any> {
	constructor(private dictionaryService: DictionaryService, private campaignService: CampaignService) {}

	resolve() {
		return forkJoin(
			this.dictionaryService.getUsers(),
			this.dictionaryService.getDepartmentUsers(),
			this.dictionaryService.getStates(),
			this.campaignService.getCampaignTypes(),
			this.campaignService.getGeneralLandUseCodes()
		).pipe(
			map(
				(dictionaries: any): CampaignResolver => {
					return {
						Users: dictionaries[0],
						LoanDepartment: dictionaries[1].find(
							(department: DepartmentWithUsers) => department.Id === DEPARTMENT_IDS.LoanOfficers
						),
						States: dictionaries[2],
						CampaignTypes: dictionaries[3].List,
						GeneralLandUseCodes: dictionaries[4],
					};
				}
			),
			catchError(error => throwError(error))
		);
	}
}
