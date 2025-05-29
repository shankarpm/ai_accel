import { Component, OnInit, AfterViewInit, Output, Input } from '@angular/core';
import { EventEmitter } from '@angular/core';

@Component({
  selector: 'dropdown-filterable',
  templateUrl: './dropdown-filterable.component.html',
  styleUrls: ['./dropdown-filterable.component.css']
})
export class DropdownFilterableComponent implements AfterViewInit, OnInit {
  @Input() public dataProvider: any[] = [];
  @Input('placeholder') public placeholder: string = "Select PPGs ...";
  @Input('percentWidth') public percentWidth: string = "100%";
  @Input('valueField') public valueField: string = "text";
  @Input('selectAll') public selectAll: boolean = false;
  @Input('comboBox') public comboBox: boolean = false;
  @Input('disabled') public disabled: boolean = false;
  @Output('onTextChange') public onTextChange: EventEmitter<any> = new EventEmitter<any>();
  @Output('onSelectorChange') public onSelectorChange: EventEmitter<any> = new EventEmitter<any>();
  @Output('onSelectAllChange') public onSelectAllChange: EventEmitter<any> = new EventEmitter<any>();

  public filterKey: any = '';
  public listOpened: boolean = false;
  public selectAllModel: boolean = false;
  public selectedItemsList: any[] = [];

  constructor() { }

  ngOnInit() {
    if (this.selectAll)
    {
      this.selectAllModel = true;
    }
  }

  ngAfterViewInit() {
  }

  public initDataProvider(data: any[]) {
    if (!this.comboBox) {
      this.listOpened = data.length > 0;
    }
    this.dataProvider = data;
    this.selectedItemsList = this.dataProvider.filter(item => {
      return item.selected;
    });
  }

  // AI changed: Added type annotation for 'value' parameter
  public onChange(value: string) {
    this.filterKey = value;
    this.onTextChange.emit(value);
    if (this.dataProvider.length > 0 && !this.listOpened) {
      this.listOpened = true;
    }
  }

  public reset() {
    this.filterKey = '';
    this.dataProvider = [];
    this.listOpened = false;
  }

  public onSwitchSelectAll() {
    this.dataProvider.forEach(item => {
      item['selected'] = this.selectAllModel;
    });
    this.onSelectAllChange.emit(this.selectAllModel);
  }

  public onSwitchProduct(item: any) {
    this.selectedItemsList = this.dataProvider.filter(item => {
      return item && item.selected;
    });
    this.onSelectorChange.emit(item);
    this.selectAllModel = this.dataProvider.every(item => item['selected']);
  }

  public clickOutside() {
    this.listOpened = false;
  }
}