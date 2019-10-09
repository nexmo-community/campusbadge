module.exports.run = function () { 
  Badge.reset()
  var menu = {
    "": { title: "-- Select Pattern --" },
    "Back to Badge": Badge.badge,
    "Beep" : beep,
    "Fanfare" : fanfare,
    "Beethoven" : beethoven,
    "Stop" : silence,
  };
  Pixl.menu(menu);
}; 
 
var SPK1=A2;
var SPK2=A3;
var SPK3=A5;

var soundInProgress = false;

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

function silence() {
  digitalWrite(SPK1, 0);
  soundInProgress = false;
}

function beep() {
  if(!soundInProgress) {
    soundInProgress=true;
    analogWrite(SPK1, 0.5, { freq: 1000} );
    setTimeout(silence, 300);
  }
};

function playNextNoteWithDuration(tune, pos) {
  if (tune[pos]) {
    var ch = tune[pos][0];
    var duration = tune[pos][1];
    pos++;
    if (ch in pitches) {
      analogWrite(SPK1, 0.8, { soft: true, freq: pitches[ch] } );
    }
    else digitalWrite(SPK1,0); //off
    setTimeout(playNextNoteWithDuration, duration, tune, pos);
  } else {
    digitalWrite(SPK1,0); //off
    soundInProgress = false;
  }
}

var fanfare_notes = [
  ["d", 200],
  ["d", 200],
  ["d", 200],
  ["A", 400],
  ["d", 200],
  ["A", 400]
];

var beethoven_notes = [
  ["e", 400],
  ["e", 400],
  ["f", 400],
  ["g", 400],
  ["g", 400],
  ["f", 400],
  ["e", 400],
  ["d", 400],
  ["c", 400],
  ["c", 400],
  ["d", 400],
  ["e", 400],
  ["e", 400],
  [" ", 200],
  ["d", 200],
  ["d", 800],
  ["e", 400],
  ["e", 400],
  ["f", 400],
  ["g", 400],
  ["g", 400],
  ["f", 400],
  ["e", 400],
  ["d", 400],
  ["c", 400],
  ["c", 400],
  ["d", 400],
  ["e", 400],
  ["d", 400],
  [" ", 200],
  ["c", 200],
  ["c", 800],
];

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


