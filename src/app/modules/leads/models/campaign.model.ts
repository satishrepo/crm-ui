export interface Campaign {
	Id: string;
	Type: number;
	TargetDate: string;
	Code: string;
	AssignedTo: {
		Id: string;
		Name: string;
	};
}

export interface CampaignsApiQueryParams {
	fullSearch?: string;
	limit?: number;
	offset?: number;
	'Filter.LeadIds': string[];
	sortField: string;
	sortOrder: string;
}

export interface CampaignsApi {
	TotalCount: number;
	List: Campaign[];
}
