import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common'; // AI changed: Added CommonModule import for *ngIf support
import { DecimalPipe } from '@angular/common'; // AI changed: Added DecimalPipe for number pipe support

@Component({
  selector: 'popup-message',
  templateUrl: './popup-message.component.html',
  styleUrls: ['./popup-message.component.css'],
  imports: [CommonModule, DecimalPipe], // AI changed: Added imports array with required modules
  standalone: true // AI changed: Added standalone flag as per Angular 19 standards
})
export class PopupMessageComponent implements OnInit {
  @Input('dataProvider') dataProvider: any[] = [];
  @Output('onDeleteHighlightedItems') onDeleteHighlightedItems: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
  }

  public onClosePopup() {
    this.onDeleteHighlightedItems.emit();
  }

  public onCopyToClipboard(item: any) {
    // We need to create a dummy textarea with the text to be copied in the DOM
    let textArea: any = document.createElement("textarea");
    let clipboardList: any[] = [item.name];

    // Hide the textarea from actually showing
    textArea.style.position = 'fixed';
    textArea.style.top = '-999px';
    textArea.style.left = '-999px';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';

    // Set the texarea's content to our value defined in our [text-copy] attribute
    item.selectedItems.map((selectedItem: any) => {
      if (selectedItem !== undefined) {
        clipboardList.push(selectedItem[item.cellName]);
      }
    });
    textArea.value = clipboardList.join('\n');
    document.body.appendChild(textArea);

    // This will select the textarea
    textArea.select();

    try {
      // Most modern browsers support execCommand('copy'|'cut'|'paste'), if it doesn't it should throw an error
      document.execCommand('copy');
    } catch (err) {
      // Tell the user copying is not supported and give alternative, e.g alert window with the text to copy
      console.log('unable to copy');
    }

    // Finally we remove the textarea from the DOM
    document.body.removeChild(textArea);
  }
}

// AI changed: Note that the 'minusSignToParens' pipe is not available in Angular's standard library.
// You'll need to either:
// 1. Create this custom pipe and import it
// 2. Replace its usage in the template with alternative formatting
// 3. Remove its usage if not needed

// AI changed: The TS2729 error about 'component' property was not found in the provided code.
// If this property exists in the template, it should be properly initialized in the component class.