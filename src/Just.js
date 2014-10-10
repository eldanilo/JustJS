// Base.js, version 1.1a, Copyright 2006-2010, Dean Edwards
// License: http://www.opensource.org/licenses/mit-license.php 
var Base=function(){};Base.extend=function(t,e){var n=Base.prototype.extend;Base._prototyping=!0;var r=new this;n.call(r,t),r.base=function(){},delete Base._prototyping;var o=r.constructor,i=r.constructor=function(){if(!Base._prototyping)if(this._constructing||this.constructor==i)this._constructing=!0,o.apply(this,arguments),delete this._constructing;else if(null!==arguments[0])return(arguments[0].extend||n).call(arguments[0],r)};return i.ancestor=this,i.extend=this.extend,i.forEach=this.forEach,i.implement=this.implement,i.prototype=r,i.toString=this.toString,i.valueOf=function(t){return"object"==t?i:o.valueOf()},n.call(i,e),"function"==typeof i.init&&i.init(),i},Base.prototype={extend:function(t,e){if(arguments.length>1){var n=this[t];if(n&&"function"==typeof e&&(!n.valueOf||n.valueOf()!=e.valueOf())&&/\bbase\b/.test(e)){var r=e.valueOf();e=function(){var t=this.base||Base.prototype.base;this.base=n;var e=r.apply(this,arguments);return this.base=t,e},e.valueOf=function(t){return"object"==t?e:r},e.toString=Base.toString}this[t]=e}else if(t){var o=Base.prototype.extend;Base._prototyping||"function"==typeof this||(o=this.extend||o);for(var i={toSource:null},s=["constructor","toString","valueOf"],a=Base._prototyping?0:1;u=s[a++];)t[u]!=i[u]&&o.call(this,u,t[u]);for(var u in t)i[u]||o.call(this,u,t[u])}return this}},Base=Base.extend({constructor:function(){this.extend(arguments[0])}},{ancestor:Object,version:"1.1",forEach:function(t,e,n){for(var r in t)void 0===this.prototype[r]&&e.call(n,t[r],r,t)},implement:function(){for(var t=0;t<arguments.length;t++)"function"==typeof arguments[t]?arguments[t](this.prototype):this.prototype.extend(arguments[t]);return this},toString:function(){return String(this.valueOf())}});

/**
 * 
 * JustJS, version 0.1, Copyright 2014 by Daniel Schlessmann <info@eldanilo.de>
 * License: http://www.opensource.org/licenses/mit-license.php
 * 
 * Please have a look at the README for more information.
 * 
 */
