import { FastEntity } from '@synergy/commonUI';

export interface Campaign {
	Id: string;
	Name: string;
	CreateDate: Date;
	Type: FastEntity;
	TargetDate: Date;
	AssignedTo: FastEntity;
	Note: string;
	Description: string;
	State: FastEntity;
	County: FastEntity;
	Counties: FastEntity[];
	TotalRecords: number;
	TotalAmountRecords: number;
}

export interface CampaignsListReponseData {
	TotalCount: number;
	List: Campaign[];
}
export interface FastEntityListReponseData {
	TotalCount: number;
	List: FastEntity[];
}

export interface CampaignsApiQueryParams {
	fullSearch?: string;
	limit?: number;
	offset?: number;
	'Filter.LeadIds'?: string[];
	sortField?: string;
	sortOrder?: string;
}

export interface CampaignsHeaderCol {
	title: string;
	field: string;
	type?: string;
}

export interface CampaignRuleItem {
	Value: string;
	CampaignLogicType: FastEntity;
	CampaignRuleField: FastEntity;
}
export interface Rule {
	Id: string;
	Name: string;
	IsAttached: boolean;
	CampaignRuleItems: CampaignRuleItem[];
}
export interface RuleResData {
	TotalCount: number;
	List: Rule[];
}

export interface RuleFieldLogicType {
	Id: number;
	Name: string;
	FieldDataType: string;
}

export interface RuleField {
	Id: number;
	Name: string;
	LogicTypes: RuleFieldLogicType[];
	value?: string | number | boolean;
	DataCutLogicTypeId?: string | number;
	FieldDataType?: string;
	DataCutLogicType: RuleFieldLogicType;
}

export interface RuleFieldsResData {
	TotalCount: number;
	List: RuleField[];
}

export interface DataDumpItem {
	Key: string;
	Order: number;
	Alias: string;
	checked?: boolean;
}

export interface GeneralRule {
	RuleName: string;
	RuleItems: GeneralRuleItem[];
}

export interface GeneralRuleItem {
	Value: string;
	DataCutLogicTypeId: string;
	DataCutRuleFieldId: string;
}

export interface CampaignResolver {
	Users: FastEntity[];
	LoanDepartment: any;
	States: FastEntity[];
	CampaignTypes: FastEntity[];
	GeneralLandUseCodes: FastEntity[];
}
