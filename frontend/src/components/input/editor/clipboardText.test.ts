import {describe, it, expect, afterEach, beforeEach} from 'vitest'
import {createPinia, setActivePinia} from 'pinia'
import {ref} from 'vue'
import {Editor} from '@tiptap/core'

import {createEditorExtensions} from './editorExtensions'
import {fragmentToPlainText} from './clipboardText'

window.API_URL = 'http://localhost:3456'

function createEditor(content: string) {
	const holder = document.createElement('div')
	document.body.appendChild(holder)

	let editor: Editor
	editor = new Editor({
		element: holder,
		extensions: createEditorExtensions({
			t: key => key,
			isEditing: ref(true),
			isEditEnabled: () => true,
			placeholder: '',
			contentHasChanged: ref(false),
			bubbleSave: () => {},
			getEditor: () => editor,
			uploadCallback: undefined,
			uploadAndInsertFiles: () => {},
		}),
		content,
	})

	return editor
}

beforeEach(() => {
	setActivePinia(createPinia())
})

afterEach(() => {
	document.body.innerHTML = ''
})

describe('fragmentToPlainText', () => {
	it('keeps bullet markers on list items', () => {
		const editor = createEditor('<p>start</p><ul><li><p>this</p></li><li><p>is</p></li></ul><p>end</p>')

		expect(fragmentToPlainText(editor.state.doc.content)).toBe('start\n- this\n- is\nend')
	})

	it('numbers ordered list items', () => {
		const editor = createEditor('<ol><li><p>one</p></li><li><p>two</p></li></ol>')

		expect(fragmentToPlainText(editor.state.doc.content)).toBe('1. one\n2. two')
	})

	it('indents nested items under their marker', () => {
		const editor = createEditor('<ul><li><p>outer</p><ul><li><p>inner</p></li></ul></li></ul>')

		expect(fragmentToPlainText(editor.state.doc.content)).toBe('- outer\n  - inner')
	})
})
