"use strict";
(function(global) {
	/** Functions called manually to help positioning motor block on picture */
	var draggies = [];
	function activateDND() {
		var draggableElems = document.querySelectorAll('li.motor');
		// array of Draggabillies
		// init Draggabillies
		for ( var i = 0, len = draggableElems.length; i < len; i++) {
			var draggableElem = draggableElems[i];
			draggableElem.style.position = "absolute";
			var draggie = new Draggabilly(draggableElem, {
			// options...
			});
			draggies.push(draggie);
		}
	}
	function motorCss() {
		console.log(_.map(document.getElementsByClassName('motor'), function(motor, i) {
			return [ '#', motor.id, "{top:", motor.style.top, "; left:", motor.style.left, ";}" ].join('');
		}).join('\n'));
	}

	/** Load Robot status and Poppy manager * */
	function getRobot() {
		getJSON(Poppy.url + '/robot.json', {
			success : function(data) {
				Poppy.update(data);
				Poppy.trigger('connected');
			},
			error : function(data) {
				Poppy.trigger('disconnected');
			}
		});
	}

	/** Poppy model object * */
	//var poppy_url = 'http://poppy.local:8080';
	//var poppy_url = 'http://172.17.98.218:8080';
	//var poppy_url = 'http://localhost:8080';
	//var poppy_url = 'http://192.168.1.4:8080';

	var Poppy = {
		url : sessionStorage.getItem("poppy_url") ? sessionStorage.getItem("poppy_url") : 'http://172.17.98.218:8080',//http://localhost:8080',
		update : function(robot) {
			Poppy.robot = robot;
			Poppy.trigger("poppy.robot.updated", robot);
		},
		setCompliant : function(compliant, motor) {
			if (motor == null) {
				for ( var k in Poppy.robot.motors) {
					Poppy.setCompliant(compliant, Poppy.robot.motors[k].name);
				}
			} else {
				postJSON(Poppy.url + '/motor/' + motor + '/register/compliant/value.json', compliant);
			}
		},
		setRegister : function(motor, register, value) {
			postJSON([ Poppy.url, '/motor/', motor, '/register/', register, '/value.json' ].join(''), value, {
				success : function(data) {
					// notifire({msg: [motor,'.',register," =
					// ",JSON.stringify(value),") OK"].join("")});
				},
				error : function(data) {
					notifire({
						msg : [ motor, '.', register, " = ", JSON.stringify(value), " Erreur !" ].join(""),
						types : 'danger',
					});
					console.log("fail", data);
				}
			});
		},
		execPrimitive : function(primitive, action, args) {
			if (args == null) {
				getJSON([ Poppy.url, '/primitive/', primitive, '/', action, '.json' ].join(''), {
					success : function(data) {
						notifire({
							msg : [ primitive, '.', action, "() OK" ].join("")
						});
					},
					error : function(data) {
						notifire({
							msg : [ primitive, '.', action, "() Erreur !" ].join(""),
							types : 'danger',
						});
						console.log("fail", data);
					}
				});
			} else {
				postJSON([ Poppy.url, '/primitive/', primitive, '/method/', action, '/args.json' ].join(''), args, {
					success : function(data) {
						notifire({
							msg : [ primitive, '.', action, "(", args, ") OK" ].join("")
						});
					},
					error : function(data) {
						notifire({
							msg : [ primitive, '.', action, "(", args, ") Erreur !" ].join(""),
							types : 'danger',
						});
						console.log("fail", data);
					}
				});
			}
			;
		},
		stopAllPrimitives : function() {
			for ( var k in Poppy.robot.primitives) {
				if (Poppy.robot.primitives[k].running && _.contains(Poppy.robot.primitives[k].methods, 'stop')) {
					Poppy.execPrimitive(Poppy.robot.primitives[k].primitive, 'stop');
				}
			}
		},
		setPrimitiveProperty : function(primitive, property, value) {
			postJSON([ Poppy.url, '/primitive/', primitive, '/property/', property, '/value.json' ].join(''), value, {
				success : function(data) {
					notifire({
						msg : [ primitive, '.', property, "=", JSON.stringify(value), " : OK !" ].join("")
					});
				},
				error : function(data) {
					notifire({
						msg : [ primitive, '.', property, "=", JSON.stringify(value), " Erreur !" ].join(""),
						types : 'danger',
					});
					console.log("fail", data);
				}
			});
		},
		isHot: function(present_temperature){
			return present_temperature > 50;
		},
		isArdent: function(present_temperature){
			return present_temperature > 55	;
		},
		_move_to :{},
		_applyPositions:function(){
			for(var m in Poppy._move_to){
				if(Poppy._move_to[m] != null){
					Poppy.setRegister(m, 'goal_position', Poppy._move_to[m]);
					delete(Poppy._move_to[m]);
				}
			}
		},
		moveTo: function(motor,position){
			Poppy._move_to[motor] = position;
		}
		
	};
	riot.observable(Poppy);
	getRobot();
	setInterval(getRobot, 250);
	setInterval(Poppy._applyPositions, 260);
	global.Poppy = Poppy;
})(this);