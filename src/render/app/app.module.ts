import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MonacoEditorModule, NgxMonacoEditorConfig } from './components/monaco-editor';
import { AngularSplitModule } from 'angular-split';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardPageComponent } from './pages/dashboard/dashboard.page';
import { components } from './components';
import { services } from './services';

@NgModule({
    declarations: [
        AppComponent,
        DashboardPageComponent,
        ...components
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        AngularSplitModule.forRoot(),
        MonacoEditorModule.forRoot()
    ],
    providers: [
        ...services
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
