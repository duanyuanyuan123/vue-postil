/*****批注：包括画线、画圆、画长方形、画笔、选择颜色、填充颜色、选择线宽、清屏等功能****/
/**
 * ****
 * 方法：drawline、drawRound、drawRect、draw、changeColor、changelinewidth、clearCanvas
 * 调用方式：let postil = new postil('id') 注：id为canvas元素的id值
 *          postil.drawline();
 * *****
 * ****/
// import { localStorages } from '../storage/localStorage'
import { annoationBuffer } from './annoationBuffer';
export class postil {
  constructor(id, tempId, showId, ws, participantId) {
    this.ws = ws;
    this.participantId = participantId;
    this.annoationBuffer = new annoationBuffer();
    this.canvas = document.getElementById(id);
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.miterLimit = 1
    this.ctx.lineCap = "round"
    this.ctx.lineJoin = "round";

    this.tempCanvas = document.getElementById(tempId);
    this.tempCtx = this.tempCanvas.getContext('2d');
    this.tempCtx.imageSmoothingEnabled = true;
    this.tempCtx.miterLimit = 1
    this.tempCtx.lineCap = "round"
    this.tempCtx.lineJoin = "round";
    this.showId = showId;
    // this.showCanvas = document.getElementById(showId);
    // this.showCtx = this.showCanvas.getContext('2d');
    this.stage_info = document.getElementById(showId).getBoundingClientRect();
    this.ratio = this.getPixelRatio(this.ctx);
    this.drag_info = {
      dragIndex: null,
      isDrag: false,
      isDragUp: false,
      startPoint: 0,
      offsetX: 0,
      offsetY: 0,
      packetPonit: 0,
    };
    // this.setScale();
    this.path = {
      beginX: 0,
      beginY: 0,
      endX: 0,
      endY: 0,
    };
    this.isDraw = false;
    this.msg = '';
    this.startSingle = [];
    this.canvasData = [];
    this.currentHandler = {
      line: false,
      pencil: false,
      round: false,
      react: false,
      text: false,
      arrow: false,
      eraser: false,
      drag: false,
    };
    this.color = {
      colorR: 248,
      colorG: 31,
      colorB: 31,
    };
    this.drawData = [];
    this.ispencilDraw = 1;
    this.rectCoordinate = {
      beginX: 0,
      beginY: 0,
    };
    this.roundCoordinate = {
      beginX: 0,
      beginY: 0,
    };
    this.arrowCoordinate = {
      beginX: 0,
      beginY: 0,
    };
    this.behaviorArray = {
      paintbrush: [],
      rectangle: [],
      round: [],
      arrow: [],
      text: [],
      line: [],
    };
    // this.dragEvent();
    // this.changelinewidth();
    this.lineWidth = 1;
    // if (window.devicePixelRatio) {
    //   let devicePixelRatio = window.devicePixelRatio;
    //   this.ctx.scale(devicePixelRatio, devicePixelRatio)
    // }
  }
  // setScale () {
  //   this.canvas.style.width = this.canvas.width + 'px';
  //   this.canvas.style.height = this.canvas.height + 'px';
  //   this.canvas.width = this.canvas.width * this.ratio;
  //   this.canvas.height = this.canvas.height * this.ratio;
  //   this.ctx.scale(this.ratio, this.ratio);
  // }
  getPixelRatio(context) {
    var backingStore =
      context.backingStorePixelRatio ||
      context.webkitBackingStorePixelRatio ||
      context.mozBackingStorePixelRatio ||
      context.msBackingStorePixelRatio ||
      context.oBackingStorePixelRatio ||
      context.backingStorePixelRatio ||
      1;
    return (window.devicePixelRatio || 1) / backingStore;
  }
  changeColor(colorR, colorG, colorB) {
    this.color = {
      colorR,
      colorG,
      colorB,
    };
    this.tempCtx.strokeStyle = `rgb(${colorR},${colorG},${colorB})`;
    this.tempCtx.fillStyle = `rgb(${colorR},${colorG},${colorB})`;
    this.ctx.strokeStyle = `rgb(${colorR},${colorG},${colorB})`;
    this.ctx.fillStyle = `rgb(${colorR},${colorG},${colorB})`;
  }
  changelinewidth(lineWidth = 2) {
    // console.log(lineWidth, 'lineWidth');
    if (lineWidth > 1000) {
      lineWidth = 2;
    }
    let canvasWidth = this.setReceiveLineWidth(lineWidth);
    this.lineWidth = lineWidth || 1;
    this.tempCtx.lineWidth = canvasWidth || 1;
    this.ctx.lineWidth = canvasWidth || 1;
    // console.log(this.tempCtx.lineWidth);
  }
  /**create canvas for every annotation**/
  createCanvas(createId, showId) {
    var canvas = document.createElement('canvas');
    canvas.setAttribute('id', createId);
    document.getElementById(showId).appendChild(canvas);
    canvas.width = this.tempCanvas.width;
    canvas.height = this.tempCanvas.height;
    var tempcanvas = document.getElementById(createId);
    tempcanvas.style.position = 'absolute';
    tempcanvas.style.zIndex = 1;
    tempcanvas.style.cursor = 'Crosshair';
    tempcanvas.style.left = '0px';
    tempcanvas.style.top = '0px';
    tempcanvas.style.width = canvas.width + 'px';
    tempcanvas.style.height = canvas.height + 'px';
    return tempcanvas;
  }
  /****绘制直线***/
  drawline(callback) {
    this.initCurrentHandler();
    this.currentHandler.line = true;
    const curEvent = this.getCanvasEvent();
    var eventStart = curEvent.eventStart,
      eventMove = curEvent.eventMove,
      eventEnd = curEvent.eventEnd;
    // this.changelinewidth(this.lineWidth);
    this.tempCanvas[eventStart] = (event) => {
      if (this.currentHandler.line && !this.drag_info.isDrag) {
        this.changelinewidth(this.lineWidth);
        this.stage_info = document
          .getElementById(this.showId)
          .getBoundingClientRect();
        let pageX = this.getPagePosition(event).pageX;
        let pageY = this.getPagePosition(event).pageY;
        this.path.beginX = pageX;
        this.path.beginY = pageY;
        this.currentHandler.drag = false;
        this.isDraw = true;
        this.drag_info.isDragUp = false;
      }
      this.tempCanvas[eventMove] = (event) => {
        if (this.currentHandler.line && this.isDraw && !this.drag_info.isDrag) {
          this.changelinewidth(this.lineWidth);
          this.tempCtx.strokeStyle = `rgb(${this.color.colorR},${this.color.colorG},${this.color.colorB})`;
          this.ispencilDraw = 0;
          this.tempCtx.clearRect(
            0,
            0,
            this.tempCanvas.width,
            this.tempCanvas.height
          );
          this.tempCtx.beginPath();
          this.tempCtx.moveTo(this.getParseInBeginPosttion().x, this.getParseInBeginPosttion().y);
          let pageX = this.getPagePosition(event).pageX;
          let pageY = this.getPagePosition(event).pageY;
          this.path.endX = pageX;
          this.path.endY = pageY;
          this.tempCtx.lineTo(this.getParseInEndPosttion().x, this.getParseInEndPosttion().y);
          this.tempCtx.stroke();
        }
      };
      this.tempCanvas[eventEnd] = () => {
        if (
          this.currentHandler.line &&
          !this.drag_info.isDrag &&
          !this.drag_info.isDragUp
        ) {
          if (this.ispencilDraw == 0) {
            this.tempCtx.clearRect(
              0,
              0,
              this.tempCanvas.width,
              this.tempCanvas.height
            );
            this.ctx.strokeStyle = `rgb(${this.color.colorR},${this.color.colorG},${this.color.colorB})`;
            this.ctx.beginPath();
            this.ctx.moveTo(this.getParseInBeginPosttion().x, this.getParseInBeginPosttion().y);
            this.ctx.lineTo(this.getParseInEndPosttion().x, this.getParseInEndPosttion().y);
            this.ctx.stroke();
            this.sendCanvasData(0, (info) => {
              callback(info);
            });
          }
          this.isDraw = false;
          this.currentHandler.drag = true;
          this.ispencilDraw = 1;
        }
      };
    };
  }
  /***********绘制圆形********/
  drawRound(callback) {
    this.initCurrentHandler();
    this.currentHandler.round = true;
    const curEvent = this.getCanvasEvent();
    var eventStart = curEvent.eventStart,
      eventMove = curEvent.eventMove,
      eventEnd = curEvent.eventEnd;
    this.tempCanvas[eventStart] = (event) => {
      if (this.currentHandler.round && !this.drag_info.isDrag) {
        this.changelinewidth(this.lineWidth);
        this.stage_info = document
          .getElementById(this.showId)
          .getBoundingClientRect();
        let pageX = this.getPagePosition(event).pageX;
        let pageY = this.getPagePosition(event).pageY;
        this.path.beginX = pageX;
        this.path.beginY = pageY;
        this.currentHandler.drag = false;
        this.isDraw = true;
        this.drag_info.isDragUp = false;
      }
      this.tempCanvas[eventMove] = (event) => {
        if (
          this.currentHandler.round &&
          this.isDraw &&
          !this.drag_info.isDrag
        ) {
          this.ispencilDraw = 0;
          this.changelinewidth(this.lineWidth);
          this.tempCtx.strokeStyle = `rgb(${this.color.colorR},${this.color.colorG},${this.color.colorB})`;
          this.tempCtx.clearRect(
            0,
            0,
            this.tempCanvas.width,
            this.tempCanvas.height
          );
          let pageX = this.getPagePosition(event).pageX;
          let pageY = this.getPagePosition(event).pageY;
          this.path.endX = pageX;
          this.path.endY = pageY;
          let width = this.path.endX - this.path.beginX;
          let height = this.path.endY - this.path.beginY;
          this.BezierEllipse(
            this.tempCtx,
            width / 2 + this.path.beginX,
            height / 2 + this.path.beginY,
            width / 2,
            height / 2
          );
        }
      };
      this.tempCanvas[eventEnd] = (event) => {
        if (
          this.currentHandler.round &&
          !this.drag_info.isDrag &&
          !this.drag_info.isDragUp
        ) {
          if (this.ispencilDraw == 0) {
            this.ctx.strokeStyle = `rgb(${this.color.colorR},${this.color.colorG},${this.color.colorB})`;
            this.tempCtx.clearRect(
              0,
              0,
              this.tempCanvas.width,
              this.tempCanvas.height
            );
            let pageX = this.getPagePosition(event).pageX;
            let pageY = this.getPagePosition(event).pageY;
            this.path.endX = pageX;
            this.path.endY = pageY;
            let width = this.path.endX - this.path.beginX;
            let height = this.path.endY - this.path.beginY;
            this.BezierEllipse(
              this.ctx,
              width / 2 + this.path.beginX,
              height / 2 + this.path.beginY,
              width / 2,
              height / 2
            );
            this.sendCanvasData(3, (info) => {
              callback(info);
            });
          }
          this.ispencilDraw = 1;
          this.isDraw = false;
          this.currentHandler.drag = true;
        }
      };
    };
  }
  BezierEllipse(context, x, y, a, b) {
    var ox = 0.5 * a,
      oy = 0.6 * b;
    context.save();
    context.translate(x, y);
    context.beginPath();
    context.moveTo(0, b);
    context.bezierCurveTo(ox, b, a, oy, a, 0);
    context.bezierCurveTo(a, -oy, ox, -b, 0, -b);
    context.bezierCurveTo(-ox, -b, -a, -oy, -a, 0);
    context.bezierCurveTo(-a, oy, -ox, b, 0, b);
    context.closePath();
    context.stroke();
    context.restore();
  }
  /*******绘制长方形*******/
  drawRect(callback) {
    this.initCurrentHandler();
    this.currentHandler.react = true;
    const curEvent = this.getCanvasEvent();
    var eventStart = curEvent.eventStart,
      eventMove = curEvent.eventMove,
      eventEnd = curEvent.eventEnd;
    this.tempCanvas[eventStart] = (event) => {
      if (this.currentHandler.react && !this.drag_info.isDrag) {
        this.changelinewidth(this.lineWidth);
        this.stage_info = document
          .getElementById(this.showId)
          .getBoundingClientRect();

        let pageX = this.getPagePosition(event).pageX;
        let pageY = this.getPagePosition(event).pageY;
        this.path.beginX = pageX;
        this.path.beginY = pageY;
        this.currentHandler.drag = false;
        this.isDraw = true;
        this.drag_info.isDragUp = false;
      }
      this.tempCanvas[eventMove] = (event) => {
        if (
          this.currentHandler.react &&
          this.isDraw &&
          !this.drag_info.isDrag
        ) {
          this.changelinewidth(this.lineWidth);
          this.tempCtx.strokeStyle = `rgb(${this.color.colorR},${this.color.colorG},${this.color.colorB})`;
          this.tempCtx.clearRect(
            0,
            0,
            this.tempCanvas.width,
            this.tempCanvas.height
          );
          let pageX = this.getPagePosition(event).pageX;
          let pageY = this.getPagePosition(event).pageY;
          this.path.endX = pageX;
          this.path.endY = pageY;
          this.draw_Rect(
            this.tempCtx,
            this.getParseInBeginPosttion().x,
            this.getParseInBeginPosttion().y,
            this.getParseInEndPosttion().x,
            this.getParseInEndPosttion().y
          );
          this.ispencilDraw = 0;
        }
      };
      this.tempCanvas[eventEnd] = () => {
        if (
          this.currentHandler.react &&
          !this.drag_info.isDrag &&
          !this.drag_info.isDragUp
        ) {
          if (this.ispencilDraw == 0) {
            this.ctx.strokeStyle = `rgb(${this.color.colorR},${this.color.colorG},${this.color.colorB})`;
            this.tempCtx.clearRect(
              0,
              0,
              this.tempCanvas.width,
              this.tempCanvas.height
            );
            this.draw_Rect(
              this.ctx,
              this.getParseInBeginPosttion().x,
              this.getParseInBeginPosttion().y,
              this.getParseInEndPosttion().x,
              this.getParseInEndPosttion().y
            );
            this.sendCanvasData(2, (info) => {
              callback(info);
            });
          }
          this.ispencilDraw = 1;
          this.isDraw = false;
          this.currentHandler.drag = true;
        }
      };
    };
  }
  /******绘制箭头********/
  drawArrow(callback) {
    // this.changelinewidth(this.lineWidth);
    this.initCurrentHandler();
    this.currentHandler.arrow = true;
    const curEvent = this.getCanvasEvent();
    var eventStart = curEvent.eventStart,
      eventMove = curEvent.eventMove,
      eventEnd = curEvent.eventEnd;
    this.tempCanvas[eventStart] = (event) => {
      if (this.currentHandler.arrow && !this.drag_info.isDrag) {
        this.stage_info = document
          .getElementById(this.showId)
          .getBoundingClientRect();
        let pageX = this.getPagePosition(event).pageX;
        let pageY = this.getPagePosition(event).pageY;
        this.path.beginX = pageX;
        this.path.beginY = pageY;
        this.currentHandler.drag = false;
        this.isDraw = true;
        this.drag_info.isDragUp = false;
      }
      this.tempCanvas[eventMove] = (event) => {
        if (
          this.currentHandler.arrow &&
          this.isDraw &&
          !this.drag_info.isDrag
        ) {
          this.changelinewidth(this.lineWidth);
          this.tempCtx.strokeStyle = `rgb(${this.color.colorR},${this.color.colorG},${this.color.colorB})`;
          this.ispencilDraw = 0;
          this.tempCtx.clearRect(
            0,
            0,
            this.tempCanvas.width,
            this.tempCanvas.height
          );
          let pageX = this.getPagePosition(event).pageX;
          let pageY = this.getPagePosition(event).pageY;
          this.path.endX = pageX;
          this.path.endY = pageY;
          this.draw_arrow(
            this.path.beginX,
            this.path.beginY,
            this.path.endX,
            this.path.endY,
            this.tempCtx
          );
        }
        this.tempCanvas[eventEnd] = (event) => {
          if (
            this.currentHandler.arrow &&
            !this.drag_info.isDrag &&
            !this.drag_info.isDragUp
          ) {
            if (this.ispencilDraw == 0) {
              this.ctx.strokeStyle = `rgb(${this.color.colorR},${this.color.colorG},${this.color.colorB})`;
              let pageX = this.getPagePosition(event).pageX;
              let pageY = this.getPagePosition(event).pageY;
              this.path.endX = pageX;
              this.path.endY = pageY;
              this.tempCtx.clearRect(
                0,
                0,
                this.tempCanvas.width,
                this.tempCanvas.height
              );
              this.draw_arrow(
                this.path.beginX,
                this.path.beginY,
                this.path.endX,
                this.path.endY,
                this.ctx
              );
              this.sendCanvasData(1, (info) => {
                callback(info);
              });
            }
            this.ispencilDraw = 1;
            this.isDraw = false;
            this.currentHandler.drag = true;
          }
        };
      };
    };
  }
  getCoordinate(x, y, p, q) {
    var xn1, yn1, xn2, yn2;
    xn1 = (x - p) * Math.cos(Math.PI / 4) - (y - q) * Math.sin(Math.PI / 4) + p;
    yn1 = (x - p) * Math.sin(Math.PI / 4) + (y - q) * Math.cos(Math.PI / 4) + q;
    xn2 =
      (x - p) * Math.cos(Math.PI * 1.75) -
      (y - q) * Math.sin(Math.PI * 1.75) +
      p;
    yn2 =
      (x - p) * Math.sin(Math.PI * 1.75) +
      (y - q) * Math.cos(Math.PI * 1.75) +
      q;
    return {
      x1: Number(xn1),
      x2: Number(xn2),
      y1: Number(yn1),
      y2: Number(yn2),
    };
  }
  /***文字***/
  drawText() {
    let that = this;
    this.initCurrentHandler();
    this.currentHandler.text = true;
    let textHandler = {
      text: '',
      input: null,
    };
    this.tempCanvas.addEventListener('mousedown', () => {
      if (this.currentHandler.text) {
        this.path.beginX = event.pageX - this.stage_info.left;
        this.path.beginY = event.pageY - this.stage_info.top;
        createInput();
      }
    });
    function createInput() {
      that.canvas.style.zIndex = 0;
      that.tempCanvas.style.zIndex = 1;
      document.getElementById('setInput').style.zIndex = 2;
      textHandler.input = document.createElement('input');
      document.getElementById('setInput').appendChild(textHandler.input);
      textHandler.input.setAttribute('type', 'text');
      textHandler.input.style.position = 'absolute';
      textHandler.input.style.top = `${that.path.beginY}px`;
      textHandler.input.style.left = `${that.path.beginX}px`;
      textHandler.input.style.borderColor = 'red';
      textHandler.input.style.borderWidth = '1px';
      textHandler.input.style.borderStyle = 'solid';
      textHandler.input.style.height = '35px';
      textHandler.input.style.fontSize = '15px';
    }
    document
      .getElementById('setInput')
      .addEventListener('mousedown', (event) => {
        if (event.target === event.currentTarget) {
          fillText();
        }
      });
    document.addEventListener('keydown', (e) => {
      if (e.keyCode == 13) {
        fillText();
      }
    });
    function fillText(e) {
      window.event ? (window.event.cancelBubble = true) : e.stopPropagation();
      that.canvas.style.zIndex = 1;
      that.tempCanvas.style.zIndex = 2;
      document.getElementById('setInput').style.zIndex = 0;
      that.ctx.font = '15px Arial';
      that.ctx.fillText(
        textHandler.input.value,
        that.path.beginX,
        that.path.beginY
      );
      if (textHandler.input) {
        document.getElementById('setInput').removeChild(textHandler.input);
      }
    }
  }
  /***画笔***/
  draw(callback) {
    this.initCurrentHandler();
    this.currentHandler.pencil = true;
    const curEvent = this.getCanvasEvent();
    var eventStart = curEvent.eventStart,
      eventMove = curEvent.eventMove,
      eventEnd = curEvent.eventEnd;
    this.tempCanvas[eventStart] = (event) => {
      if (this.currentHandler.pencil && !this.drag_info.isDrag) {
        this.stage_info = document
          .getElementById(this.showId)
          .getBoundingClientRect();
        this.changelinewidth(this.lineWidth);
        this.tempCtx.beginPath();
        this.tempCtx.strokeStyle = `rgb(${this.color.colorR},${this.color.colorG},${this.color.colorB})`;
        this.tempCtx.lineCap = "round"
        this.tempCtx.lineJoin = "round";
        let pageX = this.getPagePosition(event).offsetX;
        let pageY = this.getPagePosition(event).offsetY;
        this.path.beginX = pageX;
        this.path.beginY = pageY;
        let position = {
          x: this.setSendPositon().beginX,
          y: this.setSendPositon().beginY
        }
        const pos = { x: this.setReceivePoint(position).x, y: this.setReceivePoint(position).y }
        this.tempCtx.moveTo(pos.x, pos.y);
        this.currentHandler.drag = false;
        this.isDraw = true;
        this.drag_info.isDragUp = false;
        this.temPath = [pos]
        this.drawing(event);
        this.ispencilDraw = 0;
      }
    };
    this.tempCanvas[eventMove] = (event) => {
      if (this.currentHandler.pencil && this.isDraw && !this.drag_info.isDrag) {
        if (this.ispencilDraw == 1) {
          this.ispencilDraw = 0;
        } else {
          if (this.isDraw) {
            this.drawing(event);
          }
        }
      }
    };
    this.tempCanvas[eventEnd] = () => {
      this.drawtime = null
      this.temPath = []
      this.last = null
      if (
        this.currentHandler.pencil &&
        !this.drag_info.isDrag &&
        !this.drag_info.isDragUp
      ) {
        if (this.ispencilDraw == 0) {
          this.tempCtx.clearRect(0, 0, this.tempCanvas.width, this.tempCanvas.height);
          this.sendCanvasData(4, (info) => {
            let analyzeJson = this.annoationBuffer.analyzeBuffer(info);
            const list = analyzeJson.pointList.map(v => {
              return {
                x: this.setReceivePoint(v).x,
                y: this.setReceivePoint(v).y,
              }
            })
            this.temp2ctx(list)
            if (list.length <= 1) return;
            callback(info);
          });
        }
        console.log(this.isDraw, '--------end')
        this.ispencilDraw = 1;
        this.isDraw = false;
        this.currentHandler.drag = true;
      }
    };
  }
  drawing(e) {
    let pageX = this.getPagePosition(e).offsetX;
    let pageY = this.getPagePosition(e).offsetY;
    this.path.endX = pageX;
    this.path.endY = pageY;
    let position = {
      x: this.setSendPositon().endX,
      y: this.setSendPositon().endY
    }
    const pos = { x: this.setReceivePoint(position).x, y: this.setReceivePoint(position).y }
    if (!this.last) {
      this.last = pos
    } else {
      this.temPath.push(pos)
    }
    if (this.drawtime) {
      if (Date.now() - this.drawtime >= 30) {
        this.drawtime = Date.now()
        this.tempCtx.beginPath();
        this.tempCtx.moveTo(this.last.x || this.temPath[0].x, this.last.y || this.temPath[0].y);
        this.temPath.forEach((v) => {
          this.tempCtx.lineTo(v.x, v.y);
        })
        this.tempCtx.stroke();
        this.last = this.temPath[this.temPath.length - 1]
        this.temPath = []
      }
    } else {
      this.drawtime = Date.now()
    }

    this.annoationBuffer.serializePoint(
      this.setSendPositon().endX,
      this.setSendPositon().endY
    );
  }
  temp2ctx(list = []) {
    this.ctx.beginPath();
    this.ctx.lineWidth = this.tempCtx.lineWidth;
    this.ctx.strokeStyle = this.tempCtx.strokeStyle;
    list.forEach((point, index) => {
      if (index == 0) {
        this.ctx.moveTo(point.x, point.y);
      } else {
        this.ctx.lineTo(point.x, point.y);
      }
    });
    this.ctx.stroke();
  }
  getParseInBeginPosttion() {
    const position = {
      x: this.setSendPositon().beginX, y: this.setSendPositon().beginY
    }
    const pos = { x: this.setReceivePoint(position).x, y: this.setReceivePoint(position).y }
    return pos
  }
  getParseInEndPosttion() {
    const position = {
      x: this.setSendPositon().endX, y: this.setSendPositon().endY
    }
    const pos = { x: this.setReceivePoint(position).x, y: this.setReceivePoint(position).y };
    return pos
  }
  getPagePosition(events) {
    let pageX, pageY, offsetX, offsetY;
    if ('ontouchstart' in document.documentElement) {
      if (events.touches) {
        pageX = events.touches[0].pageX;
        pageY = events.touches[0].pageY;
        offsetX = events.touches[0].offsetX;
        offsetY = events.touches[0].offsetY;
      } else {
        pageX = events.pageX;
        pageY = events.pageY;
        offsetX = events.offsetX;
        offsetY = events.offsetY;
      }
    } else {
      pageX = events.pageX;
      pageY = events.pageY;
      offsetX = events.offsetX;
      offsetY = events.offsetY;
    }
    offsetX = this.windowToCanvas(pageX, pageY).x;
    offsetY = this.windowToCanvas(pageX, pageY).y;
    pageX = this.windowToCanvas(pageX, pageY).x;
    pageY = this.windowToCanvas(pageX, pageY).y;
    return { offsetX, offsetY, pageX, pageY };
  }
  windowToCanvas(pageX, pageY) {
    return {
      x:
        (pageX - this.canvas.getBoundingClientRect().left) *
        (this.canvas.width / this.canvas.getBoundingClientRect().width),
      y:
        (pageY - this.canvas.getBoundingClientRect().top) *
        (this.canvas.height / this.canvas.getBoundingClientRect().height),
    };
  }
  getCanvasEvent() {
    var eventStart, eventMove, eventEnd;
    if ('ontouchstart' in document.documentElement) {
      eventStart = 'ontouchstart';
      eventMove = 'ontouchmove';
      eventEnd = 'ontouchend';
    } else {
      eventStart = 'onmousedown';
      eventMove = 'onmousemove';
      eventEnd = 'onmouseup';
    }
    return { eventStart, eventMove, eventEnd };
  }
  /***绘制过渡直线**/
  draw_line(ctx, beginX, beginY, endX, endY) {
    ctx.beginPath();
    ctx.moveTo(beginX, beginY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }
  /***绘制箭头*/
  draw_arrow(beginX, beginY, endX, endY, ctx) {
    let x, y;
    let a = beginX,
      b = beginY,
      p = endX,
      q = endY;
    //第一象限
    if (p <= a && q <= b) {
      x = p + Math.abs(p - a) / 10;
      y = q + Math.abs(q - b) / 10;
    }
    //第二象限
    if (p >= a && q <= b) {
      x = p - Math.abs(p - a) / 10;
      y = q + Math.abs(q - b) / 10;
    }
    //第三象限
    if (p <= a && q >= b) {
      x = p + Math.abs(p - a) / 10;
      y = q - Math.abs(q - b) / 10;
    }
    //第四象限
    if (p >= a && q >= b) {
      x = p - Math.abs(p - a) / 10;
      y = q - Math.abs(q - b) / 10;
    }
    var objCenter = this.getCoordinate(x, y, p, q);
    ctx.beginPath();
    ctx.moveTo(a, b);
    ctx.lineTo(p, q);
    ctx.lineTo(objCenter.x1, objCenter.y1);
    ctx.lineTo(p, q);
    ctx.lineTo(objCenter.x2, objCenter.y2);
    ctx.lineStyle = 2;
    ctx.stroke();
    ctx.closePath();
  }
  /***绘制过渡矩形**/
  draw_Rect(ctx, beginX, beginY, endX, endY) {
    ctx.beginPath();
    ctx.lineJoin = 'round';
    ctx.rect(beginX, beginY, endX - beginX, endY - beginY);
    ctx.stroke();
  }
  clearCanvas(callback) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.tempCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.initCurrentHandler();
    this.sendCanvasData(8, (info) => {
      this.drawData = [];
      callback(info);
    })
  }

