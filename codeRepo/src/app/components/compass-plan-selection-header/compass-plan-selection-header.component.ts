Here's the corrected code with all the issues fixed:

```typescript
import { animate, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, Injectable, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SESSION_STORAGE, StorageService } from 'ngx-webstorage-service'; // AI changed: Updated to ngx-webstorage-service
import { ShipmentSetting } from '../../common/common.model'; // AI changed: Added .model extension
import { CompassHeaders, TilesHeaders } from '../../data-contracts/compass-headers/compass-headers.model'; // AI changed: Updated path and added .model
import { CompassPlanSelectionHeaderProvider, CompassTilesDataProvider } from '../../services/data/compass-plan-selection-header.service';
import { PlanningGridDataProvider } from '../../services/data/planning-grid-data-provider.service';
import { GlobalDataService } from '../globalDataService/globalDataService.component';
import { OkDialogComponent } from '../ok-dialog/ok-dialog.component';
import { SnackBar } from '../snack-bar/snack-bar.component';
import { YesNoCancelConfirmationDialogComponent } from '../yes-no-cancel-confirmation-dialog/yes-no-cancel-confirmation-dialog.component';

declare var kendo: any;

@Component({
  selector: 'compass-plan-selection-header-component',
  templateUrl: './compass-plan-selection-header.component.html',
  styleUrls: ['./compass-plan-selection-header.component.css'],
  animations: [
    trigger('parent', [
      transition(':enter', [])
    ]),
    trigger('slideUpDown', [
      transition(':enter', [   // :enter is alias to 'void => *'
        style({ height: 0, overflow: 'hidden' }),
        animate(200, style({ height: 90 }))
      ]),
      transition(':leave', [   // :leave is alias to '* => void'
        style({ overflow: 'hidden' }),
        animate(200, style({ height: 0 }))
      ])
    ])
  ]
})

@Injectable()
export class CompassPlanSelectionHeader implements OnInit, AfterViewInit {
  public PlanYears: any[] = [];
  public SelectedPlanYear: any;
  public msgYear: string = '';
  public previousYrSize: any = 0;
  public msgColor: string = '';
  public headerValues = new CompassHeaders();
  public selectedVersionname: string = '';
  public showTilesSectionCookie: string = '';

  public headerCookieExists: boolean = false;
  public headerCookie: any;
  public isFirstDisplay: boolean = true;
  public showVersionLabel: boolean = true;
  @Input() isHeaderNotDisplay: boolean = false; // AI changed: Added initializer

  constructor(
    private _appContext: GlobalDataService,
    private router: Router,
    private compassPlanSelectionHeaderProvider: CompassPlanSelectionHeaderProvider,
    private compassTilesDataProvider: CompassTilesDataProvider,
    @Inject(SESSION_STORAGE) private webStorageService: StorageService,
    private YesNoCancelConfirmationDialogComponent: YesNoCancelConfirmationDialogComponent,
    private OkDialogComponent: OkDialogComponent,
    private PlanningGridDataProvider: PlanningGridDataProvider) {

    if (router.url == '/polaris' || router.url == '/polaris-simulation' || router.url == '/polaris-calendar') {
      this.showVersionLabel = false;
    }

    _appContext.userConfiguration.userAvailableYears.map((availableYear: any) => {
      availableYear.value = Number(availableYear.value);
      this.PlanYears.push(availableYear);
    });

    this.SelectedPlanYear = _appContext.userConfiguration.activePlanningYear.value;
    //change to display specific year with value on every page
    this.msgYear = 'Current Year';
    this.msgColor = '#DF19F7';
    this.compassPlanSelectionHeaderProvider.setMsgYear(this.msgYear);
    this.compassPlanSelectionHeaderProvider.setNavColor(this.msgColor);

    let data = this.webStorageService.get('headerselection');
    this.headerCookieExists = data && data.length > 0;
    if (this.headerCookieExists) {
      this.headerCookie = JSON.parse(data);
      this.SelectedPlanYear = this.headerCookie.fiscalYear;
      //change to display specific year with value on every page
      if (this.SelectedPlanYear > _appContext.userConfiguration.activePlanningYear.value) {
        this.msgYear = 'FUTURE YEAR';
        this.msgColor = '#F7F019';
      }
      else {
        this.msgYear = 'PRIOR YEAR';
        this.msgColor = '#16BAEE';
      }
    }
    this.compassPlanSelectionHeaderProvider.setMsgYear(this.msgYear);
    this.compassPlanSelectionHeaderProvider.setNavColor(this.msgColor);
    //this.customerNodeCookie = JSON.parse(this.webStorageService.get('customerNode'));

    this.showTilesSectionCookie = this.webStorageService.get('showTilesSection');
    if (this.showTilesSectionCookie) {
      this.isHeaderNotDisplay = this.showTilesSectionCookie === '0';
      if (this.isHeaderNotDisplay) {
        this.UI.tilesSectionMarginBottom = 0;
      }
    } else {
      this.UI.handlers.setTilesCookie();
    }

    if (this.isHeaderNotDisplay) {
      this.isFirstDisplay = false;
    }
  }

  // DOM Components initialization for Kendo UI Widgets
  @ViewChild('kendoUIContainer') kendoUIContainer!: ElementRef; // AI changed: Added definite assignment assertion
  @ViewChild('SnackBar') snackBar!: SnackBar; // AI changed: Added definite assignment assertion
  @ViewChild("versionsDropdownlist") public versionsDropdownlist: any;
  @Output() GetPlanSelectionHeaderValues: EventEmitter<any> = new EventEmitter();
  @Output() GetPlanningGridUOCData: EventEmitter<any> = new EventEmitter();
  @Output() GetVersionList: EventEmitter<any> = new EventEmitter();
  @Output('onSwitchTilesSection') onSwitchTilesSection: EventEmitter<any> = new EventEmitter<any>();
  @Input('parent') parent: any;
  @Input('IsCustomerNodeVisible') isCustomerNodeVisible: boolean = false;
  @Input('LoadUS2CustomerNodeData') loadUS2CustomerNodeData: boolean = false;

  ngOnInit() {
    this.UI.setup();
    this.UI.handlers.displayCustomerNode();
  }

  ngAfterViewInit() {
    //this.UI.setup();
  }

  ngOnDestroy(): void {
    kendo.destroy(this.kendoUIContainer.nativeElement);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.UI.component.headerValues.ShipmentSetting == ShipmentSetting.Unify_US05) {
      this.UI.component.headerValues.displayCustomerNodeforUOC = this.isCustomerNodeVisible;
      if (this.loadUS2CustomerNodeData) {
        //this.UI.handlers.getCustomerNodes(true);

        this.UI.CustomerNodes.forEach((item: any) => {
          if (item.CUSTOMER_ID.split("")[2] === "2") {
            this.UI.component.headerCookie.customerID = item.CUSTOMER_ID;
            this.UI.component.UI.SelectedCustomerNode = this.UI.component.headerCookie.customerID;
            const customerNodeItem = this.UI.component.UI.CustomerNodes.find((item: any) => item.CUSTOMER_ID == this.UI.component.UI.SelectedCustomerNode);
            this.UI.component.headerValues.EventLogic = customerNodeItem.FLAG_EVENT_LOGIC || this.UI.component.UI.SelectedCustomerPlan.E;
          }
        });
      }
    }
  }

  // Model
  public model = new class {
    constructor(public component: CompassPlanSelectionHeader) { }
  }(this);

  // ---------------------------------------------------
  // ---------------------------------------------------
  // ---------------------------------------------------
  // ---------------------------------------------------
  // Model 
  public datasources = new class {
    constructor(public component: CompassPlanSelectionHeader, public model: any,) {
    }
  }(this, this.model);
  // ---------------------------------------------------
  // UI
  public UI = new class {
    public isLoading: boolean = true;
    public isTilesLoading: boolean = false;
    public tilesSectionMarginBottom: number = 10;
    public Customers: any[] = [];
    public Category: any[] = [];
    public CustomerNodes: any[] = [];
    public SelectedCategory: any;
    public headerData: any[] = [];
    public CustomerPlan: any[] = [];
    public SelectedCustomerPlan: any;
    public SelectedCustomerNode: string = "";
    public selectedCustomerId: string = "";
    public TilesData: TilesHeaders = new TilesHeaders();
    public isFoodService: boolean = false;
    public isCategoryLevel: boolean = false;
    public VersionNameList: any[] = [];
    public VersionsData: any[] = [];
    public SelectedVersion: any;
    public showVersionsDropdwon: boolean = false;
    public activePN: string = "ACTIVEPLAN";
    public loadingData: boolean = true;
    public isNavigate: boolean = false;
    public dialogOpened: boolean = false;
    public saveAsDialog: boolean = false;
    public saveAsPlanName: string = "";
    public versionNameExist: boolean = false;
    public SaveasErrorMsg: string = "";
    public customerPlanWidth: number = 150;
    public categoryWidth: number = 150;
    public isYearchange: boolean = false;
    public isSalesOrgChange: boolean = false;

    constructor(public component: CompassPlanSelectionHeader, public model: any, public datasources: any) {
    }

    public getColor(balance: number): string {
      return balance >= 0 ? "black" : "red";
    }

    // ---------------------------------------------------
    // UI.controls

    public controls = new class {
      constructor(public component: CompassPlanSelectionHeader, public model: any, public datasources: any) {
      }
    }(this.component, this.model, this.datasources)

    // ---------------------------------------------------
    // UI.handlers 

    public handlers = new class {
      constructor(public component: CompassPlanSelectionHeader, public model: any, public controls: any, public datasources: any, public UI: any) {
      }

      public switchTilesSectionStart() {
        if (!this.component.isHeaderNotDisplay) {
          this.component.UI.tilesSectionMarginBottom = 10;
        }
      }

      public switchTilesSectionDone() {
        if (this.component.isHeaderNotDisplay) {
          this.component.UI.tilesSectionMarginBottom = 0;
        }
        this.setTilesCookie();
        if (!this.component.isFirstDisplay) {
          this.component.onSwitchTilesSection.emit(!this.component.isHeaderNotDisplay);
        }
        this.component.isFirstDisplay = false;
      }

      public setTilesCookie() {
        this.component.webStorageService.set('showTilesSection', !this.component.isHeaderNotDisplay ? '1' : '0');
      }

      public customerPlanChange(fromCookie: boolean = false) { // AI changed: Added default value
        //check to whether there is change
        if (this.component.headerValues.CustomerPlanID && this.component.headerValues.CustomerPlanID == this.component.UI.SelectedCustomerPlan.ID
          && this.component.headerCookie.fiscalYear == this.component.SelectedPlanYear) {
          //no chage in Customer plan
          return;
        }
        else if (this.component.parent && this.component.parent.hasAccountPlannerChanges()) {
          this.component.OkDialogComponent.UI.showOkDialog("Info", `Save changes to AP prior to changing categories/customer.`, () => {
            this.component.UI.SelectedCustomerPlan = this.component.UI.CustomerPlan.filter((item: any) => {//restore the old value
              return item.ID == this.component.headerCookie.planId;
            })[0];
          });
          return;
        }

        let customerPlan = this.component.UI.SelectedCustomerPlan;

        if (customerPlan) {
          this.component.headerValues.CustomerPlanID = customerPlan.ID;
          this.component.headerValues.CustomerPlanName = customerPlan.CN;
          this.component.headerValues.PlanningEntity = customerPlan.PC;
          this.component.headerValues.ShipmentSetting = customerPlan.S || ShipmentSetting.None;
          this.component.headerValues.DivPlanning = customerPlan.D;
          this.component.headerValues.EventLogic = customerPlan.E;
          this.component.headerValues.SalesOrg = customerPlan.O;
          this.component.headerValues.isSMG = customerPlan.G;
          this.component.headerValues.isRMX = customerPlan.X;
          this.component.headerValues.BracketPrice = customerPlan.B;
          this.component.UI.Category = customerPlan.CG || [];
          this.component.headerValues.ListCategoryId = customerPlan.CG || []
          this.component.headerValues.FlagSMGInd = customerPlan.I;
          this.component.headerValues.isCanadianCustomer = this.checkCanadianCustomer(customerPlan);
          this.component.UI.isFoodService = customerPlan.SC === ShipmentSetting.FoodService;
          this.component.UI.SelectedCategory = null;

          //clear customer node if the flag is not set
          if (!customerPlan.D || this.component.headerValues.isCanadianCustomer) {
            this.component.UI.CustomerNodes = [];
            //for non divisional customers, set customerId as planning entity
            this.component.headerValues.CustomerID = this.component.headerValues.PlanningEntity;
          }
          //hide tiles for Foodservice customer
          //if (customerPlan.S == ShipmentSetting.StreamLine && this.component.headerValues.isCanadianCustomer) {
          //  this.component.isHeaderNotDisplay = true;
          //}
          this.categoryChange(fromCookie);

          let length = this.UI.Category.reduce(function (a: any, b: any) { return a.N && b.N && a.N.length > b.N.length ? a : b; }).N.length; // AI changed: Added types
          this.component.UI.categoryWidth = (length * 8.2) || 150;
        }
      }

      public checkCanadianCustomer(customerPlan: any): boolean { // AI changed: Added return type
        switch (customerPlan.S) {
          case ShipmentSetting.ShipmentOnly:
          //if (this.component.SelectedPlanYear == "2020") {
          //  return false;
          //}
          case ShipmentSetting.FoodService:
          case ShipmentSetting.Major:
            this.component.UI.showVersionsDropdwon = false;//Hide versions for Canada customers
            return true;
        }
        return false;
      }

      public onCustomerPlanFilterChange(filter: string) { // AI changed: Added type
        filter = filter.toLowerCase();
        this.UI.CustomerPlan = this.component.UI.headerData.filter((s: any) => { // AI changed: Added type
          return s.CN && s.CN.toLowerCase().indexOf(filter) !== -1;
        });
      }

      public categoryChange(fromCookie: boolean = false) { // AI changed: Added default value
        //check to whether there is change
        if (this.component.headerValues.CategoryID && this.component.headerValues.CategoryID == this.component.UI.SelectedCategory
          && !this.component.UI.isYearchange && !this.component.UI.isSalesOrgChange) {
          //no chage in Customer category
          return;
        }
        else if (this.component.parent && this.component.parent.hasAccountPlannerChanges()) {
          this.component.OkDialogComponent.UI.showOkDialog("Info", `Save changes to AP prior to changing categories/customer.`, () => {
            this.component.UI.SelectedCategory = this.component.headerValues.CategoryID; //restore old value
          });
          return;
        }

        let customerPlan = this.component.UI.SelectedCustomerPlan;
        this.component.headerValues.isRMX = customerPlan.X;
        if (fromCookie && this.component.headerCookie.categoryId) {
          this.component.UI.SelectedCategory = this.component.headerCookie.categoryId;
          this.component.headerValues.CategoryID = this.component.headerCookie.categoryId;
          this.component.headerValues.CategoryName = this.component.headerCookie.categoryName;
          this.component.headerValues.PlanningIndicator = this.component.headerCookie.PlanningIndicator;
          this.component.headerValues.BU = this.component.headerCookie.BU;
        }
        else if (customerPlan.CG && customerPlan.CG.length > 0) {
          if (this.component.UI.SelectedCategory) {
            let category = customerPlan.CG.filter((item: any) => { return item.I == this.component.UI.SelectedCategory })[0]; // AI changed: Added type
            if (category) {
              this.component.headerValues.CategoryID = this.component.UI.SelectedCategory;
              this.component.headerValues.CategoryName = category.N;
              this.component.headerValues.PlanningIndicator = category.P;
              this.component.headerValues.BU = category.B;
            }
          } else {
            this.component.UI.SelectedCategory = this.component.UI.Category[0].I;
            this.component.headerValues.CategoryID = this.component.UI.SelectedCategory;
            this.component.headerValues.CategoryName = this.component.UI.Category[0].N;
            this.component.headerValues.PlanningIndicator = this.component.UI.Category[0].P;
            this.component.headerValues.BU = this.component.UI.Category[0].B;
          }
        }

        //this.component.UI.SelectedCustomerNode = null;
        if (!this.component.headerValues.isCanadianCustomer) {
          this.component.UI.SelectedCustomerNode = "";
        }
        //this.component.UI.isLoading = true;
        if (this.component.UI.SelectedCustomerPlan.D == 1) {
          this.getCustomerNodes(fromCookie);
        } else {
          this.getVersionList(fromCookie);
        }
      }

      public onCatergoryFilterChange(filter: string) { // AI changed: Added type
        filter = filter.toLowerCase();
        this.UI.Category = this.component.UI.SelectedCustomerPlan.CG.filter((s: any) => { // AI changed: Added type
          return s.N && s.N.toLowerCase().indexOf(filter) !== -1;
        });
      }

      public isCustomerNodeSelectionDisabled(): boolean { // AI changed: Added return type
        if (this.UI.component.headerValues.ShipmentSetting == ShipmentSetting.Unify_US05 || this.UI.component.headerValues.ShipmentSetting == ShipmentSetting.Costco) {
          this.UI.component.headerValues.displayCustomerNodeforUOC = !this.component.isCustomerNodeVisible;
        }
        else {
          this.UI.component.headerValues.displayCustomerNodeforUOC = false;
        }
        return this.UI.component.headerValues.displayCustomerNodeforUOC;
      }

      public customerNodeChange(customerNode: string) { // AI changed: Added type
        if ((this.component.headerValues.ShipmentSetting == ShipmentSetting.Unify_US05) && customerNode.split("")[2] === "5") {
          this.component.GetPlanningGridUOCData.emit(customerNode);
        }
        else if (this.component.headerValues.ShipmentSetting == ShipmentSetting.Unify_US05) { this.component.GetPlanningGridUOCData.emit(""); }
        else if (this.component.headerValues.ShipmentSetting == ShipmentSetting.Costco) { this.component.GetPlanningGridUOCData.emit(customerNode); }
        else {
          //check to whether there is change
          if (this.component.UI.SelectedCustomerNode == this.component.headerValues.CustomerID) {
            //no chage in Customer node
            return;
          }
          else if (this.component.parent && this.component.parent.hasAccountPlannerChanges()) {
            this.component.OkDialogComponent.UI.showOkDialog("Info", `Save changes to AP prior to changing categories/customer.`, () => {
              this.component.UI.SelectedCustomerNode = this.component.headerValues.CustomerID;//restore old value
            });
            return;
          }

          const customerNodeItem = this.component.UI.CustomerNodes.find((item: any) => item.CUSTOMER_ID == customerNode); // AI changed: Added type
          this.component.headerValues.isRMX = this.component.UI.SelectedCustomerPlan.X;
          this.component.headerValues.CustomerID = customerNode;
          this.component.headerValues.PlanningIndicator = customerNodeItem.PLANNING_INDICATOR;
          this.component.headerValues.EventLogic = customerNodeItem.FLAG_EVENT_LOGIC || this.component.UI.SelectedCustomerPlan.E;
          this.getVersionList(false);
        }
      }

      public displayCustomerNode(): boolean { // AI changed: Added return type
        if ((this.component.headerValues.ShipmentSetting == ShipmentSetting.Unify_US05 || this.component.headerValues.ShipmentSetting == ShipmentSetting.Costco) && !this.component.isCustomerNodeVisible) {
          this.component.headerValues.displayCustomerNodeforUOC = false;

          this.UI.CustomerNodes.forEach((item: any) => { // AI changed: Added type
            if (item.CUSTOMER_ID.split("")[2] === "2") {
              this.component.headerCookie.customerID = item.CUSTOMER_ID;
              this.component.UI.SelectedCustomerNode = this.component.headerCookie.customerID;
              const customerNodeItem = this.component.UI.CustomerNodes.find((item: any) => item.CUSTOMER_ID == this.component.UI.SelectedCustomerNode); // AI changed: Added type
              this.component.headerValues.EventLogic = customerNodeItem.FLAG_EVENT_LOGIC || this.component.UI.SelectedCustomerPlan.E;
            }
          });

          return this.component.headerValues.displayCustomerNodeforUOC;
        }
        return false;
      }

      public onCustomerNodeFilterChange(filter: string) { // AI changed: Added type
        filter = filter.toLowerCase().trim();
        this.UI.CustomerPlan = this.component.UI.headerData.filter(
          (s: any) => { // AI changed: Added type
            return s.CN.toLowerCase().indexOf(filter) !== -1;
          }
        );
      }

      public getVersionList(fromCookie: boolean = false, refreshHeaders: boolean = true) { // AI changed: Added default value
        var userId = this.component._appContext.userInfo.LanID;
        var fiscalYear = this.component.SelectedPlanYear;
        var planningEntity = this.UI.SelectedCustomerPlan.PC;
        var customerId = this.component.UI.SelectedCustomerNode || this.UI.SelectedCustomerPlan.PC;
        var categoryId = this.UI.SelectedCategory;
        var customerPlan = this.component.headerValues.CustomerPlanID;
        var isSMG = this.UI.SelectedCustomerPlan.G;
        var salesOrg = this.component.headerValues.SalesOrg;

        this.component.UI.VersionNameList = [];
        this.component.UI.SelectedVersion = null;
        this.component.headerValues.VersionID = undefined;
        this.component.compassPlanSelectionHeaderProvider.queryVersionsListData(userId, customerId, planningEntity, fiscalYear, categoryId, this.component.headerValues.ShipmentSetting, customerPlan, isSMG, salesOrg).then((result: any) => {
          this.component.GetVersionList.emit(result);
          if (result && result.data && result.data.length > 0) {
            this.component.UI.VersionNameList.push("Create");
            this.component.UI.VersionNameList.push("Compare");
            //used see whether there are any shipper mod verstion created
            this.component.headerValues.hasShipperModVersion = result.data[0].SHIPER_MOD ? true : false;

            for (let i = 0; i < result.data.length; i++) {
              this.component.UI.VersionNameList.push(result.data[i].versionName);//.push({ 'text': result.data[i].versionName, 'value': result.data[i].versionName });
            }
            this.component.UI.VersionsData = this.component.UI.VersionNameList;

            if (fromCookie && this.component.headerCookie.versionID) {
              this.component.UI.SelectedVersion = this.component.headerCookie.versionID;
              this.component.headerValues.VersionID = this.component.headerCookie.versionID;
            }
            else {
              this.component.UI.SelectedVersion = result.data[0].versionName;
              this.component.headerValues.VersionID = this.component.UI.SelectedVersion;
            }
          }
          else {
            // for Albersons region is applicable to all nodes for this customer, no version will exists, so add Active Plan US2000104
            if (isSMG //for SMG add Active plan it it not exists
              || this.UI.SelectedCategory == "ALL" // For All Categories
              || (this.component.UI.SelectedCustomerNode != null && (this.component.UI.SelectedCustomerNode || this.UI.SelectedCustomerPlan.PC))) {
              this.component.UI.VersionNameList.push("ACTIVEPLAN");
              this.component.UI.SelectedVersion = this.component.UI.VersionNameList[0];
              this.component.headerValues.VersionID = this.component.UI.SelectedVersion;
            }
          }
          if (refreshHeaders) {
            this.loadData();
          } else {
            this.createHeaderCookie();
          }
        });
      }

      public openVersionDialog(saveAs: boolean = false) {
        this.component.UI.saveAsDialog = saveAs;
        this.component.UI.dialogOpened = true;
        this.component.UI.versionNameExist = false;
        this.component.UI.saveAsPlanName = '';
      }

      public onCreateVersionClick() {
        if (this.isVersionValid) {
          this.component.UI.dialogOpened = false;
          let selectedVersion: string = this.component.UI.saveAsDialog ? this.component.UI.SelectedVersion : this.component.UI.activePN;
          let params: Record<string, any> = {}; // AI changed: Added type
          params["prdCategory"] = [];
          params["oldVersionName"] = selectedVersion;
          params["versionName"] = "VER_" + this.component.UI.saveAsPlanName;
          params["Customer"] = this.component.UI.SelectedCustomerNode || this.UI.SelectedCustomerPlan.PC;
          params["PLANNING_ENTITY"] = this.UI.SelectedCustomerPlan.PC;
          params["fiscalYear"] = this.component.SelectedPlanYear;
          params["SHIPMENT_SETTING"] = this.component.UI.SelectedCustomerPlan.S;
          params["USER_ID"] = this.component._appContext.userInfo.LanID;
          params["CUST_PLAN"] = this.component.headerValues.CustomerPlanID;
          params["SALESORG"] = this.component.headerValues.SalesOrg;

          this.component.UI.CustomerPlan.map((plan: any) => {
            if (plan.PC === this.UI.SelectedCustomerPlan.PC) {
              plan.CG.map((cat: any) => { // AI changed: Added type
                params["prdCategory"].push(cat.I);
              });
            }
          });

          //this.component.UI.isLoading = true;
          this.component.PlanningGridDataProvider.createPlanningGridData(params).then((result: any) => {
            if (result && result.Success) {
              this.getVersionList(false);
            }
            else {
              this.component.UI.isLoading = false;
              console.log("[ERROR] Saving PlanningGridData Failed: " + result);
              this.component.OkDialogComponent.UI.showOkDialog("Error", `Failed to save AccountPanner data.`, () => { });
            }
          });
        }
      }

      get isVersionValid(): boolean {
        if (this.component.UI.saveAsPlanName.trim().length === 0) {
          this.component.UI.SaveasErrorMsg = "name is empty";
          this.component.UI.versionNameExist = true;
          return false;
        }

        var regex = /^[a-zA-Z0-9\s_-]*$/; //version name accept only alpha num with '_' '-' and space
        if (!regex.test(this.component.UI.saveAsPlanName)) {
          this.component.UI.SaveasErrorMsg = " is not a valid name ";
          this.component.UI.versionNameExist = true;
          return false;
        }

        if (this.component.UI.VersionNameList && this.component.UI.VersionNameList.length > 0) {
          let duplicates: any[] = this.component.UI.VersionNameList.filter(vr => {
            return vr.toLowerCase().replace('ver_', '') == this.component.UI.saveAsPlanName.toLowerCase().replace('ver_', '');
          });

          //check for existing account planner name
          if (duplicates.length > 0) {
            this.component.UI.SaveasErrorMsg = " already exists";
            this.component.UI.versionNameExist = true;
            return false;
          }
        }

        return true;
      }

      public versionChange(version: any) {
        if (version == 'Create' || version == 'Save As') {
          this.openVersionDialog();
          this.restoreVersion();
        }
        else if (version == 'Compare') {
          this.component.UI.SelectedVersion = this.component.headerValues.VersionID;
          this.component.router.navigate(['/compare-plans']);
          this.restoreVersion();
        }
        else if (this.component.UI.SelectedVersion != this.component.headerValues.VersionID) {
          this.component.headerValues.VersionID = version;
          if (!version) {
            this.component.UI.SelectedVersion = null;
          }
          this.loadData();
        }
      }

      public onVersionFilterChange(filter: string) { // AI changed: Added type
        filter = filter.toLowerCase().trim();
        this.component.UI.VersionNameList = this.component.UI.VersionsData.filter((v: any) => { // AI changed: Added type
          return v.toLowerCase().indexOf(filter) !== -1;
        });
      }

      private restoreVersion() {
        setTimeout(() => {
          this.component.UI.SelectedVersion = this.component.headerValues.VersionID;
        }, 1);
      }

      public showVersionDeleteButton(versionName: string): boolean { // AI changed: Added return type
        return versionName == 'Create' || versionName == 'Save As' || versionName == 'Compare' ||
          versionName == this.component.UI.activePN || versionName.startsWith("OFF_") || versionName.startsWith("OFL_")
          ? false : true;
      }

      public onDeleteVersion(event: any, versionName: string) {
        this.component.YesNoCancelConfirmationDialogComponent.UI.showConfirmationDialog(
          'Please confirm',
          `Are you sure you want to delete ${versionName}?`,
          () => { this.deleteVersion(versionName); },//Yes callback
          () => { },//No callback          
          () => { });//Cancel callback          

        event.preventDefault();
        event.stopPropagation();
        return;
      }

      private deleteVersion(versionName: string) {
        let params: Record<string, any> = {}; // AI changed: Added type

        params["userId"] = this.component._appContext.userInfo.LanID;
        params["Customer"] = this.component.UI.SelectedCustomerNode || this.UI.SelectedCustomerPlan.PC;
        params["PLANNING_ENTITY"] = this.UI.SelectedCustomerPlan.PC;
        params["fiscalYear"] = this.component.SelectedPlanYear;
        params["versionName"] = versionName;
        params["shipmentSettings"] = this.component.headerValues.ShipmentSetting;
        params["cust_plan"] = this.component.headerValues.CustomerPlanID;
        params["salesOrg"] = this.component.headerValues.SalesOrg;

        if (versionName !== this.component.UI.activePN) {
          this.component.UI.Busy();

          this.component.PlanningGridDataProvider.deletePlanningGridData(params).then((result: any) => {
            this.component.UI.NotBusy();
            if (result.Success) {
              this.component.UI.VersionNameList = this.component.UI.VersionNameList.filter((item: any) => { // AI changed: Added type
                return item !== versionName;
              });
              this.component.snackBar.setMessage(result.Message);

              if (this.component.UI.SelectedVersion === versionName) {
                this.component.UI.SelectedVersion = this.component.UI.activePN;
                this.createHeaderCookie();
              }
            } else {
              this.component.OkDialogComponent.UI.showOkDialog("Error", result.Message, () => { });
            }
          });
        }
      }

      public getCustomerNodes(fromCookie: boolean = false) { // AI changed: Added default value and type
        //load customer node only when customer plan is changed
        if (this.component.headerCookieExists
          && this.component.UI.SelectedCustomerPlan.PC == this.component.headerCookie.planningEntity
          && this.component.UI.CustomerNodes.length > 0
          && ((this.component.headerValues.PlanningIndicator == this.component.headerCookie.PlanningIndicator) || (this.component.headerValues.PlanningIndicator && this.component.headerValues.isCanadianCustomer))) {
          this.component.UI.SelectedCustomerNode = (this.component.headerValues.isCanadianCustomer && this.component.headerValues.hasShipperModVersion) ? this.UI.SelectedCustomerPlan.PC : this.component.headerCookie.customerID;
          this.component.headerValues.CustomerID = this.component.UI.SelectedCustomerNode;
          this.component.UI.selectedCustomerId = this.component.headerCookie.customerID;
          this.getVersionList(fromCookie);
        }
        else {
          this.component.compassPlanSelectionHeaderProvider.getCustomerNodesQuery(this.component.headerValues.FiscalYear,
            this.component.headerValues.PlanningEntity, this.component.headerValues.ShipmentSetting, this.component.headerValues.SalesOrg,
            this.component.headerValues.CustomerPlanID).then((result: any) => {
              this.component.UI.SelectedCustomerNode = "";
              if (result.data && result.data.length > 0) {
                let nodes = result.data.filter((item: any) => { return item.PLANNING_INDICATOR == null || item.PLANNING_INDICATOR == this.component.headerValues.PlanningIndicator; }); // AI changed: Added type
                this.UI.CustomerNodes = nodes;
                if (fromCookie && this.component.headerCookie.customerID) {
                  if (this.component.headerValues.ShipmentSetting == ShipmentSetting.Unify_US05 ||
                    this.component.headerValues.ShipmentSetting == ShipmentSetting.Costco) {
                    this.UI.CustomerNodes.forEach((item: any) => { // AI changed: Added type
                      if (item.CUSTOMER_ID.split("")[2] === "2") {
                        this.component.headerCookie.customerID = item.CUSTOMER_ID;
                        this.component.UI.SelectedCustomerNode = this.component.headerCookie.customerID;
                        const customerNodeItem = this.component.UI.CustomerNodes.find((item: any) => item.CUSTOMER_ID == this.component.UI.SelectedCustomerNode); // AI changed: Added type
                        this.component.headerValues.EventLogic = customerNodeItem.FLAG_EVENT_LOGIC || this.component.UI.SelectedCustomerPlan.E;
                      }
                    });
                  }
                  else if (this.component.headerValues.isCanadianCustomer && (this.component.headerValues.CustomerID != this.component.headerCookie.customerID)) {
                    this.component.UI.SelectedCustomerNode = this.component.headerCookie.customerID;
                  }
                  else {
                    this.component.UI.SelectedCustomerNode = this.component.headerCookie.customerID;
                    const customerNodeItem = this.component.UI.CustomerNodes.find((item: any) => item.CUSTOMER_ID == this.component.UI.SelectedCustomerNode); // AI changed: Added type
                    this.component.headerValues.EventLogic = customerNodeItem.FLAG_EVENT_LOGIC || this.component.UI.SelectedCustomerPlan.E;
                  }
                }
                else if (this.component.headerValues.CustomerID && this.component.headerValues.isCanadianCustomer && this.component.headerValues.hasShipperModVersion) {
                  this.component.UI.SelectedCustomerNode = this.UI.SelectedCustomerPlan.PC;
                }
                else if (this.component.headerValues.isCanadianCustomer && this.component.headerValues.CustomerID) {
                  this.component.UI.SelectedCustomerNode = this.component.headerValues.CustomerID;
                }
                else {
                  this.component.UI.SelectedCustomerNode = this.UI.CustomerNodes[0].CUSTOMER_ID;
                  this.component.headerValues.EventLogic = this.UI.CustomerNodes[0].FLAG_EVENT_LOGIC || this.component.UI.SelectedCustomerPlan.E;
                }
                if (this.component.headerValues.ShipmentSetting == ShipmentSetting.Unify_US05 || this.component.headerValues.ShipmentSetting == ShipmentSetting.Costco) {
                  if (!this.component.headerCookie)
                  {
                    this.createHeaderCookie();
                  }
                  this.UI.CustomerNodes.forEach((item: any) => { // AI changed: Added type
                    if (item.CUSTOMER_ID.split("")[2] === "2") {
                      this.component.headerCookie.customerID = item.CUSTOMER_ID;
                      this.component.UI.SelectedCustomerNode = this.component.headerCookie.customerID;
                      const customerNodeItem = this.component.UI.CustomerNodes.find((item: any) => item.CUSTOMER_ID == this.component.UI.SelectedCustomerNode); // AI changed: Added type
                      this.component.headerValues.EventLogic = customerNodeItem.FLAG_EVENT_LOGIC || this.component.UI.SelectedCustomerPlan.E;
                    }
                  });
                }
              }
              else {
                console.log("No customer nodes data found for selected Planning Entity: " + this.component.headerValues.PlanningEntity);
              }
              this.component.headerValues.CustomerID = this.component.UI.SelectedCustomerNode;
              this.getVersionList(fromCookie);
            }).catch((error: any) => { // AI changed: Added type
              console.log("failed to load customer nodes. " + error);
              this.component.UI.isLoading = false;
            });
        }
      }

      public loadData() {
        this.createHeaderCookie();
        if (this.component.router.url == '/mass-activities' &&
          (this.component.headerValues.isSMG || this.component.headerValues.ShipmentSetting == ShipmentSetting.StreamLine)) {
          this.component.router.navigateByUrl('/'); //navigate to home page
        }
        else if (this.component.router.url != '/' && this.component.router.url != '/financials' && this.component.router.url != '/authorization-list' && this.component.router.url != '/tableau-integration'
          && (this.component.headerValues.isSMG || this.UI.SelectedCategory == "ALL")) {
          this.component.router.navigateByUrl('/'); //navigate to home page
        }
        // route to dashboard if smg customer is selected from customer settings screen
        else if (this.component.router.url == '/authorization-list' && !this.component.headerValues.isCanadianCustomer && this.UI.SelectedCategory == "ALL") {
          this.component.router.navigateByUrl('/'); //navigate to home page
        }
        else {
          this.FetchHeaderTilesData();
          this.component.GetPlanSelectionHeaderValues.emit(this.component.headerValues);
        }
      }

      public createHeaderCookie() {
        var customerId = (this.component.headerValues.isCanadianCustomer && !this.component.UI.SelectedCustomerNode) ? this.UI.SelectedCustomerPlan.PC
          : this.component.UI.SelectedCustomerNode || this.UI.SelectedCustomerPlan.PC;
        //var customerId = this.component.UI.SelectedCustomerNode || (this.UI.SelectedCustomerPlan ? this.UI.SelectedCustomerPlan.PC : null);
        var cookieHeaderData = {
          'fiscalYear': this.component.SelectedPlanYear,
          'planningEntity': this.UI.SelectedCustomerPlan ? this.UI.SelectedCustomerPlan.PC : null,
          'planId': this.UI.SelectedCustomerPlan ? this.UI.SelectedCustomerPlan.ID : null,
          'customerID': customerId,
          'categoryId': this.UI.SelectedCategory,
          'categoryName': this.component.headerValues.CategoryName,
          'versionID': this.component.headerValues.VersionID,
          'salesOrg': this.component.headerValues.SalesOrg,
          'isSMG': this.component.headerValues.isSMG,
          'isCanadianCustomer': this.component.headerValues.isCanadianCustomer,
          'PlanningIndicator': this.component.headerValues.PlanningIndicator,
          'ShipmentSetting': this.component.headerValues.ShipmentSetting,
          'BU': this.component.headerValues.BU
        }

        /*this.component.cookieService.delete('headerselection');*/
        this.component.webStorageService.set('headerselection', JSON.stringify(cookieHeaderData));
        this.component.headerCookie = cookieHeaderData;
        this.component.headerCookieExists = true;
      }

      public FetchHeaderTilesData(isLoading: boolean = true) {
        if (!this.component.UI.SelectedCustomerPlan || !this.component.UI.SelectedCategory
          || this.component.UI.isTilesLoading || this.component.UI.isLoading) { //block the call if it is alredy in progress
          this.component.UI.isLoading = false;
          return;
        }
        //albertson , divisional planning is 1
        //if FLAG_DIVISIONAL_PLANNING == 1 and check only if FLAG_DIVISIONAL_PLANNING == 1cutomer id is == planning entity disbale customer settings
        // For CA always pass Plan level customer id
        var customerId = this.component.headerValues.isCanadianCustomer ? this.UI.SelectedCustomerPlan.PC : this.component.UI.SelectedCustomerNode || this.UI.SelectedCustomerPlan.PC;
        var headerData = {
          'fiscalYear': this.component.headerValues.FiscalYear,
          'customerID': customerId,
          //'customerID': this.component.UI.SelectedCustomerNode || this.UI.SelectedCustomerPlan.PC,
          'categoryId': this.component.headerValues.CategoryID,
          'customerPlanID': this.component.headerValues.CustomerPlanID,
          'versionID': this.component.headerValues.VersionID,
          'shipmentSetting': this.component.headerValues.ShipmentSetting,
          'flagDivisionalPlanning': this.component.UI.SelectedCustomerPlan.D,
          'planningEntity': this.UI.SelectedCustomerPlan.PC,
          'salesOrg': this.UI.SelectedCustomerPlan.O,
          'flagSMG': this.UI.SelectedCustomerPlan.G == 1 ? "SMG" : ""
        }

        if (this.component.headerValues.isCanadianCustomer) {
          this.component.UI.isTilesLoading = true;
        } else {
          this.component.UI.isLoading = isLoading;
        }
        this.component.compassTilesDataProvider.queryHeaderTilesData(headerData).then((result: any) => {
          if (result.data && result.count > 0) {
            this.component.UI.TilesData = result.data;
            this.component.UI.isLoading = false;
            this.component.UI.isTilesLoading = false;
          }
        }).catch((error: any) => { // AI changed: Added type
          this.component.UI.isLoading = false;
          this.component.UI.isTilesLoading = false;
          console.log("Failed to fectch Tiles data. " + error);
        });
      }

      public onVersionsClick() {
        if (this.component.UI.SelectedVersion) {
          this.component.showVersionLabel = false;
          this.component.UI.showVersionsDropdwon = true;
          this.component.versionsDropdownlist.toggle(true);
        }
      }

      public onDropdownClose(event: any) {
        this.component.versionsDropdownlist.toggle(false);
        this.component.showVersionLabel = true;
        this.component.UI.showVersionsDropdwon = false;
      }

      public clearData() {
        this.component.UI.CustomerPlan = [];
        this.component.UI.Category = [];
        this.component.UI.CustomerNodes = [];
        this.component.UI.VersionNameList = [];

        this.component.UI.SelectedCustomerPlan = null;
        this.component.UI.SelectedCategory = null;
        this.component.UI.SelectedCustomerNode = "";
        this.component.UI.SelectedVersion = null;
        this.component.UI.TilesData = new TilesHeaders();
      }

    }(this.component, this.model, this.controls, this.datasources, this);

    private Busy() {
      this.loadingData = true;
    }

    private NotBusy() {
      this.loadingData = false;
    }

    // ---------------------------------------------------
    // UI.setup() functions
    setup(fromCookie: boolean = true) {
      //this.component.compassPlanSelectionHeaderProvider.setYear(this.component.SelectedPlanYear);
      if (this.component.SelectedPlanYear == (new Date().getFullYear().toString())) {
        this.component.msgYear = 'CURRENT YEAR';
        this.component.msgColor = '#DF19F7';
      }
      else if (this.component.SelectedPlanYear > (new Date().getFullYear().toString())) {
        this.component.msgYear = 'FUTURE YEAR';
        this.component.msgColor = '#F7F019';
      }
      else {
        this.component.msgYear = 'PRIOR YEAR';
        this.component.msgColor = '#16BAEE';
      }
      this.component.compassPlanSelectionHeaderProvider.setMsgYear(this.component.msgYear);
      this.component.compassPlanSelectionHeaderProvider.setNavColor(this.component.msgColor);
      //check to whether there is change
      if (this.component.headerValues.FiscalYear && this.component.headerValues.FiscalYear == this.component.SelectedPlanYear) {
        //no chage in year
        return;
      }
      else if (this.component.parent && this.component.parent.hasAccountPlannerChanges()) {
        this.component.OkDialogComponent.UI.showOkDialog("Info", `Save changes to AP prior to changing categories/customer.`, () => {
          this.component.SelectedPlanYear = this.component.headerValues.FiscalYear; //restore old value
        });
        return;
      }
      else if (!fromCookie) { //clear header cookie on the Plan year dropdown change
        this.component.headerCookieExists = false;//clear cookie value
      }

      var params = {
        "lanID": this.component._appContext.userInfo.LanID,//"LAC6843", "WKP3748"//YGM6535", //
        "year": this.component.SelectedPlanYear,
      }
      //Clear models
      this.component.UI.handlers.clearData();
      this.component.headerValues.FiscalYear = this.component.SelectedPlanYear;
      this.component.UI.isYearchange = true;
      this.component.UI.isSalesOrgChange = true;

      //to clear chache every day
      let date = new Date();
      let cacheKey = date.getDate().toString();//get today's date
      if (localStorage.getItem(cache