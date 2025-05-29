import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy, Input, TemplateRef, Injectable, OnInit, EventEmitter, Output } from '@angular/core';
import { DialogService, DialogRef, DialogCloseResult } from '@progress/kendo-angular-dialog';
import { Subscription } from 'rxjs/Subscription';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { YesNoConfirmationDialogComponent } from '../yes-no-confirmation-dialog/yes-no-confirmation-dialog.component';
import { PPGSBAnnerDivisionDataProvider } from '../../services/data/ppgs-bannerdivision-data-provider.service'
import { SAPPPGsDataProvider } from '../../services/data/sap-ppgs-data-provider.service'
import { CustomClientGroup } from '../../DataContracts/CustomClientGroup/CustomClientGroup';
import { fail } from 'assert';
import { GlobalDataService } from '../globalDataService/globalDataService.component';
import { UserInfo, UserBanners } from '../../DataContracts/Auth/userInfo';

declare var kendo: any;

@Component({
  selector: 'output-to-reveal-multiselect-component',
  templateUrl: './output-to-reveal-multiselect-component.html',
  styleUrls: ['./output-to-reveal-multiselect-component.css']
})

@Injectable()
export class OutputToRevealMultiselectComponent implements AfterViewInit, OnInit {
  constructor(private router: Router, private dialogService: DialogService,
    private YesNoConfirmationDialogComponent: YesNoConfirmationDialogComponent,
    private PPPGSBAnnerDivisionDataProvider: PPGSBAnnerDivisionDataProvider,
    private SAPPPGsDataProvider: SAPPPGsDataProvider,
    private _appContext: GlobalDataService) {
    this.appContext = _appContext;
  }

  public appContext: GlobalDataService = null;

  // Specific kendo Controls
  @ViewChild('bannerselection') bannerSelection: ElementRef;
  @ViewChild('ppgselection') ppgSelection: ElementRef;
  @ViewChild('sapppgselection') sapppgSelection: ElementRef;
  @ViewChild('categoryselection') categoryselection: ElementRef;

  ngOnInit() {
    if (this._appContext.Authenticated) {
      this.UI.setup();
    }
  }

  ngAfterViewInit() {
  }

  public SelectCallback: any;

  populateBanners: boolean = false;


