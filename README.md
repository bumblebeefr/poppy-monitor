# poppy-monitor

Web tool to monitor and pilot poppy project robot.

![Trunk Assembled](img/screenshot.png)

It uses Rest API to communicate with the Robot instance. ~~Not compatible, for the moment, with trunk version of pypot, please use the branch
[bumblebee/pypot](https://github.com/bumblebeefr/pypot).~~ Should now be compatible with the last version of pypot

Allows to watch un realtime temperature, position of the motors, provide a visual and audible alarm when motors are to hot, etc. ...

It also allows you to control the robot:

- Start, stop, execute methods and edit properties of Privitives attached to the Robot instance
- Set the motors compliant/not compliant
- Move motors with the mouse (drag/scroll on motor block)

## How to use it
Clone the project on your computer, or copy it to your odroid (in  /etc/www/web/ if you are using the apache configured with poppy_install script).

The Poppy HTTP Rest service should be running.
For example in a console:
```
poppy-services --http poppy-humanoid
```
or in a python script:
```
from poppy.creatures import PoppyHumanoid

robot = PoppyHumanoid(use_http=True, start_services=True)
```

Open the index.html file in your browser, click on the red broken link (near the title) and configure the rest api url, for example `http://poppy.local:8080`. If the url is correct and the rest server is running the link will goes green and informations about your robot should appear.

## How to define  and monitor a new type of pypot driven robot 

- Add the image(s) youses to preview your robot in the ''img'' folder _(you can have one picture with both the image of the robot, and the links to motor blocks or 2 transparent pictures that you can be superposed)_
- Create a css file for your robot in `css` directory (you can use` monitor-humanoid.css` as example and modify it :
    - Modify the `.poppy_picture` definition to have the model image of your robot as you want.
    - Add a line like `#motor_<motor_name>{top:520px; left:150px;}` for each motor of your robot to define the position of the motor block on your picture (you can use your browser's devtools to help you define it).
- Copy the `poppy-humanoid.html `to `poppy-<your_robot>.html` and modify it :
    - Change the css import `<link href="css/monitor-humanoid.css" rel="stylesheet">` at the begining of the file to point to the file you have created/
- Edit the index.html to link to your new robot monitor.


## Licence
GNU GPL v3
