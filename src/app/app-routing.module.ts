import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UnauthorizedComponent } from '@synergy/commonUI';
import { ErrorComponent } from '@synergy/commonUI';

export const routes: Routes = [
	{
		path: 'unauthorized',
		component: UnauthorizedComponent,
	},
	{
		path: 'error',
		component: ErrorComponent,
	},
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class AppRoutingModule {}
