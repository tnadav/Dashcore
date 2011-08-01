/*
    Dashcore	- Dashboard widget JavaScript library
	dashcore.js	- Core functionality of the library itself
				  Provides $.Object, $.Interface, $.Require,
				  $.File.read and $.Fun
	Copyright 2011 Nadav Tenenbaum
	Released under the LPGL 3 License 
    ----------------------------------------------
	This file is part of Dashcore.

	Dashcore is free software: you can redistribute it and/or modify
	it under the terms of the GNU Lesser General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	Dashcore is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Lesser General Public License for more details.
	
	You should have received a copy of the GNU Lesser General Public License
	along with Dashcore.  If not, see <http://www.gnu.org/licenses/>.
*/

// This part may be confusing. Basically it's a closure.
// We make an anonymous function that called immediately and we use the fact that the scope of
//	a function is not global. that way, we can be sure that we don't pollute the global namespace
(function Dashcore_core_initialization() {
// General initiailzation actions

//-----------------------------------------------------------------
// If there already is $ variable, we don't want it to interrupt our $ function. So, we save it
//	on a tempraory variable and decide what to do with it later when exposing the variables
if(typeof window.$ != 'undefined') {
	var __DASHCORE_OLD_$__ = window.$;
	delete window.$;
}

// User-friendly name for safari profiler
this.displayName = 'Dashcore core initialization';

//------------------------------------------------------------------
// Pre $ depandencies
//	This section contation a depandend version of $.Object and $.Chainable
//	The reason for this is that $.Chainable requires $.Object and $ requires chainable
//	The problem is that they exists on the $ namespace, so the sulotion is to create them
//	out of the namepsace and then move it to the $ namespace when it's ready

//------------------------------------------------------------------
// $.Object - The base object that every Dashcore object will inherit
//	$.Object provide support for multiple inheritance and interfaces
//	using $.Interface
//
// This peace of code is the minimal version, an extension to this code exsits after $ creation
//	at approximately line 290

// Implementation inspired by John Resig "Simple JavaScript Inheritance" (and sometimes identical
//	to it)
//	http://ejohn.org/blog/simple-javascript-inheritance/
var initializing = false;
var interfaces = [];

var $_Object = function() {};

$_Object.subclass = function(definition) {
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
	var proto = new this();				// Inherit instance functions/properties
	initializing = false;

	// Inherit static functions/properties
	for(var i in this) {
		ReturnedClass[i] = this[i];
	}

	// Override superclass in order to be relevent
	ReturnedClass.superclass = this;

	// Augment functions/properties from definition
	// Augment static functions/properties
	if('static' in definition)
		this.obtain.call(ReturnedClass, definition['static']);
	// Augment instance functions/properties as static to proto, and then set
	//	ReturnedClass's prototype to proto (in the end of the function)
	this.obtain.call(proto, definition);
	delete definition;

	// Populate our constructed prototype object 
	ReturnedClass.prototype = proto;
	// Give instance function have access to static functions / variables
	ReturnedClass.prototype._Self = ReturnedClass;
	return ReturnedClass;
}

$_Object.obtain = function(functions) {
	for(i in functions)
		this[i] = functions[i];
}
 
$_Object._super = function() {
	method = Array.prototype.shift.call(arguments);
	
	if(method in this.superclass.prototype)
		return this.superclass.prototype[method].apply(this.prototype, arguments);

	return this.superclass[method].apply(this, arguments)
}

$_Object.toString = function() {
	if(typeof this.prototype.init != 'undefined')
		return this.prototype.init.toString();

	if('toString' in this.prototype)
		return this.prototype.toString();
}

$_Object.extend = function(definition) {
	// Augment static functions/properties
	if("static" in definition) {
		this.obtain.call(this, definition['static']);
		delete definition['static'];
	}

	// Augment instance functions/properties
	this.obtatin.call(this.prototype, definition)
}

// Function compiler/decompiler
var funDecompileRegex    = /function\s*([\w_$]*)\(([\s\w_\$,\b]*)\)\s*\{([\w\W]*)\}/,
    funWhitespaces        = /\s/g;

$_Fun = {
    'decompile':function(fn) {
        var parsedFunction = funDecompileRegex.exec(fn.toString());

        // Remove whitespaces from the arguments list
        parsedFunction[2] = parsedFunction[2].replace(funWhitespaces, '');

        // Split the arguments list into an arrau and then ensure that if there are no 
        //    arguments, the result will be [], not [""]
        if(parsedFunction[2] != '')
            parsedFunction[2] = parsedFunction[2].split(',');
        else
            parsedFunction[2] = [];
        parsedFunction[3] = parsedFunction[3].replace(/^\s+|\s+$/g,"");

        return {
            'all': parsedFunction[0],
            'name': parsedFunction[1],
            // Parse arguments: first remove whitespace and then split by ,
            'args': parsedFunction[2],
            'content': parsedFunction[3],
            'compile': function() {
                return $.Fun.compile({'name': this.name,'args': this.args, 'content': this.content});
            }
        }
    },
    'compile': function(definition) {
        var FunctionArgs = definition.args || [];
        if (definition.name.trim().length != 0) {
            definition.name = ' '+definition.name+' ';
        }
        eval('var result = function '+definition.name+' ('+definition.args.join(', ')+') {'+definition.content+'}');
        return result;
    }
};

// An extension to JavaScript's String.replace to replace only what isn't
//    between quotes
function StringReplaceNotWithinQuotes(str, expression, callback) {
    var i = 0,
        di = -1,
        quoteCount = 0,
        dquoteCount = 0;
    // Preform the replace
    str = str.replace(expression, function(match) {
        // Found the index of the match
        matchIndex = arguments[arguments.length - 2]  - 1;
        
        // Count quotes and double quotes until the index of the match
        //    note the scope of i and di, both declared outside this callback
        //    this means that the loop starts from where it stoped before
        do {
            di = str.indexOf('"', di + 1);
            if(di == -1)
                break;
            if(str[di - 1] == '\\')
                continue;

            dquoteCount++;
        } while(di < matchIndex);

        do {
            i = str.indexOf("'", i + 1);
            if(i == -1)
                break;;
            if(str[i - 1] == '\\')
                continue;

            quoteCount++;
        } while(i < matchIndex);

        // If both quetes and double quetes count is even, it means that the match
        //    isn't between quotes or double quetes, return  the replacement
        if( (quoteCount % 2 == 0) && (dquoteCount % 2 == 0) ) {
            if(typeof callback == 'function')
                return callback.apply(this, arguments);
            return callback;
        }

        // match is between quotes, don't replace.
        return match;
    });
    return str;
}

//------------------------------------------------------------------
// $.Chainable: a wide selution for chaining. The content may vary: it may be HTML Elements
//	from a CSS Selector or an object returned from a function which can be chained.
//	The idea is that chainig is a searies of action which are performed by a praticular subject.
//
// $.Chainable is also implementing a flyWeight, which means it is more memory efficient. but
//	also means that if save a reference for the object, performed another chained task and then
//	use the saved reference, it will point to the last task content. In order to overcome this
//	problem, whenever you save the object to a reference, use the save method to ensure that the
//	$.Chainable content will remain the same.
//
// Another useful method is the value method: is can be changed based on the last function. By
//	defualt the value is the object content

/*
	TODO 
		- Decide if static methods sould be chainalyzed:
		it is clear that some functions like init should not be chainalyzed, but if there
		is a special use for chaining static function we can make an exception
		- Decide if value function changing is a welcome addition
		- Decide an appropriate name for the static init function
*/

var $_Chainable = $_Object.subclass({
	'static': {
		'init': function(value, id) {
			var id = id || 0;
			
			if(!(id in this._objects)) {
				this._objects[id] = new this();
			}

			this._objects[id].value = value;
			this._objects[id].id = id;
			

			// Resets the value() function
			this._objects[id]._resetValue();
			return this._objects[id];
		},
		'subclass': function(definition) {
			// When you subclass from a chainable object, the added methods are chainalyze automaticaly
			return this._super('subclass', this._chainalyze(definition));
		},
		'extend': function(definition) {
			// When you extend a chainable object, the added methods are chainalyze automaticaly
			return this._super('extend', this._chainalyze(definition));
		},
		'_chainalyze': function(definition) {
			var tempFunc;

			for(i in definition) {
				// Static methods aren't being chainalyzed
				if(i == 'static')
					continue;

				// Parse function to change the return to always return this
				// First decompile the function:
				tempFunc = $_Fun.decompile(definition[i]);
				
				// make sure that the function will always return this, but make sure it doesn't change strings!
				tempFunc.content = StringReplaceNotWithinQuotes(tempFunc.content, /return\s*([^;])*[;\n]/gm, 'return this;');
				tempFunc.content += "\nreturn this";            
				
				definition[i] = tempFunc.compile();
			}

			return definition;
		},
		'_objects': []
	},
	'init': function() {
		// Reset the state of value function being changed
		this.valueFunctionChanged = false
		this.returnValue = this._genericValue();
		return this;
	},
	// A generic value function. The idea is that chained function can modify that function so
	//	that value() is relevent to the last function in the chain.
	//	Note that it is only used per chian, it gets reset when a new chain is created
	//	DO NOT override this function!
	'_genericValue': function() {
		return this.value;
	},
	// Sets the value function to the generic one if neccecery
	'_resetValue': function() {
		if(this.valueFunctionChanged)
			this.returnValue = this._genericValue();

		this.valueFunctionChanged = false;
	},
	// Sets the value function to another function
	'_setValue': function(fn) {
		this.returnValue = fn;
		this.valueFunctionChanged = true;
	},
	// Note that save is actually clones the object.
	//	The name comes becuse users are going to use it in order to save the Chainerobject
	//	for later use.
	'save': function(id) {
		var id = id || this._Self._objects.length + 1;
		return this._Self.init(this.value, id);;
	},
	'delete': function() {
		delete ChainerObjectFactory.objects[this.id];
	},
	// Make the chainable object show it's value by default when printed
	'toString': function() {
		return this.returnValue.toString();
	}
});

// $ object. this object is the main namespace for our function. it's also a function that can
//    recive  either CSS selector or HtmlDOMElement and return a chainer object for the resaulting
//    elements
var $ = $_Chainable.subclass({
    'static': {
        // This is the code that runs when you call $
        'init': function(value) {
            if(typeof value == 'string')
                return this._super('init', $._selector(value));
			return this._super('init', [value]);
		},
		// A simple selectoer implementation, can be replaced with a complex one
		'_selector': function(query, element) {
		    if(typeof element == 'undefined') {
		        // TODO: Optimize #id

				// Optimize body
				if(query == 'body')
					return document.body;
				return document.querySelectorAll(query);
			}
			
			var oldID = element.id;
			element.id = "__DASHCORE_SELECTOR_ROOT_"+(++this._selector_counter)+"__";
			
			try {
			    return element.querySelectorAll("#"+element.id+" "+query);
			} catch(e){
			    throw e;
			} finally {
			    element.id = oldId;
			}
		},
		'_selector_counter': 0,
				
		// Move $_Object and $_Chainable to the right place
		'Object': $_Object,
		'Chainable': $_Chainable,
		'Fun': $_Fun
    }
});
// Now when theres $, we don't need $_Object and $_Chainable
delete $_Object, $_Chainable, $_Fun;

// The current version of $.Object was minimal, now extend it
// Interface functionality
$.Object._implementations = [];
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
	
	        nargs = this[i].length
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
	
	    nargs = this.prototype[i].length
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

$.Object.prototype.implements = function(interfacePointer) {
    return (interfacePointer in this._Self._implementations);
}

$.Interface = function(definition) {
    // Store the actual interface in a private variable
    interfaces.push(this.Interface._parse(definition));
    delete definition;
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
            returnVal[i] = definition[i].length;
        }
    }
    return returnVal;
}

