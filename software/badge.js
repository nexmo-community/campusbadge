Badge = global.Badge || {};
Badge.URL = Badge.URL || "http://www.espruino.com";
Badge.NAME = Badge.NAME || ["Your", "Name Here"]; // ISO10646-1 codepage
Badge.WIFI_SSID = Badge.WIFI_SSID || "SSID";
Badge.WIFI_PW = Badge.WIFI_PW || "Password";
Badge.backlight = false;
// User-defined apps
Badge.apps = Badge.apps || {};
Badge.patterns = Badge.patterns || {};


//Patch for neopixel lib on pixl
var _npwrite = require("neopixel").write;
require("neopixel").write = function(p,d) {
  var n = 0;
  // search for watches on D22
  for (var i=0;i<8;i++)
    if (((peek32(0x40006510+i*4)>>8)&31)==22)
      n = 0x40006510+i*4;
  // if there was one, disable it
  if (n) poke32(n, peek32(n)&~3);
  // do neopixel write
  _npwrite(p,d);
  // re-enable watch
  poke32(0x40025564,0xFFFFFFFF);
  poke32(0x50000758,12);
  if (n) poke32(n, peek32(n)|1);
};

var np =  require("neopixel");

var BTNS = [BTN1, BTN2, BTN3, BTN4];
// --------------------------------------------
// Get Badge back to normal-ish
Badge.reset = () => {
  Pixl.menu();
  clearInterval();
  clearWatch();
  Bluetooth.removeAllListeners();
  LoopbackB.removeAllListeners();
  g.setRotation(0);
  g.setFontBitmap();
  g.clear();
  g.flip();
  Badge.updateBLE();
};
// --------------------------------------------
// Should the badge be connectable?
Badge.connectable = false;
// --------------------------------------------
Badge.getName = () =>
  NRF.getAddress()
    .substr(-5)
    .replace(":", "");
