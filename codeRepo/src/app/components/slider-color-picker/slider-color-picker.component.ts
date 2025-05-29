import { Component, OnInit, ElementRef, Input } from '@angular/core';
import { Output } from '@angular/core';

declare var $: any;

@Component({
  selector: 'slider-color-picker',
  templateUrl: './slider-color-picker.component.html',
  styleUrls: ['./slider-color-picker.component.css']
})
export class SliderColorPickerComponent implements OnInit {
  private _value: number;
  public shouldUpdateMinMax = false;
  public isValueChangedFromOutside = false;

  @Input() valueChangeCallback: Function;

  @Input() set value(value: number) {
    this._value = value;
    //if (this.shouldUpdateMinMax) {
    //  this.min = parseFloat((this.value * .2).toPrecision(2).toString());
    //  this.max = parseFloat((this.value).toPrecision(2).toString());
    //}
    
    this.updateSlider();
  }

  get value(): number {
    return this._value;
  }

  public updateValues({ value, min, max }, shouldUpdateMinMax: boolean=true) {
    this._value = value;
    this.shouldUpdateMinMax = shouldUpdateMinMax;
    if (shouldUpdateMinMax) {
      this.min = parseFloat((this.value * .2).toPrecision(2).toString());
      this.max = parseFloat((this.value).toPrecision(2).toString());
      this.shouldUpdateMinMax = false;
    } else {
      this.min = min;
      this.max = max;
    }
    this.updateSlider();
  }

  @Input() min: number = 0;
  @Input() max: number = 0;

  constructor() {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.updateSlider();
  }

  public gradient : any [] = [
  [
    0,
    [255, 0, 0]
  ],
  [
    28,
    [0, 128, 0]
  ],
  [
    72,
    [0, 0, 255]
  ],
  [
    100,
    [255, 255, 0]
  ]
  ];

  public sliderWidth: number = 200;


  pickHex = (color1, color2, weight) => {
    let p = weight;
    let w = p * 2 - 1;
    let w1 = (w / 1 + 1) / 2;
    let w2 = 1 - w1;
    let rgb = [Math.round(color1[0] * w1 + color2[0] * w2),
    Math.round(color1[1] * w1 + color2[1] * w2),
    Math.round(color1[2] * w1 + color2[2] * w2)];
    return rgb;
  }

  updateSlider = () => {
    $('.slider').slider({
      value: this.value,
      min: this.min,
      max: this.max,
      step: 0.01,
      slide: (event, ui) => {
        var colorRange: any[] = [];
        //$.each(this.gradient, function (index: number, value) {
        //  if (ui.value <= value[0]) {
        //    colorRange = [index - 1, index];
        //    return false;
        //  }
        //});

        //Get the two closest colors
        //var firstcolor = this.gradient[colorRange[0]][1];
        //var secondcolor = this.gradient[colorRange[1]][1];
        //Calculate ratio between the two closest colors
        //var firstcolor_x = this.sliderWidth * (this.gradient[colorRange[0]][0] / this.max);
        //var secondcolor_x = this.sliderWidth * (this.gradient[colorRange[1]][0] / this.max) - firstcolor_x;
        //var slider_x = this.sliderWidth * (ui.value / this.max) - firstcolor_x;
        //var ratio = slider_x / secondcolor_x

        //Get the color with pickHex(thx, less.js's mix function!)
        //var result = this.pickHex(secondcolor, firstcolor, ratio);
      },
      change: (event, ui) => {
        if (this.valueChangeCallback) {
          let targetValue = this.isValueChangedFromOutside ? this.value : ui.value;
          ui.value = this.value;
          this.valueChangeCallback(targetValue);
          this.isValueChangedFromOutside = false;
        }
      }
    });
  }
  
}