//------------------------------------------------------------------
// Dynamic JavaScript loading mechanism

// Common variable
var requireExecutionQueue    = [],
    requireImportedFiles    = [],
    isQueueRunning            = false,
    requireNamespaces        = {},
	pages                    = {};

// Find dashcore directory: important for the Require function
//    dashcore directory is used as the $ namespace
var scriptTags = document.getElementsByTagName('script'),
    slength = scriptTags.length,
    isDashcoreDotJS = /\b\/?dashcore.js$/;

for(var i = 0; i< slength; i++) {
    if(isDashcoreDotJS.test(scriptTags[i].src)) {
        // Store dashcore directory in a private variable
        requireNamespaces['$'] = scriptTags[i].src.replace(isDashcoreDotJS, '');
        break;
    }
}
// Cleanup calculations
delete scriptTags, slength, isDashcoreDotJS;

// filterUrl function: parses the url and get the actual path
//	taken from the omgrequire jquery branch
function filterUrl(url) {
	if ( !/\./.test(url) || (/^([\w\d$]+)./.test(url) && !/\//.test( url ) && !/.js$/.test( url )) ) {
		url = url.replace(/\./g, "/").replace(/^([\w\d$]+)./, function(all, name) {
			return (requireNamespaces[name] || name) + "/";
		}) + ".js";
	}
	return url;
}

// parseFile function: find file dependancies and recursively execute the scripts
// Settings: Object{url, inputUrl, content, onload, afterDependencyQueued}
function parseFile(settings) {
    // First, find the files depandencies
	var dependancies = [];

    settings.content = settings.content.replace(parseFile.findDependancies, function(all, match) {
		if(!requireImportedFiles.hasOwnProperty(match))
		    dependancies.push(match);

        return "/* File "+match+" was imported */";
    });
    
    // Adds clusure to make the file local, and make sure $ is pointing to dashcore
    settings.content = "(function "+settings.inputUrl.replace(/[\.\-+\/]/g, '_')+"($) {\n"+settings.content+"\n})(Dashcore);";

    var length = dependancies.length;
    // If there are no dependancies, simply add current file to the queue
    if(length == 0) {
        // Check if the current file is already on the queue (Dependancies are added to the queue
        //    Instantly so if this file is other file's dependancy it is already added)
        var qLength = requireExecutionQueue.length,
            isFileFound = false;
        for(var i = 0; i < qLength; i++) {
            // Check if the file on the queue is this file by url
            if(requireExecutionQueue[i].url == settings.url) {
                // This file is in this queue
                requireExecutionQueue[i]['content'] = settings.content;    // Adds this file content to the queue
                isFileFound = true;
                
                // File was found, prevent from the loop to run again
                break;
            }
        }

        // If the file was not found in the queue
        if(!isFileFound) {
            // Add the file to the queue
            requireExecutionQueue.push(settings);
        }
		// Perform action after the dependency queued
		if(typeof settings.afterDependencyQueued == 'function')
			settings.afterDependencyQueued();
    } else {
		// Special action for last dependency
		if(typeof settings.afterDependencyQueued == 'function') {
		    var callback = (function(dependencies) {
		        var count    = 0,
		            pass    = settings;
		        return function() {
		            if(++count == dependencies) {
		                requireExecutionQueue.push(settings);
		                settings.afterDependencyQueued();
		            }
		                
		        }
		    })(length);
		} else {
		    var callback = (function(dependencies) {
		        var count    = 0,
		            pass    = settings;
		        return function() {
		            if(++count == dependencies) {
		                requireExecutionQueue.push(settings);
		            }
		        }
		    })(length);
		}
        for(var i = 0; i<length; i++)
            $.Require(dependancies[i], null, callback);
    }
}
parseFile.findDependancies = /^#\s?Require\s*([a-z0-9\.\/$]*)/gmi

function loadNextFile() {
	// Stop queue there are no files in the queue or the next file hadn't loaded yet
    if(requireExecutionQueue.length == 0 || requireExecutionQueue[0].content === false) {
        isQueueRunning = false;
        return;
    }
	isQueueRunning = true;
	// Get the next file in the queue
	var nextFile = requireExecutionQueue.shift();
	// Execute the file
	try {
	    eval(nextFile.content);
	} catch(e) {
	    throw nextFile.inputUrl+": "+e.name+": "+e.message+" on line "+e.line;
	}
	// After the file had finally loaded:
	// Execute onload event
	if(typeof nextFile.onload == 'function')
	    nextFile.onload();
	delete nextFile;
	// load next file
	loadNextFile();
}
// Require function: used to import libraries components
// require only imports file once, if the file was already imported then the function does nothing
$.Require = function(inputUrl, onload, afterDependencyQueued) {
    url = filterUrl(inputUrl);
    // Check if file was already loaded
    if(url in requireImportedFiles) {
        if(typeof onload == 'function')
            onload();
        return;
    }

	requireImportedFiles[url] = true;

	$.File.read(url, function(content) {
        parseFile({'url': url, 'inputUrl': inputUrl, 'content': content, 'onload': onload,
					'afterDependencyQueued': afterDependencyQueued});
		// Try to start the execution queue
		if(!isQueueRunning)
		    loadNextFile();
    });
}
$.Require.importedFiles = [];

$.Namespace = {};
$.Namespace.add = function(ns, url) {
    requireNamespaces[ns] = url;
}

$.Namespace.Delete = function(ns) {
    delete requireNamespaces[NS];
}

// $.File.read function: asynchronous way of loading plain text files to a variables using
//    iframe. while using AJAX appears to be a more simple solution, it can't be done locally,
//    and in the widget enviorment, everything MUST be local
//
//    the function onload first argument will be the content of the file, and this will point
//    to the actual iframe
$.File = {};
$.File.read = function(path, onloadfn, timeout) {
    // Create the iframe
    var iframe    = document.createElement('iframe'),
        timeout    = timeout || 3000,                    // 3 seconds
		handler,
		thisDate = new Date(),
		thisTime = thisDate.getTime();

	iframe.style.display = 'none';                    // Make the iframe invisiable
	iframe.src = path;


    iframe.onload = function() {
        iframe.contentWindow.location.replace(iframe.src);    // prevent caching in firefox
        // Clear all the mess
        window.clearTimeout(handler);
        iframe.onload = null;
        if(typeof onloadfn != 'undefined')
            onloadfn.call(iframe, iframe.contentDocument.body.textContent);
        document.documentElement.removeChild(iframe);
    }
    document.documentElement.appendChild(iframe);
    handler = window.setTimeout(function() {
        throw "The file "+path+
                " has taken to long to be loaded (timeout = "+timeout+")";
    }, timeout);
}

// Expose the library
window.$ = window.Dashcore = $;
})();