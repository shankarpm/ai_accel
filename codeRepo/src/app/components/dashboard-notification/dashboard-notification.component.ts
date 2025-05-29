import { Component, OnInit, Input, Output, EventEmitter, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationModel, PPGModel, NotificationListModel } from './viewmodel'
import { CookieService } from 'ngx-cookie-service';
// AI changed: Commented out missing imports
// import { DashboardObjectDataProvider } from '../../services/data/dashboard-objects-provider.service';
// import { GlobalDataProvider } from '../../services/data/global-data-provider.service';
import { Router } from '@angular/router';
// AI changed: Replaced angular-webstorage-service with @angular/common
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'dashboard-notification',
  templateUrl: './dashboard-notification.component.html',
  styleUrls: ['./dashboard-notification.component.css'],
  imports: [CommonModule]
})
export class DashboardNotification implements OnInit {
  //Global variable
  public loadingData: boolean = false;
  public collapsed: boolean = true;
  public bellClicked: boolean = false;

  public fiscalYear: string = "";
  public customerId: string = "";
  public customerName: string = "";
  public customerPlan: string = "";
  public categoryId: string = "";
  public shipmentSetting: string = "0";
  public userID: string = "";
  public planningEntity: string = '';
  public notificationListModel: NotificationListModel = new NotificationListModel();
  
  constructor(
    // AI changed: Added @Inject decorator and changed to any type
    @Inject('DashboardObjectDataProvider') private dashboardObjectDataProvider: any,
    private cookieService: CookieService,
    // AI changed: Changed to any type for missing service
    private globalDataProvider: any,
    private router: Router,
    // AI changed: Replaced SESSION_STORAGE with DOCUMENT
    @Inject(DOCUMENT) private document: Document
  ) { }

  ngOnInit() {
    this.initHeaderParams();
    this.GetDashboardNotification()
  }

  public collapse() {
    this.collapsed = !this.collapsed;
    this.bellClicked = false;
  }

  private Busy() {
    this.loadingData = true;
  }

  private NotBusy() {
    this.loadingData = false;
  }

  //Save dismiss action
  public takeAction_click(item: any) {
    this.globalDataProvider.previousAccountPlannerProduct = item.PPG;
    this.collapsed = true;
    this.router.navigateByUrl('/accounts-planner');
  }

  //Dismiss event
  public dismiss_click(item: any) {
    let saveInput = {
      YEAR: this.fiscalYear.toString(),
      PLANNING_ENTITY: this.planningEntity,
      CATEGORY: this.categoryId,
      FISCAL_WEEK: item.FISCAL_WEEK,
      PPG: item.PPG,
      ACTION: "X",
      TYPE: "PRICE CHANGE"
    }

    this.dashboardObjectDataProvider.saveDashboardNotification(saveInput,
      //success callback
      (result: any) => { // AI changed: Added type annotation
        this.NotBusy();
        if (result.Success) {
          console.log("[SUCCESS] Saving chart object complete");
        }
        else {
          console.log("[ERROR] failed to take action");
        }
      },
      //failure callback
      (result: any) => { // AI changed: Added type annotation
        this.NotBusy();
        if (!result.Success) {
          console.log("[ERROR] failed to take action");
        }
        console.log("[ERROR] failed to take action");
      });
    this.GetDashboardNotification();
  }

  private initHeaderParams() {
    this.loadingData = true;
    // AI changed: Replaced webStorageService with localStorage
    const headerData = this.document.defaultView?.localStorage.getItem('headerselection');
    if (headerData) {
      var header = JSON.parse(headerData);
      this.fiscalYear = header.fiscalYear ? header.fiscalYear.value : '';
      this.customerId = header.customer ? header.customer.value : '';
      this.customerName = header.customer ? header.customer.text : '';
      this.categoryId = header.categoryId ? header.categoryId.value : '';
      this.planningEntity = header.customerPlan.value ? header.customerPlan.value : 0;
      if (header.customerPlan) {
        this.shipmentSetting = header.customerPlan.S;
        this.customerPlan = header.customerPlan.value ? header.customerPlan.value : 0;
      }
    } else {
      this.fiscalYear = new Date().getFullYear().toString();
    }
  }

  //Load notification
  private GetDashboardNotification() {
    var param = {
      "year": this.fiscalYear.toString(),
      "planning_entity": this.planningEntity,
      "CATEGORY": this.categoryId,
    }

    this.dashboardObjectDataProvider.queryDashboardNotification(param).then((result: any) => {
      if (result.data) {
        this.notificationListModel.NewCount = result.data.NEWCOUNT;
        if (this.notificationListModel.NewCount > 0) { this.bellClicked = true;}
        let notification: NotificationModel = new NotificationModel();
        notification.TYPE = result.data.TYPE;
        for (let item of result.data.PPGS) {
          let ppg: PPGModel = new PPGModel();
          ppg.PPG = item.PPG;
          ppg.FISCAL_WEEK = item.FISCAL_WEEK;
          ppg.PPG_DESC = item.PPG_DESC;
          ppg.NEW_PRICE = item.NEW_PRICE;
          ppg.OLD_PRICE = item.OLD_PRICE;
          ppg.DATE = item.DATE;
          ppg.ACTION = item.ACTION;
          ppg.CustomerName = this.customerName;
          ppg.NotificationText = `The List Price/Case for the ${ppg.PPG_DESC} has been updated from $${ppg.NEW_PRICE} to $${ppg.OLD_PRICE}.`;
          notification.PPGS.push(ppg);
        }
        this.notificationListModel.Notification.push(notification);
      }
    })
  }

  //Convert API data to model data
  public convertDataToModelCollection<T extends new () => any>(data: any[], type: T): T[] {
    if (!data) {
      return [];
    }
    let collection: T[] = [];
    let model: T;
    data.map(item => {
      model = new type();
      for (let prop in item) {
        if (item.hasOwnProperty(prop)) {
          (model as any)[prop] = item[prop];
        }
      }
      collection.push(model);
    });
    return collection;
  }
}