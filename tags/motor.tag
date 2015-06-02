<position>
	<script>
		"use strict";
	
		/** Tag def **/
		var self = this;
		self.motor = opts.motor;
		self.dodrag = function(){
			console.log(arguments);
		};
		self.rotate = function(e) {
			e.preventDefault();
			console.log(e, this);
		};
		self.on('update', function() {
			this.root.innerHTML = [ '<svg width="32" height="32">', '<circle cx="16" cy="16" r="15" style="stroke:none; fill:#CCC"/>', '<path d="', svg_arc_path(16, 16, 15, self.motor.lower_limit, self.motor.upper_limit), '" style="stroke:none; fill:#AAA;stroke:#888; opacity:0.5; stroke-width:1;"/>', '<line x1="16"  y1="16" x2="32"   y2="16" style="stroke:#444; stroke-width:2;" transform="rotate(', self.motor.goal_position, ',16,16)"/>', '<line x1="16"  y1="16" x2="32"   y2="16" style="stroke:#F00; stroke-width:2;" transform="rotate(', self.motor.present_position, ',16,16)"/>', '</svg>' ].join('\n');
		});
	
	</script>
</position>
<motor>
	<li class="motor {hotMotor(motor) ? 'hot' : ''} {ardentMotor(motor) ? 'ardent' : ''}" id="motor_{motor.name}">
		<div class="name " title="Moteur n°{motor.id}">
			<i class="fa {motorIcon(motor)} {motorColor(motor)} {fa-spin:isMoving(motor) != 0}" onclick="Poppy.setCompliant({motor.compliant ? 'false' : 'true' },'{motor.name}')" title="{motor.compliant ? 'Moteur inactif, cliquer pour l`activer' : 'Moteur actif, cliquer pour le désactiver'}"></i> 
			{motor.name} 
		</div>
		<!-- <div class="angle" style="transform:rotate({numeral(motor.present_position).format('0.00')}deg)">&nbsp;</div> -->
			<div class="angle" onmousewheel="{rotate}" draggable="draggable" onclick="{dodrag}" title="Drag Up/Down or Scroll to rotate">
				<position motor="{motor}" />
		</div>
		<div class="detail" onclick={test}>
		 <span class="{motorColor(motor,'no')}"><span class="icon">$</span> {motor.present_temperature}°C</span><br>
		 <i class="fa fa-compass"></i> {numeral(motor.present_position).format('0.0')}°<br/>
		
			 <div class="more">
			<div style="border-bottom:dotted 1px #CCC;max-height:3px;margin-bottom:3px;">&nbsp;</div>
			<small>Course : {numeral(motor.lower_limit).format('0')}° {numeral(motor.upper_limit).format('0')}°</small><br/>
			<small>Destination : {numeral(motor.goal_position).format('0.0')}°</small><br/>
			<small>Tension : {numeral(motor.present_voltage).format('0.0')}V</small><br/>
			<small>Vitesse : {numeral(motor.present_speed).format('0.0')}</small><br/>
			<small>Couple max : {numeral(motor.torque_limit).format('0')}%</small><br/>
			<small>Charge : {numeral(motor.present_load).format('0.0')}</small><br/>
		 </div> 
		 </div>	
	</li>


	<script>
		"use strict";
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
	</script>
</motor>