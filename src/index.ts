import { Container } from 'inversify';
import { Symbols } from './symbols';
import { FileUtilImpl } from './implementations/File.Util.Impl';
import { StorageClient } from './interfaces/Storage.Client';
import { UploadUtilImpl } from './implementations/Upload.Util';
import { PackageUploaderImpl } from './implementations/Package.Uploader';
import { PackageUploader } from './interfaces/Package.Uploader';

export function Init(
    storageClient: StorageClient,
    bucket: string
): PackageUploader {
    const container = new Container();
    container.bind(Symbols.FileUtil).to(FileUtilImpl);
    container.bind(Symbols.StorageClient).toConstantValue(storageClient);
    container.bind(Symbols.UploadUtil).to(UploadUtilImpl);
    container.bind(Symbols.StorageBucket).toConstantValue(bucket);
    container.bind('PackageUploader').to(PackageUploaderImpl);
    const uploader = container.get<PackageUploader>('PackageUploader');
    return uploader;
}