  public populateBannersData(banners: CustomClientGroup) {

    if (this.datasources.dsPPG_Division_Banner != undefined) {
      //
      let bannerDivisions: any[] = banners.BannersDivision == undefined ? [] : banners.BannersDivision;
      let ppgs: any[] = banners.PPGs == undefined ? [] : banners.PPGs;
      let sapppgs: any[] = banners.SAPPPGs == undefined ? [] : banners.SAPPPGs;

      bannerDivisions = bannerDivisions.concat(this.model.BannersGroup.BannersDivision).filter((v, i, a) => a.indexOf(v) === i);
      ppgs = ppgs.concat(this.model.BannersGroup.PPGs).filter((v, i, a) => a.indexOf(v) === i);
      sapppgs = sapppgs.concat(this.model.BannersGroup.SAPPPGs).filter((v, i, a) => a.indexOf(v) === i);

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


  public populateDashboardBannersData(banners: any) {

    //to load multi selects after initialization
    this.model.SelectedCustomer = banners.PLANING_ENTITYS_DESCRIPTIONS;
    this.UI.handlers.onCustomerSelectChange(this.model.SelectedCustomer)
    this.model.BannersGroup.PlanningEntityDescriptions = banners.PLANING_ENTITYS_DESCRIPTIONS;
    this.model.BannersGroup.Category = banners.CATEGORY;
    this.model.BannersGroup.CategoryDescriptions = banners.CATEGORY_DESCRIPTIONS;
    this.model.BannersGroup.PPGs = banners.KHBM_PPGS;
    this.model.BannersGroup.PPGsDescriptions = banners.KHBM_PPG_DESCRIPTIONS;
    this.model.BannersGroup.SAPPPGs = banners.SAP_PPG_IDS;
    this.model.BannersGroup.SAPPPGsDescriptions = banners.SAP_PPGS_DESCRIPTIONS;
    this.populateBanners = true;
  }

  // Model
  public model = new class {
    constructor(public component: OutputToRevealMultiselectComponent) { }

    public BannersGroup: CustomClientGroup = new CustomClientGroup();
    public CustomerList: string[] = [];
    public SelectedCustomer: string;
    public IsDesktop: boolean = false;
    public PlaningYear: any;
  }(this);

  // ---------------------------------------------------
  // DataSources 
  public datasources = new class {
    constructor(public component: OutputToRevealMultiselectComponent, public model: any) {
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
      // this.component.UI.controls.BannerDivisionMultiSelect_setDataSource(this.QueryBanners());
    }
    
    FilterBanners() {
      this.Banners = [];


      let planningEntities: any = this.component.appContext.userInfo.PlanningEntities;

      let bannerList: any = {};
      this.CustomerListSource = [];
      this.model.CustomersList = [];

      // #6801 Filters Planning Entity by Year

      var resultArray = Object.keys(planningEntities).map(function (personNamedIndex) {
        let planningEntity = planningEntities[personNamedIndex];
        // do something with planningEntity
        //for (let i = 0; i < planningEntity.length; i++) {
        //  let currentCustomer: any = planningEntity[i];

        //  if (currentCustomer.Year == "2020") {
        //    let customerListContains = this.CustomerListSource.filter((b) => b.value == currentCustomer.CustomerPlanName);
        //    if (customerListContains.length == 0) {
        //      this.CustomerListSource.push({ "value": currentCustomer.CustomerPlanName, "id": currentCustomer.CustomerId, "year": currentCustomer.Year });
        //    }
        //  }
        //}
        return planningEntity;
      });

      for (let i = 0; i < resultArray.length; i++) {
        let key: any = resultArray[i];
        for (let i = 0; i < key.length; i++) {
          let currentCustomer: any = key[i];

          if (currentCustomer.Year == this.model.PlaningYear) {
            let customerListContains = this.CustomerListSource.filter((b) => b.value == currentCustomer.CustomerPlanName);
            if (customerListContains.length == 0) {
              this.CustomerListSource.push({ "value": currentCustomer.CustomerPlanName, "id": currentCustomer.CustomerId, "year": currentCustomer.Year });
            }
          }
        }
      }

      //for (let key in planningEntities) {

      //  if (this.CustomerListSource.includes(key) == false) {
      //    this.CustomerListSource.push(key);
      //  }
      //  //let name = currentCustomer.BannerName + " (" + currentCustomer.CustomerName + ")";
      //  //this.Banners.push({ "value": name, "id": currentCustomer.BannerID, "customer": currentCustomer.CustomerName });
      //}



      //for (let i = 0; i < customersBanners.length; i++) {
      //  let currentCustomer: any = customersBanners[i];
      //  if (this.CustomerListSource.includes(currentCustomer.CustomerName) == false) {
      //    this.CustomerListSource.push(currentCustomer.CustomerName);
      //  }
      //  let name = currentCustomer.BannerName + " (" + currentCustomer.CustomerName+ ")";
      //  this.Banners.push({ "value": name, "id": currentCustomer.BannerID, "customer": currentCustomer.CustomerName });
      //}

      //let customersBanners: any = this.dsPPG_Division_Banner.CustomersBanners;
      //let bannerList: any = {};
      //this.model.CustomersList = [];

      //for (let i = 0; i < customersBanners.length; i++) {
      //  let currentCustomer: any = customersBanners[i];
      //  this.CustomerListSource.push(currentCustomer.Name);

      //  let currentCustomerBanners: any[] = currentCustomer.Banners;
      //  for (let x = 0; x < currentCustomerBanners.length; x++) {
      //    var currentBanner: any = currentCustomerBanners[x];
      //    let name = currentBanner.Value + " (" + currentCustomer.Name + ")";
      //    this.Banners.push({ "value": name, "id": currentBanner.Id, "customer": currentCustomer.Name });
      //  }
      //}

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

    constructor(public component: OutputToRevealMultiselectComponent, public model: any, public datasources: any) {
    }

    // ---------------------------------------------------
    // UI.controls

    public controls = new class {
      constructor(public component: OutputToRevealMultiselectComponent, public model: any, public datasources: any) {
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
        let uniqueItems = this.model.BannersGroup.SAPPPGs.concat(newElements).filter((v, i, a) => a.indexOf(v) === i);

        this.model.BannersGroup.SAPPPGs = uniqueItems;
        this.SAPPPGMultiSelect.value(uniqueItems);
      }
    }(this.component, this.model, this.datasources)

    showConfirmationDialog(title: string, message: string, yesCallback: () => void, noCallback: () => void) {

      let dialog: DialogRef = this.component.dialogService.open({
        title: title,
        content: message,

        actions: [
          { text: 'No', primary: true, userConfirmed: false },
          { text: 'Yes', userConfirmed: true }
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

    // ---------------------------------------------------
    // UI.handlers 
    public handlers = new class {
      constructor(public component: OutputToRevealMultiselectComponent, public model: any, public controls: any, public datasources: any, public UI: any) {
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
            this.component.YesNoConfirmationDialogComponent.UI.showConfirmationDialog(
              'Please confirm',
              'This operation will reset your current selections. Do you want to continue?',
              whenChangeConfirmed,
              whenChangeNotConfirmed);
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
            this.component.YesNoConfirmationDialogComponent.UI.showConfirmationDialog(
              'Please confirm',
              'This operation will reset your current selections. Do you want to continue?',
              whenChangeConfirmed,
              whenChangeNotConfirmed);
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
            this.component.YesNoConfirmationDialogComponent.UI.showConfirmationDialog(
              'Please confirm',
              'This operation will reset your current selections. Do you want to continue?',
              whenChangeConfirmed,
              whenChangeNotConfirmed);
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

      UpdateCategoryDescriptions() {
        //Add BannersDivision Descriptions for selected items
        this.model.BannersGroup.CategoryDescriptions = [];
        let categoryData = this.controls.CategoryMultiSelect.dataItems()
        for (var index = 0; index < categoryData.length; index++) {
          this.model.BannersGroup.CategoryDescriptions.push(categoryData[index].Value)
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
        if (item === undefined ||
          item.value == "" ||
          this.component._appContext.userInfo.PlanningEntities[item.value] == null) {
          this.controls.BannerDivisionMultiSelect_setDataSource([]);
          this.model.BannersGroup.BannersDivision = [];
        } else {
          var entityLevelBanners = this.component._appContext.userInfo.PlanningEntities[item.value];
          var finalBannerList = [];
          var selectedBanners = [];
          for (let i = 0; i < entityLevelBanners.length; i++) {
            let banner: any = entityLevelBanners[i];
            if (banner.Year == this.model.PlaningYear) {
              let name = banner.BannerName + " (" + banner.CustomerName + ")";
              finalBannerList.push({ "value": name, "id": banner.BannerID, "customer": banner.CustomerName });
              selectedBanners.push(banner.BannerID)
            }
          }

          this.controls.BannerDivisionMultiSelect_setDataSource(finalBannerList);
          this.model.BannersGroup.BannersDivision = selectedBanners; //set Banners for the planning entity
          this.controls.BannerDivisionMultiSelect.value(this.model.BannersGroup.BannersDivision);
        }
      }

      onCustomerFilterChange(filter: any) {
        this.model.CustomerList = this.datasources.QueryCustomers().filter((s) => s.value.toLowerCase().indexOf(filter.toLowerCase()) !== -1);
      }

      onCategoryMultiSelectOpen() {
        this.isCategoryMultiSelectOpen = true;
      }

      onCategoryMultiSelectClose() {
        this.isCategoryMultiSelectOpen = false;

        let selectedCategories = this.controls.CategoryMultiSelect.value();
        this.model.BannersGroup.Categories = this.controls.CategoryMultiSelect.value();
        this.UpdateCategoryDescriptions();

        this.controls.PPGMultiSelect.value([]);
        this.controls.SAPPPGMultiSelect.value([]);

        if (selectedCategories == undefined || selectedCategories.length == 0) {
          this.controls.PPGMultiSelect_setDataSource(this.controls.datasources.QueryPPGs());
          this.controls.SAPPPGMultiSelect_setDataSource(this.controls.datasources.QuerySAPPPGs());
          this.model.BannersGroup.PPGs = this.controls.PPGMultiSelect.value();
          this.model.BannersGroup.SAPPPGs = this.controls.SAPPPGMultiSelect.value();
        } else {

          let selectedPPGs = this.controls.PPGMultiSelect.dataItems();
          let selectedSAPPPGs = this.controls.SAPPPGMultiSelect.dataItems();

          var ppgs: any[] = [];
          var sapppgs: any[] = [];
          ppgs = this.controls.datasources.QueryPPGs().filter((p) => selectedCategories.indexOf(p.CategoryId) != -1);
          sapppgs = this.controls.datasources.QuerySAPPPGs().filter((s) => selectedCategories.indexOf(s.CategoryId) != -1);
          ppgs = ppgs.concat(selectedPPGs);
          sapppgs = sapppgs.concat(selectedSAPPPGs);

          this.controls.PPGMultiSelect_setDataSource(ppgs.sort((a, b) => a.Value > b.Value ? 1 : -1));
          this.controls.SAPPPGMultiSelect_setDataSource(sapppgs.sort((a, b) => a.Value > b.Value ? 1 : -1));

          this.controls.PPGMultiSelect.value(ppgs);
          this.controls.SAPPPGMultiSelect.value(sapppgs);

          this.model.BannersGroup.PPGs = this.controls.PPGMultiSelect.value();
          this.model.BannersGroup.SAPPPGs = this.controls.SAPPPGMultiSelect.value();
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

      if (!this.component.model.IsDesktop) {
        this.controls.PPGMultiSelect.readonly(true);
        this.controls.SAPPPGMultiSelect.readonly(true);
      }

      // let's wait for the datasoruces to be ready
      this.datasources.initialize().then(() => {
        this.controls.BannerDivisionMultiSelect_setDataSource(this.datasources.QueryBanners());
        this.controls.PPGMultiSelect_setDataSource(this.datasources.QueryPPGs());
        this.controls.SAPPPGMultiSelect_setDataSource(this.datasources.QuerySAPPPGs());
        this.controls.CategoryMultiSelect_setDataSource(this.datasources.QueryCategories());

        this.model.CustomerList = this.datasources.QueryCustomers();

        if (this.component.populateBanners) {
          this.controls.CategoryMultiSelect.value(this.model.BannersGroup.Category);
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
        clearButton: (this.component.model.IsDesktop == false ? false : true),

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
        clearButton: (this.component.model.IsDesktop == false ? false : true),

        open: () => { this.handlers.onSAPPPGMultiSelectOpen() },
        close: () => { this.handlers.onSAPPPGMultiSelectClose(); },
        change: () => { this.handlers.onSAPPPGMultiSelectChange(); },

      }).data("kendoMultiSelect");
    }

  }(this, this.model, this.datasources);
}
