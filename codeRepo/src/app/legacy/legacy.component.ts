import { Component, Renderer2, ViewChild, ElementRef, OnInit } from '@angular/core';

@Component({
  selector: 'app-legacy',
  templateUrl: './legacy.component.html',
  styleUrls: ['./legacy.component.css']
})
export class LegacyComponent implements OnInit {
  @ViewChild('legacyInput') inputElement!: ElementRef; // Added definite assignment assertion

  message: string = 'Angular 5 Legacy Example';
  isHidden: boolean = false;

  constructor(private renderer: Renderer2) {} // Changed Renderer to Renderer2

  ngOnInit() {
    const el = this.inputElement.nativeElement;
    this.renderer.setAttribute(el, 'placeholder', 'Enter some text'); // Changed setElementAttribute to setAttribute
  }

  toggleVisibility() {
    const el = this.inputElement.nativeElement;
    this.isHidden = !this.isHidden;
    this.renderer.setStyle(el, 'display', this.isHidden ? 'none' : 'block'); // Changed setElementStyle to setStyle
  }

  updateMessage(newMessage: string) {
    this.message = newMessage;
  }
}

