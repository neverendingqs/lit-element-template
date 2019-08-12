const fs = require('fs'); // eslint-disable-line

const config = {
	'codeowner': '',
	'description': '',
	'publish': '',
	'shortName': '',
	'type': ''
};

if (config.type !== 'labs' && config.type !== 'official') {
	console.log('Input error: Please choose either "labs" or "official" as "type"');
	return;
}

const githubOrg = config.type === 'official' ? 'BrightspaceUI' : 'BrightspaceUILabs';
const orgName = config.type === 'official' ? '@brightspace-ui' : '@brightspace-ui-labs';
const packageName = `${orgName}/${config.shortName}`; // @brightspace-ui/element or @brightspace-ui-labs/element
const type = config.type === 'labs' ? 'labs-' : '';
const name = `d2l-${type}${config.shortName}`; // d2l-labs-element or d2l-element

console.log(`Filling in config values for ${name}...`);
updateFiles('./');
const year = new Date().getFullYear().toString();
replaceText('LICENSE', '<%= year %>', year);
const publishInfo = config.publish ? `"publishConfig": { "access": "public" },\n  "files": [ "${config.shortName}.js" ]` : '"private": true';
replaceText('package.json', '<%= publishInfo %>', publishInfo);

console.log('Moving files...');
moveFile('_element.js', `${config.shortName}.js`);
moveFile('test/_element.html', `test/${config.shortName}.html`);
moveFile('travis.yml', '.travis.yml');
moveFile('.CODEOWNERS', 'CODEOWNERS');

fs.unlinkSync('README.md');
moveFile('README_element.md', 'README.md');

console.log(`Repo for ${name} successfully configured.`);

function updateFiles(path) {
	if (fs.existsSync(path)) {
		const files = fs.readdirSync(path);
		files.forEach((file) => {
			const currentPath = `${path}/${file}`;
			if (fs.lstatSync(currentPath).isDirectory()) {
				updateFiles(currentPath);
			} else {
				replaceTextWithConfigs(currentPath);
			}
		});
	}
}

function replaceTextWithConfigs(fileName) {
	if (fileName.indexOf('configure-repo.js') !== -1
		|| fileName.indexOf('.git') !== -1
		|| fileName.indexOf('node_modules') !== -1) {
		return;
	}
	const data = fs.readFileSync(fileName, 'utf8');

	const result = data.replace(/<%= name %>/g, name)
		.replace(/<%= shortName %>/g, config.shortName)
		.replace(/<%= packageName %>/g, packageName)
		.replace(/<%= description %>/g, config.description)
		.replace(/<%= codeowner %>/g, config.codeowner)
		.replace(/<%= githubOrg %>/g, githubOrg);
	fs.writeFileSync(fileName, result, 'utf8');
}

function replaceText(fileName, original, replacement) {
	const data = fs.readFileSync(fileName, 'utf8');
	const result = data.replace(new RegExp(original, 'g'), replacement);
	fs.writeFileSync(fileName, result, 'utf8');
}

function moveFile(source, destination) {
	const sourceStream = fs.createReadStream(source);
	const destinationStream = fs.createWriteStream(destination);

	sourceStream.pipe(destinationStream, { end: false });
	sourceStream.on('end', () => {
		fs.unlinkSync(source);
	});
}
