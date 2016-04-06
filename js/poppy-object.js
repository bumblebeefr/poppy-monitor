'use strict';
(function(global) {

  /** Poppy model object **/
  var Poppy = {
    refresher: null,

    // Url of poppy rest api REST api
    url: sessionStorage.getItem('poppy_url') ? sessionStorage.getItem('poppy_url'): 'http://localhost:8080',

    initUrl: function() {
      var anchor = window.location.hash;
      var hostname = window.location.hostname;
      var url;

      if (anchor != '') {
        // return rest url for URLs like: http://localhost/index.html#open=http://localhost:8080
        url = anchor.split('=')[1];
      } else if (hostname == '') {
        // for file:// URLs
        url = sessionStorage.getItem('poppy_url') ? sessionStorage.getItem('poppy_url'): 'http://localhost:8080';
      } else {
        url = 'http://' + hostname + ':8080';
      }
      sessionStorage.setItem('poppy_url', url);
      Poppy.url = url;
      return url
    },


    /** Load Robot status and Poppy manager * */
    getRobot: function() {
      getJSON(Poppy.url + '/robot.json', {
        success: function(data) {
          Poppy.update(data);
          Poppy.trigger('connected');
          Poppy.refresher = setTimeout(Poppy.getRobot, 10);
        },
        error: function(data) {
          Poppy.trigger('disconnected');
        }
      });
    },

    /**
     * Set Poppy.robot and trigger a 'poppy.robot.updated' event. Ussually
     * called back by Poppy.getRobot()
     */
    update: function(robot) {
      Poppy.robot = robot;
      Poppy._applyPositions();
      Poppy.trigger('poppy.robot.updated', robot);
    },

    /**
     * Set a motor/all motors compliant/not compliant
     *
     * @param compliant
     *            (Boolean) Value of the compliant register to be set.
     * @param motor
     *            (String) name of the targeted motor. If null all motors
     *            will be inmpacted.
     */
    setCompliant: function(compliant, motor) {
      if (motor == null) {
        for ( var k in Poppy.robot.motors) {
          Poppy.setCompliant(compliant, Poppy.robot.motors[k].name);
        }
      } else {
        postJSON(Poppy.url + '/motor/' + motor + '/register/compliant/value.json', compliant);
      }
    },

    /**
     * Set value of a motor register.
     *
     * @param motor
     *            (String) Name of the motor to be modified.
     * @param register
     *            (String) Name of the register to be set.
     * @param value
     *            (Whatever) Value to be set on the register.
     */
    setRegister: function(motor, register, value) {
      postJSON([ Poppy.url, '/motor/', motor, '/register/', register, '/value.json' ].join(''), value, {
        success: function(/* data */) {},
        error: function(data) {
          notifire({
            msg: [ motor, '.', register, ' = ', JSON.stringify(value), ' Erreur !' ].join(''),
            types: 'danger',
          });
          console.log('fail', data);
        }
      });
    },

    /**
     * Run a primitive associated with the robot instance.
     *
     * @param primitive
     *            (String) Name of the primitive.
     * @param action
     *            (String) Name of the method to be called.
     * @param args
     *            (Object) Named parameters to be passed to the method.
     */
    execPrimitive: function(primitive, action, args) {
      if (args == null) {
        args = {};
      }

      var argsToStr;
      try {
        argsToStr = JSON.stringify(args);
      } catch (err) {
        argsToStr = '';
      }

      postJSON([ Poppy.url, '/primitive/', primitive, '/method/', action, '/args.json' ].join(''), args, {
        success: function(data) {
          notifire({
            msg: [ primitive, '.', action, '(', argsToStr, ') OK' ].join('')
          });
        },
        error: function(data) {
          notifire({
            msg: [ primitive, '.', action, '(', argsToStr, ') Erreur !' ].join(''),
            types: 'danger',
          });
          console.log('fail', data);
        }
      });
    },

    /**
     * Stop all primitives by calling stop() method on all primitives that
     * have declared a 'stop' method in ther method list.
     */
    stopAllPrimitives: function() {
      for (var k in Poppy.robot.primitives) {
        if (Poppy.robot.primitives[k].running && _.contains(Poppy.robot.primitives[k].methods, 'stop')) {
          Poppy.execPrimitive(Poppy.robot.primitives[k].primitive, 'stop');
        }
      }
    },

    /**
     * Set value of a primitive property.
     *
     * @param primitive
     *            (String) Primitive name.
     * @param property
     *            (String) Name of the property.
     * @param value
     *            (Whatever) Value to be set.
     */
    setPrimitiveProperty: function(primitive, property, value) {
      postJSON([ Poppy.url, '/primitive/', primitive, '/property/', property, '/value.json' ].join(''), value, {
        success: function(data) {
          notifire({
            msg: [ primitive, '.', property, '=', JSON.stringify(value), ' : OK !' ].join('')
          });
        },
        error: function(data) {
          notifire({
            msg: [ primitive, '.', property, '=', JSON.stringify(value), ' Erreur !' ].join(''),
            types: 'danger',
          });
          console.log('fail', data);
        }
      });
    },

    /**
     * Check if the temperature value is considered 'Hot'.
     *
     * @param present_temperature
     *            (Number) Tempreture to be tested.
     * @returns {Boolean}
     */
    isHot: function(present_temperature) {
      return present_temperature > 50;
    },

    /**
     * Check if the temperature value is considered 'Too Hot'.
     *
     * @param present_temperature
     *            (Number) Tempreture to be tested.
     * @returns {Boolean}
     */
    isArdent: function(present_temperature) {
      return present_temperature > 55;
    },

    _move_to: {},
    _applyPositions: function() {
      for ( var m in Poppy._move_to) {
        if (Poppy._move_to[m] != null) {
          Poppy.setRegister(m, 'goal_position', Poppy._move_to[m]);
          delete (Poppy._move_to[m]);
        }
      }
    },

    /**
     * Send an order to move a motor. This order is not directly sent to
     * motor but is sent by the internale Poppy._applyPositions() method in
     * order to not overflow commmunication by sending tomanin position
     * orders.
     *
     * @param motor (String) Name of the motor.
     * @param position (Number) Goal position.
     */
    moveTo: function(motor, position) {
      Poppy._move_to[motor] = position;
    }

  };
  riot.observable(Poppy);

  global.Poppy = Poppy;
})(this);
