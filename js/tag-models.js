"use strict";
(function(global) {
	/** Helper function * */
	function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
		var angleInRadians = (angleInDegrees) * Math.PI / 180.0;
		var x = centerX + radius * Math.cos(angleInRadians);
		var y = centerY + radius * Math.sin(angleInRadians);
		return [ x, y ];
	}

	function svg_arc_path(centerX, centerY, radius, low, up) {
		var a1 = polarToCartesian(centerX, centerY, radius, low);
		var a2 = polarToCartesian(centerX, centerY, radius, up);
		var large_arc = '0 ';
		if (Math.abs(up - low) > 180) {
			large_arc = '1 ';
		}
		var reverse_arc = '1 ';
		if (up < low) {
			reverse_arc = '0 ';
		}
		return [ 'M', centerX, ' ', centerY, ' ', a1.join(" "), '  A', radius, ' ', radius, ' 0 ', large_arc, reverse_arc, a2.join(" "), ' Z' ].join('');
	}

	function askValue(txt, entry) {
		var userEntry = entry;
		while (true) {
			userEntry = prompt(txt, userEntry);
			if (userEntry == null)
				break;
			try {
				return JSON.parse(userEntry);
			} catch (e) {
				try {
					return Hjson.parse(userEntry);
				} catch (e) {
					try {
						return Hjson.parse("{" + userEntry + "}");
					} catch (e) {
						alert([ 'Arguments', userEntry, "incorrects" ].join(''));
					}
				}
			}
		}
		;
	}

	/** robot tags definition * */
	riot.tag('position', '<span >  </span>', function(opts) {
		var self = this;
		self.motor = opts.motor;
		self.dodrag = function(){
			console.log(arguments);
		},
		self.rotate = function(e) {
			e.preventDefault();
			console.log(e, this);
		}
		self.on('update', function() {
			this.root.innerHTML = [ '<svg width="32" height="32">', '<circle cx="16" cy="16" r="15" style="stroke:none; fill:#CCC"/>', '<path d="', svg_arc_path(16, 16, 15, self.motor.lower_limit, self.motor.upper_limit), '" style="stroke:none; fill:#AAA;stroke:#888; opacity:0.5; stroke-width:1;"/>', '<line x1="16"  y1="16" x2="32"   y2="16" style="stroke:#444; stroke-width:2;" transform="rotate(', self.motor.goal_position, ',16,16)"/>', '<line x1="16"  y1="16" x2="32"   y2="16" style="stroke:#F00; stroke-width:2;" transform="rotate(', self.motor.present_position, ',16,16)"/>', '</svg>' ].join('\n');
		});

	});

	riot.tag('motor', document.getElementById('motorTpl').innerHTML, function(opts) {
		var self = this;
		self.numeral = numeral;
		self.svg_arc_path = svg_arc_path;
		self.motor = opts.motor;
		self._rotation = 0;
		Poppy.on('poppy.robot.updated', function() {
			self._rotation = 0;
		});
		self.hotMotor = function(motor) {
			return Poppy.isHot(motor.present_temperature);
		};
		self.ardentMotor = function(motor) {
			return Poppy.isArdent(motor.present_temperature);
		};
		self.motorIcon = function(motor) {
			if (self.isMoving(motor)) {
				return 'fa-cog';
			} else if (motor.compliant) {
				return 'fa-bed';
			} else if (self.hotMotor(motor)) {
				return 'fa-exclamation-circle';
			} else {
				return 'fa-bolt';
			}
		};
		self.motorColor = function(motor, defaultColor) {
			if (self.hotMotor(motor) && !motor.compliant) {
				return 'text-danger';
			} else if (motor.compliant) {
				return 'text-muted';
			} else if (self.isMoving(motor)) {
				return defaultColor ? defaultColor : 'text-info';
			} else {
				return defaultColor ? defaultColor : 'text-success';
			}
		};

		self.test = function() {
			console.log(arguments);
		};
		self.isMoving = function(motor) {
			return !motor.compliant && Math.abs(motor.present_position - motor.goal_position) > 1;
		};
		
		//rotate motor whith dndn
		self.on('mount', function() {
			//Rotation by DND
			var ratio = (self.motor.upper_limit - self.motor.lower_limit)/600;
			self.root.querySelector(".motor").addEventListener('mousedown',function(e){
				self._start_position = self.motor.present_position;
			});
			try{
				var mc = new Hammer(self.root.querySelector(".angle"));
			}catch(e){
				alert(e);
			}
			mc.get('pan').set({ direction: Hammer.DIRECTION_VERTICAL });
			mc.on("panup pandown", function(e) {
				e.preventDefault();
				if(self.motor.compliant){
					Poppy.setCompliant(false, self.motor.name);
				}
				var goal1 = (self._start_position + e.deltaY*ratio) % 360;
				if(self.motor.lower_limit < self.motor.upper_limit){
					var goal = Math.max(self.motor.lower_limit,Math.min(self.motor.upper_limit,goal1));
				}else{
					var goal = Math.min(self.motor.lower_limit,Math.max(self.motor.upper_limit,goal1));
				}
				Poppy.moveTo(self.motor.name,goal); //setRegister(self.motor.name, 'goal_position', goal);
			});
			
			//rotation by wheel scroll
			function wheelRotation(evt){	
	    		if(self.motor.compliant){
					Poppy.setCompliant(false, self.motor.name);
				}
	    		
			    evt.preventDefault();	
			    var delta=evt.detail? evt.detail*(-120) : evt.wheelDeltaY; //check for detail first so Opera uses that instead of wheelDelta
				self._rotation += (delta > 0 ? -1 : 1);
				var goal = self.motor.goal_position + self._rotation;
				Poppy.moveTo(self.motor.name,goal); //Poppy.setRegister(self.motor.name, 'goal_position', goal);
			}
			 
			var mousewheelevt=(/Firefox/i.test(navigator.userAgent))? "DOMMouseScroll" : "mousewheel" //FF doesn't recognize mousewheel as of FF3.x
			 
			self.root.querySelector(".motor").addEventListener(mousewheelevt, wheelRotation, false);
		});
	});

	riot.tag('robot', document.getElementById('robotTpl').innerHTML, function(opts) {
		var self = this;
		// self.robot = {};
		self.motors = [];
		self.numeral = numeral;

		self.on('mount', function() {
			Poppy.trigger('robot.view.init');
		});

		Poppy.on("poppy.robot.updated", function(robot) {
			// self.robot = robot;
			if (self.motors.length != robot.motors.length) {
				self.motors = robot.motors;
			} else {
				self.motors.forEach(function(motor, i) {
					_.assign(motor, robot.motors[i]);
				});
			}
			self.update();
		});
	});

	riot.tag('primitive', document.getElementById('primitiveTpl').innerHTML, function(opts) {
		var self = this;
		self.primitive = opts.primitive;
		self.methods = [];
		self.properties = [];
		self.JSON = JSON;
		self._ = _;

		self.on('update', function() {
			if (this.primitive.methods) {
				if (self.primitive.methods.length != self.methods.length) {
					self.methods = self.primitive.methods.map(function(m) {
						return {
							'name' : m
						};
					});
				} else {
					self.primitive.methods.forEach(function(m, i) {
						self.methods[i].name = m;
					});
				}
			}
			if (this.primitive.properties) {
				if (self.properties.length != self.primitive.properties.length) {
					self.properties = self.primitive.properties;
				} else {
					self.primitive.properties.forEach(function(o, i, a) {
						_.assign(self.properties[i], o);
					});
				}
			}
		});

		self.toggle = function(e) {
			self._open = !self._open;
		};
		
		self.execute = function() {
			Poppy.execPrimitive(this.parent.primitive.primitive, this.name, {});
		};
		
		self.updateProp = function(e) {
			e.preventDefault();
			e.stopPropagation();

			console.log(this, e.target.value.value);
			Poppy.setPrimitiveProperty(self.primitive.primitive, this.property, JSON.parse(e.target.value.value));
		};

		self.start = function(e) {
			e.preventDefault();
			e.stopPropagation();
			Poppy.execPrimitive(self.primitive.primitive, 'start');
		};
		self.stop = function(e) {
			e.preventDefault();
			e.stopPropagation();
			Poppy.execPrimitive(self.primitive.primitive, 'stop');
		};
		self.pause = function(e) {
			e.preventDefault();
			e.stopPropagation();
			Poppy.execPrimitive(self.primitive.primitive, 'pause');
		};
		self.resume = function(e) {
			e.preventDefault();
			e.stopPropagation();
			Poppy.execPrimitive(self.primitive.primitive, 'resume');
		};
	});
	riot.tag('behavior', document.getElementById('behaviorTpl').innerHTML, function(opts) {
		var self = this;
		self.primitives = [];
		Poppy.on("poppy.robot.updated", function(robot) {
			if (self.primitives.length != robot.primitives.length) {
				self.primitives = robot.primitives;
			} else {
				self.primitives.forEach(function(primitive, i) {
					_.assign(primitive, robot.primitives[i]);
				});
			}
			;
			self.update();
		});
	});
	riot.tag('robot_title', document.getElementById('robotTitleTpl').innerHTML, function(opts) {
		var self = this;
		self.maxTemp = 0;
		self.connected = false;
		self.compliant = true;
		self.hot = false;
		self.ardent = false;
		self._url_open = false;
		self.url = Poppy.url;
		
		self.toggle_url = function(){
			self._url_open = !self._url_open;
		};
		
		self.change_url = function(e){
			if (e.keyCode == 13) {
				self._url_open = false;
			}
			Poppy.url = document.getElementById('poppy_url').value;
			sessionStorage.setItem("poppy_url",Poppy.url);
		};
		
		Poppy.on("poppy.robot.updated", function(robot) {
			self.maxTemp = robot.motors.map(function(m) {
				return m['present_temperature'];
			}).reduce(function(p, c) {
				return Math.max(p, c);
			}, 0);
			self.compliant = robot.motors.map(function(m) {
				return m['compliant'];
			}).reduce(function(p, c) {
				return p && c;
			}, true);
			self.hot = Poppy.isHot(self.maxTemp);
			self.ardent = Poppy.isArdent(self.maxTemp);
			//To be moved...
			if(self.ardent){
				document.getElementById("alarm").play();
			}else{
				document.getElementById("alarm").pause();
			}
			self.update();
		});
		Poppy.on("connected", function() {
			self.connected = true;
			self.update();
		});
		Poppy.on("disconnected", function() {
			self.connected = false;
			self.update();
		});
	});

	riot.tag('pmethod', '<div>{method}</div>', function(opts) {

		console.log(_.values(opts.method));
	});

	riot.mount('robot');
	riot.mount('behavior');
	riot.mount('robot_title');
})(this);