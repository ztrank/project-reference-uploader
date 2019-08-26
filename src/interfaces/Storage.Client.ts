export interface StorageClient {
    bucket(name: string): Bucket;
}

interface Bucket {
    upload(path: string, request: {destination: string}): Promise<any>;
    file(path: string): BucketFile;
}

interface BucketFile {
    download(request: {destination: string}): Promise<any>;
}