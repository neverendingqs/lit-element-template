const fs = require('fs'); // eslint-disable-line

class Helper {

	constructor(config) {
		this.config = config;
		this.githubOrg = this.config.type === 'official' ? 'BrightspaceUI' : 'BrightspaceUILabs';
		this.orgName = this.config.type === 'official' ? '@brightspace-ui' : '@brightspace-ui-labs';
		this.packageName = `${this.orgName}/${this.config.shortName}`; // @brightspace-ui/element or @brightspace-ui-labs/element
		this.type = this.config.type === 'labs' ? 'labs-' : '';
		this.name = `d2l-${this.type}${this.config.shortName}`; // d2l-labs-element or d2l-element
	}

	moveFile(source, destination) {
		const sourceStream = fs.createReadStream(source);
		const destinationStream = fs.createWriteStream(destination);

		sourceStream.pipe(destinationStream, { end: false });
		sourceStream.on('end', () => {
			fs.unlinkSync(source);
		});
	}

	replaceText(fileName, original, replacement) {
		const data = fs.readFileSync(fileName, 'utf8');
		const result = data.replace(new RegExp(original, 'g'), replacement);
		fs.writeFileSync(fileName, result, 'utf8');
	}

	replaceTextWithConfigs(fileName) {
		if (fileName.indexOf('configure-repo.js') !== -1
			|| fileName.indexOf('configure-helper.js') !== -1
			|| fileName.indexOf('.git') !== -1
			|| fileName.indexOf('node_modules') !== -1) {
			return;
		}
		const data = fs.readFileSync(fileName, 'utf8');

		const result = data.replace(/<%= name %>/g, this.name)
			.replace(/<%= shortName %>/g, this.config.shortName)
			.replace(/<%= packageName %>/g, this.packageName)
			.replace(/<%= description %>/g, this.config.description)
			.replace(/<%= codeowner %>/g, this.config.codeowner)
			.replace(/<%= githubOrg %>/g, this.githubOrg);
		fs.writeFileSync(fileName, result, 'utf8');
	}

	updateFiles(path) {
		if (fs.existsSync(path)) {
			const files = fs.readdirSync(path);
			files.forEach((file) => {
				const currentPath = `${path}/${file}`;
				if (fs.lstatSync(currentPath).isDirectory()) {
					this.updateFiles(currentPath);
				} else {
					this.replaceTextWithConfigs(currentPath);
				}
			});
		}
	}

	updatePublishInfo() {
		let deployInfo, publishInfo;
		if (this.config.publish) {
			deployInfo = `deploy:
  - provider: npm
    email: d2ltravisdeploy@d2l.com
    skip_cleanup: true
    api_key:
      # d2l-travis-deploy: ...
    on:
      tags: true
      repo: ${this.githubOrg}/${this.config.shortName}`;
			publishInfo = `"publishConfig": { "access": "public" },\n  "files": [ "${this.config.shortName}.js" ]`;
		} else {
			deployInfo = '';
			publishInfo = '"private": true';
		}
		this.replaceText('package.json', '<%= publishInfo %>', publishInfo);
		this.replaceText('travis.yml', '<%= deployInfo %>', deployInfo);
	}
}

module.exports = Helper; // eslint-disable-line
