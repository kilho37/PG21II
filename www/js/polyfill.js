// https://github.com/Financial-Times/polyfill-service/blob/master/polyfills/Object/assign/polyfill.js
if(!('assign' in Object)) {
    Object.assign = function assign(target, source) { // eslint-disable-line no-unused-vars
        for (var index = 1, key, src; index < arguments.length; ++index) {
            src = arguments[index];
            for (key in src) {
                if(Object.prototype.hasOwnProperty.call(src, key)) {
                target[key] = src[key];
                }
            }
        }
        return target;
    };
}
if(!Array.prototype.find) {
  Array.prototype.find = function(predicate) {
    if(this == null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if(typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if(predicate.call(thisArg, value, i, list)) {
        return value;
      }
    }
    return undefined;
  };
}
if(!Object.keys) {
  Object.keys = (function() {
    'use strict';
    var hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
        dontEnums = [
          'toString',
          'toLocaleString',
          'valueOf',
          'hasOwnProperty',
          'isPrototypeOf',
          'propertyIsEnumerable',
          'constructor'
        ],
        dontEnumsLength = dontEnums.length;

    return function(obj) {
      if(typeof obj !== 'function' && (typeof obj !== 'object' || obj === null)) {
        throw new TypeError('Object.keys called on non-object');
      }

      var result = [], prop, i;

      for (prop in obj) {
        if(hasOwnProperty.call(obj, prop)) {
          result.push(prop);
        }
      }

      if(hasDontEnumBug) {
        for (i = 0; i < dontEnumsLength; i++) {
          if(hasOwnProperty.call(obj, dontEnums[i])) {
            result.push(dontEnums[i]);
          }
        }
      }
      return result;
    };
  }());
}
// https://gist.github.com/ottonascarella/c874af2d3419a350772eaf05ec438135
Function.prototype.debounce = function(delay) {
	var outter = this,
		timer;
	return function() {
		var inner = this,
			args = [].slice.apply(arguments);
		clearTimeout(timer);
		timer = setTimeout(function() {
			outter.apply(inner, args);
		}, delay);
	};
};
// https://gist.github.com/ottonascarella/acdf36df33b4f911297d6be1d91e2d67
Function.prototype.throttle = function(delay) {
	var outter = this,
		timer, control = false;
	return function() {
        if(control) return;
        control = true;
		var inner = this,
			args = [].slice.apply(arguments);
		clearTimeout(timer);
		timer = setTimeout(function() {
			control = false;
			outter.apply(inner, args);
		}, delay);
	};
};