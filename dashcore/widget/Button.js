console.log('Buttons loaded');

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