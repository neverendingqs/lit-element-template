const fs = require('fs'); // eslint-disable-line

const config = {
	'name': 'd2l-myelement',
	'shortName': 'myelement',
	'packageName': '@brightspace-ui/myelement',
	'description': 'my test element',
	'codeowner': 'me'
};

function replaceText(filename, replace, replacement) {
	fs.readFile(filename, 'utf8', (err, data) => {
		if (err) {
			return console.log(err);
		}
		const result = data.replace(new RegExp(replace, 'g'), replacement);

		fs.writeFile(filename, result, 'utf8', (err) => {
			if (err) return console.log(err);
		});
	});
}

function updateFiles(path) {
	return new Promise((resolve) => {
		if (fs.existsSync(path)) {
			const files = fs.readdirSync(path);
			files.forEach((file) => {
				const currentPath = `${path}/${file}`;
				if (fs.lstatSync(currentPath).isDirectory()) {
					resolve(updateFiles(currentPath));
				} else {
					resolve(replaceTextWithConfigs(currentPath));
				}
			});
		}
	});
}

function replaceTextWithConfigs(fileName) {
	return new Promise((resolve) => {
		fs.readFile(fileName, 'utf8', (err, data) => {
			if (fileName.indexOf('configure-repo.js') !== -1
				|| fileName.indexOf('.git') !== -1
				|| fileName.indexOf('node_modules') !== -1) {
				return;
			}
			if (err) {
				return console.log(err);
			}
			const result = data.replace(/<%= name %>/g, config.name)
				.replace(/<%= shortName %>/g, config.shortName)
				.replace(/<%= packageName %>/g, config.packageName)
				.replace(/<%= description %>/g, config.description);

			fs.writeFile(fileName, result, 'utf8', (err) => {
				if (err) return console.log(err);
				resolve();
			});
		});
	});
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
console.log(`Filing in config values for ${config.name}`);
return updateFiles(path).then(() => {
	replaceText('CODEOWNERS', '<%= codeowner %>', config.codeowner);

	const year = new Date().getFullYear().toString();
	replaceText('LICENSE', '<%= year %>', year);

	console.log('Moving necessary files');
	moveFile('./_element.js', `./${config.shortName}.js`);
	moveFile('./test/_element.html', `./test/${config.shortName}.html`);
	moveFile('./travis.yml', './.travis.yml');
	console.log(`Repo for ${config.name} successfully configured.`);
});
