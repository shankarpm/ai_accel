import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SliderColorPickerComponent } from './slider-color-picker.component';

describe('SliderColorPickerComponent', () => {
  let component: SliderColorPickerComponent;
  let fixture: ComponentFixture<SliderColorPickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SliderColorPickerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SliderColorPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
