var count_foo = 0;
var start_foo = new Date();
for(var i=0;i<100000;i++){
  for(var j=0;j<10000;j++){
    count_foo++;
  }
}
var end_foo = new Date();
console.log(end_foo - start_foo,'foo');