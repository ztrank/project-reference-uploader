import 'reflect-metadata';
import { Init } from '../src';
import { StorageClient } from '../src/interfaces/Storage.Client';

test('Bind', () => {
    const uploader = Init(<StorageClient><any>{}, 'bucket');
    expect(uploader).toBeDefined();
    expect(uploader.run).toBeDefined();
    expect(typeof uploader.run).toBe('function');
});