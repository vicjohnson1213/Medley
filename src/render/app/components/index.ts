import { EditorComponent } from './editor/editor.component';
import { EditMenuComponent } from './edit-menu/edit-menu.component';
import { ModalComponent } from './modal/modal.component';
import { TagTreeComponent } from './tag-tree/tag-tree.component';
import { MarkdownPreviewComponent } from './markdown-preview/markdown-preview.component';
import { MonacoEditorComponent } from './monaco-editor/monaco-editor.component';

export const components = [
    EditorComponent,
    EditMenuComponent,
    ModalComponent,
    TagTreeComponent,
    MarkdownPreviewComponent,
    MonacoEditorComponent
];

export * from './editor/editor.component';
export * from './edit-menu/edit-menu.component';
export * from './modal/modal.component';
export * from './tag-tree/tag-tree.component';
export * from './markdown-preview/markdown-preview.component';
export * from './monaco-editor/monaco-editor.component';