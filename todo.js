import { css, html, LitElement } from 'lit-element/lit-element.js';

class Todo extends LitElement {
	static get properties() {
		return {
			id: { type: Number },
			name: { type: String }
		};
	}

	deleteTodo() {
		const deleteEvent = new CustomEvent('delete-todo', {
			detail: {
				message: 'delete button clicked',
				id: this.id
			},
			bubbles: true,
			composed: true
		});

		this.dispatchEvent(deleteEvent);
	}

	render() {
		return html`
			<li>${this.name} <button type="button" @click=${this.deleteTodo}>Delete</button></li>
		`;
	}
}

customElements.define('d2l-labs-todo', Todo);
