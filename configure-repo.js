const Helper = require('./configure-helper.js'); // eslint-disable-line
const standardInput = process.stdin; // eslint-disable-line
const standardOutput = process.stdout; // eslint-disable-line
standardInput.setEncoding('utf-8');

const helper = new Helper();

console.log('\nConfiguring new LitElement repository. Respond to the following prompts about the new element.\n');
const prompts = [
	{ prompt: 'Short Name (e.g., button, dropdown): ', property: 'shortName' },
	{ prompt: 'Description: ', property: 'description' },
	{ prompt: 'Codeowner (e.g., myaccountname): ', property: 'codeowner' },
	{ prompt: 'Publish (true | false): ', property: 'publish' },
	{ prompt: 'Type (labs | official): ', property: 'type' }
];

let counter = 0;
standardOutput.write(prompts[counter].prompt);

standardInput.on('data', (data) => {
	helper.setProperty(prompts[counter].property, data.trim());
	counter++;

	if (counter < prompts.length) {
		standardOutput.write(prompts[counter].prompt);
	} else {
		helper.setDerivedProperties();
		completeRepoSetup();
	}
});

function completeRepoSetup()  {
	console.log(`Filling in config values for ${helper.getRepoName()}...`);

	helper.updateFiles('./');
	const year = new Date().getFullYear().toString();
	helper.replaceText('LICENSE', '<%= year %>', year);
	helper.updatePublishInfo();

	console.log('Moving files...');
	helper.moveFile('_element.js', `${helper.getShortName()}.js`);
	helper.moveFile('test/_element.html', `test/${helper.getShortName()}.html`);
	helper.moveFile('travis.yml', '.travis.yml');
	helper.moveFile('.CODEOWNERS', 'CODEOWNERS');

	helper.deleteFile('README.md');
	helper.moveFile('README_element.md', 'README.md');

	console.log(`Repo for ${helper.getRepoName()} successfully configured.`);
	process.exit(); // eslint-disable-line
}
