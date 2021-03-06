import { injectable, inject } from 'inversify';
import { UploadUtil } from '../interfaces/Upload.Util';
import { Observable, from } from 'rxjs';
import { map, mergeMap, concatMap, reduce } from 'rxjs/operators';
import { StorageClient } from '../interfaces/Storage.Client';
import { FileUtil } from '../interfaces/File.Util';
import Path from 'path';
import { Symbols } from '../symbols';

@injectable()
export class UploadUtilImpl implements UploadUtil {

    public constructor(
        @inject(Symbols.FileUtil) private fileUtil: FileUtil,
        @inject(Symbols.StorageClient) private client: StorageClient
    ) {}

    private cleanRemote(remote: string): string {
        return remote.replace(/\\/g, '/');
    }

    private uploadFile(bucket: string, local: string, remote: string): Observable<string> {
        return from(this.client.bucket(bucket).upload(local, {destination: this.cleanRemote(remote)}))
            .pipe(map(() => this.cleanRemote(remote)));
    }

    public upload(bucket: string, local: string, remote: string): Observable<string[]> {
        return this.fileUtil.isDirectory(local)
            .pipe(
               mergeMap(isDir => {
                   if(isDir) {
                       return this.fileUtil.listFiles(local)
                        .pipe(
                            mergeMap(files => from(files)),
                            concatMap(file => this.upload(bucket, Path.join(local, file), Path.join(remote, file)))
                        );
                   } else {
                       return this.uploadFile(bucket, local, remote);
                   }
               }),
               reduce((files: string[], file: string|string[]) => {
                
                if(Array.isArray(file)) {
                    files = [...files, ...file];
                } else {
                    files.push(file);
                }
                return files;
               }, [])
            )
    }

    public download(bucket: string, remote: string, local: string): Observable<void> {
        return from(this.client.bucket(bucket).file(this.cleanRemote(remote)).download({destination: local}))
            .pipe(map(() => {}));
    }
}