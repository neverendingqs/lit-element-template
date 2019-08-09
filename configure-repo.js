const fs = require('fs'); // eslint-disable-line

const config = {
	'name': '',
	'shortName': '',
	'packageName': '',
	'description': '',
	'codeowner': ''
};

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
		if (fileName.indexOf('configure-repo.js') !== -1
			|| fileName.indexOf('.git') !== -1
			|| fileName.indexOf('node_modules') !== -1) {
			return;
		}
		fs.readFile(fileName, 'utf8', (err, data) => {
			if (err) {
				return console.log(err);
			}
			const result = data.replace(/<%= name %>/g, config.name)
				.replace(/<%= shortName %>/g, config.shortName)
				.replace(/<%= packageName %>/g, config.packageName)
				.replace(/<%= description %>/g, config.description)
				.replace(/<%= codeowner %>/g, config.codeowner);

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
console.log(`Filling in config values for ${config.name}...`);
return updateFiles(path).then(() => {
	const year = new Date().getFullYear().toString();
	fs.readFile('LICENSE', 'utf8', (err, data) => {
		if (err) {
			return console.log(err);
		}
		const result = data.replace(/<%= year %>/g, year);

		fs.writeFile('LICENSE', result, 'utf8', (err) => {
			if (err) return console.log(err);
		});
	});

	console.log('Moving files...');
	moveFile('_element.js', `${config.shortName}.js`);
	moveFile('test/_element.html', `test/${config.shortName}.html`);
	moveFile('travis.yml', '.travis.yml');
	moveFile('.CODEOWNERS', 'CODEOWNERS');

	fs.unlinkSync('README.md');
	moveFile('README_element.md', 'README.md');

	console.log(`Repo for ${config.name} successfully configured.`);
});
