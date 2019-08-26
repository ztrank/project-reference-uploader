import { Observable } from 'rxjs';

export interface UploadUtil {
    upload(bucket: string, local: string, remote: string): Observable<void>;
    download(bucket: string, remote: string, local: string): Observable<void>;
}