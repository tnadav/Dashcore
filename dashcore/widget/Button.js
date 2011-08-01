/*
    Dashcore	- Dashboard widget JavaScript library
	Button.js	- Wraps AppleButton
	Require as	- $.widget.Button
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

$.Buttons = $.Object.subclass({
    'static': {
        // Static variables:
        'buttons': {},
        'appleButtons': {},    
        'styles': {},
        'directory': 'buttons/',

        // Static functions
        'add': function(key, id, label, style, callback) {
            if(arguments.length == 1) {
                // Add many buttons
                for(var i in key)
                    this.add(i, key[i].id, key[i].label, key[i].style, key[i].callback);
                return;
            }
    
            // Add one button
            this.buttons[key] = {"id": id, "label": label, "style":style, "callback":callback};
        },
        'addStyle': function(key) {
            if(window.widget)
                return window.widget.preferenceForKey(key);

            return '';
        },
        'destroy': function(key) {
            if(window.widget)
                this.write(key, null);
        }
    }
});