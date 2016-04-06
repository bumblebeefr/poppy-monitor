"use strict";

/**
 *
 * @param centerX
 * @param centerY
 * @param radius
 * @param angleInDegrees
 * @returns {Array}
 */
function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  var angleInRadians = (angleInDegrees) * Math.PI / 180.0;
  var x = centerX + radius * Math.cos(angleInRadians);
  var y = centerY + radius * Math.sin(angleInRadians);
  return [ x, y ];
}

/**
 * Generate svg path to trace a "pie" from angles.
 * @param centerX
 * @param centerY
 * @param radius
 * @param low
 * @param up
 * @returns
 */
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
