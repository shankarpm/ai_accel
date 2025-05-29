import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy, Input, TemplateRef, Injectable, OnInit, EventEmitter, Output } from '@angular/core';
import { DialogService, DialogRef, DialogCloseResult } from '@progress/kendo-angular-dialog';
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { YesNoConfirmationDialogComponent } from '../yes-no-confirmation-dialog/yes-no-confirmation-dialog.component';
import { PPGSBAnnerDivisionDataProvider } from '../../services/data/ppgs-bannerdivision-data-provider.service';
import { SAPPPGsDataProvider } from '../../services/data/sap-ppgs-data-provider.service';
// AI changed: Commented out missing imports
// import { CustomClientGroup } from '../../DataContracts/CustomClientGroup/CustomClientGroup';
import { GlobalDataService } from '../globalDataService/globalDataService.component';
// import { UserInfo, UserBanners } from '../../DataContracts/Auth/userInfo';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

declare var kendo: any;

@Component({
  selector: 'banner-multiselect-component',
  templateUrl: './banner-multiselect-component.html',
  styleUrls: ['./banner-multiselect-component.css'],
  // AI changed: Added imports
  imports: [MatFormFieldModule, MatSelectModule, MatOptionModule],
  standalone: true
})

@Injectable()
export class BannerMultiselectComponent implements AfterViewInit, OnInit {
  constructor(private router: Router, private dialogService: DialogService,
    private YesNoConfirmationDialogComponent: YesNoConfirmationDialogComponent,
    private PPPGSBAnnerDivisionDataProvider: PPGSBAnnerDivisionDataProvider,
    private SAPPPGsDataProvider: SAPPPGsDataProvider,
    private _appContext: GlobalDataService) {
    this.appContext = _appContext;
  }

  public appContext: GlobalDataService = null!; // AI changed: Added definite assignment assertion

  // Specific kendo Controls
  @ViewChild('bannerselection') bannerSelection!: ElementRef; // AI changed: Added definite assignment assertion
  @ViewChild('ppgselection') ppgSelection!: ElementRef; // AI changed: Added definite assignment assertion
  @ViewChild('sapppgselection') sapppgSelection!: ElementRef; // AI changed: Added definite assignment assertion
  @ViewChild('categoryselection') categoryselection!: ElementRef; // AI changed: Added definite assignment assertion

  ngOnInit() {
    this.UI.setup();
  }

  ngAfterViewInit() {
  }

  public SelectCallback: any;

  populateBanners: boolean = false;

  public populateBannersData(banners: any) { // AI changed: Changed type from CustomClientGroup to any
    if (this.datasources.dsPPG_Division_Banner != undefined) {
      let bannerDivisions: any[] = banners.BannersDivision == undefined ? [] : banners.BannersDivision;
      let ppgs: any[] = banners.PPGs == undefined ? [] : banners.PPGs;
      let sapppgs: any[] = banners.SAPPPGs == undefined ? [] : banners.SAPPPGs;

      bannerDivisions = bannerDivisions.concat(this.model.BannersGroup.BannersDivision).filter((v: any, i: number, a: any[]) => a.indexOf(v) === i); // AI changed: Added type annotations
      ppgs = ppgs.concat(this.model.BannersGroup.PPGs).filter((v: any, i: number, a: any[]) => a.indexOf(v) === i); // AI changed: Added type annotations
      sapppgs = sapppgs.concat(this.model.BannersGroup.SAPPPGs).filter((v: any, i: number, a: any[]) => a.indexOf(v) === i); // AI changed: Added type annotations

      let selectedCategories = this.UI.controls.CategoryMultiSelect.value()

      //clear customer and category selections
      this.model.SelectedCustomer = "";
      this.UI.handlers.onCustomerSelectChange("");
      this.UI.controls.CategoryMultiSelect.value([]);
      this.UI.handlers.onCategoryMultiSelectClose();

      this.UI.controls.BannerDivisionMultiSelect.value(bannerDivisions);
      this.UI.controls.PPGMultiSelect.value(ppgs);
      this.UI.controls.SAPPPGMultiSelect.value(sapppgs);

      this.model.BannersGroup.BannersDivision = this.UI.controls.BannerDivisionMultiSelect.value();
      this.model.BannersGroup.PPGs = this.UI.controls.PPGMultiSelect.value();
      this.model.BannersGroup.SAPPPGs = this.UI.controls.SAPPPGMultiSelect.value();

      //update descriptions
      this.UI.handlers.UpdateBannerDescriptions();
      this.UI.handlers.UpdatePPGsDescriptions();
      this.UI.handlers.UpdateSAPPPGsDescriptions();

      //Restore categories
      this.UI.controls.CategoryMultiSelect.value(selectedCategories);
      this.UI.handlers.onCategoryMultiSelectClose();
    } else {
      //to load multi selects after initialization
      this.model.BannersGroup = banners;
      this.populateBanners = true;
    }
  }

