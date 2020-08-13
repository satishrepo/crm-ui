import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { FastEntity, GetDictionaryResponse, parseQueryString, ResponseList } from '@synergy/commonUI';

import { environment } from '../../../environments/environment';
import { DepartmentWithUsers, User } from '../models/dictionary.model';

@Injectable({
	providedIn: 'root',
})
export class DictionaryService {
	landingBaseUrl = `${environment.landingApi}/api/Dictionaries`;
	baseUrl = `${environment.crmApi}/api/Dictionaries`;
	underwritingUrl = `${environment.underwritingApi}/api/Dictionaries`;

	private cachedStates: FastEntity[];
	private cachedContactTypes: FastEntity[];
	private cachedLoanTypes: FastEntity[];
	private cachedOpportunityStages: FastEntity[];
	private cachedCounties: FastEntity[];
	private cachedDepartmentUsers: DepartmentWithUsers[];
	private cachedUsers: User[];
	private cachedPropertyTypes: FastEntity[];
	private cachedCollectingEntityTypes: FastEntity[];

	constructor(private httpClient: HttpClient) {}

	getStates(): Observable<FastEntity[]> {
		const params = parseQueryString({ offset: 0, limit: 51 });

		if (this.cachedStates && this.cachedStates.length !== 0) {
			return of(this.cachedStates);
		}

		return this.httpClient.get<GetDictionaryResponse>(`${this.landingBaseUrl}/states?${params}`).pipe(
			map(res => {
				this.cachedStates = res.List.slice().sort((a, b) => Number(a.Id) - Number(b.Id));
				return this.cachedStates;
			})
		);
	}

	getContactTypes(): Observable<FastEntity[]> {
		const params = parseQueryString({ offset: 0 });

		if (this.cachedContactTypes && this.cachedContactTypes.length !== 0) {
			return of(this.cachedContactTypes);
		}

		return this.httpClient.get<GetDictionaryResponse>(`${this.baseUrl}/ContactTypes?${params}`).pipe(
			map(res => {
				this.cachedContactTypes = res.List;
				return this.cachedContactTypes;
			})
		);
	}

	getLoanTypes(): Observable<FastEntity[]> {
		const params = parseQueryString({ offset: 0 });

		if (this.cachedLoanTypes && this.cachedLoanTypes.length !== 0) {
			return of(this.cachedLoanTypes);
		}

		return this.httpClient.get<GetDictionaryResponse>(`${this.baseUrl}/LoanTypes?${params}`).pipe(
			map(res => {
				this.cachedLoanTypes = res.List;
				return this.cachedLoanTypes;
			})
		);
	}

	getOpportunityStages(): Observable<FastEntity[]> {
		const params = parseQueryString({ offset: 0 });

		if (this.cachedOpportunityStages && this.cachedOpportunityStages.length !== 0) {
			return of(this.cachedOpportunityStages);
		}

		return this.httpClient.get<GetDictionaryResponse>(`${this.baseUrl}/OpportunityStages?${params}`).pipe(
			map(res => {
				this.cachedOpportunityStages = res.List;
				return this.cachedOpportunityStages;
			})
		);
	}

	getCounties(queryParams): Observable<any> {
		const params = parseQueryString(queryParams);

		return this.httpClient.get<any>(`${this.baseUrl}/Counties?${params}`).pipe(
			map(res => {
				return res;
			})
		);
	}

	getUsers(): Observable<User[]> {
		if (this.cachedUsers && this.cachedUsers.length !== 0) {
			return of(this.cachedUsers);
		}

		const defaultParams = { offset: '0', limit: '10000' };

		return this.httpClient.get<ResponseList<User>>(`${this.landingBaseUrl}/Users`, { params: defaultParams }).pipe(
			map(res => {
				this.cachedUsers = res.List;
				return this.cachedUsers;
			})
		);
	}

	getDepartmentUsers(): Observable<DepartmentWithUsers[]> {
		if (this.cachedDepartmentUsers && this.cachedDepartmentUsers.length !== 0) {
			return of(this.cachedDepartmentUsers);
		}

		return this.httpClient.get<ResponseList<DepartmentWithUsers>>(`${this.underwritingUrl}/departmentusers`).pipe(
			map(res => {
				this.cachedDepartmentUsers = res.List.map((dep: DepartmentWithUsers) => {
					dep.Users.sort((user1: FastEntity, user2: FastEntity) => {
						return user1.Name.localeCompare(user2.Name);
					});
					return dep;
				});
				return this.cachedDepartmentUsers;
			})
		);
	}

	getPropertyTypes(): Observable<FastEntity[]> {
		if (this.cachedPropertyTypes && this.cachedPropertyTypes.length !== 0) {
			return of(this.cachedPropertyTypes);
		}

		return this.httpClient.get<GetDictionaryResponse>(`${this.baseUrl}/PropertyTypes`).pipe(
			map(res => {
				this.cachedPropertyTypes = res.List;
				return this.cachedPropertyTypes;
			})
		);
	}

	getCollectingEntityTypes(): Observable<FastEntity[]> {
		if (this.cachedCollectingEntityTypes && this.cachedCollectingEntityTypes.length !== 0) {
			return of(this.cachedCollectingEntityTypes);
		}

		return this.httpClient.get<GetDictionaryResponse>(`${this.baseUrl}/collectingentitytypes`).pipe(
			map(res => {
				this.cachedCollectingEntityTypes = res.List;
				return this.cachedCollectingEntityTypes;
			})
		);
	}
}
