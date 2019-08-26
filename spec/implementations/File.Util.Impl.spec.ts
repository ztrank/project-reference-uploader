import 'reflect-metadata';
import fs from 'fs-extra';
import { mergeMap } from 'rxjs/operators';

jest.mock('fs-extra', () => ({
    ...jest.requireActual('fs-extra'),
    writeFile: jest.fn().mockImplementation((path, content) => {
        expect(path).toBeDefined();
        expect(content).toBeDefined();
        return Promise.resolve()
    }),
    copy: jest.fn().mockImplementation((source, dest) => {
        expect(source).toBeDefined();
        expect(dest).toBeDefined();
        return Promise.resolve();
    }),
    readFile: jest.fn().mockImplementation((path, options) => {
        expect(path).toBeDefined();
        expect(options.encoding).toBe('utf8');
        return Promise.resolve('file contents');
    }),
    readdir: jest.fn().mockImplementation(path => {
        expect(path).toBeDefined();
        return Promise.resolve([
            'src',
            'temp',
            'node_modules',
            'package.json'
        ])
    }),
    lstatSync: jest.fn().mockImplementation((path:string) => {
        expect(path).toBeDefined();
        if([
            'src',
            'temp',
            'node_modules',
            'package.json'
        ].indexOf(path) < 0) {
            throw new Error('Not a file');
        }

        return {
            isDirectory: () => !path.endsWith('.json')
        };
    }),
    lstat: jest.fn().mockImplementation((path: string) => {
        expect(path).toBeDefined();
        if([
            'src',
            'temp',
            'node_modules',
            'package.json'
        ].indexOf(path) < 0) {
            return Promise.reject(new Error('Not a file'));
        }

        return Promise.resolve({
            isDirectory: () => !path.endsWith('.json')
        });
    }),
    ensureDir: jest.fn().mockImplementation((path) => {
        expect(path).toBeDefined();
        return Promise.resolve();
    })
}));

import { FileUtilImpl } from '../../src/implementations/File.Util.Impl';

beforeEach(() => {
    (<jest.Mock>fs.copy).mockClear();
    (<jest.Mock>fs.readFile).mockClear();
    (<jest.Mock>fs.readdir).mockClear();
    (<jest.Mock>fs.lstatSync).mockClear();
    (<jest.Mock>fs.lstat).mockClear();
    (<jest.Mock>fs.ensureDir).mockClear();
});

test('Working Directory', () => {
    const fileUtil = new FileUtilImpl();
    expect(fileUtil.getWorkingDirectory()).toBe(process.cwd());
});

test('Copy FIle', (done) => {
    
    const fileUtil = new FileUtilImpl();
    fileUtil.copyFile('src', 'dest')
        .subscribe(() => {
            expect(fs.ensureDir).toHaveBeenCalledTimes(1);
            expect(fs.copy).toHaveBeenCalledTimes(1);
            done();
        })
});

test('Get File', (done) => {

    const fileUtil = new FileUtilImpl();
    fileUtil.getFile('path', 'one', 'two')
        .subscribe(res => {
            expect(res).toBeDefined();
            expect(fs.readFile).toHaveBeenCalledTimes(1);
            done();
        })
});

test('List Files', (done) => {
    const fileUtil = new FileUtilImpl();
    fileUtil.listFiles('path')
        .subscribe(res => {
            expect(res).toHaveLength(4);
            expect(fs.readdir).toHaveBeenCalledTimes(1);
            done();
        })
});

test('Is Directory Sync', () => {
    
    const fileUtil = new FileUtilImpl();
    expect(fileUtil.isDirectorySync('node_modules')).toBe(true);
    expect(fileUtil.isDirectorySync('package.json')).toBe(false);
    expect(fileUtil.isDirectorySync('other_file')).toBe(false);
});

test('Is Directory Async', (done) => {
    
    const fileUtil = new FileUtilImpl();
    fileUtil.isDirectory('node_modules')
        .pipe(
            mergeMap(r => {
                expect(r).toBe(true);
                return fileUtil.isDirectory('package.json');
            }),
            mergeMap(r => {
                expect(r).toBe(false);
                return fileUtil.isDirectory('other_file');
            })
        ).subscribe(r => {
            expect(r).toBe(false);
            done();
        });
});

test('Write File', (done) => {
    const fileUtil = new FileUtilImpl();
    fileUtil.saveFile('content', 'path')
        .subscribe(() => {
            expect(fs.writeFile).toHaveBeenCalled();
            done();
        });
});