import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { CommonUIModule } from '@synergy/commonUI';

import { SharedModule } from '../../shared/shared.module';
import { ContactsComponent } from './pages/contacts/contacts.component';
import { ContactsDetailsComponent } from './components/contacts-details/contacts-details.component';

@NgModule({
	declarations: [ContactsComponent, ContactsDetailsComponent],
	imports: [CommonModule, ReactiveFormsModule, CommonUIModule, SharedModule, RouterModule],
	exports: [ContactsComponent],
})
export class ContactsModule {}
