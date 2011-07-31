module("Chainalyze");
var chain = $.Chainable.subclass({
    'static': {
        'reset': function() {
            var len = this._objects.length;

            for(i=0; i <= len; i++) {
                this._objects[i].value = '';
            }
        }
    },
    'add': function(num) {
        this.value += num;
    },
    'substruct': function(num) {
        this.value -= num;
    },
    'multiply': function(num) {
        this.value *= num;
    },
    'divide':function(num) {
        this.value /= num;
    },
    'mod': function(num) {
        this.value %= num;
    },
    'power': function(num) {
        this.value = Math.pow(this.value, num);
    },
    'square': function() {
        this.power(2);
    },
    'sqrt': function() {
        this.value = Math.sqrt(this.value);
    },
    'floor': function() {
        this.value = Math.floor(this.value);
    }
});

test('Math chaining chack', function() {
    var chained = chain.init(5).add(5).substruct(2).multiply(-2).divide(2)
                        .mod(3).power(4).square().sqrt().divide(3).floor();
    equals(chained.value, 5, "Check basic chaining using all the methods of the chain class");

    chained2 = chain.init(10).add(2).divide(3)
    equals(chained2.value, 4, "Another chain object math");
    equals(chained.value, 4, 
            "Since chaining uses the flyweight pattern, the first object value was changed");
    equals(chained.id, chained2.id, 
            "Since chaining uses the flyweight pattern, thease objects are the same");

    // Making chained2 a pysical second object using the save function and add 1 to it
    chained2 = chained2.save().add(1);
    ok(chained.id != chained2.id, "The save function created a new object");
    equals(chained.value, 4, "The first object value remaind intact");
    equals(chained2.value, 5, "The second value was increased by one");
});

/*module("The plugIn function");

$.plugIn('each', function(fn) {
    var length = this.elements.length,
        i = 0;

    if(typeof fn != 'function')
        return false;

    for(var element = this.elements[0];
        i < length && fn.call(element, i) !== false; 
        value = this.elements[++i]) {
        // Do nothing, the second sections on the for loop does the trick
    }
}).plugIn('setStyle', function(prop, val) {
    this.each(function() {
        this.style[prop] = val;
    });
}).plugIn('show', function() {
    this.setStyle('display', 'block');
}).plugIn('addEvent', function(type, fn) {
    this.each(function() {
        this.addEventListener(type, fn, false);
    })
}).plugIn('test1', function() {
}, function() {
    return 'test1'
}).plugIn('test2', function() {
    
}).plugIn('test3', function() {
    
}, function() {
    return 'test3';
}).plugIn('changeElements', function() {
    this.elements = 1;
});

test('Using plugged in methods', function() {
    ok('item' in ($('#testbox').value()), 'Check the generic value function');
    ok($('#testbox').test1().value() == 'test1', 'Check the test1 value function');
    ok('item' in ($('#testbox').test1().test2().value()), 'Check if test2 reset the value function');
    ok($('#testbox').test1().test2().test3().value() == 'test3', 'Check the test3 function');
});
module("Chaining and flyweight cheacking");
test('Test save function', function() {
    // CO = Chainer Object
    var genericCO    = $('#testbox');
    var savedCO        = $('#testbox').save();
    ok(genericCO.id != savedCO.id, 'Check if the new saved ChainerObject has different id');

    $('#testbox').changeElements();
    ok(genericCO.elements == 1, 'Check the if the flyweight behavior is correct');
    ok(savedCO.elements != 1, 'Check if saved CO remained unharmned');
});*/