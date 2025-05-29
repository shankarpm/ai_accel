import { AfterViewInit, Component, Injectable, OnInit, CommonModule } from '@angular/core';
import { Router } from '@angular/router';
import { DialogService } from '@progress/kendo-angular-dialog';

const TIMEOUT_MINUTES = 60; // Session expiration time in minutes
const POPUP_TIMER = 15; //popup to be shown before session exiration minutes 

@Component({
  selector: 'session-timeout-dialog',
  templateUrl: './session-timeout-dialog.component.html',
  styleUrls: ['./session-timeout-dialog.component.css'],
  imports: [CommonModule] // AI changed: Added CommonModule to fix NG8103 error
})

@Injectable()
export class SessionTimeoutDialogComponent implements AfterViewInit, OnInit {
  // AI changed: Initialize properties to avoid TS2729 errors
  public model: any;
  public datasources: any;
  public UI: any;

  constructor(private router: Router, private dialogService: DialogService) {
    // AI changed: Initialize model and datasources before use
    this.model = new class {
      constructor(public component: SessionTimeoutDialogComponent) { }
    }(this);

    this.datasources = new class {
      constructor(public component: SessionTimeoutDialogComponent, public model: any) {
      }
    }(this, this.model);

    this.UI = new class {
      public isOpen: boolean = false;
      public isSessionTimeout: boolean = false;
      public isSessionTimedout: boolean = false;
      public minutes: number = POPUP_TIMER;
      public seconds: number = 0;
      public controls: any;
      public handlers: any;

      constructor(public component: SessionTimeoutDialogComponent, public model: any, public datasources: any) {
        this.controls = new class {
          constructor(public component: SessionTimeoutDialogComponent, public model: any, public datasources: any) {
          }
        }(component, model, datasources);

        this.handlers = new class {
          private timerId: number | null = null; // AI changed: Changed type to number | null
          private intervalTimerId: number | null = null; // AI changed: Changed type to number | null
          private timeOutSeconds: number = (TIMEOUT_MINUTES - POPUP_TIMER) * 60 * 1000;

          constructor(public component: SessionTimeoutDialogComponent, public model: any, public controls: any, public datasources: any, public UI: any) {
          }

          public stayLoggedinClick() {
            if (this.intervalTimerId) {
              clearInterval(this.intervalTimerId);
            }
            this.intervalTimerId = null;
            this.component.UI.isSessionTimeout = false;
            this.resetTimer();
          }

          public okClick() {
            this.component.UI.isSessionTimeout = false;
            location.href = '/';
          }

          public startTimer() {
            this.timerId = window.setTimeout(() => { // AI changed: Added window prefix
              if (this.timerId) {
                clearTimeout(this.timerId);
              }
              this.component.UI.isSessionTimeout = true;
              this.startintervalTimer();
            }, this.timeOutSeconds);
          }

          public resetTimer() {
            if (!this.intervalTimerId) {
              if (this.timerId) {
                clearTimeout(this.timerId);
              }
              this.startTimer();
            }
          }

          private startintervalTimer() {
            this.component.UI.minutes = POPUP_TIMER;
            this.component.UI.seconds = 0;
            this.intervalTimerId = window.setInterval(() => { // AI changed: Added window prefix
              this.component.UI.seconds--;

              if (this.component.UI.minutes <= 0 && this.component.UI.seconds <= 0) {
                this.component.UI.isSessionTimedout = true;
                if (this.intervalTimerId) {
                  clearInterval(this.intervalTimerId);
                }
                this.intervalTimerId = null;
              }

              if (this.component.UI.seconds <= 0) {
                this.component.UI.seconds = 59;
                this.component.UI.minutes--;
              }
            }, 1000);
          }
        }(component, model, this.controls, datasources, this);
      }

      setup() {
      }
    }(this, this.model, this.datasources);
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    document.onmousemove = (e) => { this.UI.handlers.resetTimer(); }
    document.onkeydown = (e) => { this.UI.handlers.resetTimer(); }
    this.UI.handlers.startTimer();
  }
}