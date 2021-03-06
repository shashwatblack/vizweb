import { AfterViewInit, Component, ElementRef, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { Options } from 'ng5-slider';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { UtilsService } from '@app/core';

declare var Snap: any;
declare var mina: any;

@Component({
  selector: 'app-module-image',
  templateUrl: './module-image.component.html',
  styleUrls: ['./module-image.component.scss']
})
export class ModuleImageComponent implements OnInit, AfterViewInit {
  @ViewChild('colorPickerPopup') colorPickerPopup: ElementRef;
  private svg: any;
  private g: any;
  public form = {
    numCols: 0,
    numRows: 0
  };
  public figure = {
    numCols: 0,
    numRows: 0,
    nodes: {}
  };
  public manualRefresh: EventEmitter<void> = new EventEmitter<void>();
  public slider_value: number = 100;
  public slider_options: Options = {
    floor: 0,
    ceil: 255,
    vertical: true
  };
  public selectedNode = null;

  constructor(public ngxSmartModalService: NgxSmartModalService, private readonly utils: UtilsService) {}

  ngOnInit() {
    this.svg = Snap('#module-image-svg');

    this.svg.attr({
      viewBox: `0 0 900 900`
    });

    this.g = this.svg.g();

    this.initializeFigure();
  }

  ngAfterViewInit() {
    // push task at the end of queue using timeout
    setTimeout(() => {
      this.showIntro();
    }, 0);
  }

  wrapperClicked() {
    // remove selected node
    if (this.selectedNode) {
      this.selectedNode.circle.removeClass('selected');
    }
    this.selectedNode = null;
    this.hidePopup();
  }

  initializeFigure() {
    this.form.numCols = 14;
    this.form.numRows = 14;

    this.updateFigure();
  }

  nodeClicked(node) {
    if (this.selectedNode) {
      this.selectedNode.circle.removeClass('selected');
    }
    node.circle.addClass('selected');
    node.circle.attr({
      stroke: '#0db9f0'
    });
    this.manualRefresh.emit();
    this.slider_value = node.value;
    this.selectedNode = node;

    this.showPopup(node);
  }

  updateNodeValue(node, value) {
    node.value = value;
    node.circle.attr({
      fill: `rgb(${value}, ${value}, ${value})`
    });
    node.text.attr({
      text: value
    });
  }

  sliderUpdated() {
    this.updateNodeValue(this.selectedNode, this.slider_value);
  }

  addNewNode(r, c) {
    let x = 50 + c * 50;
    let y = 50 + r * 50;
    let radius = 20;
    let value = 255;
    let circle = this.g.circle(x, y, radius).attr({
      fill: `rgb(${value}, ${value}, ${value})`
    });
    let text = this.g.text(x, y, value).attr({
      'text-anchor': 'middle',
      'alignment-baseline': 'middle',
      transform: 'translate(0, 2)'
    });
    circle.addClass('cursor-pointer');
    circle.addClass('svg-node');
    text.addClass('svg-node-text');
    text.addClass('no-pointer');
    text.addClass('no-user-select');

    let node = { r, c, x, y, radius, value, circle, text };
    circle.click(this.utils.delay(() => this.nodeClicked(node)));
    text.click(this.utils.delay(() => this.nodeClicked(node)));
    return node;
  }

  dimensionsChanged() {
    this.utils.debounce(() => this.updateFigure(), 1000)();
  }

  updateFigure() {
    // if new is wider - add columns
    if (this.form.numCols > this.figure.numCols) {
      for (let r = 0; r < this.figure.numRows; r++) {
        for (let c = this.figure.numCols; c < this.form.numCols; c++) {
          this.figure.nodes[`${r},${c}`] = this.addNewNode(r, c);
        }
      }
    }
    // if new is taller - add rows
    if (this.form.numRows > this.figure.numRows) {
      for (let r = this.figure.numRows; r < this.form.numRows; r++) {
        for (let c = 0; c < this.form.numCols; c++) {
          this.figure.nodes[`${r},${c}`] = this.addNewNode(r, c);
        }
      }
    }

    // remove all outside
    for (let key in this.figure.nodes) {
      let node = this.figure.nodes[key];
      if (node.r >= this.form.numRows || node.c >= this.form.numCols) {
        node.circle.remove();
        node.text.remove();
        delete this.figure.nodes[key];
      }
    }

    this.figure.numRows = this.form.numRows;
    this.figure.numCols = this.form.numCols;
  }

  public intro = {
    current_index: 0,
    current_state: {
      title: null,
      message: null,
      btnText: null
    },
    allowClose: false,
    states: [
      {
        title: 'Hello there!',
        message: `We're going to learn about what an image means to a computer.`,
        btnText: 'Okay'
      },
      {
        title: 'An image',
        message: `An image is nothing but a bunch of pixels. Laid out in a grid.<br>
        <div class="text-center"><img src="assets/mario.png" height="400"></div>
        `,
        btnText: 'Next'
      },
      {
        title: 'An image',
        message: `When you sufficiently zoom in, you can see the pixels. This is also true in low-resolution pictures.<br>
        <div class="text-center"><img src="assets/deer.jpg" width="550"></div>
        `,
        btnText: 'Next'
      },
      {
        title: 'An image',
        message: `Here we have a small, low-resolution image of Lincoln.<br>
        <div class="text-center"><img src="assets/lincoln.png" width="550"></div><br>
        Each pixel in this image is some shade of gray between pure white and pure black. These shades can be represented by numbers between 0 to 255.
        `,
        btnText: 'Next'
      },
      {
        title: "That's it!",
        message: `That's how computers view images. In the next screen, you will be able to play with a grid of pixels. <br>
        Click on the pixels to change the shade value. <br>
        You will also be able to change the width and height of the image. 
        `,
        btnText: `Let's go!`
      }
    ]
  };

  showIntro(index = 0, allowClose = false) {
    this.intro.allowClose = allowClose;
    this.intro.current_index = index;
    this.intro.current_state = this.intro.states[index];
    this.ngxSmartModalService.getModal('introModal').open();
  }

  introNext() {
    this.intro.current_index += 1;
    if (this.intro.current_index < this.intro.states.length) {
      this.intro.current_state = this.intro.states[this.intro.current_index];
    } else {
      this.closeIntro();
    }
  }

  closeIntro() {
    this.ngxSmartModalService.getModal('introModal').close();
  }

  showPopup(node) {
    let myicon = node.circle.node;
    let colorPickerPopup = this.colorPickerPopup.nativeElement;
    let iconPos = myicon.getBoundingClientRect();
    colorPickerPopup.style.left = iconPos.right + 20 + 'px';
    colorPickerPopup.style.top = window.scrollY + iconPos.top - 60 + 'px';
    colorPickerPopup.style.display = 'block';
  }

  hidePopup() {
    let colorPickerPopup = this.colorPickerPopup.nativeElement;
    colorPickerPopup.style.display = 'none';
  }

  public presets = [
    {
      id: '0',
      name: '0',
      width: 14,
      height: 14,
      pixels: [
        [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
        [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
        [255, 255, 255, 255, 255, 255, 255, 255, 96, 96, 255, 255, 255, 255],
        [255, 255, 255, 255, 255, 255, 255, 28, 3, 22, 198, 255, 255, 255],
        [255, 255, 255, 255, 255, 255, 3, 3, 3, 159, 2, 255, 255, 255],
        [255, 255, 255, 255, 255, 17, 3, 243, 134, 255, 2, 205, 255, 255],
        [255, 255, 255, 255, 77, 15, 236, 255, 255, 255, 2, 60, 255, 255],
        [255, 255, 255, 255, 2, 255, 255, 255, 255, 255, 0, 59, 255, 255],
        [255, 255, 255, 170, 25, 255, 255, 255, 255, 248, 2, 243, 255, 255],
        [255, 255, 255, 170, 110, 255, 255, 255, 207, 3, 255, 255, 255, 255],
        [255, 255, 255, 170, 6, 207, 170, 30, 32, 199, 255, 255, 255, 255],
        [255, 255, 255, 227, 3, 2, 3, 110, 255, 255, 255, 255, 255, 255],
        [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
        [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255]
      ]
    },
    {
      id: '1',
      name: '1',
      width: 14,
      height: 14,
      pixels: [
        [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
        [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
        [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
        [255, 255, 255, 255, 255, 255, 255, 67, 39, 255, 255, 255, 255, 255],
        [255, 255, 255, 255, 255, 255, 255, 56, 127, 255, 255, 255, 255, 255],
        [255, 255, 255, 255, 255, 255, 255, 2, 97, 255, 255, 255, 255, 255],
        [255, 255, 255, 255, 255, 255, 255, 2, 108, 255, 255, 255, 255, 255],
        [255, 255, 255, 255, 255, 255, 238, 2, 224, 255, 255, 255, 255, 255],
        [255, 255, 255, 255, 255, 255, 231, 2, 255, 255, 255, 255, 255, 255],
        [255, 255, 255, 255, 255, 255, 231, 2, 255, 255, 255, 255, 255, 255],
        [255, 255, 255, 255, 255, 255, 209, 2, 255, 255, 255, 255, 255, 255],
        [255, 255, 255, 255, 255, 255, 113, 2, 255, 255, 255, 255, 255, 255],
        [255, 255, 255, 255, 255, 255, 168, 116, 255, 255, 255, 255, 255, 255],
        [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255]
      ]
    },
    {
      id: '9',
      name: '9',
      width: 14,
      height: 14,
      pixels: [
        [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
        [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
        [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
        [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
        [255, 255, 255, 255, 255, 255, 23, 2, 45, 3, 87, 255, 255, 255],
        [255, 255, 255, 255, 255, 3, 72, 255, 163, 3, 234, 255, 255, 255],
        [255, 255, 255, 255, 2, 79, 255, 247, 10, 126, 255, 255, 255, 255],
        [255, 255, 255, 233, 3, 233, 58, 2, 4, 255, 255, 255, 255, 255],
        [255, 255, 255, 255, 20, 38, 213, 63, 112, 255, 255, 255, 255, 255],
        [255, 255, 255, 255, 255, 255, 255, 2, 234, 255, 255, 255, 255, 255],
        [255, 255, 255, 255, 255, 255, 255, 2, 234, 255, 255, 255, 255, 255],
        [255, 255, 255, 255, 255, 255, 255, 0, 234, 255, 255, 255, 255, 255],
        [255, 255, 255, 255, 255, 255, 255, 159, 66, 255, 255, 255, 255, 255],
        [255, 255, 255, 255, 255, 255, 255, 255, 108, 213, 255, 255, 255, 255]
      ]
    }
  ];

  loadPreset(preset) {
    this.form.numRows = preset.height;
    this.form.numCols = preset.width;
    this.updateFigure();

    for (let r = 0; r < preset.height; r++) {
      for (let c = 0; c < preset.width; c++) {
        let node = this.figure.nodes[`${r},${c}`];
        this.updateNodeValue(node, preset.pixels[r][c]);
      }
    }
  }
}
