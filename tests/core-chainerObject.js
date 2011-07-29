module("The plugIn function");

global = [];

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
});