/*
    Dashcore - Development version
    ------------------------------

    Why was Dashcore invented?

        The situation as it is today is that there are tons of JavaScript libraries.
        so why creating another one?
        
        First, it is a dashdoard widget JavaScript library, and there is a difference. 
        JavaScript on webpages is often done in a way so it will add certin functionality
        to the application. When developing a dashboard widget, JavaScript is the application.
        As I was working on a widget, I realised that developing for a dashboard widget is
        defferent. It requires a more advanced OOP capeabilities, thease capeabilities are one
        that JavaScript doesn't have, but can be emulated. The main purpose of this library is
        to make advanced OOP on JavaScript easy. This library is heavily inspired by the book
        "Pro JavaScript Design Patterns", written by Ross Harmes and Dustin Diaz.

        Second, some components are unique to dashboard, such as Preferences, Instance preferences
        and i18n.

        Third, other libraries have to deal with supporting other browser, which add an additional 
        overhead, this library doesn't because it doesn't need to.

        And Forth, when developing a library a lot of files is a problem because this makes a lot
        of HTTP requstes. This library use as much files as it can, in order make it as modular as
        it can.

        Sorry for my poor english, as you can see English isn't my native language, and it will
        affect my comments. I hope that you will enjoy using Dashcore.
*/

// This part may be confusing. Basically it's a closure.
// We make an anonymous function that called immediately and we use the fact that the scope of
//    a function is not global. that way, we can be sure that we don't pollute the global namespace

