module.exports.run = function () { 
  Badge.reset();
  var server = "test.mosquitto.org"; 
  var mqtt = require("tinyMQTT").create(server);
  mqtt.on('connected', function() {
      var name = Badge.getName();
      Badge.drawCenter("MQTT Connected\n"+name);
      mqtt.subscribe("/badge/"+name);
    
  });
  mqtt.on('message', function (msg) {
    //console.log(msg.message);
    //console.log(msg.topic);
    var data = JSON.parse(msg.message);
    require("neopixel").write(D13, data);
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
};
  