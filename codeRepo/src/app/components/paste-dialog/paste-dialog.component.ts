import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy, Input, TemplateRef, Injectable, OnInit } from '@angular/core';
import { Router } from '@angular/router';

declare var $: any;

@Component({
  selector: 'paste-dialog-component',
  templateUrl: './paste-dialog.component.html',
  styleUrls: ['./paste-dialog.component.css']
})

@Injectable()
export class PasteDialogComponent implements AfterViewInit, OnInit {
  constructor(private router: Router){}

  @ViewChild('grid') el: ElementRef;

  ngOnInit() {
  }

  ngAfterViewInit() {
    //$(this.el.nativeElement)
    //  .chosen()
    //  .on('change', (e, args) => {
    //    this.selectedValue = args.selected;
    //  });
    $(this.el.nativeElement).kendoGrid({
      // the column fields should match the excel columns
      columns: [
        { field: "Name" },
        { field: "Age" }
      ],
      dataSource: [
        { Name: "John Doe", Age: 33 }
      ]
    }).on('focusin', function (e) {
      // get the grid position
      var offset = $(this).offset();
      // crete a textarea element which will act as a clipboard
      var textarea = $("<textarea>");
      // position the textarea on top of the grid and make it transparent
      textarea.css({
        position: 'absolute',
        opacity: 0,
        top: offset.top,
        left: offset.left,
        border: 'none',
        width: $(this).width(),
        height: $(this).height()
      })
        .appendTo('body')
        .on('paste', function () {
          // handle the paste event
          setTimeout(function () {
            // the pasted content
            var value = $.trim(textarea.val().toString());
            // get instance to the grid
            var grid = $("#grid").data("kendoGrid");
            // get the pasted rows - split the text by new line
            var rows = value.split('\n');

            var data = [];

            for (var i = 0; i < rows.length; i++) {
              var cells = rows[i].split('\t');
              data.push({
                Name: cells[0],
                Age: cells[1]
              });
            };
            grid.dataSource.data(data);
          });
        }).on('focusout', function () {
          // remove the textarea when it loses focus
          $(this).remove();
        });
      // focus the textarea
      setTimeout(function () {
        textarea.focus();
      });
    });
  }


  // Model
  public model = new class {
    constructor(public component: PasteDialogComponent) { }

  }(this);

  // ---------------------------------------------------
  // ---------------------------------------------------
  // ---------------------------------------------------
  // ---------------------------------------------------
  // Model 
  public datasources = new class {
    constructor(public component: PasteDialogComponent, public model: any) {
    }
  }(this, this.model);
  // ---------------------------------------------------
  // UI
  public UI = new class {

    constructor(public component: PasteDialogComponent, public model: any, public datasources: any) {
    }

    // ---------------------------------------------------
    // UI.controls

    public controls = new class {
      constructor(public component: PasteDialogComponent, public model: any, public datasources: any) {
      }
    }(this.component, this.model, this.datasources)


    public showPasteDialog() {
    }
    // ---------------------------------------------------
    // UI.handlers 

    public handlers = new class {
      constructor(public component: PasteDialogComponent, public model: any, public controls: any, public datasources: any, public UI: any) {
      }


    }(this.component, this.model, this.controls, this.component.datasources, this);


    // ---------------------------------------------------
    // UI.setup() functions
    setup() {

    }
  }(this, this.model, this.datasources);

}
