import type {Fragment, Node as ProseMirrorNode} from '@tiptap/pm/model'

const LIST_TYPES = ['bulletList', 'orderedList', 'taskList']

/**
 * Plain text for a copied slice. ProseMirror's default joins blocks without their list
 * markers, so pasting a copied list into a plain text field loses which lines were items.
 *
 * `first` prefixes the first line of a node, `rest` every line after it, so nested
 * items line up under their marker.
 */
export function fragmentToPlainText(fragment: Fragment): string {
	const lines: string[] = []
	fragment.forEach(node => lines.push(...nodeLines(node, '', '')))
	return lines.join('\n')
}

function nodeLines(node: ProseMirrorNode, first: string, rest: string): string[] {
	if (node.isTextblock) {
		return [first + node.textContent]
	}

	const lines: string[] = []

	if (LIST_TYPES.includes(node.type.name)) {
		node.forEach((item, _offset, index) => {
			const marker = node.type.name === 'orderedList' ? `${index + 1}. ` : '- '
			const itemFirst = (index === 0 ? first : rest) + marker
			lines.push(...nodeLines(item, itemFirst, rest + ' '.repeat(marker.length)))
		})
		return lines
	}

	node.forEach((child, _offset, index) => {
		lines.push(...nodeLines(child, index === 0 ? first : rest, rest))
	})
	return lines
}
