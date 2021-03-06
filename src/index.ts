import 'reflect-metadata';
import { Container } from 'inversify';
import { Symbols } from './symbols';
import { FileUtilImpl } from './implementations/File.Util.Impl';
import { UploadUtilImpl } from './implementations/Upload.Util';
import { PackageUploaderImpl } from './implementations/Package.Uploader';
import { PackageUploader } from './interfaces/Package.Uploader';
import { Storage } from '@google-cloud/storage';

export function Init(
    storageClientCertLocation: string = 'C:\\service-accounts\\azimuth-package-manager.json',
    bucket: string = 'azimuth-packages',
    temp: string = 'C:\\Temp\\azimuth-packages'
): PackageUploader {
    const container = new Container();
    container.bind(Symbols.FileUtil).to(FileUtilImpl);
    container.bind(Symbols.StorageClient).toConstantValue(new Storage({keyFilename: storageClientCertLocation}));
    container.bind(Symbols.UploadUtil).to(UploadUtilImpl);
    container.bind(Symbols.Settings).toConstantValue({
        bucket: bucket,
        temp: temp
    });
    container.bind('PackageUploader').to(PackageUploaderImpl);
    const uploader = container.get<PackageUploader>('PackageUploader');
    return uploader;
}

export const Options = [
    {
        name: 'account',
        short: 'a',
        type: 'string'
    },
    {
        name: 'bucket',
        short: 'b',
        type: 'string'
    }
];