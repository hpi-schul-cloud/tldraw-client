import * as log from 'loglevel';

export const errorLogger = (message: string, error: Error): void => {
	log.error(`${message}: ${error}`);
};
