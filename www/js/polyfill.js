// https://github.com/Financial-Times/polyfill-service/blob/master/polyfills/Object/assign/polyfill.js
if(!('assign' in Object)) {
    Object.assign = function assign(target, source) { // eslint-disable-line no-unused-vars
        for (var index = 1, key, src; index < arguments.length; ++index) {
            src = arguments[index];
            for (key in src) {
                if (Object.prototype.hasOwnProperty.call(src, key)) {
                target[key] = src[key];
                }
            }
        }
        return target;
    };
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
        if (control) return;
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