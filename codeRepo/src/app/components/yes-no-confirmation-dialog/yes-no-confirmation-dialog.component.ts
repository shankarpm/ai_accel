import { AfterViewInit, Component, Injectable, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DialogCloseResult, DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { MessageBoxComponent } from '../ok-dialog/ok-dialog.component';


@Component({
  selector: 'yes-no-confirmation-dialog-component',
  templateUrl: './yes-no-confirmation-dialog.component.html',
  styleUrls: ['./yes-no-confirmation-dialog.component.css']

})

@Injectable()
export class YesNoConfirmationDialogComponent implements AfterViewInit, OnInit {
  constructor(private router: Router, private dialogService: DialogService) {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
  }

  // Model
  public model = new class {
    constructor(public component: YesNoConfirmationDialogComponent) { }

  }(this);

  // ---------------------------------------------------
  // ---------------------------------------------------
  // ---------------------------------------------------
  // ---------------------------------------------------
  // Model 
  public datasources = new class {
    constructor(public component: YesNoConfirmationDialogComponent, public model: any) {
    }
  }(this, this.model);
  // ---------------------------------------------------
  // UI
  public UI = new class {

    constructor(public component: YesNoConfirmationDialogComponent, public model: any, public datasources: any) {
    }

    // ---------------------------------------------------
    // UI.controls

    public controls = new class {
      constructor(public component: YesNoConfirmationDialogComponent, public model: any, public datasources: any) {
      }
    }(this.component, this.model, this.datasources)

    showConfirmationDialog(title: string, message: string, yesCallback: () => void, noCallback: () => void, style: any = { width: 450, height: 200}) {
      let dialog: DialogRef = this.component.dialogService.open({
        title: title,
        content: MessageBoxComponent,
        actions: [
          { text: 'Yes', userConfirmed: true },
          { text: 'No', primary: true, userConfirmed: false }
        ],
        width: style.width,
        height: style.height,
        minWidth: 250
      });

      dialog.content.instance.message = message;

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

    // ---------------------------------------------------
    // UI.handlers 

    public handlers = new class {
      constructor(public component: YesNoConfirmationDialogComponent, public model: any, public controls: any, public datasources: any, public UI: any) {
      }


    }(this.component, this.model, this.controls, this.component.datasources, this);

    // ---------------------------------------------------
    // UI.setup() functions
    setup() {

    }
  }(this, this.model, this.datasources);

}
