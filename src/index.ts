import { Container } from 'inversify';
import { Symbols } from './symbols';
import { FileUtilImpl } from './implementations/File.Util.Impl';
import { UploadUtilImpl } from './implementations/Upload.Util';
import { PackageUploaderImpl } from './implementations/Package.Uploader';
import { PackageUploader } from './interfaces/Package.Uploader';
import { Storage } from '@google-cloud/storage';

export function Init(
    storageClientCertLocation: string = 'C:\\service-accounts\\azimuth-package-manager',
    bucket: string = 'azimuth-packages'
): PackageUploader {
    const container = new Container();
    container.bind(Symbols.FileUtil).to(FileUtilImpl);
    container.bind(Symbols.StorageClient).toConstantValue(new Storage({keyFilename: storageClientCertLocation}));
    container.bind(Symbols.UploadUtil).to(UploadUtilImpl);
    container.bind(Symbols.StorageBucket).toConstantValue(bucket);
    container.bind('PackageUploader').to(PackageUploaderImpl);
    const uploader = container.get<PackageUploader>('PackageUploader');
    return uploader;
}