import { Component, OnInit, ViewChild } from '@angular/core';
import { CompassPlanSelectionHeader } from '../components/compass-plan-selection-header/compass-plan-selection-header.component';
import { GlobalDataService } from '../components/globalDataService/globalDataService.component';
import { OkDialogComponent } from '../components/ok-dialog/ok-dialog.component';
import { DashboardObjectDataProvider } from '../services/data/dashboard-objects-provider.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  @ViewChild('compassPlanSelectionHeader', { static: true }) compassPlanSelectionHeader!: CompassPlanSelectionHeader; // AI changed: Added static flag and non-null assertion

  //Global Variable
  public appContext: GlobalDataService; // AI changed: Removed null initialization
  public customerId: string = '';
  public categoryId: string = '';
  public fiscalYear: string = '';
  public CategoryName: string = ''
  public chartCategoryName: string = ''
  public loadingData: boolean = false;
  public currentCharts: any[] = [];
  //public addchartbuttonDisabled: boolean = false;
  public objectList: any[] = [];
  public gsvmonths: string[] = [];
  public gsvdata: string[] = [];
  public tradedata: string[] = [];
  public addchartselectDisabled: boolean = true;
  public gridData: any[] = [{ EventId: "235", EventName: "PPG5 Bogo", Reason: "Starts in 15 days", Action: "Send reminder" },
  { EventId: "335", EventName: "PPG5 2/5$", Reason: "In Review", Action: "Review" }];

  private today = new Date();
  public isCompass: boolean = false;
  public messages = [];

  constructor(private _appContext: GlobalDataService,
    private dashboardObjectDataProvider: DashboardObjectDataProvider,
    private OkDialogComponent: OkDialogComponent) {
    // This can be string, array or object
    this.appContext = _appContext;
  }

  ngOnInit() {
    this.isCompass = this.appContext.userInfo.IsCompass;
    if (this.isCompass) {
      document.body.classList.add('has-blue-style');
    }
  }

  ngOnDestroy(): void {
    if (this.isCompass) {
      document.body.classList.remove('has-blue-style');
    }
  }

  //Gloabl Header value
  getPlanSelectionHeaderValues(headerValues: any) {
    if (this.appContext.Authenticated) {
      this.Busy();
      this.customerId = this.compassPlanSelectionHeader.headerValues.CustomerID;
      this.categoryId = this.compassPlanSelectionHeader.headerValues.CategoryID;
      this.fiscalYear = this.compassPlanSelectionHeader.headerValues.FiscalYear;
      this.CategoryName = this.compassPlanSelectionHeader.headerValues.CategoryName;
      this.chartCategoryName = "GSV LE vs " + this.CategoryName;

      var param = {
        "customer": this.customerId,
        "categoryId": this.categoryId,
        "fiscalYear": this.fiscalYear.toString(),
        "shipmentSetting": this.compassPlanSelectionHeader.headerValues.ShipmentSetting
      }

      this.gsvmonths = [];
      this.gsvdata = [];
      this.tradedata = [];
      this.objectList = [];
      this.currentCharts = [];

      let p = {
        planningEntity: this.compassPlanSelectionHeader.headerValues.PlanningEntity,
        salesOrg: this.compassPlanSelectionHeader.headerValues.SalesOrg
      };

      this.messages = [];
      this.dashboardObjectDataProvider.queryCommunicationHubMessages(p).then((result: any) => {
        if (result.data && result.data.length > 0) {
          this.messages = result.data;
        }
      }).catch((error) => {
        console.log("Filed to communication hub messages: " + error);
      });

      //Get Chart data then chart object visibility
      this.dashboardObjectDataProvider.queryDashboardGSVAndTrade(param).then((result: any) => {
        if (result.data) {
          for (let item of result.data) {
            this.gsvmonths.push(item.MONTH_NAME);
            this.gsvdata.push(item.GSV);
            this.tradedata.push(item.TRADE_RATE);
          }
        }
      }).then(() => {
        this.dashboardObjectDataProvider.queryDashboardObject(param).then((result: any) => {
          if (result.data && result.data.length > 0) {
            this.objectList = result.data;
            for (var i = 0; i < this.objectList.length; i++)
              if (this.objectList[i].SELECTED === "X") {
                this.currentCharts.push(this.objectList[i]);
              }
          }
          this.NotBusy();
        })
      });
    }
  }

  private Busy() {
    this.loadingData = true;
  }

  private NotBusy() {
    this.loadingData = false;
  }

  //Control visibility of chart
  public addChart() {
    this.addchartselectDisabled = !this.addchartselectDisabled;
  }

  public avalue: Date = new Date(this.today.getFullYear(), (this.today.getMonth()), this.today.getDate());

  public onValueChange(value: any[]) { // AI changed: Added type annotation for value parameter
    if (value.length >= 0) {
      for (var i = 0; i < this.objectList.length; i++) {
        this.objectList[i].SELECTED = "";
      }
      for (var i = 0; i < value.length; i++) {
        value[i].SELECTED = "X";
      }
      this.saveObjects();
    } else {
      console.log('No chart object found');
    }
  }

  //Action - Chart control
  public closeChart(chart: string) {
    for (var i = 0; i < this.objectList.length; i++) {
      if (this.objectList[i].OBJECT_NAME == chart) {
        this.objectList[i].SELECTED = "";
        break;
      }
    }
    this.saveObjects();
  }

  //Save chart on cross action
  public saveObjects() {
    //Save chart object
    this.Busy();

    let objectdata: { CUSTOMER: string; FISCAL_YEAR: string; OBJECT_ID: string[]; CATEGORY_ID: string; SHIPMENT_SETTINGS: any } = { // AI changed: Added type annotation
      CUSTOMER: this.customerId,
      FISCAL_YEAR: this.fiscalYear.toString(),
      OBJECT_ID: [],
      CATEGORY_ID: this.categoryId,
      SHIPMENT_SETTINGS: this.compassPlanSelectionHeader.headerValues.ShipmentSetting
    }

    for (var i = 0; i < this.objectList.length; i++) {
      if (this.objectList[i].SELECTED === "X") {
        objectdata.OBJECT_ID.push(this.objectList[i].OBJECT_ID as string) // AI changed: Added type assertion
      }
    }
    this.dashboardObjectDataProvider.saveDashboardObjectData(objectdata,
      //success callback
      (result) => {
        this.NotBusy();
        if (result.Success) {
          console.log("[SUCCESS] Saving chart object complete");
          //this.OkDialogComponent.UI.showOkDialog("Info", "Saving chart object complete", () => { });
        }
        else {
          console.log("[ERROR] Saving chart object failed");
          this.OkDialogComponent.UI.showOkDialog("Error", result.Message, () => { });
        }
      },
      //failure callback
      (result) => {
        this.NotBusy();
        if (!result.Success) {
          this.OkDialogComponent.UI.showOkDialog("Error", result.Message, () => { });
        }
        console.log("[ERROR] Saving chart object Failed");
      });
  }

  public getChartVisibility(itemName: string) {
    for (var i = 0; i < this.objectList.length; i++) {
      if (this.objectList[i].OBJECT_NAME == itemName && this.objectList[i].SELECTED == "X") {
        return true;
      }
    }
    return false;//hide chart
  }
}