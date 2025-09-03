---
title: Custom shape deletion
component: ./CustomShapeDeletionExample.tsx
category: shapes/tools
priority: 1
keywords: [deletion, canDelete, onBeforeDelete, custom]
---

Testing custom shape deletion hooks with canDelete and onBeforeDelete.

---

This example demonstrates the new shape-level deletion hooks:
- `canDelete(shape)`: Controls whether a shape can be deleted
- `onBeforeDelete(shape)`: Called before deletion, can prevent or customize deletion

The example creates two types of test shapes:
- **Red shapes**: Protected (canBeDeleted: false) - shows confirmation dialog
- **Green shapes**: Deletable (canBeDeleted: true) - deletes immediately

Try selecting shapes and pressing the Delete key to test the custom deletion behavior.
