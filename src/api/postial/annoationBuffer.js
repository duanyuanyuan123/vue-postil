export  class   annoationBuffer{
    constructor(){
        this.bufferManager = new proto.net263.annotation.Manager();
        this.bufferStart = new proto.net263.annotation.Start();
        this.bufferPoint = new proto.net263.annotation.Point();
        this.bufferPosition = new proto.net263.annotation.Position();
        this.bufferColor = new proto.net263.annotation.Color();
        this.bufferText = new proto.net263.annotation.Text();
        this.bufferDraw = new  Array();
        this.sendId = 0;
    }
    /**序列化start**/
    serializeStart(msgId,size,color){
        this.bufferStart.setMsgId(msgId);
        this.bufferStart.setSize(size);
        this.bufferStart.setColor(this.serializeColor(color.colorR,color.colorG,color.colorB,color.alpha))
        return this.bufferStart
    }
    /****序列化point***/
    serializePoint(x,y){
        let bufferPoint = new proto.net263.annotation.Point();
        bufferPoint.setX(x);
        bufferPoint.setY(y);
        this.bufferManager.addPoint(bufferPoint);
    }
    /**序列化position***/
    serializePosition(x1,y1,x2,y2){
        this.bufferPosition.setX1(x1);
        this.bufferPosition.setY1(y1);
        this.bufferPosition.setX2(x2);
        this.bufferPosition.setY2(y2);
        return this.bufferPosition
    }
    /***序列化Text**/
    serializeText(text,color,size){
        this.bufferText.setSize(size);
        this.bufferText.setColor(this.serializeColor(color.colorR,color.colorG,color.colorB,color.alpha));
        this.bufferText.setText(text);
        return this.bufferText
    }
    /**序列化color**/
    serializeColor(red,green,blue,alpha){
        this.bufferColor.setA(alpha);
        this.bufferColor.setR(red);
        this.bufferColor.setG(green);
        this.bufferColor.setB(blue);
        return this.bufferColor
    }
    /***序列化画笔数据***/
    serializeDraw(size,color){
        var Manager = new proto.net263.annotation.Manager();
        let sendId = this.randomNum(0,65535);
        Manager.setType(4);
        Manager.setStart(this.serializeStart(sendId,size,color));
        Manager.setPointList(this.bufferManager.getPointList());
        this.bufferManager = new proto.net263.annotation.Manager();
        return this.arrayBufferToBase64(Manager.serializeBinary());
    }
    /***序列化橡皮擦**/
    serializeEraser(){
        var Manager = new proto.net263.annotation.Manager();
        let sendId = this.randomNum(0,65535);
        Manager.setType(6);
        Manager.setStart(this.serializeStart(sendId));
        Manager.setPointList(this.bufferManager.getPointList());
        this.bufferManager = new proto.net263.annotation.Manager();
        return this.arrayBufferToBase64(Manager.serializeBinary());
    }
    /***序列化直线、箭头、矩形、空心圆、**/
    serializeDbdot(type,size,color,x1,y1,x2,y2){
        console.log(x1);
        console.log(y1);
        var Manager = new proto.net263.annotation.Manager();
        let sendId = this.randomNum(0,65535);
        Manager.setType(type);
        Manager.setStart(this.serializeStart(sendId,size,color));
        Manager.setPosition(this.serializePosition(x1,y1,x2,y2));
        console.log(Manager);
        return this.arrayBufferToBase64(Manager.serializeBinary());
    }
    //序列化text
    serializeContent(type,text,color,size,position){
        var Manager = new proto.net263.annotation.Manager();
        let sendId = this.randomNum(0,65535);
        Manager.setType(type);
        Manager.setStart(this.serializeStart(sendId,size,color));
        Manager.setPosition(this.serializePosition(position.beginX,position.beginY,position.endX,position.endY));
        Manager.setContent(this.serializeText(text,color,size));
        return this.arrayBufferToBase64(Manager.serializeBinary());
    }
    //序列化清屏, 撤销发送数据
    serializePaintType(type){
        var Manager = new proto.net263.annotation.Manager();
        Manager.setType(type);
        return this.arrayBufferToBase64(Manager.serializeBinary());
    }
    //解析类型
    analyzeBuffer(bufView){
        let Manager = proto.net263.annotation.Manager.deserializeBinary(bufView);
        // let actionType = Manager.getType();
        return  Manager.toObject()
    }
    // deserializeDbdot(bytes){
    //     let Manager = proto.net263.annotation.Manager.deserializeBinary(bytes);
    //     let DbdotData = {
    //         type:Manager.getType(),
    //         id:Manager.getStart().getMsgId(),
    //         size:Manager.getStart().getSize(),
    //         color:{R:Manager.getStart().getColor().getR(),G:Manager.getStart().getColor().getG(),B:Manager.getStart().getColor().getB(),A:Manager.getStart().getColor().getA()},
    //         x1:Manager.getPosition().getX1(),
    //         y1:Manager.getPosition().getY1(),
    //         x2:Manager.getPosition().getX2(),
    //         y2:Manager.getPosition().getY2()
    //     };
    //     return DbdotData
    // }
    // deserializeDraw(manager){
    //     let Manager = manager.toObject();
    //     return Manager
    // }
    /*******生成随机数0-65535随机数*******/
    randomNum(minNum,maxNum){
        switch(arguments.length){
            case 1:
                return parseInt(Math.random()*minNum+1,10);
            case 2:
                return parseInt(Math.random()*(maxNum-minNum+1)+minNum,10);
            default:
                return 0;   
        }
    }
    //base64 --> ArrayBuffer
    base64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }
    //ArrayBuffer --> base64
    arrayBufferToBase64(buffer) {
        var binary = '';
        var bytes = new Uint8Array(buffer);
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }
}