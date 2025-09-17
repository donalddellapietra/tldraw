import {
	Editor,
	sanitizeId,
	TLExportType,
	TLFrameShape,
	TLImageExportOptions,
	TLShapeId,
} from '@tldraw/editor'

/** @public */
export interface ExportAsOptions extends TLImageExportOptions {
	/** {@inheritdoc @tldraw/editor#TLImageExportOptions.format} */
	format: TLExportType
	/** Name of the exported file. If undefined a predefined name, based on the selection, will be used. */
	name?: string
}

/**
 * Export the given shapes as files.
 *
 * @param editor - The editor instance.
 * @param ids - The ids of the shapes to export.
 * @param opts - Options for the export.
 *
 * @public
 */
export async function exportAs(
	editor: Editor,
	ids: TLShapeId[],
	opts: ExportAsOptions
): Promise<void>
/**
 * @deprecated The format & name parameters are now part of the opts object.
 * @public
 */
export async function exportAs(
	editor: Editor,
	ids: TLShapeId[],
	format?: TLExportType,
	name?: string,
	opts?: TLImageExportOptions
): Promise<void>
export async function exportAs(
	...args:
		| [
				editor: Editor,
				ids: TLShapeId[],
				opts: TLImageExportOptions & { format: TLExportType; name?: string },
		  ]
		| [
				editor: Editor,
				ids: TLShapeId[],
				format?: TLExportType,
				name?: string,
				opts?: TLImageExportOptions,
		  ]
) {
	const [editor, ids, opts] =
		typeof args[2] === 'object'
			? args
			: [args[0], args[1], { ...args[4], format: args[2] ?? 'png', name: args[3] }]

	// If we don't get name then use a predefined one
	let name = opts.name
	if (!name) {
		name = `shapes at ${getTimestamp()}`
		if (ids.length === 1) {
			const first = editor.getShape(ids[0])!
			if (editor.isShapeOfType<TLFrameShape>(first, 'frame')) {
				name = first.props.name || 'frame'
			} else {
				name = `${sanitizeId(first.id)} at ${getTimestamp()}`
			}
		}
	}
	name += `.${opts.format}`

	let blob: Blob

	if (opts.format === 'png') {
		// Use SVG → Canvas → PNG pipeline for better results
		const svgResult = await editor.getSvgString(ids, {
			...opts,
			embedFonts: false, // Avoid font loading issues
			padding: (opts.padding || 32) + 16, // Add extra padding to prevent text cutoff
		})

		if (!svgResult) throw new Error('Failed to generate SVG')

		// Convert SVG to PNG via Canvas
		blob = await svgToPng(svgResult.svg, {
			width: svgResult.width,
			height: svgResult.height,
			scale: opts.scale || 1,
			background: opts.background ?? true,
		})
	} else {
		// Use original method for other formats (SVG, etc.)
		const result = await editor.toImage(ids, {
			...opts,
			embedFonts: opts.embedFonts ?? false, // Default to false to avoid font loading issues
		})
		blob = result.blob
	}

	const file = new File([blob], name, { type: blob.type })
	downloadFile(file)
}

function getTimestamp() {
	const now = new Date()

	const year = String(now.getFullYear()).slice(2)
	const month = String(now.getMonth() + 1).padStart(2, '0')
	const day = String(now.getDate()).padStart(2, '0')
	const hours = String(now.getHours()).padStart(2, '0')
	const minutes = String(now.getMinutes()).padStart(2, '0')
	const seconds = String(now.getSeconds()).padStart(2, '0')

	return `${year}-${month}-${day} ${hours}.${minutes}.${seconds}`
}

/**
 * Convert SVG string to PNG blob using Canvas
 * @internal
 */
async function svgToPng(
	svgString: string,
	options: {
		width: number
		height: number
		scale: number
		background: boolean
	}
): Promise<Blob> {
	const { width, height, scale, background } = options

	return new Promise((resolve, reject) => {
		const canvas = document.createElement('canvas')
		const ctx = canvas.getContext('2d')!

		// Add extra padding to prevent any cutoff issues
		const extraPadding = 20
		const finalWidth = (width + extraPadding * 2) * scale
		const finalHeight = (height + extraPadding * 2) * scale

		// Set canvas size with scale and extra padding
		canvas.width = finalWidth
		canvas.height = finalHeight

		// Set background if needed
		if (background) {
			ctx.fillStyle = '#ffffff'
			ctx.fillRect(0, 0, canvas.width, canvas.height)
		}

		// Create image from SVG
		const img = new Image()

		img.onload = () => {
			// Draw SVG to canvas with extra padding offset
			const paddingOffset = extraPadding * scale
			ctx.drawImage(img, paddingOffset, paddingOffset, width * scale, height * scale)

			// Convert canvas to PNG blob
			canvas.toBlob(
				(blob) => {
					if (blob) {
						resolve(blob)
					} else {
						reject(new Error('Failed to convert canvas to blob'))
					}
				},
				'image/png',
				1.0
			)
		}

		img.onerror = () => {
			reject(new Error('Failed to load SVG'))
		}

		// Convert SVG to data URL (avoids CORS/tainted canvas issues)
		const svgDataUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)))
		img.src = svgDataUrl
	})
}

/** @internal */
export function downloadFile(file: File) {
	const link = document.createElement('a')
	const url = URL.createObjectURL(file)
	link.href = url
	link.download = file.name
	link.click()
	URL.revokeObjectURL(url)
}
