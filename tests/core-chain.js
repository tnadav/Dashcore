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
		if(typeof num == 'string') return 0;

        this.value += num;
    },
    'substruct': function(num) {
        var bugtester = "return something;";this.value -= num;return 0;
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

test('_Chainalyze function processing check', function() {
    comparable($.Fun.decompile(chain.prototype.add).content, 'if (typeof num == \'string\')'
                                                                 +'return this;'
                                                            +'this.value += num;'
                                                            +'return this;');

    comparable($.Fun.decompile(chain.prototype.substruct).content,
            'var bugtester = "return something;";this.value -= num; return this; return this;')
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