import { TDFile, TDDocument } from '@tldraw/tldraw';
import log from 'loglevel';

interface FileBuilderResult {
	fileHandle: FileSystemFileHandle | null;
	document: TDDocument;
}

class FileBuilder {
	static build(
		json: string | null,
		fileHandle: FileSystemFileHandle | null,
	): FileBuilderResult | null {
		if (json === null) {
			log.error('Failed to cast result to string');
			return null;
		}

		try {
			const parsedFile: TDFile = JSON.parse(json);

			return {
				fileHandle,
				document: parsedFile.document,
			};
		} catch (error) {
			log.error('Error parsing JSON:', error);
			return null;
		}
	}
}

export { FileBuilder, type FileBuilderResult };
