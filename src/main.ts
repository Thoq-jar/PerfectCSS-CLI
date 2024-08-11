import * as fs from 'node:fs';
import * as path from 'node:path';
import * as https from 'node:https';
import { argv } from 'node:process';
import { execSync } from "node:child_process";
import * as std from './aqua.std';

const pcssUrl = 'https://raw.githubusercontent.com/Thoq-jar/PCSS/master/.pcss/pcss.min.js';

function getNpmVersion(): string {
  try {
    return execSync('npm -v').toString().trim() + ' npm';
  } catch (error) {
    console.error('Error fetching npm version:', error);
    return 'unknown';
  }
}

async function about(): Promise<void> {
  const info: any = [
    '\n',
    'PCSS CLI: v1.0.0',
    `Node: ${process.version}`,
    `Package manager: ${getNpmVersion()}`,
    `Arch: ${process.arch}`,
    `Platform: ${process.platform}`,
    'Help: ',
    'Type "pcss new { project name }" to create a new project',
    'Type "pcss version" to show this message',
  ];

  const logo: any = `
.______     ______     _______.     _______.     ______  __       __  
|   _  \\   /      |   /       |    /       |    /      ||  |     |  | 
|  |_)  | |  ,----'  |   (----\`   |   (----\`   |  ,----'|  |     |  | 
|   ___/  |  |        \\   \\        \\   \\       |  |     |  |     |  | 
|  |      |  \`----.----)   |   .----)   |      |  \`----.|  \`----.|  | 
| _|       \\______|_______/    |_______/        \\______||_______||__| 
`
  std.printc(std.styles.normal, std.colors.magenta, logo);
  info.forEach(sentence => std.printc(std.styles.normal, std.colors.blue, sentence));
}

function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve: any, reject: any): void => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response): void => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
        return;
      }
      response.pipe(file);
      file.on('finish', (): void => {
        file.close(resolve);
      });
    }).on('error', (err): void => {
      fs.unlink(dest, (): any => reject(err));
    });
  });
}

function createIndexHtml(filePath: string): void {
  const htmlContent: any = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PCSS Starter</title>
    <script src="./.pcss/pcss.min.js"></script>
</head>
<body>
    <h1>PCSS Starter template</h1>
</body>
</html>`;
  fs.writeFileSync(filePath, htmlContent);
}

async function main(): Promise<void> {
  const command: any = argv[2];
  const projectName = argv[3];
  const commands = ['version', 'about', 'info', 'help', 'new'];
  const newUsage = `Usage: pcss new { project name }`;

  if (
    command === 'version' ||
    command === 'about' ||
    command === 'info' ||
    command === 'help'
  ) {
    about().then((): void => process.exit(0));
  } else if (command === 'new' && !projectName) {
    std.printc(std.styles.bold, std.colors.red, newUsage);
    process.exit(1);
  } else {
    std.printc(
      std.styles.bold,
      std.colors.red,
      `Unknown command/usage: ${command}, for help type "pcss help"`
    );
    process.exit(1);
  }

  const projectDir = path.join(__dirname, projectName);
  const pcssDir = path.join(projectDir, '.pcss');
  const pcssFilePath = path.join(pcssDir, 'pcss.min.js');
  const indexHtmlPath = path.join(projectDir, 'index.html');

  if (!fs.existsSync(projectDir)) {
    fs.mkdirSync(projectDir);
  }
  if (!fs.existsSync(pcssDir)) {
    fs.mkdirSync(pcssDir);
  }
  try {
    await downloadFile(pcssUrl, pcssFilePath);
    createIndexHtml(indexHtmlPath);
    console.log(`Files downloaded and index.html created successfully in ${projectName}.`);
  } catch (error) {
    console.error('Error:', error);
  }
}

main().then((): void => {});