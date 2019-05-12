import { Observable } from 'rxjs';

export interface Note {
    Name: string;
    Content?: string;
    Path: string;
    Children?: Note[];
    Expanded?: boolean;
    IsFile: boolean;
}
