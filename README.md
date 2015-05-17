# poppy-monitor

Web tool to monitor and pilot poppy project robot.

![Trunk Assembled](img/screenshot.png)

It uses Rest API to communicate with the Robot instance. Not compatible, for the moment, with trunk version of pypot, please use the branch 
[bumblebee/pypot](https://github.com/bumblebeefr/pypot).

Allows to whatch un realtime temperature, position of the motors, provide a visual and audible alarm whe motors are to hot.

It also allows you to control the robot:
* Start, stop, execute methods and edit properties of Privitives attached to the Robot instance
* Set the motors compliant/not compliant
* Move motors with the mouse
