import { PackageUploader } from '../interfaces/Package.Uploader';
import { injectable, inject } from 'inversify';
import { Symbols } from '../symbols';
import { FileUtil } from '../interfaces/File.Util';
import { UploadUtil } from '../interfaces/Upload.Util';
import { Observable, throwError, of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { Metadata } from '../interfaces/Metadata';
import { RepositoryMetadata } from '../interfaces/Repository.Metadata';
import Path from 'path';
import { Settings } from '../interfaces/Settings';

@injectable()
export class PackageUploaderImpl implements PackageUploader {
    private _metadata?: Metadata;

    public constructor(
        @inject(Symbols.FileUtil) private fileUtil: FileUtil,
        @inject(Symbols.UploadUtil) private uploadUtil: UploadUtil,
        @inject(Symbols.Settings) private settings: Settings
    ) {}

    private getDir(...paths: string[]): string {
        return Path.join(this.fileUtil.getWorkingDirectory(), ...paths);
    }

    private get temp(): string {
        return this.settings.temp;
    }

    run(): Observable<void> {
        return this.getMetadata()
            .pipe(
                mergeMap(() => this.setRepoMetadata()),
                mergeMap(() => this.copyToTemp()),
                mergeMap(() => this.uploadTemp())
            );
    }

    public get metadata(): Metadata {
        if(!this._metadata) {
            throw new Error('Need to call Get Metadata First');
        }
        return this._metadata;
    }

    private getMetadata(): Observable<void> {
        return this.fileUtil.getFile(this.getDir('package-metadata.json'))
            .pipe(
                catchError(() => this.createMetadata()),
                map(file => <Metadata>JSON.parse(file)),
                map(meta => this._metadata = meta),
                mergeMap(() => {
                    if(!this.metadata.directory) {
                        return throwError('Unable to upload a blank directory. This has unintended consequences!');
                    }
                    return of(undefined);
                })
            );
    }

    private createMetadata(): Observable<never> {
        return this.fileUtil.getFile(this.getDir('package.json'))
            .pipe(
                map(file => JSON.parse(file)),
                mergeMap((pkg: any) => {
                    const meta = {
                        version: pkg.version,
                        name: pkg.name,
                        author: pkg.author,
                        repository: pkg.repository ? pkg.repository.url : '',
                        directory: ''
                    };
                    return this.fileUtil.saveFile(JSON.stringify(meta), this.getDir('package-metadata.json'))
                }),
                mergeMap(() => throwError(new Error('Unable to upload Package. Metadata was missing. Please set the directory of files to upload and try again.')))
            );
    }

    private copyToTemp(): Observable<void> {
        return this.fileUtil.remove(Path.join(this.temp, 'package'))
            .pipe(
                mergeMap(() => this.fileUtil.copyFile(this.getDir(this.metadata.directory), Path.join(this.temp, 'package')))
            );
            
    }

    private uploadTemp(): Observable<void> {
        return this.uploadUtil.upload(this.settings.bucket, Path.join(this.temp, 'package'), Path.join(this.metadata.name, this.metadata.version))
            .pipe(
                mergeMap(files => this.fileUtil.saveFile(JSON.stringify({files: files}), Path.join(this.temp, 'package', 'package-files.json'))),
                mergeMap(() => this.uploadUtil.upload(this.settings.bucket, Path.join(this.temp, 'package', 'package-files.json'), Path.join(this.metadata.name, this.metadata.version, 'package-files.json'))),
                mergeMap(() => this.uploadUtil.upload(this.settings.bucket, this.getDir('package-metadata.json'), Path.join(this.metadata.name, this.metadata.version, 'package-metadata.json'))),
                map(() => {})
            )
    }

    private setRepoMetadata(): Observable<void> {
        return this.uploadUtil.download(this.settings.bucket, 'repository-metadata.json', Path.join(this.temp, 'repository-metadata.json'))
            .pipe(
                mergeMap(() => this.fileUtil.getFile(Path.join(this.temp, 'repository-metadata.json'))),
                map(file => <RepositoryMetadata>JSON.parse(file)),
                mergeMap((meta: RepositoryMetadata) => {
                    if(!meta[this.metadata.name]) {
                        meta[this.metadata.name] = {};
                    }
                    if(meta[this.metadata.name][this.metadata.version]) {
                        return throwError('Version already exists!!!');
                    }
                    meta[this.metadata.name][this.metadata.version] = this.metadata;
                    return this.fileUtil.saveFile(JSON.stringify(meta), Path.join(this.temp, 'repository-metadata.json'));
                }),
                mergeMap(() => this.uploadUtil.upload(this.settings.bucket, Path.join(this.temp, 'repository-metadata.json'), 'repository-metadata.json')),
                map(() => {})
            );
    }
}