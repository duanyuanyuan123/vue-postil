<template>
  <div>
    <button @click.self="drawImage" style="">添加图片</button>
 
  <div class="hello" id="canvasCtx" style="position:relative">
     <canvas id="postil" width="640" height="640" class="postil"   style="position:absolute;z-index: 1;top: 0;    left: 0px;"></canvas>
     <canvas id="temp-canvas" width="640" height="640" class="postil"    style="position:absolute;z-index: 2;top: 0;    left: 0px;"></canvas>
   
  </div>
</div>
</template>

<script>
import  {postil} from "@/api/postial/postil"
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data(){ 
    return{
       postil:null
    }
  },
  mounted(){
    this.initPostil()
  },
  methods:{
      initPostil(){
          this.postil =  new postil('postil', 'temp-canvas', 'canvasCtx', null, '1111');
          // this.postil.clearCanvas();
          this.postil.changeColor('12', '33','2');
          this.postil.draw(()=>{
          });
          console.log(this.postil)
      },
      drawImage(){
        const url = "https://nimg.ws.126.net/?url=http%3A%2F%2Fdingyue.ws.126.net%2F2021%2F1031%2Fce4b2e85j00r1svr6001ec000hs00owc.jpg&thumbnail=660x2147483647&quality=80&type=jpg"
        this.postil.drawImage(url,()=>{
          });
      }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
.postil{
   border: 1px solid red;
}
</style>
