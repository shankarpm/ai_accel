import { Component, OnInit, AfterViewInit, Input } from '@angular/core';

@Component({
  selector: 'snack-bar-component',
  templateUrl: './snack-bar.component.html',
  styleUrls: ['./snack-bar.component.css']
})

export class SnackBar implements OnInit, AfterViewInit {
  @Input() public text1: string;
 public text2: string;
 public custommessage: string;

  ngAfterViewInit(): void {
    //throw new Error("Method not implemented.");
  }
  constructor() {
  }
  ngOnInit(): void {
  }

  public setMessage(message: string, duration: number = 3000, leftAligned: boolean = false) {
    if (message) {
      this.custommessage = message;
      var x = document.getElementById('snackbar');
      x.innerHTML = "";
      x.innerHTML += message;
      x.className = "show" + (leftAligned ? " left-aligned" : "");
      setTimeout(function () { x.className = x.className.replace("show", ""); }, duration);
    }
  }
}
