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