import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER, ErrorHandler } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import {
	AuthService,
	AuthServiceFactory,
	CommonUIModule,
	CommonUIModuleConfig,
	GlobalErrorhandler,
	JwtInterceptor,
	OperationsService,
	PermissionsService,
} from '@synergy/commonUI';

import { environment } from '../environments/environment';
import { AppConstants } from './app.constants';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { HomeModule } from './modules/home/home.module';

export function ConfigFactory(): CommonUIModuleConfig {
	return {
		environment,
		constants: AppConstants,
	};
}

@NgModule({
	declarations: [AppComponent],
	imports: [
		BrowserModule,
		AppRoutingModule,
		HttpClientModule,
		NoopAnimationsModule,
		SharedModule,
		HomeModule,
		CommonUIModule.forRoot(ConfigFactory),
	],
	providers: [
		AuthService,
		OperationsService,
		PermissionsService,
		{
			provide: APP_INITIALIZER,
			useFactory: AuthServiceFactory,
			deps: [AuthService],
			multi: true,
		},
		{ provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
		{ provide: ErrorHandler, useClass: GlobalErrorhandler },
	],
	bootstrap: [AppComponent],
})
export class AppModule {}
