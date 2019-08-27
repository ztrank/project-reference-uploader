import { Observable } from 'rxjs';

export interface FileUtil {
    getWorkingDirectory(): string;
    copyFile(fromPath: string, toDirectory: string): Observable<void>;
    getFile(...paths:string[]): Observable<string>;
    saveFile(content: any, ...paths: string[]): Observable<void>;
    listFiles(...paths: string[]): Observable<string[]>;
    isDirectorySync(...paths: string[]): boolean;
    isDirectory(...paths: string[]): Observable<boolean>;
    remove(...paths: string[]): Observable<void>;
}