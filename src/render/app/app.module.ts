import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MonacoEditorModule, NgxMonacoEditorConfig } from 'ngx-monaco-editor';
import { AngularSplitModule } from 'angular-split';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardPageComponent } from './pages/dashboard/dashboard.page';
import { components } from './components';
import { services } from './services';

const monacoConfig: NgxMonacoEditorConfig = {
    baseUrl: './assets', // configure base path for monaco editor
    onMonacoLoad: () => { console.log((<any>window).monaco); } // here monaco object will be available as window.monaco use this function to extend monaco editor functionalities.
  };

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
        MonacoEditorModule.forRoot(monacoConfig)
    ],
    providers: [
        ...services
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
