const fs = require('fs'); // eslint-disable-line

const config = {
	'name': '',
	'shortName': '',
	'packageName': '',
	'description': '',
	'codeowner': ''
};

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
	const result = data.replace(/<%= name %>/g, config.name)
		.replace(/<%= shortName %>/g, config.shortName)
		.replace(/<%= packageName %>/g, config.packageName)
		.replace(/<%= description %>/g, config.description)
		.replace(/<%= codeowner %>/g, config.codeowner);
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

const path = './';

console.log(`Filling in config values for ${config.name}...`);
updateFiles(path);
const year = new Date().getFullYear().toString();
const licenseData = fs.readFileSync('LICENSE', 'utf8');
const licenseResult = licenseData.replace(/<%= year %>/g, year);
fs.writeFileSync('LICENSE', licenseResult, 'utf8');

console.log('Moving files...');
moveFile('_element.js', `${config.shortName}.js`);
moveFile('test/_element.html', `test/${config.shortName}.html`);
moveFile('travis.yml', '.travis.yml');
moveFile('.CODEOWNERS', 'CODEOWNERS');

fs.unlinkSync('README.md');
moveFile('README_element.md', 'README.md');

console.log(`Repo for ${config.name} successfully configured.`);
