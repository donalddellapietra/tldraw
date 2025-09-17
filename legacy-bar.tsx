import { useCanRedo, useCanUndo } from '../../hooks/menu-hooks'
import { AccessibilityMenu } from '../AccessibilityMenu'
import { ColorSchemeMenu } from '../ColorSchemeMenu'
import { KeyboardShortcutsMenuItem } from '../HelpMenu/DefaultHelpMenuContent'
import { LanguageMenu } from '../LanguageMenu'
import {
	ClipboardMenuGroup,
	ConversionsMenuGroup,
	SelectAllMenuItem,
	ToggleDebugModeItem,
	ToggleDynamicSizeModeItem,
	ToggleEdgeScrollingItem,
	ToggleFocusModeItem,
	ToggleGridItem,
	TogglePasteAtCursorItem,
	ToggleSnapModeItem,
	ToggleToolLockItem,
	ToggleWrapModeItem,
	ZoomTo100MenuItem,
	ZoomToFitMenuItem,
	ZoomToSelectionMenuItem,
} from '../menu-items'
import { TldrawUiMenuActionItem } from '../primitives/menus/TldrawUiMenuActionItem'
import { TldrawUiMenuGroup } from '../primitives/menus/TldrawUiMenuGroup'
import { TldrawUiMenuSubmenu } from '../primitives/menus/TldrawUiMenuSubmenu'

/** @public @react */
export function DefaultMainMenuContent() {
	return (
		<>
			<TldrawUiMenuGroup id="basic">
				<EditSubmenu />
				<ViewSubmenu />
				<ExportFileContentSubMenu />
				<ExtrasGroup />
			</TldrawUiMenuGroup>
			<PreferencesGroup />
		</>
	)
}

/** @public @react */
export function ExportFileContentSubMenu() {
	return (
		<TldrawUiMenuSubmenu id="export" label="menu.export">
			<TldrawUiMenuGroup id="export-group">
				<TldrawUiMenuActionItem actionId="export-as-svg" />
				<TldrawUiMenuActionItem actionId="export-as-png" />
				<TldrawUiMenuActionItem actionId="export-as-json" />
			</TldrawUiMenuGroup>
			<ConversionsMenuGroup />
		</TldrawUiMenuSubmenu>
	)
}

/** @public @react */
export function EditSubmenu() {
	const canUndo = useCanUndo()
	const canRedo = useCanRedo()

	return (
		<TldrawUiMenuSubmenu id="edit" label="menu.edit">
			<TldrawUiMenuGroup id="history">
				<TldrawUiMenuActionItem actionId="undo" disabled={!canUndo} />
				<TldrawUiMenuActionItem actionId="redo" disabled={!canRedo} />
			</TldrawUiMenuGroup>
			<ClipboardMenuGroup />
			<TldrawUiMenuGroup id="set-selection-group">
				<SelectAllMenuItem />
			</TldrawUiMenuGroup>
			<TldrawUiMenuGroup id="delete-group">
				<TldrawUiMenuActionItem actionId="delete" />
			</TldrawUiMenuGroup>
		</TldrawUiMenuSubmenu>
	)
}

/** @public @react */
export function ViewSubmenu() {
	return (
		<TldrawUiMenuSubmenu id="view" label="menu.view">
			<TldrawUiMenuGroup id="view-actions">
				<ZoomTo100MenuItem />
				<ZoomToFitMenuItem />
				<ZoomToSelectionMenuItem />
			</TldrawUiMenuGroup>
		</TldrawUiMenuSubmenu>
	)
}

export function ExtrasGroup() {
	return (
		<>
			<TldrawUiMenuActionItem actionId="insert-embed" />

			<TldrawUiMenuActionItem actionId="insert-media" />
		</>
	)
}

/* ------------------- Preferences ------------------ */

/** @public @react */
export function PreferencesGroup() {
	return (
		<TldrawUiMenuGroup id="preferences">
			<TldrawUiMenuSubmenu id="preferences" label="menu.preferences">
				<TldrawUiMenuGroup id="preferences-actions">
					<ToggleSnapModeItem />
					<ToggleToolLockItem />
					<ToggleGridItem />
					<ToggleWrapModeItem />
					<ToggleFocusModeItem />
					<ToggleEdgeScrollingItem />
					<ToggleDynamicSizeModeItem />
					<TogglePasteAtCursorItem />
					<ToggleDebugModeItem />
				</TldrawUiMenuGroup>
				<TldrawUiMenuGroup id="color-scheme">
					<ColorSchemeMenu />
				</TldrawUiMenuGroup>
				<TldrawUiMenuGroup id="accessibility-menu">
					<AccessibilityMenu />
				</TldrawUiMenuGroup>
			</TldrawUiMenuSubmenu>
			<LanguageMenu />
			<KeyboardShortcutsMenuItem />
		</TldrawUiMenuGroup>
	)
}
