import * as fs from 'fs';
import * as zlib from 'zlib';
import * as tar from 'tar';
import * as stream from 'stream';
import * as chalk from 'chalk';

import { runcmd } from './utils/shell';
import { StarterTemplate } from '../definitions';

/**
 * Spawn an npm install task from within 
 */
export async function pkgInstallProject(installer: string, root: string): Promise<any> {
  try {
    await runcmd(installer, ['install'], {cwd: root, stdio: 'ignore'});
  } catch (e) {
    throw `${installer} install failed`;
  }
}

/**
 * 
 */
export function tarXvf(readStream: stream.Readable, destination: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const baseArchiveExtract = tar.Extract({
        path: destination,
        strip: 1
      })
      .on('error', reject)
      .on('end', resolve);
    try {
      readStream
        .pipe(zlib.Unzip())
        .on('error', reject)
        .pipe(baseArchiveExtract);
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * 
 */
export function isProjectNameValid(name: string): boolean {
  return name !== '.';
}

/**
 * If project only contains files generated by GH, it’s safe.
 * We also special case IJ-based products .idea because it integrates with CRA:
 * https://github.com/facebookincubator/create-react-app/pull/368#issuecomment-243446094
 */
export function isSafeToCreateProjectIn(root: string): boolean {
  var validFiles = [
    '.DS_Store', 'Thumbs.db', '.git', '.gitignore', '.idea', 'README.md', 'LICENSE'
  ];
  return fs.readdirSync(root)
    .every(function(file) {
      return validFiles.indexOf(file) >= 0;
    });
}

/**
 * 
 */
export function getStarterTemplateText(templateList: StarterTemplate[]): string {
  let headerLine = chalk.bold(`Ionic Starter templates`);

  function optionLineFn(template: StarterTemplate) {
    let templateName = chalk.green(template.name);

    return `${templateName} ${Array(20 - template.name.length).join('.')} ${template.description}`;
  };

  return `
    ${headerLine}
      ${templateList.map(optionLineFn).join(`
      `)}
  `;
}

/**
 * 
 */
export function getHelloText(): string {
  return `
${chalk.bold('♬ ♫ ♬ ♫  Your Ionic app is ready to go! ♬ ♫ ♬ ♫')}

${chalk.bold('Some helpful tips:')}

${chalk.bold('Run your app in the browser (great for initial development):')}
  ionic serve

${chalk.bold('Run on a device or simulator:')}
  ionic run ios[android,browser]

${chalk.bold('Test and share your app on device with Ionic View:')}
  http://view.ionic.io

${chalk.bold('Build better Enterprise apps with expert Ionic support:')}
  http://ionic.io/enterprise
  `;
}