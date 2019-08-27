#!/usr/bin/env node
var argv = require('argv');
var dist = require('../dist/index.js');

var args = argv.option(dist.Options).run();
dist.Init(args.account, args.bucket)
    .run()
    .subscribe({
        next: () => {},
        error: err => conole.error(err),
        complete: () => {
            process.exit(0);
        }
    });