import { Metadata } from './Metadata';

export interface RepositoryMetadata {
    [packageName: string]: RepositoryPackageMetadata
}

export interface RepositoryPackageMetadata {
    [versions: string]: Metadata;
}