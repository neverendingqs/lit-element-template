const fs = require('fs');

class Helper {

	checkIfDefined(property) {
		return this[property] ? true : false;
	}

	deleteFile(fileName) {
		fs.unlinkSync(fileName);
	}

	getRepoName() {
		return `${this.githubOrg}/${this.shortName}`; // BrightspaceUI/element or BrightspaceUILabs/element
	}

	getShortName() {
		return this.shortName;
	}

	moveFile(source, destination) {
		fs.renameSync(source, destination);
	}

	replaceText(fileName, original, replacement) {
		const data = fs.readFileSync(fileName, 'utf8');
		const result = data.replace(new RegExp(original, 'g'), replacement);
		fs.writeFileSync(fileName, result, 'utf8');
	}

	setDerivedProperties() {
		this.githubOrg = this.type === 'official' ? 'BrightspaceUI' : 'BrightspaceUILabs';
		this.orgName = this.type === 'official' ? '@brightspace-ui' : '@brightspace-ui-labs';
		this.packageName = `${this.orgName}/${this.shortName}`; // @brightspace-ui/element or @brightspace-ui-labs/element
		this.type = this.type === 'labs' ? 'labs-' : '';
		this.name = `d2l-${this.type}${this.shortName}`; // d2l-labs-element or d2l-element
	}

	setProperty(name, value) {
		this[name] = value;
	}

	updateFiles(path) {
		if (fs.existsSync(path)) {
			const files = fs.readdirSync(path);
			files.forEach((file) => {
				const currentPath = `${path}/${file}`;
				if (fs.lstatSync(currentPath).isDirectory()) {
					this.updateFiles(currentPath);
				} else {
					this._replaceTextWithConfigs(currentPath);
				}
			});
		}
	}

	updatePublishInfo() {
		let deployInfo, publishInfo, readmeInfo;
		if (this.publish === 'yes') {
			deployInfo = `deploy:
  - provider: npm
    email: d2ltravisdeploy@d2l.com
    skip_cleanup: true
    api_key:
      # d2l-travis-deploy: ...
    on:
      condition: $UPDATE_RESULT = 0
      repo: ${this.getRepoName()}`;
			publishInfo = `"publishConfig": { "access": "public" },\n  "files": [ "${this.shortName}.js" ]`;
			readmeInfo = ', create a tag, and trigger a deployment to NPM.';
		} else {
			deployInfo = '';
			publishInfo = '"private": true';
			readmeInfo = 'and create a tag.';
		}
		this.replaceText('package.json', '<%= publishInfo %>', publishInfo);
		this.replaceText('travis.yml', '<%= deployInfo %>', deployInfo);
		this.replaceText('README_element.md', '<%= readmeDeployment %>', readmeInfo);
	}

	_replaceTextWithConfigs(fileName) {
		if (fileName.indexOf('configure-repo.js') !== -1
			|| fileName.indexOf('configure-helper.js') !== -1
			|| fileName.indexOf('.git') !== -1
			|| fileName.indexOf('node_modules') !== -1) {
			return;
		}
		const data = fs.readFileSync(fileName, 'utf8');

		const result = data.replace(/<%= name %>/g, this.name)
			.replace(/<%= shortName %>/g, this.shortName)
			.replace(/<%= packageName %>/g, this.packageName)
			.replace(/<%= description %>/g, this.description)
			.replace(/<%= codeowner %>/g, this.codeowner)
			.replace(/<%= githubOrg %>/g, this.githubOrg);
		fs.writeFileSync(fileName, result, 'utf8');
	}
}

module.exports = Helper;
