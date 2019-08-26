import 'reflect-metadata';
import { of, from } from 'rxjs';
import { UploadUtilImpl } from '../../src/implementations/Upload.Util';
import { FileUtil } from '../../src/interfaces/File.Util';
import { directory } from './Directory';

const remoteRoot = 'project\\v1';
const bucketName = 'azimuth-package-manager';
const expectedUploadLocalFiles = [
    "project\\temp\\package\\interfaces\\File.Util.ts",
    "project\\temp\\package\\interfaces\\Metadata.ts",
    "project\\temp\\package\\interfaces\\Repository.Metadata.ts",
    "project\\temp\\package\\interfaces\\Storage.Client.ts",
    "project\\temp\\package\\interfaces\\Upload.Util.ts",
    "project\\temp\\package\\interfaces\\index.ts",
    "project\\temp\\package\\index.ts",
];

const expectedUploadFiles = [
    ("project\\v1\\interfaces\\File.Util.ts").replace(/\\/g, '/'),
    ("project\\v1\\interfaces\\Metadata.ts").replace(/\\/g, '/'),
    ("project\\v1\\interfaces\\Repository.Metadata.ts").replace(/\\/g, '/'),
    ("project\\v1\\interfaces\\Storage.Client.ts").replace(/\\/g, '/'),
    ("project\\v1\\interfaces\\Upload.Util.ts").replace(/\\/g, '/'),
    ("project\\v1\\interfaces\\index.ts").replace(/\\/g, '/'),
    ("project\\v1\\index.ts").replace(/\\/g, '/')
];

const fileUtil = {
    isDirectory: jest.fn().mockImplementation(local => {
        expect(local).toBeDefined();
        expect(directory[local]).toBeDefined();
        return of(directory[local].type === 'directory');
    }),
    listFiles: jest.fn().mockImplementation(local => {
        expect(local).toBeDefined();
        expect(directory[local]).toBeDefined();
        expect(directory[local].type).toBe('directory');
        return of(directory[local].files);
    })
};

let uploaded: string[] = [];
let lastUpload: number | undefined;
const File = {
    download: jest.fn().mockImplementation(() => {
        return of(undefined);
    })
}
const bucket = {
    upload: jest.fn().mockImplementation((local, options) => {
        expect(expectedUploadLocalFiles.indexOf(local)).toBeGreaterThan(-1);
        expect(expectedUploadFiles.indexOf(options.destination)).toBeGreaterThan(-1);
        uploaded.push(options.destination);
        if(lastUpload) {
            expect(lastUpload + 100).toBeLessThanOrEqual(new Date().getTime());
            lastUpload = new Date().getTime();
        }
        return from(new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 100);
        }));
    }),
    file: jest.fn().mockImplementation(() => {
        return File;
    })
};

const client = {
    bucket: jest.fn().mockImplementation(name => {
        expect(name).toBe(bucketName);
        return bucket;
    })
};

beforeEach(() => {
    lastUpload = undefined;
    uploaded = [];
    fileUtil.isDirectory.mockClear();
    fileUtil.listFiles.mockClear();
    bucket.upload.mockClear();
    client.bucket.mockClear();
});

test('Upload file', (done) => {
    const uploadUtil = new UploadUtilImpl(<FileUtil><any>fileUtil, client);
    uploadUtil.upload(bucketName, 'project\\temp\\package\\interfaces\\Metadata.ts', `${remoteRoot}\\interfaces\\Metadata.ts`)
        .subscribe({
            next: () => {
                expect(client.bucket).toHaveBeenCalledTimes(1);
                expect(bucket.upload).toHaveBeenCalledTimes(1);
                expect(fileUtil.isDirectory).toHaveBeenCalledTimes(1);
                done();
            },
            error: done
        })
});

test('Upload All', (done) => {
    const uploadUtil = new UploadUtilImpl(<FileUtil><any>fileUtil, client);
    uploadUtil.upload(bucketName, 'project\\temp\\package', remoteRoot)
        .subscribe({
            next: files => {
                files.forEach(file => expect(expectedUploadFiles.indexOf(file) > -1).toBe(true));
                expectedUploadFiles.forEach(file => expect(files.indexOf(file) > -1).toBe(true));
                expect(client.bucket).toHaveBeenCalled();
                expect(bucket.upload).toHaveBeenCalled();
                expect(fileUtil.isDirectory).toHaveBeenCalled();
                expect(fileUtil.listFiles).toHaveBeenCalled();
            },
            error: done,
            complete: () => done()
        });
})

test('Download', (done) => {
    
    const uploadUtil = new UploadUtilImpl(<FileUtil><any>fileUtil, client);
    uploadUtil.download(bucketName, 'remote', 'local')
        .subscribe(() => {
            expect(File.download).toHaveBeenCalled();
            done();
        });
})