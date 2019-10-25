var tone=false;

function toggleTone(){
  
  tone = !tone; 
  if (tone){
    analogWrite(A0, 0.9, { soft: false, freq: 392});
    
  } else {
    analogWrite(A0, 0, { soft: false, freq: 392});
  }
  LED1.write(tone);
  
  
}  

setWatch(function() {
    toggleTone();
  }, BTN1, {edge:"rising", debounce:50, repeat:true});

setWatch(function() {
    toggleTone();
}, BTN2, {edge:"rising", debounce:50, repeat:true});

setWatch(function() {
    toggleTone();
}, BTN3, {edge:"rising", debounce:50, repeat:true});

setWatch(function() {
    toggleTone();
}, BTN4, {edge:"rising", debounce:50, repeat:true});
