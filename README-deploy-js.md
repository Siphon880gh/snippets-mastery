# Deploy.js (Useful Tool for Snippets Mastery)

When maintaining the snippets on your computer, sometimes you want to make it available across all devices. You can upload the entire snippets folder via FTP. But a quicker way is `npm run deploy` and it will upload the files.

## Requirements

package.json
```
{
  "name": "snippets-mastery",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "build-sass": "node-sass css/scss --output css",
    "watch-compass": "compass watch ./",
    "livereload": "livereload .",
    "watch": "npm run watch-compass & npm run livereload",
    "deploy": "echo 'Uploading snippets/.. It will hang for a while until finished uploading:'; node deploy.js"
  },
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "ftp-deploy": "^2.3.3"
  },
  "dependencies": {
    "deploy": "^1.0.3",
    "ftp": "^0.3.10"
  }
}
```

deploy.js
```
var FtpDeploy = require('ftp-deploy');
var ftpDeploy = new FtpDeploy();
 
var config = {
    user: "_____",                   // NOTE that this was username in 1.x 
    password: "_____",               // CHANGE THIS FROM TEMPLATE
    host: "_____",
    port: 21,
    localRoot: __dirname,
    remoteRoot: '/public_html/_____', // CHANGE THIS FROM TEMPLATE
    // include: ['*', '**/*'],         // this would upload everything except dot files
    include: ['snippets/**'],
    exlude: [],
    deleteRemote: false,              // delete ALL existing files at destination before uploading, if true
    forcePasv: true                   // Passive mode is forced (EPSV command is not sent)
}
 
// use with callback
ftpDeploy.deploy(config, function(err, res) {
    if (err) console.log(err)
    else console.log('finished:', res);
});
```

## Warning

For your safety, do not ever upload deploy.js to your remote server. Keep it at your local server. Otherwise, a hacker can visit deploy.js directly and look at your FTP login information.

## Source
- Credit: https://www.npmjs.com/package/ftp-deploy

- Install command: `npm install --save-dev ftp-deploy`

## Recommended Improvements

The tool simply uploads all files, replacing old files. It does not delete remote files that are no longer on your local files. It also does not distinguish old from new files to save bandwidth. You as a developer may want to improve on this. Refer to discussion here:
https://community.atlassian.com/t5/Bitbucket-questions/Deploying-only-changed-files-via-FTP/qaq-p/1023055