Badge.updateBLE = () => {
  var adv = {
    showName: Badge.connectable,
    connectable: Badge.connectable,
    interval: Badge.connectable ? 100 : 1000
  };
  NRF.setAdvertising({}, adv);
  NRF.setServices(undefined, { uart: Badge.connectable });
};
// --------------------------------------------
// Fullscreen stuff
Badge.drawCenter = (txt, title, big) => {
  g.clear();
  g.setFontAlign(0, 0);
  if (title) {
    g.fillRect(0, 0, 127, 7);
    g.setColor(0);
    g.drawString(title, 64, 4);
    g.setColor(1);
  }
  var l = txt.split("\n");
  if (big) Badge.setBigFont(g);
  var h = big ? 10 : 6;
  l.forEach((s, i) => g.drawString(s, 64, 34 + (i - (l.length - 1) / 2) * h));
  g.setFontBitmap();
  g.setFontAlign(-1, -1);
  g.flip();
};
// https://raw.githubusercontent.com/Tecate/bitmap-fonts/master/bitmap/dylex/7x13.bdf
// ISO10646-1 codepage
Badge.setBigFont = g => {
  var font = atob(
    "AAAAAAAAA/QAAcAAAHAAAAJAf4CQH+AkAAAMQJIP+CSBGAAAQAUIEYAwBiBCgAgAAG4EiCRA0gBgDIAAOAAAAfAwYgCAAIAjBgfAAACgAgB8AIAKAAABAAgB8AIAEAAAACAOAAAIAEACABAAgAAADAAAAYAwBgDAGAAAAfgQIJkECB+AAAIQIIP8ACABAAAQwQoIkEiBhAAAQgQIJEEiBuAAADACgCQCID/ACAAAeQJEEiCRBHAAAHwFEEiCRAHAAAQAIMEYCwBgAAANwJEEiCRA3AAAOAIkESCKA+AAAGYAAAAgzgAACACgCICCAAAKAFACgBQAoAAAggIgCgAgAABABAAjQSAGAAAA8AhAmQUoL0CKA4AAABwHAMgGQA4ADgAAf4JEEiCRA4gDgAADwCECBBAggQIQAAH+CBBAggQIQDwAAD/BIgkQSIJEECAAB/gkASAJAEAAAAeAQgQIIkESBOAAA/wCABAAgAQB/gAAQIP8ECAAABAAQQIIEH8AAB/gEADACQCECBAAA/wAIAEACABAAA/wMABgAwBgB/gAAf4MABgAMABg/wAADwCECBBAgQgHgAAH+CIBEAiAOAAAB4BCBAggQIQD2AAD/BEAiARgHIACAAAxAkQSIIkESBGAAAgAQAIAH+CABAAgAAAP4ACABAAgAQfwAAHAAcABgAwDgOAAAD4ADgGAMABgAOD4AAAwwEgBgAwAkBhgAAYACAAgAPAIAIAYAAAEGCFBEgkQUIMEAAH/yAJAEAAYADAAYADAAYAAQBIAn/wAAGAMAYADAAYAAAAIAEACABAAgAQAIAAQAEAAAADAKQFICkA+AAD/gIQEICEA8AAAPAIQEICEAkAAAPAIQEICEP+AAAPAKQFICkA0AAAQA/wkASAIAAAAPAISEJCEh/gAD/gIAEACAA+AAAQBPwAAABAAggSfwAA/4AQAYASAQgAAgAf8AAA/AQAIAD4CABAAfAAAPwEACABAAfAAAHgEICEBCAeAAAP+EICEBCAeAAAHgEICEBCA/4AAPwCACABAAQAAAEQFICkBKAiAAAIAfwCEBCABAAAPgAIAEACA/AAAMABgAMAYAwAAAPAAYAYAwAGABgPAAACEAkAMAJAIQAAD5ACQBIAkP8AACEBGAlAUgMQAAAgAQD3iAJAEAAf/AAEASAI94BAAgAAAIAIAEADAAgAQAQAAAFAHwFUCqBBARAAAACAOAAAAQQI/4kASAAAADgAAA4AAAEAAABAAAAQAAEACAH/AgAQAAAFACgH/AoAUAAAEAEAEABAAQAAAGMAYAwBjAAAAwAADEKRDIiiQRIEYAAAIAKAIgAAH4ECCBA/AkQSIIEAACDFChiRSIKEGCAADAAQAAAEAMAAADAAQAwAEAAABADAAQAwAAAAQAcAfAHABAAAAQAIAEACABAAAAQAIAEACABAAgAQAAAgAgAIAIAAACAB4AgAAAPAGADwAAAEQlIKkJKAiAAAIgCgAgAAAeAQgIQDwCkBSAaAAAIQkYKUJSAxAAAYACAQgAOEIAIAYAAAL8AAAeAQgf4EIBIAAATA+gkQSIAEAABBAfAIgEQCIB8BBAAAwAEgBQAeAUASAwAAAffAADCCYhKQjIIYAAEAAABAAAAH4ECCZBSgpQQIH4AAAQBUAqAPAAAAQAUAVAFAEQAAAQAIAEADwAAH4ECC9BUglQQIH4AAIAEACABAAgAQAIAAAAwAkASAGAAAAIgEQPoBEAiAACIBMAqAJAAAEQCoBUAUAAAEAEAAAAAEH8AIACABAfAAQAAGAHgD/hAA/4QAAAA4AcAOAAAAFADAACQD4AEAAAOAIgEQBwAAAEQBQBUAUAEAAA8YAwBkDGGHgAgAAeMAYAwBpjFQBIAAIgFTB2AMgYww8AEAAADACQWIAEAEAAADgOBJAUgBwAHAAABwHAUgSQA4ADgAAA4TgSQJICcABwAAAcJwJICkCOAA4AAAOE4AkASAnAAcAAAHDcCSBJAbgAOAAADgGANAIgH+CRBAgAAHgEIECSBxAgQgAAH8SSFJAkgQQAAH8CSFJEkgQQAAH8KSJJCkgQQAAH8KSBJCkgQQAAEET+FBAAAQQv4kEAAFBE/hQQAAUED+FBAAACAP4EkCSBBARAHAAAH8KAIwCGCAwP4AAA4AiEghQQEQBwAAAcARBQRIICIA4AAAOBIhIIkEJEAcAAAHAkQkEKCIiAOAAADgSICCBBCRAHAAACIAoAIAKAIgAAD0CECNBYgQgXgAAD8ABEAhAQAIH4AAB+AAhARAIAED8AAA/BARAIgEICB+AAAfggIAEACEBA/AAAMABAAQEHEEAEAMAAAH+AkASAJADAAAABD/CQhIQkINEAcAAADAKQlIKkA+AAADAKQVISkA+AAADAqQlIKkA+AAADAqQlIKkI+AAADAqQFIKkA+AAADBKRVISkA+AAADAKQFIB8BSApANAAADwCEhDghAJAAADwSkFSApANAAADwKkJSApANAAADwKkJSCpANAAADwKkBSCpANAAAkAL8AACgCfgAAUAT8EAAACQAPwgAAAAcERCogkQvwAAF+EgBQBIAD4AAA8EhBQgIQDwAAA8AhBQhIQDwAAA8ChCQgoQDwAAA8ChCQgoQjwAAA8ChAQgoQDwAAAQAIAVACABAAAA9AjAWgMQLwAAB8EBBAgAQH4AAB8CBCAgAQH4AAB8CBCAggQH4AAB8CBAAggQH4AAB8ABJAlASH+AAH/ghAQgIQDwAAB8CBIAkgSH+AAA"
  );
  var widths = atob(
    "AwIEBgYIBwIEBAYGAwYCBgYGBgYHBgYGBgYCAwUGBQYIBwcHBwcGBwcEBgcGBwcHBgcHBwgHBwgHCAcEBgQGCAMGBgYGBgYGBgMFBgMIBgYGBgYGBgYGCAYGBgYCBggABwADBgQGBgYGBwcECAAHAAADAwUFBgYIBQgGBAgABggAAgYGCAgCBgQIBQYFAAgIBQYFBQMIBwQDBAUGBwcIBgcHBwcHBwgHBgYGBgQEBAQIBwcHBwcHBgcHBwcHCAYIBgYGBgYGCAYGBgYGAwMEBAYGBgYGBgYGBgYGBgYGBgY="
  );
  g.setFontCustom(font, 32, widths, 13);
};
// align=-1=left,0,1=right
Badge.drawStringDbl = (txt, px, py, h, align) => {
  var g2 = Graphics.createArrayBuffer(128, h, 2, { msb: true });
  Badge.setBigFont(g2);
  var w = g2.stringWidth(txt);
  var c = (w + 3) >> 2;
  g2.drawString(txt);
  if (w > 55) {
    // too wide - use 1x
    var img = g2.asImage();
    g.transparent = 0;
    px -= ((align + 1) * w) / 2;
    g.drawImage(img, px, py + 2);
    return;
  }
  px -= (align + 1) * w;
  var img = {
    width: w * 2,
    height: 1,
    transparent: 0,
    buffer: new ArrayBuffer(c)
  };
  var a = new Uint8Array(img.buffer);
  for (var y = 0; y < h; y++) {
    a.set(new Uint8Array(g2.buffer, 32 * y, c));
    g.drawImage(img, px, py + y * 2);
    g.drawImage(img, px, py + 1 + y * 2);
  }
};
// --------------------------------------------
// Main menu
Badge.menu = () => {
  function wait(cb) {
    m = { move: cb, select: cb };
  }
  var mainmenu = {
    "": { title: "-- Campus Badge --" },
    "Back to Badge": Badge.badge,
    "Toggle Backlight": () => {
      Badge.backlight = !Badge.backlight; 
      LED1.write(Badge.backlight);
    },
    "Make Connectable": () => {
      Badge.drawCenter(`-- Now Connectable --

You can connect to this badge
with a BLE capable device. Go to
espruino.com/ide on a Web BLE
capable browser to start coding!

Name: Pixl.js ${Badge.getName()}
MAC: ${NRF.getAddress()}`);
      g.flip();
      wait(() => {
        Badge.connectable = false;
        Badge.updateBLE();
        Badge.menu();
      });
      Badge.connectable = true;
      Badge.updateBLE();
    }
  };
  for (var i in Badge.apps) mainmenu[i] = Badge.apps[i];
  Badge.reset();
  Pixl.menu(mainmenu);
};
Badge.badge = () => {
  Badge.reset();
  var timeout;
  var lastTime = Date.now();
  var imgy = 0;

  function getTimeChar(ch) {
    var min = ch.charCodeAt() * 10;
    return ((min / 60) | 0) + ":" + ("0" + (min % 60)).substr(-2);
  }

  function draw(n) {
    var t = Date.now();
    var timeDiff = t - lastTime;
    lastTime = t;

    g.clear();
    // Draw the Name
    var y = 20; // y offset
    var l = Badge.NAME;
    l.forEach((s, i) =>
      Badge.drawStringDbl(s, 57, y + (i - (l.length - 1) / 2) * 20, 14, 0)
    );

    // Draw the current time
    //g.setFontAlign(-1, -1);
    //var date = new Date();
    //var timeStr = date
    //  .toISOString()
    //  .split("T")[1]
    //  .substr(0, 5);
    //g.drawString(timeStr, 0, 59);
    g.flip();
    //var delay = 1000;
    //if (timeout) clearTimeout(timeout);
    //timeout = setTimeout(e => {
    //  timeout = undefined;
    //  draw(1);
    //}, delay);
  }
  draw(0);
  setWatch(Badge.menu, BTN1);
  setWatch(Badge.menu, BTN4);
  setWatch(e => draw(-1), BTN2, { repeat: 1 });
  setWatch(e => draw(1), BTN3, { repeat: 1 });
};


