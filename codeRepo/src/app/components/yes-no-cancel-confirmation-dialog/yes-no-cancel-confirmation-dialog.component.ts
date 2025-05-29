import { Component, AfterViewInit, Injectable, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DialogService, DialogRef, DialogCloseResult } from '@progress/kendo-angular-dialog';


@Component({
  selector: 'yes-no-cancel-confirmation-dialog-component',
  templateUrl: './yes-no-cancel-confirmation-dialog.component.html',
  styleUrls: ['./yes-no-cancel-confirmation-dialog.component.css']

})

@Injectable()
export class YesNoCancelConfirmationDialogComponent implements AfterViewInit, OnInit {
  constructor(private router: Router, private dialogService: DialogService) {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
  }

  // Model
  public model = new class {
    constructor(public component: YesNoCancelConfirmationDialogComponent) { }

  }(this);

  // ---------------------------------------------------
  // ---------------------------------------------------
  // ---------------------------------------------------
  // ---------------------------------------------------
  // Model 
  public datasources = new class {
    constructor(public component: YesNoCancelConfirmationDialogComponent, public model: any) {
    }
  }(this, this.model);
  // ---------------------------------------------------
  // UI
  public UI = new class {

    constructor(public component: YesNoCancelConfirmationDialogComponent, public model: any, public datasources: any) {
    }

    // ---------------------------------------------------
    // UI.controls

    public controls = new class {
      constructor(public component: YesNoCancelConfirmationDialogComponent, public model: any, public datasources: any) {
      }
    }(this.component, this.model, this.datasources)

    showConfirmationDialog(title: string, message: string, yesCallback: () => void, noCallback: () => void, cancelCallback: () => void) {
      setTimeout(() => {
        let dialog: DialogRef = this.component.dialogService.open({
          title: title,
          content: message,

          actions: [
            { text: 'Yes', userConfirmed: true },
            { text: 'No', primary: true, userConfirmed: false }
          ],
          width: 450,
          height: 200,
          minWidth: 250
        });
        let result: any;

        dialog.result.subscribe((result) => {

          if (result instanceof DialogCloseResult) {
            cancelCallback();
          } else {
            let resultCasted: any = result;
            if (resultCasted.userConfirmed) {
              yesCallback();
            }
            else {
              noCallback();
            }
          }
        });
      }, 0);
    }

    // ---------------------------------------------------
    // UI.handlers 

    public handlers = new class {
      constructor(public component: YesNoCancelConfirmationDialogComponent, public model: any, public controls: any, public datasources: any, public UI: any) {
      }


    }(this.component, this.model, this.controls, this.component.datasources, this);

    // ---------------------------------------------------
    // UI.setup() functions
    setup() {

    }
  }(this, this.model, this.datasources);

}
