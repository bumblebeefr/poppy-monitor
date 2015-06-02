<behavior>
	<div class="behavior">
		<primitive each="{primitive in primitives}"></primitive>
	</div>
	<script>
		"use strict";
		var self = this;
		self.primitives = [];
		Poppy.on("poppy.robot.updated", function(robot) {
			if (self.primitives.length != robot.primitives.length) {
				self.primitives = robot.primitives;
			} else {
				self.primitives.forEach(function(primitive, i) {
					_.assign(primitive, robot.primitives[i]);
				});
			};
			self.update();
		});
	</script>
</behavior>
<primitive>
	<div class="panel { primitive.running ? 'panel-info' : 'panel-default'} primitive">
 			<div class="panel-heading" onclick={toggle}>
 				<button type="button" class="btn btn-default btn-xs" onclick="{start}" if={_.includes(primitive.methods,'start')} title="Start {primitive.primitive}">
				<i class="fa fa-play"></i> 
			</button>
 				<button type="button" class="btn btn-default btn-xs" onclick="{stop}" if={_.includes(primitive.methods,'stop')} title="Stop {primitive.primitive}">
				<i class="fa fa-stop"></i> 
			</button>
 				<button type="button" class="btn btn-default btn-xs" onclick="{pause}" if={_.includes(primitive.methods,'pause')} title="Pause {primitive.primitive}">
				<i class="fa fa-pause"></i> 
			</button>
 				<button type="button" class="btn btn-default btn-xs" onclick="{resume}" if={_.includes(primitive.methods,'resume')} title="Resume {primitive.primitive}">
				<i class="fa fa-eject fa-rotate-90"></i> 
			</button>
 				<i class="fa {_open ? 'fa-chevron-up' : 'fa-chevron-down'} pull-right"></i>
			{primitive.primitive} 
			<i if={primitive.running} class="fa fa-cog fa-spin"></i>
		</div>
		<div if={_open} class="panel-body">
			<div class="row">
				<div class="col-md-6">
					<div each="{methods}" >
						<button type="button" class="btn btn-default btn-xs" onclick={parent.execute}>
							<i class="fa fa-play-circle-o"></i> Execute {name}
						</button>	
					</div>
				</div>
				<div class="col-md-6">
					<div each="{properties}" >
						<form onsubmit={parent.updateProp}>
							<label>{property} : <small>{value}</small></label>
							 <div class="input-group input-group-sm">
						      <input type="text" class="form-control" value="{value}" name="value">
						      <span class="input-group-btn">
						        <button class="btn btn-default" type="submit" >Update</button>
						      </span>
						    </div><!-- /input-group -->
						</form>
					</div>
				</div>
			</div>
		</div>
	</div>
	<script>
		"use strict";
		var self = this;
		self.methods = [];
		self.properties = [];
		self.JSON = JSON;
		self._ = _;

		self.on('update', function() {
			if(self.primitive){
				if (self.primitive.methods) {
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
				if (self.primitive.properties) {
					if (self.properties.length != self.primitive.properties.length) {
						self.properties = self.primitive.properties;
					} else {
						self.primitive.properties.forEach(function(o, i, a) {
							_.assign(self.properties[i], o);
						});
					}
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
	</script>
</primitive>