(function() {

//-----------------------------------------------------------------
// If there already is $ variable, we don't want it to interrupt our $ function. So, we save it
//    on a tempraory variable and decide what to do with it later when exposing the variables
if($ != undefined) {
    var __DASHCORE_OLD_$__ = $;
    delete $;
}
//------------------------------------------------------------------
// $ object. this object is the main namespace for our function. it's also a function that can
//    recive  either CSS selector or HtmlDOMElement and return a chainer object for the resaulting
//    elements
function $(subject) {
    /*if(typeof subject == 'string')
        return ChainerObject(this._selector);

    return ChainerObject([subject]);*/
}

// taken from the book "Secrets of the JavaScript Ninja" by John Resig: chapter 11 page 115-116
$._selector = function(query, element) {
    if(typeof element == 'undefined')
        return document.querySelectorAll(query);

    var oldID = element.id;
    element.id = "__DASHCORE_SELECTOR_ROOT_"+(++this.counter)+"__";

    try {
        return element.querySelectorAll("#"+element.id+" "+query);
    } catch(e){
        throw e;
    } finally {
        element.id = oldId;
    }
}
$._selector.couter = 0;

//------------------------------------------------------------------
// $.Object - The base object that every Dashcore object will inherit
//    $.Object provide support for multiple inheritance and interfaces
//    using $.Interface

// Implementation inspired by John Resig "Simple JavaScript Inheritance" (and sometimes identical
//    to it)
//    http://ejohn.org/blog/simple-javascript-inheritance/
(function(){
    var initializing = false;
    var interfaces = [];
    var is_SelfNeeded = /\bthis._Self\b/;

    // A private function used by $.Object and $.Interface
    //    Takes a callback function, parse it and returns an array of the function arguments
    function getFunctionArguments(callback) {
        match = getFunctionArguments.argsMatch.exec(callback.toString());
        match[1] = match[1].replace(getFunctionArguments.removeWhiteSpace, '');
        return match[1].split(',');
    }
    getFunctionArguments.argsMatch = /function(?:\s*)\(([\s\w\$,]*)\)/;
    getFunctionArguments.removeWhiteSpace = /\s*/g;

    $.Object = function() {};
    $.Object.subclass = function(definition) {
        // Creating a base class
        function ReturnedClass() {
            // All construction is actually done in the init method
            if ( !initializing && this.init )
                this.init.apply(this, arguments);
        }

        // Enforce the constructor to be what we expect
        ReturnedClass.constructor = ReturnedClass;

        // Instantiate a base class (but only create the instance, 
        // don't run the init constructor) 
        initializing = true;
        var proto = new this();
        initializing = false;

        // Take care of static methods and properties
        
        // Inherit static functions
        for(var i in this) {
            ReturnedClass[i] = this[i];
        }
        ReturnedClass.superclass = this;
        // Augment the new class static functions
        if("static" in definition) {
            for(var i in definition["static"]) {
                ReturnedClass[i] = definition["static"][i];
            }
        
            delete definition["static"];
        }

        // Take care of instance variables and functions
        
        // Copy the properties over onto the new prototype
        for(var name in definition) {
            if(is_SelfNeeded.test(definition[name].toString())) {
                proto[name] = (function(fn){
                    returnVal = function() {
                        return fn.apply(this, arguments);
                    }
                    returnVal.toString = function() {
                        return fn.toString();
                    }
                    return returnVal;
                })(definition[name]);
            } else {
                proto[name] = definition[name];
            }
        }
        
        // Populate our constructed prototype object 
        ReturnedClass.prototype = proto;
        // Give instance function have access to static functions / variables
        ReturnedClass.prototype._Self = ReturnedClass;
        return ReturnedClass;
    }

    $.Object.implement = function(interfacePointer) {
        // Gets the actual interface from the pointer
        var nargs = 0,
            definition = interfaces[interfacePointer];
    
        // Checks for static functions
        if(typeof definition['static'] != 'undefined') {
            for(i in definition['static']) {
                if(typeof this[i] == undefined)
                    throw("Dashcore.Interface - implement: static method "+i+
                                " does not exists");
    
                nargs = getFunctionArguments(this[i]).length
                if(nargs != definition['static'][i]) {
                    throw("Dashcore.Interface - implement: static method "+i+" has "+
                                nargs+" arguments instead of "+definition['static'][i]);
                }
            }
        }
        delete definition['static'];
    
        for(var i in definition) {
            if(typeof this.prototype[i] == 'undefined')
                throw("Dashcore.Interface - implement: method "+i+" does not exists");
    
            nargs = getFunctionArguments(this.prototype[i]).length
            if(nargs != definition[i]) {
                throw("Dashcore.Interface - implement: method "+i+" has "+nargs+
                            " arguments instead of "+definition[i]);
            }
        }
        delete definition;
        // Cache the resault in a static vatiable that can be 
        this._implementations.push(interfacePointer);
        return this;
    }

    $.Object._implementations = [];

    $.Object.prototype.implements = function(interfacePointer) {
        return (interfacePointer in this._Self._implementations);
    }
    
    $.Object._super = function(method) {
        Array.prototype.shift.call(arguments);
        
        if(method in this.superclass.prototype)
            return this.superclass.prototype[method].apply(this.prototype, arguments);

        return this.superclass[method].apply(this, arguments)
    }

    $.Object.toString = function() {
        if(typeof this.prototype.init != 'undefined')
            return this.prototype.init.toString();

        if('toString' in this.prototype)
            return this.prototype.toString();
    }

    $.Interface = function(definition) {
        // Store the actual interface in a private variable
        interfaces.push(this.Interface._parse(definition));
        // Return a pointer to the interface
        return interfaces.length - 1;
    }

    $.Interface._parse = function(definition) {
        var returnVal = {};

        if('static' in definition) {
            returnVal['static'] = this._parse(definition['static']);
            delete definition['static'];
        }

        for(var i in definition) {
            // Interface only support methods
            if(typeof definition[i] == "function") {
                // Interfaces only care about function name and number of arguments
                //    but it may change
                returnVal[i] = getFunctionArguments(definition[i]).length;
            }
        }
        return returnVal;
    }

})();

//------------------------------------------------------------------
// ChainerObject - The object used to chain commands. The idea of the API is that you select a
//    number of elements, do as many commands you want using chainning, and then call the value()
//    function if you want a value to be returend

//------------------------------------------------------------------
// Common functions that will be under the $. namespace

// PlugIn function: used to plug plugins into the library

// Namespace function: makes a plugin to be global 

// Import function: used to import libraries components

// Expose the library
window.$ = $;
})();