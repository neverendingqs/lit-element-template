import { css, html, LitElement } from 'lit-element/lit-element.js';

class First extends LitElement {

	static get properties() {
		return {
			prop1: { type: String },
			todos: { type: Array }
		};
	}

	static get styles() {
		return css`
			:host {
				display: inline-block;
			}
			:host([hidden]) {
				display: none;
			}
		`;
	}

	constructor() {
		super();

		this.prop1 = 'first';
		this.todos = [
			{ name: 'todo1' },
			{ name: 'todo2' }
		]
	}

	addTodo() {
		const newTodo = this.shadowRoot.getElementById('new-todo').value;
		if(newTodo) {
			this.todos = [
				...this.todos,
				{ name: newTodo }
			];
		}
	}

	render() {
		return html`
			<h2>Hello ${this.prop1}!</h2>
			<input type="text" id="new-todo" placeholder="New TODO">
			<button type="button" @click="${this.addTodo}">Add TODO</button>
			<ol>
				${this.todos.map(({ name }) => html`
					<li>${name}</li>
				`)}
			</ol>
		`;
	}
}
customElements.define('d2l-labs-first', First);
