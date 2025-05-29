import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy, Input, TemplateRef, Injectable, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DialogService, DialogRef, DialogCloseResult } from '@progress/kendo-angular-dialog';

@Component({
  selector: 'save-cancel-confirmation-dialog-component',
  templateUrl: './save-cancel-confirmation-dialog.component.html',
  styleUrls: ['./save-cancel-confirmation-dialog.component.css']
})

@Injectable()
export class SaveCancelConfirmationDialogComponent implements AfterViewInit, OnInit {
  // AI changed: Moved model declaration before usage
  public model = new class {
    constructor(public component: SaveCancelConfirmationDialogComponent) { }
  }(this);

  // AI changed: Moved datasources declaration before usage
  public datasources = new class {
    constructor(public component: SaveCancelConfirmationDialogComponent, public model: any) {
    }
  }(this, this.model);

  // AI changed: Moved UI declaration after model and datasources
  public UI = new class {
    constructor(public component: SaveCancelConfirmationDialogComponent, public model: any, public datasources: any) {
    }

    public controls = new class {
      constructor(public component: SaveCancelConfirmationDialogComponent, public model: any, public datasources: any) {
      }
    }(this.component, this.model, this.datasources)

    showConfirmationDialog(title: string, message: string, yesCallback: () => void, noCallback: () => void) {
      let dialog: DialogRef = this.component.dialogService.open({
        title: title,
        content: message,
        actions: [
          { text: 'Save', userConfirmed: true },
          { text: 'Cancel', primary: true, userConfirmed: false }
        ],
        width: 450,
        height: 200,
        minWidth: 250
      });
      let result: any;

      dialog.result.subscribe((result) => {
        if (result instanceof DialogCloseResult) {
          noCallback();
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
    }

    public handlers = new class {
      constructor(public component: SaveCancelConfirmationDialogComponent, public model: any, public controls: any, public datasources: any, public UI: any) {
      }
    }(this.component, this.model, this.controls, this.component.datasources, this);

    setup() {
    }
  }(this, this.model, this.datasources);

  constructor(private router: Router, private dialogService: DialogService) {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
  }
}