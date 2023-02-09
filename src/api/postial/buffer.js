export class  buffer{
  constructor(id,ws){

  }
  sendStartBuffer(){
    let buffer  =  new ArrayBuffer(8); //一个字节是8位，8个字节    //id是2个字节，16位，0-2位表示类型，3-16位表示id。
    ///let Uint8Array = new Int8Array(newBuffer);
    // let startId = new Int8Array(buffer, 0,2);  //占两个字节，按位运算
    // let startType = new Int8Array(buffer, 2,1); //占一个字节  type取值为0，1，2，3，4，5
    // let startSize = new Int8Array(buffer, 3,1); //占一个字节 这个就是字体的大小
    // let startColor = new Int8Array(buffer, 4,4); //占4个字节 这个不知道
    let view = new DataView(buffer);
    let num = this.randomNum(0,8191);
    console.log(num);
  }
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
  analyzeBuffer(){

  }
}
