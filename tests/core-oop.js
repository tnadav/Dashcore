module("Inheritance and Interfaces");

var idInterface = $.Interface({
    "static": {
        "count": function(){}
    },
    "setCounter": function(num){},
    "getCounter": function(){},
    "identify": function(){}
});

var MyObject = $.Object.subclass({
    "static": {
        "counter": 0,
        "count": function() {++this.counter;},
        "getCounter": function() {return this.counter}
    },
    "init": function() {
        this.exists = true;
    },
    "destroy": function() {
        delete this.exists;
    },
    "setCounter": function(num) {
        MyObject.counter = num;
    },
    "getCounter": function(){
        return this._Self.counter;
    },
    "identify": function() {
        return "MyObject";
    },
    "MyObject": function() {
        
    }
}).implement(idInterface);

var MySubClass = MyObject.subclass({
    "static": {
        "countTwice": function() {
            this._super('count');
            return this._super('count');
        }
    },
    "init": function() {
        MySubClass._super('init');
        this.exists = false;    
    },
    "identify": function() {
        return "MySubClass";
    },
    "MySubClass": function() {
        
    }
});

test("Object creation", function() {
    ok(typeof MyObject != "undefined", "Check if MyObject created");
    ok(typeof MySubClass != "undefined", "Check if MySubClass created");

    // Check if the essential methods exists on MyObject
    ok(("implement" in MyObject), "Check if MyObject has the implement function");
    ok(("subclass" in MyObject), "Check if MyObject has the subclass function");
    ok(("_super" in MyObject), "Check if MyObject has the super property");

    ok(("implement" in MySubClass), "Check if MySubClass has the implement function");
    ok(("subclass" in MySubClass), "Check if MySubClass has the subclass function");
    ok(("_super" in MySubClass), "Check if MySubClass has the super property");

    // Check that static $ functions aren't inherited
    ok(!("_selector" in MyObject), "Check that static $._selector function isn't inherited")
});

o = new MyObject();
s = new MySubClass();

test("Instanceof and interface check", function() {
    ok(o instanceof $.Object, "Checking if MyObject is instanceof $");
    ok(s instanceof $.Object, "Checking if MySubClass is instanceof $");

    ok(o instanceof MyObject, "Checking if MyObject is instanceof MyObject");
    ok(s instanceof MySubClass, "Checking if MySubClass is instanceof MySubClass");

    ok(s instanceof MyObject, "Checking if MySubClass is instanceof MyObject");

    ok(o.implements(idInterface), "Checking if MyObject is an interface of idInterface");
    ok(s.implements(idInterface), "Checking if MySubClass is an interface of idInterface");

    // Check if inheritance worked
    ok(("setCounter" in s), "Check if MySubClass has inherited the \
                                         setCounter function");
});

test("Static function check", function() {
    ok('count' in MyObject, 'Checking the static count function at MyObject');
    ok('count' in MySubClass, 'Checking the static count function at MySubClass');

    ok('countTwice' in MySubClass, 'Checking the static countTwice function at MySubClass');

    ok('counter' in MyObject, 'Checking the static counter variable at MyObject');
    ok('counter' in MySubClass, 'Checking the static counter variable at MySubClass');

    o2 = new MyObject();
    s2 = new MySubClass();

    MyObject.count();

    ok(o.getCounter() == 1, 'checks if static function worked on first MyObject');
    ok(o2.getCounter() == 1, 'checks if static function worked on second MyObject');

    ok(s.getCounter() == 0, 'MySubClass should be the same');
    MySubClass.countTwice();
    ok(s.getCounter() == 2, 'checks if static function worked on first MySubClass');
    ok(s2.getCounter() == 2, 'checks if static function worked on first MySubClass');
    
    ok(o.getCounter() == 1, 'checks if first MyObject is the same');
    ok(o2.getCounter() == 1, 'checks if second MyObject is the same');
});

test("Object Oparations", function() {
    ok(o.exists, 'Check if the exists property on MyObject is right');
    ok(!s.exists, 'Check if MySubClass overriden the exists property');
});