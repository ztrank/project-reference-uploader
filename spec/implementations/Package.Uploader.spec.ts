import 'reflect-metadata';
import { of, throwError } from 'rxjs';
import Path from 'path';
import { PackageUploaderImpl } from '../../src/implementations/Package.Uploader';
import { FileUtil } from '../../src/interfaces/File.Util';

const metadata = {
    version: '1.0.2',
    name: 'azimuth-test',
    author: 'ztrank',
    repository: 'git',
    directory: 'src/public',
};

const fileUtil = {
    getWorkingDirectory: jest.fn().mockImplementation(() => {
        return process.cwd();
    }),
    getFile: jest.fn(),
    saveFile: jest.fn().mockImplementation((content, path) => {
        expect(content).toBeDefined();
        expect(path).toBeDefined();
        if(path.endsWith('repository-metadata.json')) {
            expect(content["azimuth-test"]).toBeDefined();
            expect(content["azimuth-test"]["1.0.2"]).toBeDefined();
        }
        return of(undefined);
    }),
    copyFile: jest.fn().mockImplementation((source: string, dest: string) => {
        expect(source).toBe(Path.join(process.cwd(), metadata.directory));
        expect(dest).toBe(Path.join(process.cwd(), 'temp', 'package'));
        return of(undefined);
    })
};
const uploadUtil = {
    upload: jest.fn().mockImplementation((bucket, local, remote) => {
        
        return of(undefined);
    }),
    download: jest.fn().mockImplementation(() => {
        return of(undefined);
    })
};
const bucketName = 'bucket';

beforeEach(() => {
    fileUtil.getWorkingDirectory.mockClear();
    fileUtil.getFile.mockReset();
    fileUtil.saveFile.mockClear();
    fileUtil.copyFile.mockClear();
    uploadUtil.upload.mockClear();
    uploadUtil.download.mockClear();
});

test('Error if no metadata is set', () => {
    
    const uploader = new PackageUploaderImpl(<FileUtil><any>fileUtil, uploadUtil, bucketName);
    let err: Error | undefined = undefined;
    try {
        uploader.metadata;
    } catch(e) {
        err = e;
    }
    expect(err).toBeDefined();
});

test('With Metadata', (done) => {
    fileUtil.getFile.mockImplementation(path => {
        if(path.endsWith('package-metadata.json')) {
            return of(JSON.stringify(metadata));
        } else {
            return of(JSON.stringify({
                "azimuth-test": {
                    "1.0.0": {
                        version: '1.0.0',
                        name: 'azimuth-test',
                        author: 'ztrank',
                        repository: 'git',
                        directory: 'src/public',
                    }
                }
            }));
        }
    });

    const uploader = new PackageUploaderImpl(<FileUtil><any>fileUtil, uploadUtil, bucketName);
    uploader.run()
        .subscribe(() => {
            expect(fileUtil.getFile).toHaveBeenCalled();
            expect(fileUtil.copyFile).toHaveBeenCalled();
            expect(fileUtil.getWorkingDirectory).toHaveBeenCalled();
            expect(uploadUtil.upload).toHaveBeenCalled();
            done();
        });
});

test('New Project in Repo', (done) => {
    fileUtil.getFile.mockImplementation(path => {
        if(path.endsWith('package-metadata.json')) {
            return of(JSON.stringify(metadata));
        } else {
            return of(JSON.stringify({}));
        }
    });

    const uploader = new PackageUploaderImpl(<FileUtil><any>fileUtil, uploadUtil, bucketName);
    uploader.run()
        .subscribe(() => {
            expect(fileUtil.getFile).toHaveBeenCalled();
            expect(fileUtil.copyFile).toHaveBeenCalled();
            expect(fileUtil.getWorkingDirectory).toHaveBeenCalled();
            expect(uploadUtil.upload).toHaveBeenCalled();
            done();
        });
})

test('Try to overwrite repo version', (done) => {
    fileUtil.getFile.mockImplementation(path => {
        if(path.endsWith('package-metadata.json')) {
            return of(JSON.stringify(metadata));
        } else {
            return of(JSON.stringify({
                "azimuth-test": {
                    "1.0.2": {
                        version: '1.0.2',
                        name: 'azimuth-test',
                        author: 'ztrank',
                        repository: 'git',
                        directory: 'src/public'
                    }
                }
            }));
        }
    });

    const uploader = new PackageUploaderImpl(<FileUtil><any>fileUtil, uploadUtil, bucketName);
    uploader.run()
        .subscribe({
            next: () => done('whoops'),
            error: err => {
                expect(fileUtil.getFile).toHaveBeenCalled();
                expect(fileUtil.saveFile).toHaveBeenCalledTimes(0);
                expect(uploadUtil.download).toHaveBeenCalledTimes(1);
                expect(uploadUtil.upload).toHaveBeenCalledTimes(0);
                done();
            }
        });
})

test('With Out Metadata', (done) => {
    fileUtil.getFile.mockImplementation((path: string) => {
        if(path.endsWith('package-metadata.json')) {
            return throwError('NOENT');
        } else if(path.endsWith('package.json')) {
            return of(JSON.stringify({
                version: '2.0.0',
                name: 'azimuth-test-2',
                author: 'ztrank',
                repository: {
                    url: 'git'
                }
            }));
        } else {
            return of(JSON.stringify({}));
        }
    });

    const uploader = new PackageUploaderImpl(<FileUtil><any>fileUtil, uploadUtil, bucketName);
    uploader.run()
        .subscribe({
            next: () => done('whoops'),
            error: err => {
                expect(fileUtil.getFile).toHaveBeenCalled();
                expect(fileUtil.saveFile).toHaveBeenCalled();
                expect(uploadUtil.upload).toHaveBeenCalledTimes(0);
                done();
            }
        });
});

test('With Out Metadata No Repo', (done) => {
    fileUtil.getFile.mockImplementation((path: string) => {
        if(path.endsWith('package-metadata.json')) {
            return throwError('NOENT');
        } else if(path.endsWith('package.json')) {
            return of(JSON.stringify({
                version: '2.0.0',
                name: 'azimuth-test-2',
                author: 'ztrank'
            }));
        } else {
            return of(JSON.stringify({}));
        }
    });

    const uploader = new PackageUploaderImpl(<FileUtil><any>fileUtil, uploadUtil, bucketName);
    uploader.run()
        .subscribe({
            next: () => done('whoops'),
            error: err => {
                expect(fileUtil.getFile).toHaveBeenCalled();
                expect(fileUtil.saveFile).toHaveBeenCalled();
                expect(uploadUtil.upload).toHaveBeenCalledTimes(0);
                done();
            }
        });
});