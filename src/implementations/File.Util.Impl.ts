import { injectable } from 'inversify';
import { FileUtil } from '../interfaces/File.Util';
import { Observable, from } from 'rxjs';
import fs from 'fs-extra';
import Path from 'path';

@injectable()
export class FileUtilImpl implements FileUtil {

    public constructor() {}

    public getWorkingDirectory(): string {
        return process.cwd();
    }

    public remove(...paths: string[]): Observable<void> {
        return from(fs.remove(Path.join(...paths)));
    }

    public copyFile(fromDirectory: string, toDirectory: string): Observable<void> {
        return from(
            fs.ensureDir(toDirectory)
                .then(() => fs.copy(fromDirectory, toDirectory))
        )
    }

    public saveFile(content: any, ...paths: string[]): Observable<void> {
        return from(fs.writeFile(Path.join(...paths), content));
    }

    public getFile(...paths:string[]): Observable<string> {
        return from(fs.readFile(Path.join(...paths), {encoding: 'utf8'}));
    }

    public listFiles(...paths: string[]): Observable<string[]> {
        return from(fs.readdir(Path.join(...paths)));
    }

    public isDirectorySync(...paths: string[]): boolean {
        try {
            return fs.lstatSync(Path.join(...paths)).isDirectory();
        } catch (e) {
            return false;
        }
    }

    public isDirectory(...paths: string[]): Observable<boolean> {
        return from(
            fs.lstat(Path.join(...paths))
                .then(stats => stats.isDirectory())
                .catch(err => false)
        );
    }
}