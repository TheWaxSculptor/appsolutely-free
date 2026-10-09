const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const appsDir = path.join(__dirname, 'data/appsolutely-free-data/apps');
const altsDir = path.join(__dirname, 'data/appsolutely-free-data/alternatives');

function readYamlDir(dir) {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));
    return files.map(file => {
        const content = fs.readFileSync(path.join(dir, file), 'utf8');
        const data = yaml.load(content);
        data.id = file.replace(/\.yml$/, '');
        return data;
    });
}

const apps = readYamlDir(appsDir);
const alts = readYamlDir(altsDir);

const jsContent = `
const data = {
    apps: ${JSON.stringify(apps, null, 2)},
    alternatives: ${JSON.stringify(alts, null, 2)}
};
export default data;
`;

fs.writeFileSync(path.join(__dirname, 'data.js'), jsContent);
console.log('Successfully generated data.js');
