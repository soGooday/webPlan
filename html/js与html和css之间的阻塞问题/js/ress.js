var count_ress = 0;
var start_ress = new Date();
for(var i=0;i<100000;i++){
  for(var j=0;j<10000;j++){
    count_ress++;
  }
}
var end_ress = new Date();
console.log(end_ress - start_ress,'ress');