// Run at boot...
function onInit() {
  Badge.drawCenter("Hold down BTN4 to\nenable connection.");
  setTimeout(function() {
    digitalPulse(LED1, 1, 200, 200, 200);
  }, 100);
  setTimeout(x => {
    if (!BTN4.read()) {
      NRF.nfcURL(Badge.URL);
      Badge.badge();
    } else reset();
  }, 2500);
}

// Additional Apps Here--------------------------------

Badge.apps["Lights"] = () => {
  Badge.reset();
  lightpattern = (pattern) => {
    np.write(D13, pattern);
  };

  function amb() {
    l = new Int8Array(15);
    for( i = 0; i < 15; i++) {
      if(Math.random() > 0.6) {
        val = Math.random() * 80;
      } else {
        val = Math.random() * 35;
      }
      l[i] = val;
    }
    lightpattern(l);
  }
  
 function pulse(){
    l = new Int8Array(15);
    var i = 0;
    var mode = "asc";
    setInterval(function(){
      if (i == -1 ) {mode = "asc";
                   i++;
                  }
      if (i => 0 && i < 14){
        l[7] = i*10;
        if (mode == "asc"){ i++;} else {i--;}
      } 
      if (i == 14){mode = "desc";
                   i--;
                  }
      lightpattern(l);
    }, 75);
}

  var menu = {
    "": { title: "-- Select Pattern --" },
    "Back to Badge": Badge.badge,
    "Rainbow": function () {clearTimeout(); lightpattern([0,67,97,0,10,127,127,10,0,55,127,0,0,120,0]);},
    "Ambient/Random": function() { amb(); setInterval(amb, 1000);},
    "Pulse":  function () {clearTimeout(); pulse();},
    "Floodlights (!WARNING! BRIGHT)" : function () { clearTimeout(); lightpattern([255,255,255,255,255,255,255,255,255,255,255,255,255,255,255]);},
    "Off" : function () { clearTimeout(); lightpattern([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);},
  };
  Pixl.menu(menu);
};

Badge.apps["Sound"]= () => {
  Badge.reset()

  var SPK1=A0;
  var SPK2=A1;
  var SPK3=A2;

  var soundInProgress = false;
  var timer;

  var pitches = {
    'a':220.00,
    'b':246.94,
    'c':261.63,
    'd':293.66,
    'e':329.63,
    'f':349.23,
    'g':392.00,
    'A':440.00,
    'B':493.88,
    'C':523.25,
    'D':587.33,
    'E':659.26,
    'F':698.46,
    'G':783.99
  };

  var fanfare_notes = [
    ["d", 200],
    ["d", 200],
    ["d", 200],
    ["A", 400],
    ["d", 200],
    ["A", 400]
  ];

  var beethoven_notes = [
    ["e", "C", 400],
    ["e", "C", 400],
    ["f", "D", 400],
    ["g", "g", 400],
    ["g", "E", 400],
    ["f", "D", 400],
    ["e", "C", 400],
    ["d", "g", 400],
    ["c", "e", 400],
    ["c", "e", 400],
    ["d", "g", 400],
    ["e", "C", 400],
    ["e", "C", 400],
    [" ", " ", 200],
    ["d", "g", 200],
    ["d", "g", 800],
    ["e", "C", 400],
    ["e", "C", 400],
    ["f", "D", 400],
    ["g", "g", 400],
    ["g", "E", 400],
    ["f", "D", 400],
    ["e", "C", 400],
    ["d", "g", 400],
    ["c", "e", 400],
    ["c", "e", 400],
    ["d", "g", 400],
    ["e", "C", 400],
    ["d", "B", 400],
    [" ", "g", 200],
    ["c", "C", 200],
    ["c", "C", 800],
  ];

  function playNextNoteWithDuration(tune, pos) {
    if (tune.length > pos) {
      var ch1 = tune[pos][0];
      var ch2; // check for this later
      var duration = tune[pos][tune[pos].length - 1];

      if (ch1 in pitches) {
        analogWrite(SPK1, 0.8, { soft: false, freq: pitches[ch1] } );
        analogWrite(SPK3, 0.8, { soft: false, freq: pitches[ch1] } );
      }
      else digitalWrite(SPK1,0); //off

      if (tune[pos].length > 2) {
        ch2 = tune[pos][1];
        if (ch2 in pitches) {
          analogWrite(SPK2, 0.4, { soft: false, freq: pitches[ch2] } );
        }
        else digitalWrite(SPK2,0); //off
      }

      pos++;
      timer = setTimeout(playNextNoteWithDuration, duration, tune, pos);
    } else {
      silence();
    }
  }

  function fanfare() {
    if (!soundInProgress) {
      soundInProgress = true;
      playNextNoteWithDuration(fanfare_notes, 0);
    }
  }

  function beethoven() {
    if (!soundInProgress) {
      soundInProgress = true;
      playNextNoteWithDuration(beethoven_notes, 0);
    }
  }

  function silence() {
    digitalWrite([SPK1, SPK2, SPK3], 0);
    if (timer) {
      clearTimeout(timer);
    }
    soundInProgress = false;
  }

  function beep() {
    if(!soundInProgress) {
      soundInProgress=true;
      analogWrite(SPK1, 0.5, { freq: 1000} );
      setTimeout(silence, 300);
    }
  };

  function goBack() {
    silence();
    Badge.badge();
  }

  var menu = {
    "": { title: "-- Sounds Menu --" },
    "Back to Badge": goBack,
    "Beep" : beep,
    "Fanfare" : fanfare,
    "Beethoven" : beethoven,
    "Stop" : silence,
  };
  Pixl.menu(menu);
};

Badge.apps["DTMF Dialer"]= () => {
   Badge.reset();

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
  function bluebox(){
      np.write(D13, [60,0,30,50,0,120,0,0,255,120,0,50,30,0,60]);
      g.clear();
      g.setFontVector(15);
      g.drawString("2600",5,20);
      g.flip();
      analogWrite(A1,0.5,{ freq : 2600 });
      setTimeout(function(){analogWrite(A1,0);},1000);
      setTimeout(function(){np.write(D13, [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);},1500);
      setTimeout(function(){reset();},2000);
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

  setWatch(function(e){
  var isLong = (e.time-e.lastTime)>3;
      if (isLong){
        bluebox();
      }else{
        next();
      }
    }, BTN4, {repeat:true, debounce:50, edge:"falling"});
  next();

};

Badge.apps["Temperature"] = () => {
  function onTimer() {
    // Get the temperature as a string
    var t = E.getTemperature().toFixed(1);
    // Clear display
    g.clear();
    // Use the small font for a title
    g.setFontBitmap();
    g.drawString("Temperature:");
    // Use a large font for the value itself
    g.setFontVector(40);
    g.drawString(t, (g.getWidth()-g.stringWidth(t))/2,10);
    // Update the screen
    g.flip();
  }
  // Update temperature every 2 seconds
  setInterval(onTimer,2000);
  // Update temperature immediately
  onTimer();
  // Handle exit
  setWatch(function() {
    Badge.badge();
  }, BTN1, {edge:"rising", debounce:50, repeat:true});

};

Badge.apps["NodeRED Workshop"]= () => {
  Badge.reset();
  var server = "demo.nexmodev.com"; 
  var mqtt = require("tinyMQTT").create(server);
  var name = Badge.getName();
  mqtt.on('connected', function() {
      Badge.drawCenter("MQTT Connected\n"+name);
      mqtt.subscribe("/badge/"+name+"/message");
    
  });
  mqtt.on('message', function (msg) {
      var data = JSON.parse(msg.message);
      if (data.hasOwnProperty('l')){
        np.write(D13, data.l);
      }
      if (data.hasOwnProperty('t')){
        Badge.drawCenter(data.t);
      }
      if (data.hasOwnProperty('f')){    
        analogWrite(A1,0.5,{ freq : data.f });
        setTimeout(function(){
          analogWrite(A1,0);
        }, data.d); 
      }
  });


  digitalWrite(D11,1); // enable ESP8266
  Serial1.setup(115200, { rx: D12, tx : D10 });
  var wifi = require("ESP8266WiFi_0v25").connect(Serial1, function(err) {
    if (err) throw err;
    Badge.drawCenter("Connecting to WiFi");
    wifi.connect(Badge.WIFI_SSID, Badge.WIFI_PW, function(err) {
      if (err) throw err;
      Badge.drawCenter("WiFi Connected");
      mqtt.connect();
    });
  });

  setWatch(function() {
    Badge.badge();
  }, BTN1, {edge:"rising", debounce:50, repeat:true});
  setWatch(function() {
    mqtt.publish("/badge/"+name+"/button", "BTN2");
  }, BTN2, {edge:"rising", debounce:50, repeat:true});
  setWatch(function() {
    mqtt.publish("/badge/"+name+"/button", "BTN3");
  }, BTN3, {edge:"rising", debounce:50, repeat:true});
  setWatch(function() {
    mqtt.publish("/badge/"+name+"/button", "BTN4");
  }, BTN4, {edge:"rising", debounce:50, repeat:true});
};

Badge.apps["T-Rex"]=()=>{

  Badge.reset();
  var IMG = {
    rex: [
      Graphics.createImage(`
           ########
          ##########
          ## #######
          ##########
          ##########
          ##########
          #####
          ########
#        #####
#      #######
##    ##########
###  ######### #
##############
##############
 ############
  ###########
   #########
    #######
     ### ##
     ##   #
          #
          ##
`),
      Graphics.createImage(`
           ########
          ##########
          ## #######
          ##########
          ##########
          ##########
          #####
          ########
#        #####
#      #######
##    ##########
###  ######### #
##############
##############
 ############
  ###########
   #########
    #######
     ### ##
     ##   ##
     #
     ##
`),
      Graphics.createImage(`
           ########
          #   ######
          # # ######
          #   ######
          ##########
          ##########
          #####
          ########
#        #####
#      #######
##    ##########
###  ######### #
##############
##############
 ############
  ###########
   #########
    #######
     ### ##
     ##   #
     #    #
     ##   ##
`)
    ],
    cacti: [
      Graphics.createImage(`
     ##
    ####
    ####
    ####
    ####
    ####  #
 #  #### ###
### #### ###
### #### ###
### #### ###
### #### ###
### #### ###
### #### ###
### #### ###
###########
 #########
    ####
    ####
    ####
    ####
    ####
    ####
    ####
    ####
`),
      Graphics.createImage(`
   ##
   ##
 # ##
## ##  #
## ##  #
## ##  #
## ##  #
#####  #
 ####  #
   #####
   ####
   ##
   ##
   ##
   ##
   ##
   ##
   ##
`)
    ]
  };
  IMG.rex.forEach(i => (i.transparent = 0));
  IMG.cacti.forEach(i => (i.transparent = 0));
  var cacti, rex, frame;

  function gameStart() {
    rex = {
      alive: true,
      img: 0,
      x: 10,
      y: 0,
      vy: 0,
      score: 0
    };
    cacti = [{ x: 128, img: 1 }];
    var random = new Uint8Array((128 * 3) / 8);
    for (var i = 0; i < 50; i++) {
      var a = 0 | (Math.random() * random.length);
      var b = 0 | (Math.random() * 8);
      random[a] |= 1 << b;
    }
    IMG.ground = { width: 128, height: 3, bpp: 1, buffer: random.buffer };
    frame = 0;
    setInterval(onFrame, 50);
  }
  function gameStop() {
    rex.alive = false;
    rex.img = 2; // dead
    clearInterval();
    setTimeout(() => setWatch(gameStart, BTN3), 1000);
    setTimeout(onFrame, 10);
  }

  function onFrame() {
    g.clear();
    if (rex.alive) {
      frame++;
      rex.score++;
      if (!(frame & 3)) rex.img = rex.img ? 0 : 1;
      // move rex
      if (BTN4.read() && rex.x > 0) rex.x--;
      if (BTN3.read() && rex.x < 20) rex.x++;
      if (BTN2.read() && rex.y == 0) {
        rex.vy = 4;
      }
      rex.y += rex.vy;
      rex.vy -= 0.2;
      if (rex.y <= 0) {
        rex.y = 0;
        rex.vy = 0;
      }
      // move cacti
      var lastCactix = cacti.length ? cacti[cacti.length - 1].x : 127;
      if (lastCactix < 128) {
        cacti.push({
          x: lastCactix + 24 + Math.random() * 128,
          img: Math.random() > 0.5 ? 1 : 0
        });
      }
      cacti.forEach(c => c.x--);
      while (cacti.length && cacti[0].x < 0) cacti.shift();
    } else {
      g.drawString("Game Over!", (128 - g.stringWidth("Game Over!")) / 2, 20);
    }
    g.drawLine(0, 60, 127, 60);
    cacti.forEach(c =>
      g.drawImage(IMG.cacti[c.img], c.x, 60 - IMG.cacti[c.img].height)
    );
    // check against actual pixels
    var rexx = rex.x;
    var rexy = 38 - rex.y;
    if (
      rex.alive &&
      (g.getPixel(rexx + 0, rexy + 13) ||
        g.getPixel(rexx + 2, rexy + 15) ||
        g.getPixel(rexx + 5, rexy + 19) ||
        g.getPixel(rexx + 10, rexy + 19) ||
        g.getPixel(rexx + 12, rexy + 15) ||
        g.getPixel(rexx + 13, rexy + 13) ||
        g.getPixel(rexx + 15, rexy + 11) ||
        g.getPixel(rexx + 17, rexy + 7) ||
        g.getPixel(rexx + 19, rexy + 5) ||
        g.getPixel(rexx + 19, rexy + 1))
    ) {
      return gameStop();
    }
    g.drawImage(IMG.rex[rex.img], rexx, rexy);
    var groundOffset = frame & 127;
    g.drawImage(IMG.ground, -groundOffset, 61);
    g.drawImage(IMG.ground, 128 - groundOffset, 61);
    g.drawString(rex.score, 127 - g.stringWidth(rex.score));
    g.flip();
  }
  gameStart();
  setWatch(Badge.menu, BTN1);
}

Badge.apps["Flappy Bird"]=()=>{
  Badge.reset();
  var SPEED = 0.5;
  var BIRDIMG = Graphics.createImage(`

 ####
#    #
# ### #
# #  #
#    #
 ####

`);
  BIRDIMG.transparent = 0;
  var birdy, birdvy;
  var wasPressed = false;
  var running = false;
  var barriers;
  var score;

  function newBarrier(x) {
    barriers.push({
      x1: x - 5,
      x2: x + 5,
      y: 10 + Math.random() * (g.getHeight() - 20),
      gap: 8
    });
  }

  function gameStart() {
    running = true;
    birdy = g.getHeight() / 2;
    birdvy = 0;
    barriers = [];
    newBarrier(g.getWidth() / 2);
    newBarrier(g.getWidth());
    score = 0;
    wasPressed = false;
    setInterval(onFrame, 50);
  }

  function gameStop() {
    running = false;
    clearInterval();
    setTimeout(() => setWatch(gameStart, BTN3), 1000);
    setTimeout(onFrame, 10);
  }

  function onFrame() {
    var buttonState = BTN2.read() || BTN3.read();

    g.clear();
    if (!running) {
      g.drawString("Game Over!", 25, 10);
      g.drawString("Score", 10, 20);
      g.drawString(score, 10, 26);
      g.flip();
      return;
    }

    if (buttonState && !wasPressed) {
      birdvy -= 2;
    }
    wasPressed = buttonState;

    score++;
    birdvy += 0.2;
    birdvy *= 0.8;
    birdy += birdvy;
    if (birdy > g.getHeight()) return gameStop();
    // draw bird
    g.drawImage(BIRDIMG, 0, birdy - 4);
    // draw barriers
    barriers.forEach(b => {
      b.x1 -= SPEED;
      b.x2 -= SPEED;
      var btop = b.y - b.gap;
      var bbot = b.y + b.gap;
      g.drawRect(b.x1 + 1, -1, b.x2 - 2, btop - 5);
      g.drawRect(b.x1, btop - 5, b.x2, btop);
      g.drawRect(b.x1, bbot, b.x2, bbot + 5);
      g.drawRect(b.x1 + 1, bbot + 5, b.x2 - 1, g.getHeight());
      if (b.x1 < 6 && (birdy - 3 < btop || birdy + 3 > bbot)) return gameStop();
    });
    while (barriers.length && barriers[0].x2 <= 0) {
      barriers.shift();
      newBarrier(g.getWidth());
    }

    g.flip();
  }
  gameStart();
  setWatch(Badge.menu, BTN1);
}

