# lit-element-template

Template for creating BrightspaceUI lit elements.

With this template you get:

* Project boilerplate including: README, .editorconfig, .gitignore, package.json, polymer.json, CODEOWNERS and LICENSE (Apache-2.0)
* A basic LitElement scaffold
* Demo page for the element
* Test page for the element
* Travis CI ready-to-go
* Local tests that do linting using ESLint and unit tests
* Cross-browser testing from Travis CI using Sauce Labs

## Setup

This assumes you have node installed.

1. Follow the Github instructions [here](https://help.github.com/en/articles/creating-a-repository-from-a-template) to create a new repository from this template, then clone the new repository on your local machine.
2. Within your local copy of your new repository, modify `config` at top of `configure-repo.js`. For example:
```
const config = {
	'shortName': 'myelement',
	'description': 'my test element',
	'codeowner': 'me',
	'type': 'labs' // labs | official
};
```
3. Run the script:
```
node configure-repo.js
```

After the script successfully runs, follow the instructions on the generated README for usage of your new component.

### Sauce Labs

To do cross-browser testing using Sauce Labs, the API key needs to be encrypted into the .travis.yml file.

To learn more about how to set this up, see the [testing](https://github.com/BrightspaceUI/guide/wiki/Testing) section of The Guide.

## Developing and Contributing

Pull requests welcome!
