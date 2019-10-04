# Vonage Campus Developer Conference Badge

Welcome to [Vonage Campus](https://www.vonage.com/campus/)! This repo is dedicated to the software for the Developer Track Conference Badges.

## Assemble Your Badge

The badge kit contains:

* A [pixl.js](http://www.espruino.com/Pixl.js)
* A badge circuit board
* A battery pack

The pixl fits onto the board. The board has five lights along the top of it, and the pixl has a microUSB socket on its right hand side so hopefully this helps to line up the pieces!

<img src="images/pixl.jpg" />

When it powers on, you will get to a screen that says "Your Name Here".

## Buttons

If you look at the sides of the screen you will find four (small) buttons. These are:

* **BTN1** in the top left
* **BTN2** in the top right
* **BTN3** in the bottom right
* **BTN4** in the bottom left

The left hand side controls the menu (BTN1 and BTN4 to go up and down respectively), and BTN4 in the bottom right selects.

## Configuring Your Name

You can set your own name! Actually "First Name" is more like "top line of text" and "Second Name" is really "second line of text" so do whatever you like with these fields.

1. Enable the bluetooth on your badge by selecting "Make Connectable" from the menu.

2. Go to <https://nodebadge.org/name/> on your phone and enter your details.

3. Click "Send to Badge".

4. Unplug your badge from its power source and plug it back in.

Well done! You and your badge are friends now :)

## Badge Features

We've put together some ready-made bits and bobs for you to enjoy in between letting your badge display your name today. They each have their own wiki page:

* [Backlight](https://github.com/nexmo-community/campusbadge/wiki/Backlight)
* [T-Rex](https://github.com/nexmo-community/campusbadge/wiki/T-Rex)
* [Flappy Bird](https://github.com/nexmo-community/campusbadge/wiki/FlappyBird)

## About and Acknowledgements

The Vonage Campus Developer Track Badge is based heavily on the [NodeConfEU Badge from 2018](https://github.com/nearform/nceubadge2018). Many thanks to them for sharing their fun with us :)

