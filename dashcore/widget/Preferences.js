/*
    Dashcore	- Dashboard widget JavaScript library
	IPreferences.js	- widget.setPreferenceForKey/preferenceForKey wraper
	Require as	- $.widget.Preferences
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

$.Preferences = $.Object.subclass({
    'static': {
        'write': function(key, preferences) {
            if(window.widget)
                window.widget.setPreferenceForKey(preference, key);
        },
        'read': function(key) {
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