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
    if(typeof subject == 'string')
		return ChainerObjectFactory($._selector(subject));

    return ChainerObjectFactory([subject]);
}

// taken from the book "Secrets of the JavaScript Ninja" by John Resig: chapter 11 page 115-116
$._selector = function(query, element) {
    if(typeof element == 'undefined') {
		// TODO: Optimize #id
		
		
		// Optimize body
		if(query == 'body')
		    return document.body;
		return document.querySelectorAll(query);
	}
        

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
$._selector.counter = 0;

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

		// Take care of inheritance

        // Instantiate a base class (but only create the instance, 
        // don't run the init constructor) 
        initializing = true;
        var proto = new this();                // Inherit instance functions/properties
        initializing = false;

        // Take care of static methods and properties
        
        // Inherit static functions/properties
        for(var i in this) {
            ReturnedClass[i] = this[i];
        }
		// Override superclass in order to be relevent
        // Augment functions/properties from definition
		// Augment static functions/properties
		if('static' in definition)
		    this.obtain.call(ReturnedClass, definition['static']);
		// Augment instance functions/properties as static to proto, and then set
		//    ReturnedClass's prototype to proto (in the end of the function)
		this.obtain.call(proto, definition);
		delete definition;
        
        // Populate our constructed prototype object 
        ReturnedClass.prototype = proto;
        // Give instance function have access to static functions / variables
        ReturnedClass.prototype._Self = ReturnedClass;
        return ReturnedClass;
    }

	$.Object.extend = function(definition) {
	    // Augment static functions/properties
	    if("static" in definition) {
	        this.obtain.call(this, definition['static']);
	        delete definition['static'];
	    }
	
	    // Augment instance functions/properties
	    this.obtatin.call(this.prototype, definition)
	}
	
	$.Object.obtain = function(functions) {
	    for(i in functions)
	        this[i] = functions[i];
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
//    number of elements, do as many commands you want using chainning, and then call either the
//    value() function if you want a value to be returend, or the save() function in order to save
//    a copy of ChainerObject.
//
// ChainerObject is implementing a flyWeight design pattern inspired by Ext Core's fly, but the
//    difference is that instead of having two different methods - one for flyWeight and one that
//    isn't flyweighted, you the flyWeight and can save the flyWeight to another, saperate flyWeight
//    with no need to worry about conflicts
function ChainerObjectFactory(elements, id) {
    var id = id || '_0';

    if(!(id in ChainerObjectFactory.objects))
        ChainerObjectFactory.objects[id] = new ChainerObject();

    ChainerObjectFactory.objects[id].elements = elements;
    ChainerObjectFactory.objects[id].id = id;

 	// Resets the value() function
    ChainerObjectFactory.objects[id]._resetValue();
    return ChainerObjectFactory.objects[id];
}
ChainerObjectFactory.objects = {};

ChainerObject = $.Object.subclass({
    'init': function(elements) {
        if(typeof elements != "undefined")
        	this.elements = elements;

		// Reset the state of value function being changed
		this.valueFunctionChanged = false
		this.value = this._genericValue;
        return this;
    },
    // A generic value function. The idea is that chained function can modify that function so
    //    that value() is relevent to the last function in the chain.
    //    Note that it is only used per chian, it gets reset when a new chain is created
    //    DO NOT override this function!
    '_genericValue': function() {
        return this.elements;
    },
	// Sets the value function to the generic one if neccecery
	'_resetValue': function() {
	    if(this.valueFunctionChanged)
	        this.value = this._genericValue;
	
	    this.valueFunctionChanged = false;
	},
	// Sets the value function to another function
	'_setValue': function(fn) {
	    this.value = fn;
	    this.valueFunctionChanged = true;
	},
    // Note that save is actually clones the object.
    //    The name comes becuse users are going to use it in order to save the Chainerobject
    //    for later use.
    'save': function(id) {
        var id = id || ChainerObjectFactory.objects.length + 1;
        return ChainerObjectFactory(this.elements, id);
    },
    'delete': function() {
        delete ChainerObjectFactory.objects[this.id];
    }
});

//------------------------------------------------------------------
// Common functions that will be under the $. namespace

// Users can extend Dashcore n two ways: they can add static functions to the Dahscore library
//    by either doing something like this: $.staticFunction = function() {};,
//    or extend the ChainerObject by using the plugIn function, like this:
//    $.plugIn('firstFunction', function() {}[,Value function, overrides the default value function]).
//    plugIn('secondFunction')...

// PlugIn function: used to plug plugins into the library
$.plugIn = function(functionName, theFunction, valueOverrideFunction) {
    if(typeof valueOverrideFunction != 'function')
        delete valueOverrideFunction;

    ChainerObject.prototype[functionName] = function() {
        if(typeof valueOverrideFunction != "undefined")
		    this._setValue(valueOverrideFunction);
		else
		    this._resetValue();
		
		theFunction.apply(this, arguments);
        return this;
    }

	// Enable chaining
	return this;
}

// Require function: used to import libraries components
// require only imports file once, if the file was already imported then the function does nothing

var dashcorelibrary = 'dashcore';
$.Require = function(src, onload, onfailure) {
    // Check if file was already loaded
    var importedLength = this.importedFiles.length;
    for(var i = 0; i < importedLength; i++) {
        if(this.importedFiles[i] == src)
            return;
    }
    delete i, importedLength;

    // Inject the script to the document
    var head = document.getElementsByTagName("head")[0] || 
                document.documentElement, 
                script = document.createElement("script"); 
    script.type = "text/javascript"; 
    script.src = src; 

    // Set the script events
    if(onload)
        script.onload = onload;

	onfailure = onfailure || function() {
		throw('Dashcore.Include: the script '+src+' was failed to load');
    }
    script.onerror = onfailure;
    head.appendChild( script ); 
    head.removeChild( script ); 
}
$.Require.importedFiles = [];

// Expose the library
window.$ = $;
})();