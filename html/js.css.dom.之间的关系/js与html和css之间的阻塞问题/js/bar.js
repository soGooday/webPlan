var count_bar = 0;
var start_bar = new Date();
for(var i=0;i<100000;i++){
  for(var j=0;j<10000;j++){
    count_bar++;
  }
}
var end_bar = new Date();
console.log(end_bar -  start_bar,'bar');