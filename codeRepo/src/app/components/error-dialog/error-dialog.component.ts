import { Injector,ApplicationRef,Component, ViewChild, ElementRef, AfterViewInit, OnDestroy, Input, TemplateRef, Injectable, OnInit } from '@angular/core';
import { DialogService, DialogRef, DialogCloseResult } from '@progress/kendo-angular-dialog';
import { AppComponent } from '../../app.component';



@Component({
  selector: 'error-dialog-component',
  templateUrl: './error-dialog.component.html',
  styleUrls: ['./error-dialog.component.css']

})

@Injectable()
export class ErrorDialogComponent implements AfterViewInit, OnInit {
  constructor(private dialogService: DialogService, private injector : Injector)  {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
  }

  // Model
  public model = new class {
    constructor(public component: ErrorDialogComponent) { }

  }(this);

  // ---------------------------------------------------
  // ---------------------------------------------------
  // ---------------------------------------------------
  // ---------------------------------------------------
  // Model 
  public datasources = new class {
    constructor(public component: ErrorDialogComponent, public model: any) {
    }
  }(this, this.model);
  // ---------------------------------------------------
  // UI
  public UI = new class {

    constructor(public component: ErrorDialogComponent, public model: any, public datasources: any) {
    }

    // ---------------------------------------------------
    // UI.controls

    public controls = new class {
      constructor(public component: ErrorDialogComponent, public model: any, public datasources: any) {
      }
    }(this.component, this.model, this.datasources)

    showErrorDialog(message: string, closeCallback: () => void) {
      let dialog: DialogRef = this.component.dialogService.open({
        title: 'Critical Error',
        content: message,
        actions: [
          { text: 'Ok', primary: true, userConfirmed: true },
        ],
        width: 450,
        height: 200,
        minWidth: 250
      });
      let result: any;

      dialog.result.subscribe((result) => {

        if (result instanceof DialogCloseResult) {
          closeCallback();
        } else {
          let resultCasted: any = result;

          if (resultCasted.userConfirmed) {
            closeCallback();
          }
        }
      });
    }

    showTechnicalErrorDialog(title: string, errorDetails: string, closeCallback: () => void) {

      let appRef: any = this.component.injector.get(ApplicationRef);
      let dialog: DialogRef = this.component.dialogService.open({
        title: title,
        content: errorDetails,

        actions: [
          { text: 'Ok', primary: true, userConfirmed: true },
        ],
        width: 850,
        height: 400,
        minWidth: 250,  
        appendTo: appRef.AppComponentViewRef
      });
      let result: any;
      
      dialog.result.subscribe((result) => {

        if (result instanceof DialogCloseResult) {
          closeCallback();
        } else {
          let resultCasted: any = result;

          if (resultCasted.userConfirmed) {
            if (closeCallback != null) {
              closeCallback();
            }
          }
        }
      });
    }
    // ---------------------------------------------------
    // UI.handlers 

    public handlers = new class {
      constructor(public component: ErrorDialogComponent, public model: any, public controls: any, public datasources: any, public UI: any) {
      }


    }(this.component, this.model, this.controls, this.component.datasources, this);


    // ---------------------------------------------------
    // UI.setup() functions
    setup() {

    }
  }(this, this.model, this.datasources);

}
