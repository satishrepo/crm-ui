import { Routes } from '@angular/router';

import { AuthGuard, CRMContacts, NoItemSelectedComponent } from '@synergy/commonUI';

import { ContactsComponent } from './pages/contacts/contacts.component';
import { ContactsDetailsComponent } from './components/contacts-details/contacts-details.component';

export const contactsRoutes: Routes = [
	{
		path: 'contacts',
		component: ContactsComponent,
		children: [{ path: '', component: NoItemSelectedComponent }, { path: ':id', component: ContactsDetailsComponent }],
		canActivate: [AuthGuard],
		data: {
			expectedPermission: CRMContacts.Read,
		},
	},
];
