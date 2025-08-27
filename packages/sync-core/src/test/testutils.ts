import { RecordsDiff } from '@tldraw/store'

export function prettyPrintDiff(diff: RecordsDiff<any>): string {
	const before = {} as Record<string, any>
	const after = {} as Record<string, any>

	for (const added of Object.values(diff.added)) {
		after[added.id] = added
	}
	for (const [from, to] of Object.values(diff.updated)) {
		before[from.id] = from
		after[to.id] = to
	}
	for (const removed of Object.values(diff.removed)) {
		before[removed.id] = removed
	}

	return `Diff: Added=${Object.keys(after).length}, Updated=${Object.keys(diff.updated).length}, Removed=${Object.keys(before).length}`
}
