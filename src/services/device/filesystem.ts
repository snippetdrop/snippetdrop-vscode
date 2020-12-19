import { readFileSync } from 'fs';

export function getFileContents(path: string): string {
	return readFileSync(path, 'utf8');
}