import { css, html, LitElement } from 'lit-element/lit-element.js';
import './todo.js';

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
		];

		this.addEventListener('delete-todo', this.handleDeleteTodo);
	}

	addTodo() {
		const newTodo = this.shadowRoot.getElementById('new-todo').value;
		if (newTodo) {
			this.todos = [
				...this.todos,
				{ name: newTodo }
			];
		}
	}

	handleDeleteTodo(event) {
		const deleteId = event.detail.id;
		this.todos.splice(deleteId, 1);
		this.requestUpdate();
	}

	render() {
		return html`
			<h2>Hello ${this.prop1}!</h2>
			<!-- TODO: hitting enter should also add the new TODO item -->
			<input type="text" id="new-todo" placeholder="New TODO">
			<button type="button" @click="${this.addTodo}">Add TODO</button>
			<ol>
				${this.todos.map(({ name }, i) => html`
					<d2l-labs-todo id="${i}" name="${name}"></d2l-labs-todo>
				`)}
			</ol>
		`;
	}
}
customElements.define('d2l-labs-first', First);