var JustJS = {
    // Document Loaded/Ready Handling, originally from: https://github.com/jfriend00/docReady
    readyLoader: {
        listeners:  [],
        fired:      false,
        registered: false,
        fire: function() {
            // restrict to one call only
            if(!JustJS.readyLoader.fired) {
                JustJS.readyLoader.fired = true;
                // call registered listeners
                for(var i = 0; i < JustJS.readyLoader.listeners.length; i++) {
                    JustJS.readyLoader.listeners[i].fn.call(window, JustJS.readyLoader.listeners[i].args);
                }
                JustJS.readyLoader.listeners = [];
            }
        },
        readyStateChanged: function() {
            if(document.readyState === 'complete') {
                JustJS.readyLoader.ready();
            }
        }
    },
    ready: function( callback, arguments ) {
        // if the readyLoader has already fired, call the callback asynchronously as soon as possible
        if(JustJS.readyLoader.fired) {
            setTimeout(function() { callback(arguments); }, 1);
            return;
        // otherwise add the callback to the list
        } else {
            JustJS.readyLoader.listeners.push({ fn: callback, args: arguments });
        }
        // if the document is already ready, execute loader.fire
        if(document.readyState === 'complete') {
            setTimeout(JustJS.readyLoader.fire, 1);
        // otherwise if we don't have event handlers registered, do this now
        } else if(!JustJS.readyLoader.registered) {
            if(document.addEventListener) {
                // first choice is DOMContentLoaded event
                document.addEventListener('DOMContentLoaded', JustJS.readyLoader.fire, false);
                // backup is window load event
                window.addEventListener('load', JustJS.readyLoader.fire, false);
            } else {
                // must be IE
                document.attachEvent('onreadystatechange', JustJS.readyLoader.readyStateChanged);
                window.attachEvent('onload', JustJS.readyLoader.fire);
            }
            JustJS.readyLoader.registered = true;
        }
    },
    // Holds all transformation and animation stuff, concept originally from:
    // http://gabrieleromanato.name/javascript-implementing-the-fadein-and-fadeout-methods-without-jquery/
    fx: {
        worker: {
            animate: function(options) {
                var start   = new Date();

                var tick    = function() {
                    var timePassed = new Date() - start;
                    var progress = timePassed / options.duration;
                    if (progress > 1) {
                        progress = 1;
                    }
                    options.progress = progress;
                    var delta = options.delta(progress);
                    options.step(delta);
                    if (progress === 1) {
                        if(typeof options.complete === 'function') {
                            options.complete();
                        }
                    } else {
                        (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 10);
                    }
                };
                tick();
            }
        },
        easing: {
            linear: function(progress) {
                return progress;
            },
            quadratic: function(progress) {
                return Math.pow(progress, 2);
            },
            swing: function(progress) {
                return 0.5 - Math.cos(progress * Math.PI) / 2;
            },
            circ: function(progress) {
                return 1 - Math.sin(Math.acos(progress));
            },
            back: function(progress, x) {
                return Math.pow(progress, 2) * ((x + 1) * progress - x);
            },
            bounce: function(progress) {
                for (var a = 0, b = 1, result; 1; a += b, b /= 2) {
                    if (progress >= (7 - 4 * a) / 11) {
                        return -Math.pow((11 - 6 * a - 11 * progress) / 4, 2) + Math.pow(b, 2);
                    }
                }
            },
            elastic: function(progress, x) {
                return Math.pow(2, 10 * (progress - 1)) * Math.cos(20 * Math.PI * x / 3 * progress);
            }
        },
        animate: function( element, properties, options) {
            // use swing as default
            if(!options.easing) {
                options.easing = 'linear';
            }
            for(var property in properties) {
                // give each property-animation its own closure
                (function(property) {
                    // initial values
                    var pixels  = false;
                    var start   = null;

                    // determine start by property
                    switch(property) {
                        case 'width':
                        case 'height':
                        case 'top':
                        case 'right':
                        case 'bottom':
                        case 'left':
                        pixels  = true;
                        start   = JustJS.dom.getPropertyAsPixelValue( element, property );
                        break;

                        case 'opacity':
                        start   = JustJS.dom.getPropertyAsPixelValue( element, property );
                        break;
                    }

                    var to = [ '', '', '', '' ], toNum;
                    if(typeof properties[property] === 'number') {
                        toNum   = properties[property];
                    } else {
                        to      = properties[property].match(/(\+|\-)?\=?(\d+)(\.\d+)?/);
                        toNum   = parseInt(to[2], 10);
                        if(to[3]) {
                            toNum   += parseFloat(to[3]);
                        }
                    }

                    JustJS.fx.worker.animate({
                        duration:   options.duration,
                        delta:      function(progress) {
                            progress = this.progress;
                            return JustJS.fx.easing[options.easing](progress);
                        },
                        complete:   function() {
                            if(typeof options.complete === 'function') {
                                options.complete();
                            }
                        },
                        step:       function(delta) {
                            // +/-
                            if(to[1]) {
                                if(to[1] === '+') {
                                    element.style[property] = (start + delta * toNum) + (pixels ? 'px' : '');
                                } else {
                                    element.style[property] = (start - delta * toNum) + (pixels ? 'px' : '');
                                }
                            } else {
                                element.style[property] = start + ((toNum - start) * delta) + (pixels ? 'px' : '');
                            }
                        }
                    });
                })(property);
            }
        },
        fadeIn: function( element, options ) {
            element.style.opacity = 0;
            if(JustJS.dom.getPropertyValue( element, 'display' )    === 'none') {
                element.style.display       = 'block';
            }
            if(JustJS.dom.getPropertyValue( element, 'visibility' ) === 'hidden' ) {
                element.style.visibility    = 'visible';
            }
            JustJS.fx.animate(element, {
                opacity: '1.0' 
            },{
                easing: (!options.easing ? 'linear' : options.easing),
                duration: options.duration,
                complete: function() {
                    element.style.opacity = '';
                    if(typeof options.complete === 'function') {
                        options.complete();
                    }
                }
            });
        },
        fadeOut: function( element, options ) {
            JustJS.fx.animate( element, 
                {   opacity: '0' }, 
                {
                    easing: (!options.easing ? 'linear' : options.easing),
                    duration: options.duration,
                    complete: function() {
                        element.style.display = 'none';
                        element.style.opacity = '';
                        if(typeof options.complete === 'function') {
                            options.complete();
                        }
                    }
                }
            );
        }
    },
    /**
     * Provides DOM functionality
     */
    dom: {
        swapStylesTemporary: function( element, properties, callback, args ) {
            var retVal, property, old = {};
            if(typeof callback === 'function') {

                // save old & set new values
                for(property in properties) {
                    old[ property ]             = element.style[ property ];
                    element.style[ property ]   = properties[ property ];
                }
                retVal = callback.apply( this, args || [] );
                // restore old values
                for(property in properties) {
                    element.style[ property ]   = old[ property ];
                }

            }
            return retVal;
        },
        // source: http://javascript.info/tutorial/styles-and-classes-getcomputedstyle
        __ie_getCurrentStylePropertyAsPixelValue: function( element, prop ) {
            var pixels = /^\d+(px)$/i;
            var value = element.currentStyle[prop] || 0;

            if(pixels.test(value)) {
                return value;
            }

            // we use 'left' property as a place holder so backup values
            var leftCopy        = element.style.left;
            var runtimeLeftCopy = element.runtimeStyle.left;

            // assign to runtimeStyle and get pixel value
            element.runtimeStyle.left = element.currentStyle.left;
            element.style.left = (prop === "fontSize") ? "1em" : value;
            value = element.style.pixelLeft + "px";

            // restore values for left
            element.style.left = leftCopy;
            element.runtimeStyle.left = runtimeLeftCopy;

            return value;
        },
        getPropertyAsPixelValue: function( element, prop ) {
            if(window.getComputedStyle) {
                var styles  = getComputedStyle( element, null );
                return parseInt(styles[prop].match(/-?\d+(\.\d+)?/)[0], 10);
            } else {
                return __ie_getCurrentStylePropertyAsPixelValue( element, prop );
            }
        },
        getPropertyValue: function( element, prop ) {
            if(window.getComputedStyle) {
                var styles  = getComputedStyle( element, null );
                return styles[prop];
            } else {
                return element.currentStyle[prop];
            }
        },
        width: function( element ) {
            var width = JustJS.dom.outerWidth( element );

            if(width > 0) {
                if(window.getComputedStyle) {
                    var styles  = getComputedStyle( element, null );
                    width -= parseInt(styles.borderLeftWidth, 10);
                    width -= parseInt(styles.borderRightWidth, 10);
                    width -= parseInt(styles.paddingLeft, 10);
                    width -= parseInt(styles.paddingRight, 10);
                } else {
                    // IE < 9.0
                    width -= parseInt(JustJS.dom.__ie_getCurrentStylePropertyAsPixelValue(element, 'borderLeftWidth'), 10);
                    width -= parseInt(JustJS.dom.__ie_getCurrentStylePropertyAsPixelValue(element, 'borderRightWidth'), 10);
                    width -= parseInt(JustJS.dom.__ie_getCurrentStylePropertyAsPixelValue(element, 'paddingLeft'), 10);
                    width -= parseInt(JustJS.dom.__ie_getCurrentStylePropertyAsPixelValue(element, 'paddingRight'), 10);
                }
            }
            return width;
        },
        innerWidth: function( element ) {
            var width = JustJS.dom.outerWidth( element );

            if(width > 0) {
                if(window.getComputedStyle) {
                    var styles  = getComputedStyle( element, null );
                    width -= parseInt(styles.borderLeftWidth, 10);
                    width -= parseInt(styles.borderRightWidth, 10);
                } else {
                    // IE < 9.0
                    width -= parseInt(JustJS.dom.__ie_getCurrentStylePropertyAsPixelValue(element, 'borderLeftWidth'), 10);
                    width -= parseInt(JustJS.dom.__ie_getCurrentStylePropertyAsPixelValue(element, 'borderRightWidth'), 10);
                }
            }
            return width;
        },
        outerWidth: function( element, includeMargin ) {
            var styles, width = element.offsetWidth ? element.offsetWidth : 0;

            if(width === 0) {
                if(window.getComputedStyle) {
                    styles  = getComputedStyle( element, null );
                } else {
                    styles  = element.currentStyle;
                }

                // check if the element is hidden
                if( /^(none|table(?!-c[ea]).+)/.test(styles.display) ) {
                    // swap attributes and get the width, then swap back
                    width = JustJS.dom.swapStylesTemporary( element, 
                        { 
                            position: 'absolute', display: 'block', visibility: 'hidden' 
                        }, function() {
                            return JustJS.dom.outerWidth( element );
                        });
                }
                // if width is still 0 fall back to css values
                if(width === 0) {
                    if(styles) {
                        width = parseInt(styles.width, 10);
                        width += parseInt(styles.borderLeftWidth, 10);
                        width += parseInt(styles.borderRightWidth, 10);
                        width += parseInt(styles.paddingLeft, 10);
                        width += parseInt(styles.paddingRight, 10);
                    }
                }
            }

            if(includeMargin === true) {
                if(!styles) {
                    if(window.getComputedStyle) {
                        styles  = getComputedStyle( element, null );
                    } else {
                        styles  = element.currentStyle;
                    }
                }
                width += parseInt(styles.marginLeft, 10);
                width += parseInt(styles.marginRight, 10);
            }
            return width;
        },
        height: function( element ) {
            var height = JustJS.dom.outerHeight( element );

            if(height > 0) {
                if(window.getComputedStyle) {
                    var styles  = getComputedStyle( element, null );
                    height -= parseInt(styles.borderTopWidth, 10);
                    height -= parseInt(styles.borderBottomWidth, 10);
                    height -= parseInt(styles.paddingTop, 10);
                    height -= parseInt(styles.paddingBottom, 10);
                } else {
                    // IE < 9.0
                    height -= parseInt(JustJS.dom.__ie_getCurrentStylePropertyAsPixelValue(element, 'borderTopWidth'), 10);
                    height -= parseInt(JustJS.dom.__ie_getCurrentStylePropertyAsPixelValue(element, 'borderBottomWidth'), 10);
                    height -= parseInt(JustJS.dom.__ie_getCurrentStylePropertyAsPixelValue(element, 'paddingTop'), 10);
                    height -= parseInt(JustJS.dom.__ie_getCurrentStylePropertyAsPixelValue(element, 'paddingBottom'), 10);
                }
            }
            return height;
        },
        innerHeight: function( element ) {
            var height = JustJS.dom.outerHeight( element );

            if(height > 0) {
                if(window.getComputedStyle) {
                    var styles  = getComputedStyle( element, null );
                    height -= parseInt(styles.borderTopWidth, 10);
                    height -= parseInt(styles.borderBottomWidth, 10);
                } else {
                    // IE < 9.0
                    height -= parseInt(JustJS.dom.__ie_getCurrentStylePropertyAsPixelValue(element, 'borderTopWidth'), 10);
                    height -= parseInt(JustJS.dom.__ie_getCurrentStylePropertyAsPixelValue(element, 'borderBottomWidth'), 10);
                }
            }
            return height;
        },
        outerHeight: function( element, includeMargin ) {
            var styles, height = element.offsetHeight ? element.offsetHeight : 0;

            if(height === 0) {
                var styles;
                if(window.getComputedStyle) {
                    styles  = getComputedStyle( element, null );
                } else {
                    styles  = element.currentStyle;
                }

                // check if the element is hidden
                if( /^(none|table(?!-c[ea]).+)/.test(styles.display) ) {
                    // swap attributes and get the height, then swap back
                    height = JustJS.dom.swapStylesTemporary( element, 
                        { 
                            position: 'absolute', display: 'block', visibility: 'hidden' 
                        }, function() {
                            return JustJS.dom.outerHeight( element );
                        });
                }
                // if height is still 0 fall back to css values
                if(height === 0) {
                    if(styles) {
                        height = parseInt(styles.height, 10);
                        height += parseInt(styles.paddingTop, 10);
                        height += parseInt(styles.paddingBottom, 10);
                        height += parseInt(styles.borderTopWidth, 10);
                        height += parseInt(styles.borderBottomWidth, 10);
                    }
                }
            }

            if(includeMargin === true) {
                if(!styles) {
                    if(window.getComputedStyle) {
                        styles  = getComputedStyle( element, null );
                    } else {
                        styles  = element.currentStyle;
                    }
                }
                width += parseInt(styles.marginTop, 10);
                width += parseInt(styles.marginBottom, 10);
            }
            return height;
        },
        offset: function( element ) {
            var r = element.getBoundingClientRect();

            return {
                top:    r.top +  document.body.scrollTop, 
                left:   r.left + document.body.scrollLeft
            };
        },
        hasClass: function( element, className ) {
            var regex   = new RegExp('(^|\\s+)'+className+'(\\s+|$)', 'g');
            return regex.test(element.className);
        },
        toggleClass: function( element, className ) {
            if( !JustJS.dom.removeClass(element, className) ) {
                if(element.className.length > 0) {
                    element.className += ' '+className;
                } else {
                    element.className = className;
                }
            }
            return;
        },
        removeClass: function( element, className ) {
            var r, result  = false;
            
            var regex   = new RegExp('(^|\\s+)'+className+'(\\s+|$)', 'g');
            while((r = regex.exec(element.className)) !== null) {
                // beginning of string
                if(r[0].length === 0 && r[2].length > 0) {
                    element.className = 
                        element.className.substring(r[0].length);
                // end of string
                } else if(r[0].length > 0 && r[2].length === 0) {
                    element.className = 
                        element.className.substring(0, r.index);
                // middle of string
                } else {
                    element.className = 
                        element.className.substring(0, r.index)
                        + element.className.substring((r.index+r[0].length-1));
                }
                if(!result) {
                    result = true;
                }
            }
            return result;
        },
        addClass: function( element, className ) {
            if( !JustJS.dom.hasClass( element, className ) ) {
                if(element.className.length > 0) {
                    element.className += ' '+className;
                } else {
                    element.className = className;
                }
            }
        }
    }
};