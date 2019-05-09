import { Observable } from 'rxjs';

export interface NoteTreeNode {
    Name: string;
    Content?: string;
    Path: string;
    Children?: NoteTreeNode[];
}
