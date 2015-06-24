<robot>
	<ul class="motors poppy_picture">
		<motor each="{motors}" motor="{this}" />
	</ul>
	<script>
		"use strict";
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
	</script>
</robot>	

<robot_title>
	<h2>
		<span class="pull-right">
			<i class="fa {connected ? 'fa-link text-success':'fa-chain-broken text-danger'}" title="{connected ? 'Connected' : 'Disconnected'} - Click to édit url " onclick="{toggle_url}"></i>
			<span if="{connected}">
				<i if="{compliant}" class="fa fa-bed" title="All motors are compliant"></i>
				<span class="temperature {hot:hot} {ardent:ardent}" title="Hottest motor at {maxTemp}°C">
					<span class="icon">$</span>&thinsp;{maxTemp}<small>°C<sub>Max.</sub></small>
				</span>
			</span>
		</span>
		<img src="img/poppy-monitor.png" style="height:1em;"/> Monitoring Poppy 
	</h2>
	<input id="poppy_url" if="{_url_open}" type="text"  value="{url}" onkeyup="{change_url}" style="width:100%"/>
	<script>
		"use strict";
		var self = this;
		self.maxTemp = 0;
		self.connected = false;
		self.compliant = true;
		self.hot = false;
		self.ardent = false;
		self._url_open = false;
		Poppy.initUrl() ;
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
	</script>
</robot_title>