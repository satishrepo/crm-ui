import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material';
import { Router } from '@angular/router';

import { CRMCampaigns, CRMContacts, CRMOpportunities, CRMProperties, CRMRecords, NavItem } from '@synergy/commonUI';

import { environment } from '../../../../../environments/environment';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
	@ViewChild('sideNav') sideNav: MatSidenav;

	items: NavItem[] = [
		{
			icon: 'dashboard',
			title: 'Opportunities',
			link: '/opportunities',
			permissionName: CRMOpportunities.Read,
		},
		{
			icon: 'subject',
			title: 'Properties',
			link: '/properties',
			permissionName: CRMProperties.Read,
		},
		{
			icon: 'launch',
			title: 'Campaigns',
			link: '/campaigns',
			permissionName: CRMCampaigns.Read,
		},
		{
			icon: 'library_books',
			title: 'Records',
			link: '/records',
			permissionName: CRMRecords.Read,
		},
		{
			icon: 'import_contacts',
			title: 'Contacts',
			link: '/contacts',
			permissionName: CRMContacts.Read,
		},
	];

	modules: NavItem[] = [
		{
			icon: 'home',
			title: 'Landing',
			link: environment.landingPageLink,
		},
	];

	constructor(private router: Router) {}

	toggleSideNavVisibility() {
		this.sideNav.toggle();
	}

	ngOnInit() {
		this.router.events.subscribe(() => {
			this.sideNav.close();
		});
	}

	get sideNavOpened() {
		return this.sideNav.opened;
	}
}
