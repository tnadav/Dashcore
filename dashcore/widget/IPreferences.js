/*
    Dashcore	- Dashboard widget JavaScript library
	IPreferences.js	- Per instance widget.setPreferenceForKey/preferenceForKey wraper
	Require as	- $.widget.IPreferences
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

// Import depeandencies
#require $.widget.Preferences

console.log('Instance preferences loaded');
if(!window.widget) {
    window.widget = {}
}

if(!window.widget.identifier) {
    widget.identifier = '';
}

$.IPreferences = $.Preferences.subclass({
    'static': {
        'perfix': widget.identifier,
        'getInstanceKey': function(key) {
            return this.perfix+"_"+key;
        },
        'write': function(key, preferences) {
            this._Self._super('write', this.getInstanceKey(key), preferences);
        },
        'read': function(key) {
            return this._Self._super('read', this.getInstanceKey(key));
        },
        'destroy': function(key) {
            this._Self._super('destroy', this.getInstanceKey(key));
        }
    }
});