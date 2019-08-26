import { Observable } from 'rxjs';

export interface UploadUtil {
    upload(bucket: string, local: string, remote: string): Observable<string[]>;
    download(bucket: string, remote: string, local: string): Observable<void>;
}