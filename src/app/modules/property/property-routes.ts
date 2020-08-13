import { Routes } from '@angular/router';

import { AuthGuard, CRMProperties, NoItemSelectedComponent } from '@synergy/commonUI';

import { PropertyComponent } from './pages/property/property.component';
import { PropertyDetailsComponent } from './components/property-details/property-details.component';
import { PropertyDictionariesResolver } from './resolvers/property.resolver';

export const propertyRoutes: Routes = [
	{
		path: 'properties',
		component: PropertyComponent,
		children: [
			{ path: '', component: NoItemSelectedComponent },
			{ path: ':id', component: PropertyDetailsComponent, resolve: { dictionaries: PropertyDictionariesResolver } },
		],
		canActivate: [AuthGuard],
		data: {
			expectedPermission: CRMProperties.Read,
		},
	},
];
