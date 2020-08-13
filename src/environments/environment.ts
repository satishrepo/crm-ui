// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { Environment } from '@synergy/commonUI';

export const environment: Environment = {
	production: 'false',

	landingPageLink: '/',
	crmPageLink: '/',
	underwritingPageLink: '/',
	workflowPageLink: '/',
	adminPageLink: '/',
	processingPageLink: '/',

	authApi: 'https://auth_sbox.cazcreekdev.com',
	notificationApi: 'https://notification_sbox.cazcreekdev.com',
	landingApi: 'https://landing_sbox.cazcreekdev.com',
	crmApi: 'https://crm_sbox.cazcreekdev.com',
	underwritingApi: 'https://underwriting_sbox.cazcreekdev.com',
	workflowsApi: 'https://wf_sbox.cazcreekdev.com',
	adminApi: 'https://admin_sbox.cazcreekdev.com',
	processingApi: 'https://processing_sbox.cazcreekdev.com',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
