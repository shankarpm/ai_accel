import { Component, AfterViewInit, OnInit, ViewChild, ElementRef } from "@angular/core";

declare var kendo: any;

@Component({
  selector: 'date-range-common-quick-edit.component',
  templateUrl: './date-range-common-quick-edit.component.html',
  styleUrls: ['./date-range-common-quick-edit.component.css']
})

export class DateRangeCommonQuickEditComponent implements AfterViewInit, OnInit {
  constructor() {
  }
  // DOM Components initialization for Kendo UI Widgets
  @ViewChild('kendoUIContainer') kendoUIContainer: ElementRef; // main container for destroy  
  @ViewChild('dateMultiselect') dateMultiselect: ElementRef;

  ngOnInit() {
    this.UI.setup();
  }

  ngAfterViewInit() {
  }

  ngOnDestroy(): void {
    kendo.destroy(this.kendoUIContainer.nativeElement);
  }

  public setupData(UnitPriceTitle, weeksInYear) {
    this.UI.UnitPriceTitle = UnitPriceTitle;
    this.UI.weeksInYear = weeksInYear;
    this.UI.WeeksDateRange = [];
    for (let i = 0; i < this.UI.weeksInYear; i++) {
      this.UI.WeeksDateRange.push({ text: 'Week ' + (i + 1), value: i });
    }

    this.UI.MonthsDateRange = [
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
      { text: "December", value: { start: 48, end: this.UI.weeksInYear - 1 } },
    ];

    this.UI.QuartersDateRange = [
      { text: "Quarter1", value: { start: 0, end: 12 } },
      { text: "Quarter2", value: { start: 13, end: 25 } },
      { text: "Quarter3", value: { start: 26, end: 38 } },
      { text: "Quarter4", value: { start: 39, end: this.UI.weeksInYear - 1 } },
    ];
  }

  // Model
  public model = new class {
    constructor(public component: DateRangeCommonQuickEditComponent) { }

  }(this);

  // ---------------------------------------------------
  // ---------------------------------------------------
  // ---------------------------------------------------
  // ---------------------------------------------------
  // Model 
  public datasources = new class {
    constructor(public component: DateRangeCommonQuickEditComponent, public model: any) {
    }
  }(this, this.model);
  // ---------------------------------------------------
  // UI
  public UI = new class {
    public DateRangeData: any[] = [];
    public SelectedDateRange: string;
    public CustomUnitPrice: number = 0;
    public SelectedWeeks: string[] = [];
    public UnitPriceTitle: string = "";
    public weeksInYear = 52;
    public EnableUnitPrice: boolean = false;
    public WeeksDateRange: any[] = [];
    public MonthsDateRange: any[] = [];
    public QuartersDateRange: any[] = [];

    constructor(public component: DateRangeCommonQuickEditComponent, public model: any, public datasources: any) {
    }

    // ---------------------------------------------------
    // UI.controls

    public controls = new class {
      constructor(public component: DateRangeCommonQuickEditComponent, public model: any, public datasources: any) {
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
      constructor(public component: DateRangeCommonQuickEditComponent, public model: any, public controls: any, public datasources: any, public UI: any) {
      }
      isDateMultiSelectOpen: boolean = false;

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
        for (let i = 0; i < this.UI.weeksInYear; i++) {
          this.UI.SelectedWeeks.push(i);
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
              this.UI.SelectedWeeks.push(i);
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
      this.initializeDateMultiSelect();
      this.controls.DateMultiselect.enable(false);
    }
  }(this, this.model, this.datasources);
}
