import express from 'express';
import serve from 'express-static';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import icongen from 'icon-gen';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

const app = express();

app.get('/', (req, res, next) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  fs.promises.readFile(`${__dirname}/public/index.html`).then(html => {
    res.write(html);
    res.end();
  });
});
// @ts-ignore
app.use(serve(`${__dirname}/public`, null));

generateIcons();

const server = app.listen(PORT, () => {
  console.log('Demo running at %s', PORT);
});

//////////////////////////////////////////////

interface Parameters {
  iconFile: string;
  outputFoler: string;
  timestampFile: string;
}

async function generateIcons(parameters?: Parameters) {
  const iconFile = parameters?.iconFile ?? "icon.png";
  const outputFolder = parameters?.outputFoler ?? "./public";
  const timestampFile = parameters?.timestampFile ?? "icon-timestamp.txt";
  return new Promise((resolve, reject) => {
      fs.readFile(`${outputFolder}/${timestampFile}`, (err, data) => {
          const { mtime } = fs.statSync(iconFile);
          const timestamp = mtime.getTime().toString();
          const outOfSync = err || data?.toString() !== timestamp;
          if (outOfSync) {
            fs.writeFileSync(`${outputFolder}/${timestampFile}`, timestamp);
            icongen(iconFile, outputFolder)
              .then((results) => {
                console.log(`${iconFile} updated. ${results.length} icons generated in ${outputFolder}.`);
                resolve(results);
              })
              .catch((err) => {
                console.error(err)
                reject();
              })    
          }
        });      
  });
}