  /*****全部行为置为false*****/
  initCurrentHandler() {
    this.path = {
      beginX: 0,
      beginY: 0,
      endX: 0,
      endY: 0,
    };
    Object.keys(this.currentHandler).forEach((key) => {
      this.currentHandler[key] = false;
    });
    this.tempCanvas.onmousedown = null;
    this.tempCanvas.onmousemove = null;
    this.tempCanvas.onmouseup = null;
  }
  /***撤销***/
  undoCanvas() {
    this.clearCanvas();
  }
  /*橡皮擦点选擦除*/
  eraser(callback) {
    this.initCurrentHandler();
    this.currentHandler.eraser = true;
    this.tempCanvas.onmouseup = (event) => {
      if (this.currentHandler.eraser) {
        // if(this.ispencilDraw == 0){
        let pageX = this.getPagePosition(event).pageX;
        let pageY = this.getPagePosition(event).pageY;
        // this.path.endX = pageX;
        // this.path.endY = pageY;
        // this.annoationBuffer.serializePoint(
        //   this.setSendPositon().endX,
        //   this.setSendPositon().endY
        // );
        this.eraserData(pageX, pageY, (data) => {
          if (data) {
            this.drawCanvasData();
            for (let i = 0; i < data.length; i++) {
              this.sendCanvasData(
                6,
                (info) => {
                  callback(info);
                },
                data[i]
              );
            }
          }
        });
      }
    };
  }
  /**绘制图片 */
  drawImage(text,callback){
    this.initCurrentHandler();
    this.path.beginX = 0;
    this.path.beginY = 0;
    this.path.endX = 100;
    this.path.endY = 100
    this.sendCanvasData(10,(info)=>{
       console.log(this.annoationBuffer.analyzeBuffer(info))
         callback(info)
    },null,text)
  }
  isDelSussess(data) {
    let isDelIndex = this.drawData.findIndex((message) => {
      let curPostial = this.annoationBuffer.analyzeBuffer(message);
      return curPostial.start && curPostial.start.msgId == data.start.msgId;
    });
    if (isDelIndex != -1) {
      this.drawData.splice(isDelIndex, 1);
    }
  }
  erasering(beginX, benginY, endX, endY, ctx) {
    //获取两个点之间的剪辑区域四个端点
    var asin = 30 * Math.sin(Math.atan((endY - benginY) / (endX - beginX)));
    var acos = 30 * Math.cos(Math.atan((endY - benginY) / (endX - beginX)));
    var x3 = beginX + asin;
    var y3 = benginY - acos;
    var x4 = beginX - asin;
    var y4 = benginY + acos;
    var x5 = endX + asin;
    var y5 = endY - acos;
    var x6 = endX - asin;
    var y6 = endY + acos;
    //保证线条的连贯，所以在矩形一端画圆
    ctx.save();
    ctx.beginPath();
    ctx.arc(endX, endY, 30, 0, 2 * Math.PI);
    ctx.clip();
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.restore();
    //清除矩形剪辑区域里的像素
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x3, y3);
    ctx.lineTo(x5, y5);
    ctx.lineTo(x6, y6);
    ctx.lineTo(x4, y4);
    ctx.closePath();
    ctx.clip();
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.restore();
    //记录最后坐标
    beginX = endX;
    benginY = endY;
  }
  /****拖动****/
  dragEvent() {
    // this.tempCanvas.addEventListener('mousedown', this.mouseDown);
    // this.tempCanvas.addEventListener('mousemove', this.cursorMouseMove);
    // this.tempCanvas.addEventListener('mouseup', this.mouseUp);
  }
  // cursorMouseMove = (e) => {
  //   // if (this.currentHandler.drag) {
  //   //   if (this.isPointInStroke(e)) {
  //   //     this.tempCanvas.style.cursor = 'move';
  //   //     this.drag_info.isDrag = true;
  //   //   } else {
  //   //     this.tempCanvas.style.cursor = 'default';
  //   //     this.drag_info.isDrag = false;
  //   //   }
  //   // }
  // };
  // mouseDown = (e) => {
  //   if (this.currentHandler.drag && this.isPointInStroke(e) && this.drag_info.isDrag) {
  //     this.path.beginX = e.pageX - this.stage_info.left;
  //     this.path.beginY = e.pageY - this.stage_info.top;
  //     this.tempCanvas.removeEventListener('mousemove', this.cursorMouseMove);
  //     this.tempCanvas.addEventListener('mousemove', this.dragMove);
  //     this.drag_info.offsetY = 0;
  //     this.drag_info.offsetX = 0;
  //     // let sendDragStart = JSON.parse(JSON.stringify(this.drawData[this.drag_info.dragIndex].start));
  //     // this.ws.send(sendDragStart);
  //   }
  // // };
  // dragMove = () => {
  //   // let shareResolution = {
  //   //   height: 1080,
  //   //   width: 1920
  //   // };
  //   this.drag_info.isDrag = true;
  //   let endX = event.pageX - this.stage_info.left;
  //   let endY = event.pageY - this.stage_info.top;
  //   this.path.endX = endX - this.path.beginX;
  //   this.path.endY = endY - this.path.beginY;
  //   let msgId = this.annoationBuffer.analyzeBuffer(this.drawData[this.drag_info.dragIndex].start).id;
  //   this.sendPacketData(6, msgId);
  //   // this.drawCanvasDragData(this.path.endX,this.path.endY);
  // };
  // mouseUp = () => {
  //   if (this.currentHandler.drag) {
  //     // var _this = this;
  //     this.tempCanvas.removeEventListener('mousemove', this.dragMove);
  //     this.drag_info.isDrag = false;
  //     this.drag_info.isDragUp = true;
  //     this.tempCanvas.addEventListener('mousemove', this.cursorMouseMove);
  //   }
  // };
  isPointInStroke() {
    // var x = e.offsetX, y = e.offsetY;
    // let isReact =  false;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    return this.reDrawcanvas(true);
  }
  // type等于6删除数据
  // message
  delDrawData() {
    // let analyzeJson = this.annoationBuffer.analyzeBuffer(message);
    // if (analyzeJson.type == 6) {
    //   this.isDelSussess(message, (isdel) => {
    //     console.log(isdel, '删除成功');
    //   });
    // }
  }
  /****接受消息绘制图形***/
  message(message, _unuse, index) {
    let analyzeJson = this.annoationBuffer.analyzeBuffer(message);
    let startSize = analyzeJson.start && analyzeJson.start.size;
    if (startSize) {
      startSize = this.setReceiveLineWidth(startSize);
    }
    if (analyzeJson.type == 0) {
      this.tempCtx.lineWidth = startSize || 1;
      this.ctx.lineWidth = startSize || 1;
      let doubleDotPoint = this.setReceivePosition(analyzeJson.position);
      this.ctx.strokeStyle = `rgb(${analyzeJson.start.color.r},${analyzeJson.start.color.g},${analyzeJson.start.color.b})`;
      this.draw_line(
        this.ctx,
        doubleDotPoint.beginX,
        doubleDotPoint.beginY,
        doubleDotPoint.endX,
        doubleDotPoint.endY
      );
    } else if (analyzeJson.type == 1) {
      this.tempCtx.lineWidth = startSize || 1;
      this.ctx.lineWidth = startSize || 1;
      let doubleDotPoint = this.setReceivePosition(analyzeJson.position);
      this.ctx.strokeStyle = `rgb(${analyzeJson.start.color.r},${analyzeJson.start.color.g},${analyzeJson.start.color.b})`;
      this.draw_arrow(
        doubleDotPoint.beginX,
        doubleDotPoint.beginY,
        doubleDotPoint.endX,
        doubleDotPoint.endY,
        this.ctx
      );
    } else if (analyzeJson.type == 2) {
      let doubleDotPoint = this.setReceivePosition(analyzeJson.position);
      this.tempCtx.lineWidth = startSize || 1;
      this.ctx.lineWidth = startSize || 1;
      this.ctx.strokeStyle = `rgb(${analyzeJson.start.color.r},${analyzeJson.start.color.g},${analyzeJson.start.color.b})`;
      this.draw_Rect(
        this.ctx,
        doubleDotPoint.beginX,
        doubleDotPoint.beginY,
        doubleDotPoint.endX,
        doubleDotPoint.endY
      );
    } else if (analyzeJson.type == 3) {
      let doubleDotPoint = this.setReceivePosition(analyzeJson.position);
      this.ctx.strokeStyle = `rgb(${analyzeJson.start.color.r},${analyzeJson.start.color.g},${analyzeJson.start.color.b})`;
      this.tempCtx.lineWidth = startSize || 1;
      this.ctx.lineWidth = startSize || 1;
      let width = doubleDotPoint.endX - doubleDotPoint.beginX,
        height = doubleDotPoint.endY - doubleDotPoint.beginY;
      this.BezierEllipse(
        this.ctx,
        width / 2 + doubleDotPoint.beginX,
        height / 2 + doubleDotPoint.beginY,
        width / 2,
        height / 2
      );
      this.tempCtx.lineWidth = startSize || 1;
      this.ctx.lineWidth = startSize || 1;
    } else if (analyzeJson.type == 4) {
      this.ctx.beginPath();
      this.tempCtx.lineWidth = startSize || 1;
      this.ctx.lineWidth = startSize || 1;
      // this.ctx.lineCap = 'round';
      // this.ctx.lineJoin = 'round';
      analyzeJson.pointList.forEach((point, index) => {
        if (index == 0) {
          this.ctx.moveTo(
            this.setReceivePoint(point).x,
            this.setReceivePoint(point).y
          );
        } else {
          this.ctx.lineTo(
            this.setReceivePoint(point).x,
            this.setReceivePoint(point).y
          );
        }
      });

      this.ctx.strokeStyle = `rgb(${analyzeJson.start.color.r},${analyzeJson.start.color.g},${analyzeJson.start.color.b})`;
      this.ctx.stroke();
    } else if (analyzeJson.type == 6) {
      this.isDelSussess(analyzeJson);
      this.drawCanvasData();
    } else if (analyzeJson.type == 8) {
      console.log('analyzeJson', index, this.drawData);
      if (typeof index !== 'undefined') {
        this.drawData = this.drawData.splice(index + 1)
      } else {
        this.drawData = []
      }
      if (typeof this.onClear === 'function') {
        this.onClear(this)
      }
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  eraserData(x, y, callback) {
    let delPoint = [];
    for (let i = 0; i < this.drawData.length; i++) {
      let analyzeJson = this.annoationBuffer.analyzeBuffer(this.drawData[i]);
      let isDel = null;
      if (analyzeJson.type == 0) {
        let doubleDotPoint = this.setReceivePosition(analyzeJson.position);
        let x1 = doubleDotPoint.beginX,
          y1 = doubleDotPoint.beginY,
          x2 = doubleDotPoint.endX,
          y2 = doubleDotPoint.endY;
        isDel = this.isDelPostil(
          x1,
          y1,
          x2,
          y2,
          x,
          y,
          this.setReceiveLineWidth(analyzeJson.start.size)
        );
      } else if (analyzeJson.type == 2) {
        let doubleDotPoint = this.setReceivePosition(analyzeJson.position);
        isDel =
          this.isDelPostil(
            doubleDotPoint.beginX,
            doubleDotPoint.beginY,
            doubleDotPoint.beginX,
            doubleDotPoint.endY,
            x,
            y,
            this.setReceiveLineWidth(analyzeJson.start.size)
          ) ||
          this.isDelPostil(
            doubleDotPoint.beginX,
            doubleDotPoint.beginY,
            doubleDotPoint.endX,
            doubleDotPoint.beginY,
            x,
            y,
            analyzeJson.start.size
          ) ||
          this.isDelPostil(
            doubleDotPoint.beginX,
            doubleDotPoint.endY,
            doubleDotPoint.endX,
            doubleDotPoint.endY,
            x,
            y,
            analyzeJson.start.size
          ) ||
          this.isDelPostil(
            doubleDotPoint.endX,
            doubleDotPoint.beginY,
            doubleDotPoint.endX,
            doubleDotPoint.endY,
            x,
            y,
            analyzeJson.start.size
          );
      } else if (analyzeJson.type == 4) {
        isDel = analyzeJson.pointList.find((info, index) => {
          let isDelDraw = false;
          if (index + 1 != analyzeJson.pointList.length) {
            let x1 = this.setReceivePoint(info).x,
              y1 = this.setReceivePoint(info).y,
              x2 = this.setReceivePoint(analyzeJson.pointList[index + 1]).x,
              y2 = this.setReceivePoint(analyzeJson.pointList[index + 1]).y;
            isDelDraw = this.isDelPostil(
              x1,
              y1,
              x2,
              y2,
              x,
              y,
              this.setReceiveLineWidth(analyzeJson.start.size)
            );
          }
          return isDelDraw;
        });
      }
      if (isDel) {
        this.drawData.splice(i, 1);
        i--;
        delPoint.push(analyzeJson.start.msgId);
      }
    }
    if (delPoint.length != 0 && callback != undefined) {
      callback(delPoint);
    }
  }
  isDelPostil(x1, y1, x2, y2, x, y, d = 1) {
    let isHorizontal = false,
      isVertical = false;
    if (
      x1 >= x2 &&
      (x >= x2 || x - d >= x2 || x + 2 >= x2) &&
      (x <= x1 || x - d <= x1 || x + d <= x1)
    ) {
      isHorizontal = true;
    }
    if (
      x1 <= x2 &&
      (x <= x2 || x - d <= x2 || x + d <= x2) &&
      (x >= x1 || x + d >= x1 || x - d >= x1)
    ) {
      isHorizontal = true;
    }
    if (
      y1 >= y2 &&
      (y >= y2 || y - d >= y2 || y + d >= y2) &&
      (y <= y1 || y - d <= y1 || y + d <= y1)
    ) {
      isVertical = true;
    }
    if (
      y1 <= y2 &&
      (y <= y2 || y - d <= y2 || y + d <= y2) &&
      (y >= y1 || y + d >= y1 || y - d >= y1)
    ) {
      isVertical = true;
    }
    return isVertical && isHorizontal;
  }
  initDraw(msg) {
    const index = JSON.parse(JSON.stringify(msg)).reverse().findIndex((info) => { return this.annoationBuffer.analyzeBuffer(info).type == 8 });
    if (index != -1) {
      msg = msg.slice(msg.length - index, msg.length)
    }
    let drawEraserData = msg.filter((message) => {
      return this.annoationBuffer.analyzeBuffer(message).type == 6;
    });
    this.drawData = msg.filter((v) => {
      const drawInfo = this.annoationBuffer.analyzeBuffer(v);
      return drawEraserData.every((k) => {
        const drawEraserInfo = this.annoationBuffer.analyzeBuffer(k);
        if (
          drawInfo.start &&
          drawEraserInfo.start &&
          drawEraserInfo.start.msgId != drawInfo.start.msgId
        ) {
          return v;
        }
      });
    });
    this.drawCanvasData();
  }
  drawCanvasData() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.miterLimit = 1
    this.ctx.lineCap = "round"
    this.ctx.lineJoin = "round";
    for (let j = 0; j < this.drawData.length; j++) {
      this.message(this.drawData[j], null, j);
    }
  }
  drawCanvasDragData(x, y) {
    let dx = x - this.drag_info.offsetX;
    let dy = y - this.drag_info.offsetY;
    let packetPonit = this.drawData[this.drag_info.dragIndex].packet;
    if (packetPonit instanceof Array) {
      for (var i = 0; i < packetPonit.length; i++) {
        let packetData = this.annoationBuffer.analyzeBuffer(packetPonit[i]);
        let msgId = packetData.id;
        let X = packetData.x + dx;
        let Y = packetData.y + dy;
        this.drawData[this.drag_info.dragIndex].packet[
          i
        ] = this.annoationBuffer.serializePosition(X, Y, 1, msgId);
      }
    } else {
      let packetData = this.annoationBuffer.analyzeBuffer(packetPonit);
      let msgId = packetData.id;
      let beginX = packetData.x1 + dx;
      let beginY = packetData.y1 + dy;
      let endX = packetData.x2 + dx;
      let endY = packetData.y2 + dy;
      this.drawData[
        this.drag_info.dragIndex
      ].packet = this.annoationBuffer.serializeRect(
        beginX,
        beginY,
        endX,
        endY,
        2,
        msgId
      );
    }
    this.drag_info.offsetX = x;
    this.drag_info.offsetY = y;
    //this.drawCanvasData();
  }
  /***处理canvasData***/
  saveCanvasData(data) {
    this.drawData.push(data);
  }
  sendCanvasData(type, callback, senId = null,text) {
    // this.ctx.lineWidth = 1;
    let sendPoint = this.setSendPositon();
    if (type == 0 || type == 1 || type == 2 || type == 3) {
      let sendData = this.annoationBuffer.serializeDbdot(
        type,
        this.lineWidth,
        this.color,
        sendPoint.beginX,
        sendPoint.beginY,
        sendPoint.endX,
        sendPoint.endY
      );
      // this.ws.send(sendData, this.participantId);
      this.saveCanvasData(sendData);
      callback(sendData);
    } else if (type == 4) {
      let sendData = this.annoationBuffer.serializeDraw(
        this.lineWidth,
        this.color
      );
      // this.ws.send(sendData, this.participantId);
      this.saveCanvasData(sendData);
      callback(sendData);
    }else if(type == 5){  //文字
        let sendData = this.annoationBuffer.serializeContent(type,text,this.color,null,sendPoint);
        callback(sendData);
    } else if (type == 6) {  //橡皮擦
      let sendData = this.annoationBuffer.serializeEraser(senId);
      // this.ws.send(sendData, this.participantId);
      // console.log(sendData);
      // console.log(this.annoationBuffer.analyzeBuffer(sendData));
      callback(sendData);
      //this.saveCanvasData(sendData);
    } else if (type == 8) {   //清屏
      let sendData = this.annoationBuffer.serializePaintType(type);
      this.saveCanvasData(sendData);
      callback(sendData);
      // this.ws.send(sendData, this.participantId);
    }else if(type == 10){
        let sendData = this.annoationBuffer.serializeContent(type,text,this.color,null,sendPoint);
        callback(sendData);
    }
  }
  setSendPositon() {
    var shareScreenResolution = {
      width: 1920,
      height: 1080,
    };
    let sendPoint = {
      beginX: parseInt(
        (shareScreenResolution.width * this.path.beginX) / this.tempCanvas.width
      ),
      beginY: parseInt(
        (shareScreenResolution.height * this.path.beginY) /
        this.tempCanvas.height
      ),
      endX: parseInt(
        (shareScreenResolution.width * this.path.endX) / this.tempCanvas.width
      ),
      endY: parseInt(
        (shareScreenResolution.height * this.path.endY) / this.tempCanvas.height
      ),
    };
    return sendPoint;
  }
  setSendlineWidth(lineWidth) {
    let width = 640,
      canvasWidth = this.tempCanvas.width,
      sendLineWidth = Math.ceil((width * lineWidth) / canvasWidth);
    return sendLineWidth;
  }
  setReceivePosition(analyzejson) {
    var shareScreenResolution = {
      width: 1920,
      height: 1080,
    };
    let sendPoint = {
      beginX: parseInt(
        (this.tempCanvas.width * analyzejson.x1) / shareScreenResolution.width
      ),
      beginY: parseInt(
        (this.tempCanvas.height * analyzejson.y1) / shareScreenResolution.height
      ),
      endX: parseInt(
        (this.tempCanvas.width * analyzejson.x2) / shareScreenResolution.width
      ),
      endY: parseInt(
        (this.tempCanvas.height * analyzejson.y2) / shareScreenResolution.height
      ),
    };
    return sendPoint;
  }
  setReceivePoint(analyzejson) {
    var shareScreenResolution = {
      width: 1920,
      height: 1080,
    };
    let sendPoint = {
      x: parseInt(
        (this.tempCanvas.width * analyzejson.x) / shareScreenResolution.width
      ),
      y: parseInt(
        (this.tempCanvas.height * analyzejson.y) / shareScreenResolution.height
      ),
    };
    return sendPoint;
  }
  setReceiveLineWidth(lineWidth) {
    let width = 1920,
      canvasWidth = this.tempCanvas.width,
      sendLineWidth = Math.ceil((canvasWidth * lineWidth) / width);
    return sendLineWidth;
  }
  reDrawcanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // let isReact = false;
    // for(var i = 0;i< this.drawData.length;i++) {
    //     this.message(this.drawData[i]);
    //     if(status&&this.ctx.isPointInStroke(x,y)) {
    //         this.drag_info.dragIndex  = i;
    //         isReact = true
    //     }
    // }
    // return isReact
  }
}
