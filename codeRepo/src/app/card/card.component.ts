import {
  Component,
  Input,
  ElementRef,
  Renderer2, // Changed from Renderer to Renderer2
  ViewChild,
  OnInit
} from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit {
  @Input() title: string = ''; // Added initializer
  @Input() value: string = ''; // Added initializer
  @Input() color: string = ''; // Added initializer

  @ViewChild('cardRef', {static: true}) cardEl!: ElementRef; // Added definite assignment assertion and static flag

  constructor(private renderer: Renderer2) {} // Changed to Renderer2

  ngOnInit() {
    const el = this.cardEl.nativeElement;

    this.renderer.setAttribute(el, 'data-card', this.title); // Updated method to Renderer2
    this.renderer.setStyle(el, 'borderColor', this.color); // Updated method to Renderer2
    this.renderer.addClass(el, 'highlight'); // Updated method to Renderer2
  }
}