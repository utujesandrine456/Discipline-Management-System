const fs = require('fs');
const https = require('https');

async function fetchFont(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode === 301 || res.statusCode === 302) {
                return fetchFont(res.headers.location).then(resolve).catch(reject);
            }
            const data = [];
            res.on('data', (chunk) => data.push(chunk));
            res.on('end', () => resolve(Buffer.concat(data).toString('base64')));
            res.on('error', reject);
        }).on('error', reject);
    });
}

async function main() {
    console.log('Downloading Normal font...');
    const normalStr = await fetchFont('https://github.com/coreyhu/Urbanist/raw/main/fonts/ttf/Urbanist-Regular.ttf');
    console.log('Downloading Bold font...');
    const boldStr = await fetchFont('https://github.com/coreyhu/Urbanist/raw/main/fonts/ttf/Urbanist-Bold.ttf');

    const content = `export const urbanistNormal = '${normalStr}';\nexport const urbanistBold = '${boldStr}';\n`;
    fs.writeFileSync('C:/Users/user/Videos/RCA/frontend/src/lib/urbanistFont.ts', content);
    console.log('Fonts saved!');
}
main();
