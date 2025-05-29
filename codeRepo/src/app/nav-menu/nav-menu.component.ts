import { Location } from '@angular/common';
import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SESSION_STORAGE, StorageService } from 'ngx-webstorage-service';
import { environment } from '../../environments/environment';
import { GlobalDataService } from '../components/globalDataService/globalDataService.component';
import { CompassPlanSelectionHeaderProvider } from '../services/data/compass-plan-selection-header.service';
import { ShipmentSetting } from '../common/common';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.css'],
  imports: [CommonModule, RouterLink, RouterLinkActive],
  standalone: true
})

export class NavMenuComponent {
  route: string = '';
  public headerCookieExists: boolean = false;
  public headerCookie: any;
  public isSMGCheckbook: boolean = false;
  public isCanadaAllCateg: boolean = false;
  public showCustSettingSD: boolean = false;
  public isCanada: boolean = false;
  public overlay: boolean = false;
  public msgYear = { value: '' };
  public colorName = { value: '' };

  @ViewChild('kendoUIContainer') kendoUIContainer!: ElementRef; // main container for destroy
  ngOnInit() {
    this.setup();
  }

  constructor(private _appContext: GlobalDataService, location: Location, private _router: Router,
    private _compassPlanSelectionHeaderProvider: CompassPlanSelectionHeaderProvider,
    @Inject(SESSION_STORAGE) private webStorageService: StorageService) {

    this.msgYear = { value: this._compassPlanSelectionHeaderProvider.msgNav.value };
    this.colorName = { value: this._compassPlanSelectionHeaderProvider.yearNavColor.value };
    // This can be string, array or object
    this.appContext = _appContext;
    this.router = _router;
    this.compassPlanSelectionHeaderProvider = _compassPlanSelectionHeaderProvider;

    _router.events.subscribe((val) => {
      if (location.path() != '') {
        this.route = location.path();
      } else {
        this.route = 'Home';
      }

      if (this.route != '') {
        this.pageHeader = this.getPageHeader(this.route);
      }
    });
  }

  public appContext: GlobalDataService;
  public router: Router;
  public compassPlanSelectionHeaderProvider: CompassPlanSelectionHeaderProvider;
  public pageHeader: string = '';
  public environment: string = "";
  public isZKFTCCMRole: boolean = false;
  public isAdminUser: boolean = false;
  public isPolarisUser: boolean = false;
  public isCompass: boolean = false;
  public showCompassLogo: boolean = false;
  public isUS01: boolean = false;
  public showMassActivities: boolean = false;
  public compassPowerBIReportLink: string = `https://app.powerbi.com/groups/me/apps/5fd3ddbe-cba9-43ae-8a97-c12ddf1dd769/reports/67a44833-e342-4097-a13b-2971f3fff68a/ReportSectiona77a32cb2d83a6edeb0b?experience=power-bi`;
  isExpanded = false;

  private setup() {
    let env = window.location.host.substr(0, window.location.host.indexOf('.'));
    if (env.startsWith("compass")) {
      env = env.replace("compass", "");
      this.isCompass = true;
    } else {
      env = env.replace("river", "");
    }
    //this.environment = env ? env.toUpperCase() + " Environment" : "";
    if (env) {
      this.environment = env == 'reg' ? "CH7 Environment" : (env == 'sup' ? "CH2 Environment" : env.toUpperCase() + " Environment");
    }
    this.showCompassLogo = false;

    let salesOrgs = this.appContext.userInfo.SalesOrg.filter((s: string) => { return s.startsWith("US"); });
    this.showCompassLogo = salesOrgs.length > 0;
    salesOrgs = this.appContext.userInfo.SalesOrg.filter((s: string) => { return s == "US01"; });
    this.isUS01 = salesOrgs.length > 0;

    //for (var i = 0; i < this.appContext.userInfo.SalesOrg.length; i++) {
    //  if (this.appContext.userInfo.SalesOrg[i].startsWith("US")) { //check only first 2 chars, US01, US12 for mrshal etc
    //    this.showCompassLogo = true; break;
    //  }
    //}


    //Check for Admin control panel user
    if (this.appContext.userInfo.LanID) {
      let userIds: string[] = ['WSO6243', 'GVG3228', 'GTE4430', 'HVS1658', 'LADOUCJ', 'WIWANOW', 'RUG8938', 'HUT0415', 'GLR9353'];
      this.isAdminUser = userIds.includes(this.appContext.userInfo.LanID.toUpperCase());

      //Polaris user
      let polarisIds: string[] = ['LDT4684', 'SWN5646', 'LAR2429', 'DNU5356', 'DJD3303', 'VFARNESE', 'BPE9221', 'TGQ1188', 'FKZ1666',
        'ZEG6818', 'HVS0581', 'PTF1838', 'TUAWTXM', 'MVW6067', 'BREIMANN', 'EHW4582', 'BWU2839', 'VTJ6414', 'PYN0163', 'XYE4484', 'SECREGST040', 'SECREGST045'];
      this.isPolarisUser = polarisIds.includes(this.appContext.userInfo.LanID.toUpperCase());

      const roles: string[] = this.appContext.userInfo.Roles;
      this.isZKFTCCMRole = roles ? roles.includes('ZKFT_CCM') : false;
    }
  }

