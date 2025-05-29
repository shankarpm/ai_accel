import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownFilterableComponent } from './dropdown-filterable.component';

describe('DropdownFilterableComponent', () => {
  let component: DropdownFilterableComponent;
  let fixture: ComponentFixture<DropdownFilterableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DropdownFilterableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DropdownFilterableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
