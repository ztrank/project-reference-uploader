import 'reflect-metadata';
import { Init } from '../src';

test('Bind', () => {
    const uploader = Init();
    expect(uploader).toBeDefined();
    expect(uploader.run).toBeDefined();
    expect(typeof uploader.run).toBe('function');
});