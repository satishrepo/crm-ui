declare var require: any;
import { IAppConstants } from '@synergy/commonUI';

export const AppConstants: IAppConstants = {
	version: require('../../package.json').version,
	AppModuleName: 'Crm',
};
