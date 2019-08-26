import { Observable } from 'rxjs';

export interface PackageUploader {
    run(): Observable<void>;
}