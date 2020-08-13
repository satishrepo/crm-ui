import { FastEntity } from '@synergy/commonUI';

export enum DEPARTMENT_IDS {
	Data = 1,
	Accounting,
	Management,
	Acquisition,
	AssetManagement,
	Underwriting,
	LoanOfficers,
}

export const DEPARTMENT_NAME_BY_ID = {
	[DEPARTMENT_IDS.Data]: 'Data',
	[DEPARTMENT_IDS.Accounting]: 'Accounting',
	[DEPARTMENT_IDS.Management]: 'Management',
	[DEPARTMENT_IDS.Acquisition]: 'Acquisition',
	[DEPARTMENT_IDS.AssetManagement]: 'Asset Management',
	[DEPARTMENT_IDS.Underwriting]: 'Underwriting',
	[DEPARTMENT_IDS.LoanOfficers]: 'Loan Officers',
};

export interface DepartmentUserModel {
	DepartmentId: number;
	UserId: any;
}

export interface DepartmentWithUsers {
	Id: DEPARTMENT_IDS;
	Name: string;
	DisplayName: string;
	Users: FastEntity[];
}

export interface User extends FastEntity {
	IsActive: boolean;
}
