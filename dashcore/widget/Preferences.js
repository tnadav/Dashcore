console.log('Preferences loaded');
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