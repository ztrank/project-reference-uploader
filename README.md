# project-reference

## Uploading a Project
### Installation
`npm install --save-dev @trankzachary/project-reference-uploader`

### Usage
Create a .ts file to create a storage client (Google-Cloud/Storage) in it, call `Init(...).run().subscribe(() => {});`

You will need to have a `pacakge-metadata.json` in your project's root directory. This utility will create one error the observable if one does not exist.

Add a call to this file into a script/gulp task, then call it to upload!

```typescript
import { Storage } from '@google-cloud/storage';
import { Init } from '@trankzachary/project-reference-uploader';

Init(
    new Storage({keyFilename: 'path/to/sa/keyfile'}),
    'azimuth-packages'
).run()
.subscribe({
    next: () => {},
    error: err => {
        console.error(err);
    }
});
```

## Installing a Project
### Planning
I want to be able to, in VSCode, use the command pallet to enter in a project name, e.g. azimuth-connection-factory, and for it to create the interfaces for that project in my current project's src/references/azimuth-connection-factory. This should include a src/references/index.ts file with it to export * from './azimuth-connection-factory'. It also should have a JSON with the installed package information

### Steps
1. Add a Command to the VS Code Command Pallet
2. Take user input to take in the package name
3. Fetch the package metadata from Google Cloud bucket
4. Provider user with options of versions to install, indicate the installed version if there is one
5. If user chooses a version different from currently installed, delete the currently installed directory for this package and remove from the metadata json, and from the index.ts
6. Download the directory from google cloud bucket to the src/references/<project-name> directory
7. Add the project to the index.ts file
8. Add the project's metadata to the src/references/metadata.json

## Uploading a Project
### Planning
I want to be able to, using a gulp task or a pipeline, on publish / package or event or custom script, take a definted set of .ts files, and upload them to a google cloud bucket. The destination is static, except for the versioning, which is defined in the metadata.json for the project. Projects should be uploaded into the <bucket-name>/<project-name>/<version-number> directory in the cloud.

### Steps
1. Run a gulp task/npm script/pipeline to find the metadata.json
2. Find the files in the metadata.json
3. Package them into a package directory
4. Upload them to the google-cloud bucket