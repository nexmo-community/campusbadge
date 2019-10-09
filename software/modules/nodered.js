module.exports.run = function () { 
  Badge.reset();
  var server = "test.mosquitto.org"; 
  var mqtt = require("tinyMQTT").create(server);
  var name = Badge.getName();
  mqtt.on('connected', function() {
      Badge.drawCenter("MQTT Connected\n"+name);
      mqtt.subscribe("/badge/"+name+"/lights");
      mqtt.subscribe("/badge/"+name+"/text");
      //mqtt.subscribe("/badge/"+name+"/sound");
    
  });
  mqtt.on('message', function (msg) {
    switch (msg.topic) {
    case "/badge/"+name+"/lights":
      var data = JSON.parse(msg.message);
      require("neopixel").write(D13, data);
      break;
    case "/badge/"+name+"/text":
      Badge.drawCenter(msg.message);
      break;
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
  