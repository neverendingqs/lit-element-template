const fs = require('fs'); // eslint-disable-line
const Helper = require('./configure-helper.js'); // eslint-disable-line

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

const helper = new Helper(config);

console.log(`Filling in config values for ${helper.name}...`);
helper.updateFiles('./');
const year = new Date().getFullYear().toString();
helper.replaceText('LICENSE', '<%= year %>', year);
helper.updatePublishInfo();

console.log('Moving files...');
helper.moveFile('_element.js', `${config.shortName}.js`);
helper.moveFile('test/_element.html', `test/${config.shortName}.html`);
helper.moveFile('travis.yml', '.travis.yml');
helper.moveFile('.CODEOWNERS', 'CODEOWNERS');

fs.unlinkSync('README.md');
helper.moveFile('README_element.md', 'README.md');

console.log(`Repo for ${helper.name} successfully configured.`);