  // Model
  public model = new class {
    // AI changed: Reordered initialization to avoid property usage before initialization
    public BannersGroup: any = {}; // AI changed: Changed type from CustomClientGroup to any
    public CustomerList: string[] = [];
    public SelectedCustomer: string = ""; // AI changed: Added initializer
    public IsPlanModified: boolean = false;
    public PlaningYear: any;

    constructor(public component: BannerMultiselectComponent) { 
      this.PlaningYear = this.component._appContext.userConfiguration.activePlanningYear.value;
    }
  }(this);

  // ---------------------------------------------------
  // DataSources 
  public datasources = new class {
    constructor(public component: BannerMultiselectComponent, public model: any) {
    }
    private promises: Promise<Object>[] = [];
    private Banners: any[] = [];

    public CustomerListSource: any[] = [];
    public CategoryListSource: string[] = [];

    private WaitForData(promise: Promise<Object>): Promise<Object> {
      this.promises.push(promise);
      return promise;
    }

    public GetAllWaitForDataPromise(): Promise<Object> {
      return Promise.all(this.promises);
    }

    public initialize(): Promise<Object> {
      this.WaitForData(this.component.PPPGSBAnnerDivisionDataProvider.query()).then((result: any) => {
        this.dsPPG_Division_Banner = result.data;
        this.FilterBanners();
      });

      return this.GetAllWaitForDataPromise();
    }

    CustomerFilterReset() {
      this.FilterBanners();
      this.model.CustomerList = this.QueryCustomers();
      this.component.UI.controls.BannerDivisionMultiSelect_setDataSource(this.QueryBanners());
    }

    FilterBanners() {
      this.Banners = [];

      let customersBanners: any[] = this.component.appContext.userInfo.Banners; // AI changed: Changed type from UserBanners[] to any[]
      let bannerList: any = {};
      this.CustomerListSource = [];

      for (let i = 0; i < customersBanners.length; i++) {
        let currentCustomer: any = customersBanners[i];

        if (currentCustomer.Year == this.model.PlaningYear) {
          let customerListContains = this.CustomerListSource.filter((b: any) => b.value == currentCustomer.CustomerPlanName); // AI changed: Added type annotation
          if (customerListContains.length == 0) {
            this.CustomerListSource.push({ "value": currentCustomer.CustomerPlanName, "id": currentCustomer.CustomerId, "year": currentCustomer.Year });
          }
          let name = currentCustomer.BannerName + " (" + currentCustomer.CustomerName + ")";
          this.Banners.push({ "value": name, "id": currentCustomer.BannerID, "customer": currentCustomer.CustomerPlanName, "year": currentCustomer.Year });
        }
      }

      this.CustomerListSource.sort();
    }

    QueryBanners() {
      return this.Banners;
    }

    QueryPPGs() {
      return this.dsPPG_Division_Banner.PPGs;
    }

    QuerySAPPPGs(banners: any) {
      return this.dsPPG_Division_Banner.SAPPPGs;
    }

    QueryCustomers() {
      return this.CustomerListSource;
    }

    QueryCategories() {
      return this.dsPPG_Division_Banner.Categories;
    }

    FeatureTypesList: any[] = ["Front Page", "Back Page", "Inside", "In Store", "EDLP"];

    dsPPG_Division_Banner: any;
  }(this, this.model);
  // ---------------------------------------------------
  // UI
  public UI = new class {
    public ready: boolean = false;
    public loadingData: boolean = false;

    constructor(public component: BannerMultiselectComponent, public model: any, public datasources: any) {
    }

    // ---------------------------------------------------
    // UI.controls

    public controls = new class {
      constructor(public component: BannerMultiselectComponent, public model: any, public datasources: any) {
      }

      CategoryMultiSelect: any = null;
      PPGMultiSelect: any = null;
      SAPPPGMultiSelect: any = null;
      BannerDivisionMultiSelect: any = null;
      // ------------------------------------------------------------

      BannerDivisionMultiSelect_setDataSource(newElements: any) {
        this.BannerDivisionMultiSelect.setDataSource(new kendo.data.DataSource({ data: newElements }));
        // lets for a value read
        let workaround = this.BannerDivisionMultiSelect.value();
      }
      
      PPGMultiSelect_setDataSource(newElements: any) {
        let items: any[] = [];
        let ulist: string[] = [];

        //filter unique items to show in multiselect
        for (let item of newElements) {
          if (ulist.indexOf(item.Id) == -1) {
            ulist.push(item.Id);
            items.push(item);
          }
        }

        this.PPGMultiSelect.setDataSource(new kendo.data.DataSource({ data: items }));
        // lets for a value read
        let workaround = this.PPGMultiSelect.value();
      }

      SAPPPGMultiSelect_setDataSource(newElements: any) {
        this.SAPPPGMultiSelect.setDataSource(new kendo.data.DataSource({ data: newElements }));
        // lets for a value read
        let workaround = this.SAPPPGMultiSelect.value();
      }

      CategoryMultiSelect_setDataSource(newElements: any) {
        this.CategoryMultiSelect.setDataSource(new kendo.data.DataSource({ data: newElements }));
        // lets for a value read
        let workaround = this.CategoryMultiSelect.value();
      }

      AddToSAPPPGMultiSelect(newElements: any) {
        let uniqueItems = this.model.BannersGroup.SAPPPGs.concat(newElements).filter((v: any, i: number, a: any[]) => a.indexOf(v) === i); // AI changed: Added type annotations
        this.model.BannersGroup.SAPPPGs = uniqueItems;
        this.SAPPPGMultiSelect.value(uniqueItems);
      }
    }(this.component, this.model, this.datasources)

    showConfirmationDialog(title: string, message: string, yesCallback: () => void, noCallback: () => void) {
      let dialog: DialogRef = this.component.dialogService.open({
        title: title,
        content: message,
        actions: [
          { text: 'No', primary: true }, // AI changed: Removed deprecated userConfirmed property
          { text: 'Yes' } // AI changed: Removed deprecated userConfirmed property
        ],
        width: 450,
        height: 200,
        minWidth: 250
      });

      dialog.result.subscribe((result) => {
        if (result instanceof DialogCloseResult) {
          noCallback();
        } else {
          if (result.text === 'Yes') { // AI changed: Updated dialog result check
            yesCallback();
          } else {
            noCallback();
          }
        }
      });
    }

    // ---------------------------------------------------
    // UI.handlers 
    public handlers = new class {
      constructor(public component: BannerMultiselectComponent, public model: any, public controls: any, public datasources: any, public UI: any) {
      }

      isBannerMultiSelectOpen: boolean = false;
      isPPGMultiSelectOpen: boolean = false;
      isSAPPPGMultiSelectOpen: boolean = false;
      isBannerDivisionMultiSelectChangePropagating: boolean = false;
      isPPGMultiSelectChangePropagating: boolean = false;
      isCategoryMultiSelectOpen: boolean = false;

      isSeletedItemsChanged(sourceItems: any[], targetItems: any[]) {
        if (sourceItems.length != targetItems.length) {
          return true;
        }

        for (let s of sourceItems) {
          if (targetItems.indexOf(s) == -1)
            return true;
        }

        return false;
      }

      /////////////// BANNER-DIVISION MULTI SELET UI STATE MANAGEMENT

      onBannerDivisionMultiSelectOpen() {
        console.log("[BannerDivisionMultiSelect:Open");
        this.isBannerMultiSelectOpen = true;
      }

      onBannerDivisionMultiSelectClose() {
        console.log("[BannerDivisionMultiSelect:Close");

        this.isBannerMultiSelectOpen = false;

        let whenChangeConfirmed: () => void = () => {
          this.model.BannersGroup.BannersDivision = this.controls.BannerDivisionMultiSelect.value();
          this.UpdateBannerDescriptions();
        };

        let whenChangeNotConfirmed: () => void = () => {
          // Restore the Multiple Selection to its previous state
          this.controls.BannerDivisionMultiSelect.value(this.model.BannersGroup.BannersDivision);
        };

        // if we didn't have anything selected before, just confirm the change, if not ask for confirmation
        if (this.model.BannersGroup.BannersDivision == null || this.model.BannersGroup.BannersDivision.length == 0) {
          whenChangeConfirmed();
        }
        else {
          // let's see if there has been any change on the selected Banners, if so, ask the user for confirmation before scrap all the plan
          if (this.isSeletedItemsChanged(this.model.BannersGroup.BannersDivision, this.controls.BannerDivisionMultiSelect.value())) {
            if (this.model.IsPlanModified) {
              this.component.YesNoConfirmationDialogComponent.UI.showConfirmationDialog(
                'Please confirm',
                'This operation will reset your current selections. Do you want to continue?',
                whenChangeConfirmed,
                whenChangeNotConfirmed);
            }
            else { whenChangeConfirmed(); }
          }
        }
      }

      onBannerDivisionMultiSelectChange() {
        console.log("[BannerDivisionMultiSelect:Change");
        if (this.isBannerMultiSelectOpen == false) {
          // Reuse the logic, a change will trigger the Confirmation Dialog
          this.onBannerDivisionMultiSelectClose();
        }
        else {
          console.log("[BannerDivisionMultiSelect]:Change -> Ignoring Change due isBannerMultiSelectOpen = True.");
        }
      }

      ////////////////// PPG MULTISELECT UI STATE MANAGEMENT

      onPPGMultiSelectOpen() {
        this.isPPGMultiSelectOpen = true;
      }

      onPPGMultiSelectClose() {
        console.log("[onPPGMultiSelectClose:Close");
        this.isPPGMultiSelectOpen = false;

        let whenChangeConfirmed: () => void = () => {
          this.model.BannersGroup.PPGs = this.controls.PPGMultiSelect.value();
          this.UpdatePPGsDescriptions();
          this.LoadSAPPPGs();
        };

        let whenChangeNotConfirmed: () => void = () => {
          // Restore the Multiple Selection to its previous state
          this.controls.PPGMultiSelect.value(this.model.BannersGroup.PPGs);
        };

        // if we didn't have anything selected before, just confirm the change, if not ask for confirmation
        if (this.model.BannersGroup.PPGs == null || this.model.BannersGroup.PPGs.length == 0) {
          whenChangeConfirmed();
        } else {
          // check if there is a difference between the current values in the DropBox and the current selection
          if (this.isSeletedItemsChanged(this.model.BannersGroup.PPGs, this.controls.PPGMultiSelect.value())) {
            if (this.model.IsPlanModified) {
              this.component.YesNoConfirmationDialogComponent.UI.showConfirmationDialog(
                'Please confirm',
                'This operation will reset your current selections. Do you want to continue?',
                whenChangeConfirmed,
                whenChangeNotConfirmed);
            } else {
              whenChangeConfirmed();
            }
          }
        }
      }

      onPPGMultiSelectChange() {
        if (this.isPPGMultiSelectOpen == false) {
          // Reuse the logic, a change will trigger the Confirmation Dialog
          this.onPPGMultiSelectClose();
        }
        else {
          console.log("[onPPGMultiSelectChange]:Change -> Ignoring Change due isPPGMultiSelectOpen = True.");
        }
      }

      ////////////////// SAPPPG MULTISELECT UI STATE MANAGEMENT

      onSAPPPGMultiSelectOpen() {
        this.isSAPPPGMultiSelectOpen = true;
      }

      onSAPPPGMultiSelectClose() {
        this.isSAPPPGMultiSelectOpen = false;

        let whenChangeConfirmed: () => void = () => {
          this.model.BannersGroup.SAPPPGs = this.controls.SAPPPGMultiSelect.value();
          this.UpdateSAPPPGsDescriptions();
        };

        let whenChangeNotConfirmed: () => void = () => {
          // Restore the Multiple Selection to its previous state
          this.controls.SAPPPGMultiSelect.value(this.model.BannersGroup.SAPPPGs);
        };

        // if we didn't have anything selected before, just confirm the change, if not ask for confirmation
        if (this.model.BannersGroup.SAPPPGs == null || this.model.BannersGroup.SAPPPGs.length == 0) {
          whenChangeConfirmed();
        }
        else {
          // check if there is a difference between the current values in the DropBox and the current selection
          if (this.isSeletedItemsChanged(this.model.BannersGroup.SAPPPGs, this.controls.SAPPPGMultiSelect.value())) {
            if (this.model.IsPlanModified) {
              this.component.YesNoConfirmationDialogComponent.UI.showConfirmationDialog(
                'Please confirm',
                'This operation will reset your current selections. Do you want to continue?',
                whenChangeConfirmed,
                whenChangeNotConfirmed);
            } else { whenChangeConfirmed(); }
          }
        }
      }

      onSAPPPGMultiSelectChange() {
        if (this.isSAPPPGMultiSelectOpen == false) {
          this.onSAPPPGMultiSelectClose();
        }
        else {
          console.log("[onSAPPPGMultiSelectChange]:Change -> Ignoring Change due isSAPPPGMultiSelectOpen = True.");
        }
      }

      LoadSAPPPGs() {
        this.model.BannersGroup.PPGs = this.controls.PPGMultiSelect.value();
        let ppgs: string[] = this.model.BannersGroup.PPGs;

        if (ppgs.length > 0) {
          console.log('[Planning-Editor] Fetching SAPPPGs for new combination banner: ');
          this.UI.Busy();
          this.component.SAPPPGsDataProvider.querySAPPPGs(ppgs).then((result: any) => {
            console.log('[Planning-Editor] Fetch SAPPPGs bumpData. count: ' + result.count);
            this.component.UI.controls.AddToSAPPPGMultiSelect(result.data);
            this.model.BannersGroup.SAPPPGs = this.controls.SAPPPGMultiSelect.value();
            this.UpdateSAPPPGsDescriptions();
            this.UI.NotBusy();
          });
        }
      }

      UpdateBannerDescriptions() {
        //Add BannersDivision Descriptions for selected items
        this.model.BannersGroup.BannersDivisionDescriptions = [];
        let bannerData = this.controls.BannerDivisionMultiSelect.dataItems()
        for (var index = 0; index < bannerData.length; index++) {
          this.model.BannersGroup.BannersDivisionDescriptions.push(bannerData[index].value)
        }
      }

      UpdatePPGsDescriptions() {
        //Add PPGs Descriptions for selected items
        this.model.BannersGroup.PPGsDescriptions = [];
        let ppgsData = this.controls.PPGMultiSelect.dataItems()
        for (var index = 0; index < ppgsData.length; index++) {
          this.model.BannersGroup.PPGsDescriptions.push(ppgsData[index].Value)
        }
      }

      UpdateSAPPPGsDescriptions() {
        //Add SAPPPGs Descriptions for selected items
        this.model.BannersGroup.SAPPPGsDescriptions = [];
        let sapppgsData = this.controls.SAPPPGMultiSelect.dataItems()
        for (var index = 0; index < sapppgsData.length; index++) {
          this.model.BannersGroup.SAPPPGsDescriptions.push(sapppgsData[index].Value)
        }
      }

      onCustomerSelectChange(item: any) {
        if (item === undefined || item.value == "" || item == "") {
          this.controls.BannerDivisionMultiSelect_setDataSource(this.controls.datasources.QueryBanners());
        } else {
          this.controls.BannerDivisionMultiSelect_setDataSource(this.controls.datasources.QueryBanners().filter((b: any) => b.customer == item.value)); // AI changed: Added type annotation
          this.model.BannersGroup.BannersDivision = []; //clear banner selection
        }
      }

      onCustomerFilterChange(filter: any) {
        this.model.CustomerList = this.datasources.QueryCustomers().filter((s: any) => s.value.toLowerCase().indexOf(filter.toLowerCase()) !== -1); // AI changed: Added type annotation
      }

      onCategoryMultiSelectOpen() {
        this.isCategoryMultiSelectOpen = true;
      }

      onCategoryMultiSelectClose() {
        this.isCategoryMultiSelectOpen = false;

        let selectedCategories = this.controls.CategoryMultiSelect.value();

        if (selectedCategories == undefined || selectedCategories.length == 0) {
          this.controls.PPGMultiSelect_setDataSource(this.controls.datasources.QueryPPGs());
          this.controls.SAPPPGMultiSelect_setDataSource(this.controls.datasources.QuerySAPPPGs());
          this.controls.AddToSAPPPGMultiSelect([]);
        } else {
          let selectedPPGs = this.controls.PPGMultiSelect.dataItems();
          let selectedSAPPPGs = this.controls.SAPPPGMultiSelect.dataItems();

          var ppgs: any[] = [];
          var sapppgs: any[] = [];
          ppgs = this.controls.datasources.QueryPPGs().filter((p: any) => selectedCategories.indexOf(p.CategoryId) != -1); // AI changed: Added type annotation
          sapppgs = this.controls.datasources.QuerySAPPPGs().filter((s: any) => selectedCategories.indexOf(s.CategoryId) != -1); // AI changed: Added type annotation
          ppgs = ppgs.concat(selectedPPGs);
          sapppgs = sapppgs.concat(selectedSAPPPGs);

          this.controls.PPGMultiSelect_setDataSource(ppgs.sort((a, b) => a.Value > b.Value ? 1 : -1));
          this.controls.SAPPPGMultiSelect_setDataSource(sapppgs.sort((a, b) => a.Value > b.Value ? 1 : -1));
        }
      }

      onCategorySelectChange() {
        if (this.isCategoryMultiSelectOpen == false) {
          this.onCategoryMultiSelectClose();
        }
        else {
          console.log("[onCategoryMultiSelectChange]:Change -> Ignoring Change due isCategoryMultiSelectOpen = True.");
        }
      }
    }(this.component, this.model, this.controls, this.component.datasources, this);

    // ---------------------------------------------------
    // UI.setup() functions
    private Ready() {
      this.ready = true;
    }

    private Busy() {
      this.loadingData = true;
    }

    private NotBusy() {
      this.loadingData = false;
    }

    setup() {
      // initialize the multi selects
      this.initializeBannerDivisionMultiSelect();
      this.initializeCategoryMultiSelect();
      this.initializePPGMultiSelect();
      this.initializeSAPPPGMultiSelect();
      // UI Is Ready 
      this.Ready();

      this.Busy();
      // let's wait for the datasoruces to be ready
      this.datasources.initialize().then(() => {
        this.controls.BannerDivisionMultiSelect_setDataSource(this.datasources.QueryBanners());
        this.controls.PPGMultiSelect_setDataSource(this.datasources.QueryPPGs());
        this.controls.SAPPPGMultiSelect_setDataSource(this.datasources.QuerySAPPPGs());
        this.controls.CategoryMultiSelect_setDataSource(this.datasources.QueryCategories());
        
        this.model.CustomerList = this.datasources.QueryCustomers();

        if (this.component.populateBanners) {
          this.controls.BannerDivisionMultiSelect.value(this.model.BannersGroup.BannersDivision);
          this.controls.PPGMultiSelect.value(this.model.BannersGroup.PPGs);
          this.controls.SAPPPGMultiSelect.value(this.model.BannersGroup.SAPPPGs);
          this.component.populateBanners = false;
        }
        this.NotBusy();
      })
    }

    initializeBannerDivisionMultiSelect() {
      this.controls.BannerDivisionMultiSelect = kendo.jQuery(this.component.bannerSelection.nativeElement).kendoMultiSelect({
        dataTextField: "value",
        dataValueField: "id",
        dataSource: [],
        autoClose: false,
        open: () => { this.handlers.onBannerDivisionMultiSelectOpen() },
        close: () => { this.handlers.onBannerDivisionMultiSelectClose(); },
        change: () => { this.handlers.onBannerDivisionMultiSelectChange(); },
      }).data("kendoMultiSelect");
    }

    initializeCategoryMultiSelect() {
      this.controls.CategoryMultiSelect = kendo.jQuery(this.component.categoryselection.nativeElement).kendoMultiSelect({
        dataTextField: "Value",
        dataValueField: "Id",
        dataSource: [],
        autoClose: false,
        open: () => { this.handlers.onCategoryMultiSelectOpen() },
        close: () => { this.handlers.onCategoryMultiSelectClose(); },
        change: () => { this.handlers.onCategorySelectChange(); }
      }).data("kendoMultiSelect");
    }

    initializePPGMultiSelect() {
      this.controls.PPGMultiSelect = kendo.jQuery(this.component.ppgSelection.nativeElement).kendoMultiSelect({
        dataTextField: "Value",
        dataValueField: "Id",
        dataSource: [],
        autoClose: false,
        open: () => { this.handlers.onPPGMultiSelectOpen() },
        close: () => { this.handlers.onPPGMultiSelectClose(); },
        change: () => { this.handlers.onPPGMultiSelectChange(); },
      }).data("kendoMultiSelect");
    }

    initializeSAPPPGMultiSelect() {
      this.controls.SAPPPGMultiSelect = kendo.jQuery(this.component.sapppgSelection.nativeElement).kendoMultiSelect({
        dataTextField: "Value",
        dataValueField: "Id",
        dataSource: [],
        autoClose: false,
        open: () => { this.handlers.onSAPPPGMultiSelectOpen() },
        close: () => { this.handlers.onSAPPPGMultiSelectClose(); },
        change: () => { this.handlers.onSAPPPGMultiSelectChange(); },
      }).data("kendoMultiSelect");
    }
  }(this, this.model, this.datasources);
}