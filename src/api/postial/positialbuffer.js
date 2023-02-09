export  class   positialbuffer{
   constructor(){
      this.sendId = 0;
      this.randomNumber = 0;
      /***actionType:0:开始 1:点 2.文本 3:结束**/
      this.actionType = 0;
      this.startJson = {
         id:0,
         actionType:0,
         type:0,
         size:14,
         colorR:0,
         colorG:0,
         colorB:0,
      };
      this.dotJson = {
         id:0,
         actionType:1,
         x:0,
         y:0
      };
      this.doubleDotJSon = {
        id:0,
        actionType:2,
        x1:0,
        y1:0,
        x2:0,
        y2:0
      };
      this.textJson = {
         id:0,
         actionType:3,
         x:0,
         Y:0,
         length:10,
         content:''
      };
     this.clearCanvasJson = {
       id:0,
       actionType:4
     };
     this.undoJson = {
           id:0,
           actionType:5
     };
     this.dragJson = {
       id:0,
       actionType:6,
       x:0,
       y:0,
      };
      this.endJson = {
        id:0,
        actionType:7
      };

   }
   sendStartBuffer(sendtype,sendsize,colorR,colorG,colorB,colorA){
      let buffer =  new ArrayBuffer(8);
      let bufView = new Uint8Array(buffer);
      this.randomNumber = this.randomNum(0,8191);
      this.sendId = this.randomNumber>>5;
      let actionType = (this.randomNumber & 31)<<3;
      bufView[0]=this.sendId;
      bufView[1]=actionType;
      bufView[2]=sendtype;
      bufView[3]=sendsize;
      bufView[4]=0;
      bufView[5]=colorR;
      bufView[6]=colorG;
      bufView[7]=colorB;
     // console.log(bufView);
     return bufView
   }
  sendLineBuffer(X,Y){
    let buffer =  new ArrayBuffer(6);
    let bufView = new Uint8Array(buffer);
    let sendLineType = ((this.randomNumber&31) << 3)+1;
    bufView[0]=this.sendId;
    bufView[1]=sendLineType;
    bufView[2]=X>>8;
    bufView[3]=X&255;
    bufView[4]=Y>>8;
    bufView[5]=Y&255;
    return bufView
  }
  sendDoubleDotBuffer(X1,Y1,X2,Y2){
    let buffer =  new ArrayBuffer(10);
    let bufView = new Uint8Array(buffer);
    let sendLineType = ((this.randomNumber&31) << 3)+2;
    bufView[0]=this.sendId;
    bufView[1]=sendLineType;
    bufView[2]=X1>>8;
    bufView[3]=X1&255;
    bufView[4]=Y1>>8;
    bufView[5]=Y1&255;
    bufView[6]=X2>>8;
    bufView[7]=X2&255;
    bufView[8]=Y2>>8;
    bufView[9]=Y2&255;
    return bufView
  }
  getDoubleDotBuffer(X1,Y1,X2,Y2){
      let buffer =  new ArrayBuffer(8);
      let bufView = new Uint8Array(buffer);
      bufView[0]=X1>>8;
      bufView[1]=X1&255;
      bufView[2]=Y1>>8;
      bufView[3]=Y1&255;
      bufView[4]=X2>>8;
      bufView[5]=X2&255;
      bufView[6]=Y2>>8;
      bufView[7]=Y2&255;
      return Array.from(bufView)
  }
  skewData(x,y){
      let buffer =  new ArrayBuffer(4);
      let bufView = new Uint8Array(buffer);
      bufView[0]=x>>8;
      bufView[1]=x&255;
      bufView[2]=y>>8;
      bufView[3]=y&255;
      return Array.from(bufView)
  }
  sendTextBuffer(content,X,Y){
     let buffer =  new ArrayBuffer(8);
     let bufView = new Uint8Array(buffer);
     bufView[0] = this.sendId;
     let sendTextType = ((this.randomNumber&31) << 3)+3;
     bufView[1] = sendTextType;
     bufView[2]=X>>8;
     bufView[3]=X&255;
     bufView[4]=Y>>8;
     bufView[5]=Y&255;
     let textConten = [bufView,content];
     return textConten
  }
  sendClearCanvas(){
    let buffer =  new ArrayBuffer(2);
    let bufView = new Uint8Array(buffer);
    bufView[0] = this.sendId;
    let sendEndType = ((this.randomNumber&31) << 3)+4;
    bufView[1] = sendEndType;
    return bufView
  }
  sendEndBuffer(){
    let buffer =  new ArrayBuffer(2);
    let bufView = new Uint8Array(buffer);
    bufView[0] = this.sendId;
    let sendEndType = ((this.randomNumber&31) << 3)+7;
    bufView[1] = sendEndType;
    return bufView
  }
  analyzeBuffer(message){
     //解析id
      this.actionType = message[1]&7;
     if(this.actionType == 0){
         return  this.analyzeStartBuffer(message)
     }else if(this.actionType == 1){
       return  this.analyzeDotBuffer(message)
     }else if(this.actionType == 2){
       return  this.analyzeDoubleDotBuffer(message)
     }else if (this.actionType == 3) {
       return this.analyzeTextBuffer(message)
     }else if(this.actionType == 4){
       return this.analyzeClearCanvasBuffer(message)
     }else if(this.actionType == 5){
         return this.analyzeUndoBuffer(message)
     }else if(this.actionType == 6){
         return this.analyzeDragBuffer(message)
     }else if (this.actionType == 7){
       return this.analyzeEndBuffer(message)
     }

  }
  analyzeStartBuffer(message){
      this.startJson.id = this.analyzeSendId(message);
        this.startJson.type = message[2]&255;
        this.startJson.size = message[3]&255;
        this.startJson.colorR = message[5]&255;
        this.startJson.colorG = message[6]&255;
        this.startJson.colorB = message[7]&255;
      return this.startJson
  }
  analyzeDotBuffer(message){
    this.dotJson = {
        id:this.analyzeSendId(message),
        actionType:1,
        x:(message[2]<<8)+message[3],
        y:(message[4]<<8)+message[5]
      };
      return this.dotJson
  }
  analyzeDoubleDotBuffer(message){
      this.doubleDotJSon = {
        id:this.analyzeSendId(message),
        actionType:2,
        x1:(message[2]<<8)+message[3],
        y1:(message[4]<<8)+message[5],
        x2:(message[6]<<8)+message[7],
        y2:(message[8]<<8)+message[9]
      };
      return this.doubleDotJSon
  }
  analyzeTextBuffer(message){

  }
  analyzeClearCanvasBuffer(message){
    this.clearCanvasJson = {
      id:this.analyzeSendId(message),
      actionType:4
    };
    return this.clearCanvasJson
  }
  analyzeUndoBuffer(message){
      this.undoJson = {
          id:this.analyzeSendId(message),
          actionType:5
      };
      return this.undoJson
 }
  analyzeDragBuffer(message){
     this.dragJson = {
         id:this.analyzeSendId(message),
         actionType:6,
         x:(message[2]<<8)+message[3],
         y:(message[4]<<8)+message[5]
     };
     return this.dragJson
  }
  analyzeEndBuffer(message){
    this.endJson = {
      id:this.analyzeSendId(message),
      actionType:7
    };
    return this.endJson
  }
  analyzeSendId(message){
    let sendHigh8 = (message[0] << 5);
    let sendLow3 = (message[1]&248)>>3;
    let analyzesendId = sendHigh8 + sendLow3;
    return analyzesendId
  }
   /*******生成随机数0-8191随机数*******/
   randomNum(minNum,maxNum){
    switch(arguments.length){
      case 1:
        return parseInt(Math.random()*minNum+1,10);
        break;
      case 2:
        return parseInt(Math.random()*(maxNum-minNum+1)+minNum,10);
        break;
      default:
        return 0;
        break;
    }
  }
}
