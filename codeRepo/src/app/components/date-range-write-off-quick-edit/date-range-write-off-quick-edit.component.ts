import { Component, ViewChild, ElementRef, AfterViewInit, OnInit, OnDestroy, Input, TemplateRef, Injectable } from '@angular/core';
import { Observable } from 'rxjs'; // AI changed: Updated rxjs import path
import { State } from '@progress/kendo-data-query';
import { Router } from '@angular/router';
import { NumericTextBoxComponent } from '@progress/kendo-angular-inputs';
import { FormsModule } from '@angular/forms'; // AI changed: Added FormsModule for ngModel support
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'; // AI changed: Added CUSTOM_ELEMENTS_SCHEMA for Kendo components

declare var kendo: any;

@Component({
  selector: 'date-range-write-off-quick-edit.component',
  templateUrl: './date-range-write-off-quick-edit.component.html',
  styleUrls: ['./date-range-write-off-quick-edit.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // AI changed: Added schema to support Kendo components
})
export class DateRangeWriteOffQuickEditComponent implements AfterViewInit, OnInit {
  constructor(private router: Router) {
  }
  // DOM Components initialization for Kendo UI Widgets
  @ViewChild('kendoUIContainer') kendoUIContainer!: ElementRef; // AI changed: Added definite assignment assertion
  @ViewChild('dateMultiselect') dateMultiselect!: ElementRef; // AI changed: Added definite assignment assertion

  ngOnInit() {
    this.UI.setup();
  }

  ngAfterViewInit() {
  }

  ngOnDestroy(): void {
    kendo.destroy(this.kendoUIContainer.nativeElement);
  }

  public state: State = {
    skip: 0,
    take: 5
  };

  @Input() public currentWeek: any;

  // Model
  public model = new class {
    constructor(public component: DateRangeWriteOffQuickEditComponent) { }
  }(this);

  // ---------------------------------------------------
  // ---------------------------------------------------
  // ---------------------------------------------------
  // ---------------------------------------------------
  // Model 
  public datasources = new class {
    constructor(public component: DateRangeWriteOffQuickEditComponent, public model: any) {
    }
  }(this, this.model);
  // ---------------------------------------------------
  // UI
  public UI = new class {
    public DateRangeData: any[] = [];
    public SelectedDateRange: string = ''; // AI changed: Initialized property
    public CustomUnitPrice: number = 0;
    public SelectedWeeks: string[] = [];
    public UnitPriceTitle: string = "";
    public EnableUnitPrice: boolean = false;
    public WeeksDateRange: any[] = [];
    public MonthsDateRange: any[] = [
      { text: "January", value: { start: 0, end: 4 } },
      { text: "February", value: { start: 5, end: 8 } },
      { text: "March", value: { start: 9, end: 12 } },
      { text: "April", value: { start: 13, end: 17 } },
      { text: "May", value: { start: 18, end: 21 } },
      { text: "June", value: { start: 22, end: 25 } },
      { text: "July", value: { start: 26, end: 30 } },
      { text: "August", value: { start: 31, end: 34 } },
      { text: "September", value: { start: 35, end: 38 } },
      { text: "October", value: { start: 39, end: 43 } },
      { text: "November", value: { start: 44, end: 47 } },
      { text: "December", value: { start: 48, end: 51 } },
    ];
    public QuartersDateRange: any[] = [
      { text: "Quarter1", value: { start: 0, end: 12 } },
      { text: "Quarter2", value: { start: 13, end: 25 } },
      { text: "Quarter3", value: { start: 26, end: 38 } },
      { text: "Quarter4", value: { start: 39, end: 51 } },
    ];

    public quickEditWriteOffManualContent: number = NaN;
    public quickEditWriteOffAutoContent: number = NaN;
    public quickEditWriteOffToleranceContent: number = NaN;
    public quickEditWriteOffTotal: number = 0; // AI changed: Added type and initialization

    constructor(public component: DateRangeWriteOffQuickEditComponent, public model: any, public datasources: any) {
    }

    // ---------------------------------------------------
    // UI.controls

    public controls = new class {
      constructor(public component: DateRangeWriteOffQuickEditComponent, public model: any, public datasources: any) {
      }

      DateMultiselect: any = null;
      DateMultiselect_setDataSource(newElements: any) {
        this.DateMultiselect.setDataSource(new kendo.data.DataSource({ data: newElements }));
        // lets for a value read
        let workaround = this.DateMultiselect.value();
      }
    }(this.component, this.model, this.datasources)

    // ---------------------------------------------------
    // UI.handlers 

    public handlers = new class {
      constructor(public component: DateRangeWriteOffQuickEditComponent, public model: any, public controls: any, public datasources: any, public UI: any) {
      }
      isDateMultiSelectOpen: boolean = false;

      public onModelChange(targetTextBox: any) { // AI changed: Added type for parameter
        this.UI.quickEditWriteOffTotal = 0;

        if (this.UI.quickEditWriteOffManualContent || this.UI.quickEditWriteOffManualContent === 0) {
          this.UI.quickEditWriteOffTotal += parseInt(this.UI.quickEditWriteOffManualContent.toString(), 10);
        }

        if (this.UI.quickEditWriteOffAutoContent || this.UI.quickEditWriteOffAutoContent === 0) {
          this.UI.quickEditWriteOffTotal += parseInt(this.UI.quickEditWriteOffAutoContent.toString(), 10);
        }

        if (this.UI.quickEditWriteOffToleranceContent || this.UI.quickEditWriteOffToleranceContent === 0) {
          this.UI.quickEditWriteOffTotal += parseInt(this.UI.quickEditWriteOffToleranceContent.toString(), 10);
        }
      }

      DateRange_SelectionChange(value: any) {
        this.controls.DateMultiselect.enable(false);
        this.UI.EnableUnitPrice = true;
        this.UI.SelectedWeeks = [];

        switch (value) {
          case "Quarterly":
            this.controls.DateMultiselect_setDataSource(this.UI.QuartersDateRange);
            this.controls.DateMultiselect.enable();
            break;
          case "Monthly":
            this.controls.DateMultiselect_setDataSource(this.UI.MonthsDateRange);
            this.controls.DateMultiselect.enable();
            break;
          case "Weekly":
            this.controls.DateMultiselect_setDataSource(this.UI.WeeksDateRange);
            this.controls.DateMultiselect.enable();
            break;
          case "Annual":
            this.controls.DateMultiselect_setDataSource([]);
            this.FillFullYeardata();
            break;
          default:
            this.UI.EnableUnitPrice = false;
            this.controls.DateMultiselect_setDataSource([]);
            break;
        }
      }

      FillFullYeardata() {
        //fill all 53 week data
        this.UI.SelectedWeeks = [];
        for (let i = 0; i < 52; i++) {
          this.UI.SelectedWeeks.push(i.toString());
        }
      }

      onDateMultiSelectOpen() {
        this.isDateMultiSelectOpen = true;
      }

      onDateMultiSelectClose() {
        console.log("[onPPGMultiSelectClose:Close");
        this.isDateMultiSelectOpen = false;
        this.UI.SelectedWeeks = [];//clear 

        let items = this.controls.DateMultiselect.value();

        if ((this.UI.SelectedDateRange == "Quarterly" && items.length == 4) ||
          (this.UI.SelectedDateRange == "Monthly" && items.length == 12)) {
          this.FillFullYeardata();
        }
        if (this.UI.SelectedDateRange == "Weekly") {
          for (let item of items) {
            this.UI.SelectedWeeks.push(item);
          }
        } else {//Quarterly and Monthly weeks
          for (let item of items) {
            for (var i = item.start; i <= item.end; i++) {
              this.UI.SelectedWeeks.push(i.toString());
            }
          }
        }
      }

      onDateMultiSelectChange() {
        if (this.isDateMultiSelectOpen == false) {
          this.onDateMultiSelectClose();
        }
        else {
          console.log("[onPPGMultiSelectChange]:Change -> Ignoring Change due isPPGMultiSelectOpen = True.");
        }
      }

    }(this.component, this.model, this.controls, this.component.datasources, this);

    initializeDateMultiSelect() {
      this.controls.DateMultiselect = kendo.jQuery(this.component.dateMultiselect.nativeElement).kendoMultiSelect({
        dataTextField: "text",
        dataValueField: "value",

        dataSource: [],
        autoClose: false,
        open: () => { this.handlers.onDateMultiSelectOpen() },
        close: () => { this.handlers.onDateMultiSelectClose(); },
        change: () => { this.handlers.onDateMultiSelectChange(); }
      }).data("kendoMultiSelect");
    }

    // ---------------------------------------------------
    // UI.setup() functions
    setup() {
      for (let i = 0; i < 53; i++) {
        this.WeeksDateRange.push({ text: 'Week ' + (i + 1), value: i });
      }
      this.initializeDateMultiSelect();
      this.controls.DateMultiselect.enable(false);
    }
  }(this, this.model, this.datasources);
}