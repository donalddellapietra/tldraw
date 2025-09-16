import { TLAsset } from './TLAsset'
import { TLBinding } from './TLBinding'
import { TLCamera } from './TLCamera'
import { TLCanvasStorage } from './TLCanvasStorage'
import { TLDocument } from './TLDocument'
import { TLInstance } from './TLInstance'
import { TLPage } from './TLPage'
import { TLInstancePageState } from './TLPageState'
import { TLPointer } from './TLPointer'
import { TLInstancePresence } from './TLPresence'
import { TLShape } from './TLShape'

/** @public */
export type TLRecord =
	| TLAsset
	| TLBinding
	| TLCamera
	| TLCanvasStorage
	| TLDocument
	| TLInstance
	| TLInstancePageState
	| TLPage
	| TLShape
	| TLInstancePresence
	| TLPointer
