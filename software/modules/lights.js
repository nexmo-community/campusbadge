module.exports.run = function () { 
  Badge.reset()
    var menu = {
      "": { title: "-- Select Pattern --" },
      "Back to Badge": Badge.badge,
      "Rainbow": function () {lightpattern([0,127,0,64,127,0,127,0,0,0,0,127,0,96,127]);},
      "One White" : function () { lightpattern([0,0,0,0,0,0,127,127,127,0,0,0,0,0,0]);},
      "Off" : function () { lightpattern([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);},
    };
    Pixl.menu(menu);
  }; 
 

  lightpattern=(pattern)=>{
    var np = require("neopixel");
    np.write(D13, pattern);
}