  public onOBRDashboardClick() {
    let environment: string = "";
    switch (this.appContext.configuration.environment) {
      case 'QualityControl':
        environment = 'qa';
        break;
      case 'Regression':
        environment = 'reg';
        break;
      case 'Support':
        environment = 'sup';
        break;
      case 'Fix':
        environment = 'fix';
        break;
      case 'Production':
        environment = '';
        break;
      case 'Development':
      default:
        environment = "dev";
    }

    let url = `https://compass${environment}.myit.kraftheinz.com/funding/auth/start`;
    window.open(url, "_blank");
    this.collapse();
  }

  collapse() {
    this.isExpanded = false;
  }

  toggle() {
    this.isExpanded = !this.isExpanded;
  }

  mouseenter() {
    this.isExpanded = true;
    let data = this.webStorageService.get('headerselection');
    this.headerCookieExists = data && data.length > 0;
    if (this.headerCookieExists) {
      this.headerCookie = JSON.parse(data);
      this.isSMGCheckbook = this.headerCookie.isSMG;
      this.isCanada = this.headerCookie.isCanadianCustomer;
      this.isCanadaAllCateg = (this.isCanada && this.headerCookie.categoryId === "ALL");
      this.showCustSettingSD = this.isCanadaAllCateg && (this.headerCookie.ShipmentSetting == ShipmentSetting.ShipmentOnly || this.headerCookie.ShipmentSetting == ShipmentSetting.FoodService);
      this.showMassActivities = this.headerCookie.ShipmentSetting != ShipmentSetting.StreamLine;
    }
  }

  mouseleave() {
    this.isExpanded = false;
  }

  getPageHeader(route: any) {
    switch (route) {
      case '/accounts-planner':
        return 'Accounts Planner';
      case '/financials':
        return 'Financials';
      case '/shipper-mod':
        return 'Shipper Mod';
      case '/khbm-bridge':
        return 'KHBM Bridge';
      case '/commodity-ppg':
        return 'Commodity PPG';
      case '/authorization-list':
        return 'Customer Settings';
      case '/customer-authorization-list':
        return 'Customer Authorization';
      case '/polaris':
        return 'Polaris Optimization';
      case 'Home':
        return 'Dashboard';
      case '/merch-calendar':
        return 'Merch Calendar';
      case '/compare-plans':
        return 'Compare Plans';
      case '/publishing':
        return 'Publishing';
      case '/ppg-revenue':
        return 'PPG Revenue';
      case '/polaris-simulation':
        return 'Polaris Simulation';
      case '/polaris-calendar':
        return 'Polaris Calendar';
      case '/tableau-integration':
        return 'Sales Intelligence';
      case '/mass-activities':
        return 'Mass Activities';
      default:
        if (route.includes('/event-management')) {
          return 'Event Management';
        } else {
          return "";
        }
    }
  }

  clearLocalCache(e: Event) {
    if (confirm('Do you want to clear the Plan Selection data cache?')) {
      localStorage.clear();
      console.log("Local cache has cleared successfully");
    }
    e.preventDefault();
  }

  showOverlay() {
    this.overlay = true;
  }

  goToPolaris(dest: string) {
    const hostname = window.location.hostname.split('.')[0];

    if (environment.polarisNavigation[hostname]) {
      let polarisUrl = environment.polarisNavigation[hostname].toUrl;

      if (dest === 'Generate') {
        polarisUrl += 'generate-plans';
      } else if (dest === 'Simulate') {
        polarisUrl += 'simulate';
      } else if (dest === 'Calendar') {
        polarisUrl += 'calendar';
      }

      window.open(polarisUrl, "_blank");
    }
  }

  onFundingClick() {
    let root: string = '';
    switch (this.appContext.configuration.environment) {
      case "Development":
        root = `https://compassdev.myit.kraftheinz.com/funds/auth/fakesso/Dragos/Stoicescu/dragos.stoicescu@kraftheinz.com/45EC6435-C554-4FBE-AE13-56FBD2AB28F5`;
        break;
      case "QualityControl":
        root = 'https://compassqa.myit.kraftheinz.com/funds/auth/fakesso/Dragos/Stoicescu/dragos.stoicescu@kraftheinz.com/45EC6435-C554-4FBE-AE13-56FBD2AB28F5';
        break;
      case "Regression":
        root = `https://compassreg.myit.kraftheinz.com/funds/auth/fakesso/Dragos/Stoicescu/dragos.stoicescu@kraftheinz.com/45EC6435-C554-4FBE-AE13-56FBD2AB28F5`;
        break;
      case "Production":
        root = `https://compass.myit.kraftheinz.com/funds/auth/startsso`;
        break;
      default://PROD
        console.log("Invalid environment");
    }
    window.open(root, "_blank");
    this.collapse();
  }
}