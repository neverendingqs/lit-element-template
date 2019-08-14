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

	updateLocalizationInfo() {
		let localizeExtends, localizeMixin, localizeResources, localizedDemo;
		if (this.localization === 'yes') {
			localizeExtends = 'LocalizeMixin(LitElement)';
			localizeMixin = '\nimport { LocalizeMixin } from \'@brightspace-ui/core/mixins/localize-mixin.js\';';
			localizedDemo = '\n\t\t\t<div>Localization Example: ${this.localize(\'myLangTerm\')}</div>';

			if (this.localizationResources === 'static') {
				localizeResources = `\n\tstatic async getLocalizeResources(langs) {
		const langResources = {
			'en': { 'myLangTerm': 'I am a localized string!' }
		};

		for (let i = 0; i < langs.length; i++) {
			if (langResources[langs[i]]) {
				return {
					language: langs[i],
					resources: langResources[langs[i]]
				};
			}
		}

		return null;
	}\n`;
			} else {
				// dynamic
				const enFileContents = 'export const val = {\n\t\'myLangTerm\': \'I am a dynamically imported localized string!\'\n};\n';
				fs.mkdirSync('locales');
				fs.writeFileSync('locales/en.js', enFileContents);

				localizeResources = `\n\tstatic async getLocalizeResources(langs) {
		for await (const lang of langs) {
			let translations;
			switch (lang) {
				case 'en':
					translations = await import('./locales/en.js');
					break;
			}

			if (translations && translations.val) {
				return {
					language: lang,
					resources: translations.val
				};
			}
		}

		return null;
	}\n`;
			}
		} else {
			localizeExtends = 'LitElement';
			localizeMixin = '';
			localizeResources = '';
			localizedDemo = '';
		}

		this.replaceText('_element.js', '<%= extends %>', localizeExtends);
		this.replaceText('_element.js', '<%= localizeMixin %>', localizeMixin);
		this.replaceText('_element.js', '<%= localizeResources %>', localizeResources);
		this.replaceText('_element.js', '<%= localizedDemo %>', localizedDemo);
	}

	updatePublishInfo() {
		let deployInfo, publishInfo;
		if (this.publish === 'yes') {
			deployInfo = `deploy:
  - provider: npm
    email: d2ltravisdeploy@d2l.com
    skip_cleanup: true
    api_key:
      # d2l-travis-deploy: ...
    on:
      tags: true
      repo: ${this.getRepoName()}`;
			publishInfo = `"publishConfig": { "access": "public" },\n  "files": [ "${this.shortName}.js" ]`;
		} else {
			deployInfo = '';
			publishInfo = '"private": true';
		}
		this.replaceText('package.json', '<%= publishInfo %>', publishInfo);
		this.replaceText('travis.yml', '<%= deployInfo %>', deployInfo);
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
