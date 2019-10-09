module.exports.run = function () { 
  Badge.reset()

  var digits = ['_', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '#'];
  var pos = 0;
  var number = [];
  var numlen = 0;

  function step(dir) {
  	if (dir == 'up'){
  		if (pos == 12){ pos = 1;}
  		else { pos++; }
  		number[numlen] = digits[pos];
  		show();
  	} else {
  		if (pos == 1| pos== 0) {pos = 12;}
  		else { pos--; }
  		number[numlen] = digits[pos];
  		show();
  	}
  }
  function next(){
  	if (number.slice(-1)[0] == '_'){
  		play();
  	}else{
  		numlen ++;
  		pos = 0;
  		number[numlen] = digits[pos];
  		show();
  	}
  }
  function show(){
    g.clear();
    g.setFontVector(15);
    g.drawString(number.join(''),5,20);
    g.flip();
  }
  function reset(){
  	pos = 0;
  	number = [];
  	numlen = 0;
  	show();
  }
  function play(){
     var player = setInterval(function(){ 
       if (number.length == 0) {
         clearInterval(player);
         reset();
       } else {
         var digit = number.shift();
         playTone(digit);
       }   
     }, 500);
  }
  function playTone(n){
    switch (n){
  case '1':
    analogWrite(A1,0.5,{ freq : 697 });
    analogWrite(A2,0.5,{ freq : 1209 });
    setTimeout(function(){
      analogWrite(A1,0);
      analogWrite(A2,0);
      }, 450); 
    break;
  case '2':
    analogWrite(A1,0.5,{  freq : 697 });
    analogWrite(A2,0.5,{  freq : 1336 });
    setTimeout(function(){
      analogWrite(A1,0);
      analogWrite(A2,0);
      }, 450); 
          break;
  case '3':
    analogWrite(A1,0.5,{  freq : 697 });
    analogWrite(A2,0.5,{  freq : 1477 });
    setTimeout(function(){
      analogWrite(A1,0);
      analogWrite(A2,0);
      }, 450); 
          break;
  case '4':
    analogWrite(A1,0.5,{  freq : 770 });
    analogWrite(A2,0.5,{  freq : 1209 });
    setTimeout(function(){
      analogWrite(A1,0);
      analogWrite(A2,0);
      }, 450); 
          break;
  case '5':
    analogWrite(A1,0.5,{  freq : 770 });
    analogWrite(A2,0.5,{  freq : 1336 });
    setTimeout(function(){
      analogWrite(A1,0);
      analogWrite(A2,0);
      }, 450); 
          break;
  case '6':
    analogWrite(A1,0.5,{  freq : 770 });
    analogWrite(A2,0.5,{  freq : 1477 });
    setTimeout(function(){
      analogWrite(A1,0);
      analogWrite(A2,0);
      }, 450); 
          break;
  case '7':
    analogWrite(A1,0.5,{  freq : 852 });
    analogWrite(A2,0.5,{  freq : 1209 });
    setTimeout(function(){
      analogWrite(A1,0);
      analogWrite(A2,0);
      }, 450); 
          break;
  case '8':
    analogWrite(A1,0.5,{  freq : 852 });
    analogWrite(A2,0.5,{  freq : 1336 });
    setTimeout(function(){
      analogWrite(A1,0);
      analogWrite(A2,0);
      }, 450); 
          break;
  case '9':
    analogWrite(A1,0.5,{  freq : 852 });
    analogWrite(A2,0.5,{  freq : 1477 });
    setTimeout(function(){
      analogWrite(A1,0);
      analogWrite(A2,0);
      }, 450); 
          break;
  case '*':
    analogWrite(A1,0.5,{  freq : 941 });
    analogWrite(A2,0.5,{  freq : 1209 });
    setTimeout(function(){
      analogWrite(A1,0);
      analogWrite(A2,0);
      }, 450); 
          break;
  case '0':
    analogWrite(A1,0.5,{  freq : 941 });
    analogWrite(A2,0.5,{  freq : 1336 });
    setTimeout(function(){
      analogWrite(A1,0);
      analogWrite(A2,0);
      }, 450); 
          break;
  case '#':
    analogWrite(A1,0.5,{  freq : 941 });
    analogWrite(A2,0.5,{  freq : 1477 });
    setTimeout(function(){
      analogWrite(A1,0);
      analogWrite(A2,0);
      }, 450); 
          break;
    }
  }

  setWatch(function() {
    Badge.badge();
  }, BTN1, {edge:"rising", debounce:50, repeat:true});

  setWatch(function() {
    step('dn');
  }, BTN2, {edge:"rising", debounce:50, repeat:true});

  setWatch(function() {
    step('up');
  }, BTN3, {edge:"rising", debounce:50, repeat:true});

  setWatch(function() {
    next();
  }, BTN4, {edge:"rising", debounce:50, repeat:true});
  next();

}


