import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RouterModule, Routes } from '@angular/router';
// AI changed: Removed HomeComponent from declarations since it's standalone
// import { HomeComponent } from './home/home.component';
// import { LegacyComponent } from './legacy/legacy.component';
// import { CardComponent } from './card/card.component';
// import { HomeComponent } from './home/home.component';
// AI changed: Commented out missing module import
// import { ApplicationSecurityRolesComponent } from './components/application-security-roles/application-security-roles.component';
import { BannerMultiselectComponent } from './components/banner-multiselect-component/banner-multiselect-component';
import { CompassPlanSelectionHeader } from './components/compass-plan-selection-header/compass-plan-selection-header.component';
import { DashboardNotification } from './components/dashboard-notification/dashboard-notification.component';
import { DateRangeCommonQuickEditComponent } from './components/date-range-common-quick-edit/date-range-common-quick-edit.component';
import { DateRangeWriteOffQuickEditComponent } from './components/date-range-write-off-quick-edit/date-range-write-off-quick-edit.component';
import { DropdownFilterableComponent } from './components/dropdown-filterable/dropdown-filterable.component';
import { ErrorDialogComponent } from './components/error-dialog/error-dialog.component';
import { GlobalDataService } from './components/globalDataService/globalDataService.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { LoginComponent } from './components/login/login.component';
import { MessageBoxComponent, OkDialogComponent } from './components/ok-dialog/ok-dialog.component';
import { OutputToRevealMultiselectComponent } from './components/output-to-reveal-multiselect-component/output-to-reveal-multiselect-component';
import { PasteDialogComponent } from './components/paste-dialog/paste-dialog.component';
import { PopupMessageComponent } from './components/popup-message/popup-message.component';
import { SaveCancelConfirmationDialogComponent } from './components/save-cancel-confirmation-dialog/save-cancel-confirmation-dialog.component';
import { SessionTimeoutDialogComponent } from './components/session-timeout-dialog/session-timeout-dialog.component';
import { SliderColorPickerComponent } from './components/slider-color-picker/slider-color-picker.component';
import { SnackBar } from './components/snack-bar/snack-bar.component';
import { YesNoCancelConfirmationDialogComponent } from './components/yes-no-cancel-confirmation-dialog/yes-no-cancel-confirmation-dialog.component';
import { YesNoConfirmationDialogComponent } from './components/yes-no-confirmation-dialog/yes-no-confirmation-dialog.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { AuthService } from './services/authentication/auth.service';
import { EnsureAuthenticatedService } from './services/authentication/ensure-authenticated.service';
import { LoginRedirectService } from './services/authentication/login-redirect.service';
import { AdminControlHistoricalRefresh, AdminControlPanelDataProvider, AdminControlPanelDataProviderPublish, AdminControlPanelDataProviderUnPublish, AdminControlPanelPOSForceRecalculation, AdminControlPanelPOSInitialization } from './services/data/admin-control-panel-data-provider.service';
import { AuthorizationListDataProvider, AuthorizationPPGListDataProvider, CCRDataProvider, CustomGroupListProvider, SpendMethodsListDataProvider, SPNDataProvider } from './services/data/authorization-list.service';
import { CustomClientGroupBindingDirective } from './services/data/bindings/custom-client-group-binding.directive';
import { CustomClientGroup2BindingDirective } from './services/data/bindings/custom-client-group2-binding.directive';
import { PlanEventsBindingDirective } from './services/data/bindings/plans-data-binding.directive';
import { CacheInterceptor } from './services/data/cache-interceptor';
import { ComparePlansDataProvider } from './services/data/compare-plans.service';
import { CompassPlanSelectionHeaderProvider, CompassTilesDataProvider } from './services/data/compass-plan-selection-header.service';
import { CPFExportDataProvider, CPFRowCountProvider, CPFRunningDataProvider } from './services/data/cpf-export-data-provider.service';
import { CSPBBsDataProvider } from './services/data/csp-bbs-data-provider.service';
import { CSPCSPDataProvider } from './services/data/csp-csp-data-provider.service';
import { CSPCustomersDataProvider } from './services/data/csp-customers-data-provider.service';
import { CSPFYsDataProvider } from './services/data/csp-fys-data-provider.service';
import { CSPPPGsDataProvider } from './services/data/csp-ppgs-data-provider.service';
import { CSPProductFamilyDataProvider } from './services/data/csp-product-family-data-provider.service';
import { CSPSectorDataProvider } from './services/data/csp-sector-data-provider.service';
import { CspSnapshotAdminDataProvider } from './services/data/csp-snapshot-data-provider.service';
import { CSPSparkShipmentDataProvider, CSP_UI_Grid_Data_Provider } from './services/data/csp-ui-grid-data-provider.service';
import { CSP_UI_Grid_allocation_Data_Provider, CSP_UI_Grid_rows_Data_Provider } from './services/data/csp-ui-grid-rows-data-provider.service';
import { CSP_UI_Grid_Search_Data_Provider } from './services/data/csp-ui-grid-search-data-provider.service';
import { CSP_UI_Grid2_Data_Provider } from './services/data/csp-ui-grid2-data-provider.service';
import { CustomClientGroupDataProvider, HideClientGroupDataProvider, ShareClientGroupDataProvider, UnhideClientGroupDataProvider } from './services/data/custom-client-group-data-provider.service';
import { CustomClientGroup2DataProvider } from './services/data/custom-client-group2-data-provider.service';
import { CustomExcelUploadProvider } from './services/data/custom-excel-upload-provider.service';
import { DashboardObjectDataProvider } from './services/data/dashboard-objects-provider.service';
import { EventsManagementDataProvider, Routine57EventsDataProvider } from './services/data/event-management.service';
import { EventScreenDataProvider, EventScreenHeaderDataProvider } from './services/data/event-screen-header.service';
import { FinancialsScreenDataProvider } from './services/data/financials.service';
import { GlobalDataProvider } from './services/data/global-data-provider.service';
import { KHBMBridgeScreenDataProvider } from './services/data/khbm.service';
import { LSVDriversDataProvider } from './services/data/lsv-drivers-data-provider.service';
import { MerchCalendarDataProvider } from './services/data/merch-calendar-data-provider';
import { MergeClientGroupDataProvider } from './services/data/merge-client-group-data-provider.service';
import { MinusSignToParens } from './services/data/minus-sign-to-parens-pipe';
import { MonitoringDataProvider } from './services/data/monitoring.service';
import { MopDataProvider } from './services/data/mop.service';
import { PlanningDataProvider, POSLSVPlanningDataProvider } from './services/data/planning-data-provider.service';
import { PlanningGridDataProvider } from './services/data/planning-grid-data-provider.service';
import { PolarisCalendarDataProvider } from './services/data/polaris-calendar.service';
import { PolarisDataProvider } from './services/data/polaris-data.service';
import { PolarisSimulationDataProvider, PolarisSimulationProvider, PolarisSimulationVersionProvider } from './services/data/polaris-simulation.service';
import { POSDriversDataProvider } from './services/data/pos-drivers-data-provider.service';
import { PpgRevenueDataProvider } from './services/data/ppg-revenue.service';
import { PPGSBAnnerDivisionDataProvider } from './services/data/ppgs-bannerdivision-data-provider.service';
import { ProductDetailsDataProvider } from './services/data/product-details-screen.service';
import { PublishingDataProvider } from './services/data/publishing.service';
import { SAPPPGsDataProvider } from './services/data/sap-ppgs-data-provider.service';
import { DashBoardBumpChartDataProvider, DashBoardGridDataProvider, DashBoardLSVAOPBumpChartDataProvider, DashBoardYTDSectorDataProvider, MergeScenarioModelingDataProvider, ScenarioModelingDataProvider } from './services/data/scenario-modeling-data-provider.service';
import { ShipperModDataProvider } from './services/data/shipper-mod.service';
import { UserListDataProvider, UserSecurityDataProvider } from './services/data/user-security-data-provider.service';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
];

@NgModule({
  declarations: [
    AppComponent
    // AI changed: Removed HomeComponent from declarations since it's standalone
  ],
  imports: [
    BrowserModule,
    RouterModule,
    AppRoutingModule,
    // LegacyComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }