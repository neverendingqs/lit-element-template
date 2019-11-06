import { css, html, LitElement } from 'lit-element/lit-element.js';

class Todo extends LitElement {
	static get properties() {
		return {
			name: { type: String }
		}
	}

	render() {
		return html`
			<li>${this.name}</li>
		`
	}
}

customElements.define('d2l-labs-todo', Todo);
