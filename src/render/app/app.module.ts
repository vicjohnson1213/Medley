import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularSplitModule } from 'angular-split';
import { AngularResizedEventModule } from 'angular-resize-event';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardPageComponent } from './pages/dashboard/dashboard.page';
import { components } from './components';
import { services } from './services';
import { pipes } from './pipes';

@NgModule({
    declarations: [
        AppComponent,
        DashboardPageComponent,
        ...components,
        ...pipes
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        AngularResizedEventModule,
        AngularSplitModule.forRoot()
    ],
    providers: [
        ...services,
        { provide: 'Monaco', useValue: (<any>window).monaco }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
