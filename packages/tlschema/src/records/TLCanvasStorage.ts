import {
	BaseRecord,
	createMigrationIds,
	createRecordMigrationSequence,
	createRecordType,
	RecordId,
} from '@tldraw/store'
import { T } from '@tldraw/validate'
import { idValidator } from '../misc/id-validator'

/**
 * TLCanvasStorage
 *
 * @public
 */
export interface TLCanvasStorage extends BaseRecord<'canvas_storage', TLCanvasStorageId> {
	widgets: Record<string, Record<string, any>> // [shapeId][key] = value
	global: Record<string, any> // [key] = value
}

/** @public */
export type TLCanvasStorageId = RecordId<TLCanvasStorage>

/** @public */
export const canvasStorageValidator: T.Validator<TLCanvasStorage> = T.model(
	'canvas_storage',
	T.object({
		typeName: T.literal('canvas_storage'),
		id: idValidator<TLCanvasStorageId>('canvas_storage'),
		widgets: T.dict(T.string, T.dict(T.string, T.any)),
		global: T.dict(T.string, T.any),
	})
)

/** @public */
export const canvasStorageVersions = createMigrationIds('com.tldraw.canvas_storage', {
	Initial: 1,
} as const)

/** @public */
export const canvasStorageMigrations = createRecordMigrationSequence({
	sequenceId: 'com.tldraw.canvas_storage',
	recordType: 'canvas_storage',
	sequence: [
		{
			id: canvasStorageVersions.Initial,
			up: (record: any) => {
				// Initial migration - ensure widgets and global exist
				if (!record.widgets) record.widgets = {}
				if (!record.global) record.global = {}
			},
		},
	],
})

/** @public */
export const CanvasStorageRecordType = createRecordType<TLCanvasStorage>('canvas_storage', {
	validator: canvasStorageValidator,
	scope: 'document',
}).withDefaultProperties(
	(): Omit<TLCanvasStorage, 'id' | 'typeName'> => ({
		widgets: {},
		global: {},
	})
)

/** @public */
export const TLCANVAS_STORAGE_ID = CanvasStorageRecordType.createId('main')

/** @public */
export function isCanvasStorage(
	record?: BaseRecord<string, RecordId<BaseRecord<any, any>>>
): record is TLCanvasStorage {
	if (!record) return false
	return record.typeName === 'canvas_storage'
}
