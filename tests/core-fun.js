module("Function decompiler test");

// used to remove whitespace from the function in order
//    to to be able to validate the resualt correctly
function removeWhiteSpace(string) {
    return string.replace(/\s/g, '');
}

test('Check fn1 - blank function', function() {
        fn1 = function() {},
        decompiled1 = $.Fun.decompile(fn1),
        expected1 = {'args':[] , 'content':'', 'all':'function () {}', 'name': ''};
    same(decompiled1.args        ,expected1.args, 'args');
    comparable(decompiled1.content    ,expected1.content, 'content');
	comparable(decompiled1.all        ,expected1.all, 'all');
    equals(decompiled1.name        ,expected1.name, 'name');
})

test('Check fn2 - blank function with arguments', function() {
        fn2 = function(a, b, c, d, e) {},
        decompiled2 = $.Fun.decompile(fn2),
        expected2 = {'args':['a', 'b', 'c', 'd', 'e'] , 'content':'', 'all':'function (a, b, c, d, e) {}', 'name': ''};

    same(decompiled2.args        ,expected2.args, 'rgs');
	comparable((decompiled2.content)    ,(expected2.content), 'content');
	comparable((decompiled2.all)        ,(expected2.all), 'all');
    equals(decompiled2.name        ,expected2.name, 'name');
})

test('Check fn3 - blank function with wired arguments and whitespaces', function() {
        fn3 = function(a0,b$,    _c,D,            
        
        eQ) {},
        decompiled3 = $.Fun.decompile(fn3),
        expected3 = {'args':['a0', 'b$', '_c', 'D', 'eQ'] , 'content':'', 
                    'all':'function (a0, b$, _c, D, eQ) {}', 'name': ''};

    same(decompiled3.args        ,expected3.args, 'args');
	comparable(decompiled3.content,expected3.content, 'content');
	comparable(decompiled3.all    ,expected3.all, 'all');
    equals(decompiled3.name        ,expected3.name, 'name');
})

test('Check fn4 - function with arguments and complex content', function() {
        fn4 = function(a, b) {
                    var _a = a,
                _b = b,            
                $ = _a+_b, 
                            __$__ = /function\s*\(([\s\w_\$,\b]*)\)\s*\{([\w\W]*)\}/;
            return a+b;
        },
        decompiled4 = $.Fun.decompile(fn4),
        expected4 = {'args':['a', 'b'] , 
                    'content':
                        'var _a = a, _b = b, $ = _a + _b, __$__ = \/function\\s*\\(([\\s\\w_\\$,\\b]*)\\)\\s*\\{([\\w\\W]*)\\}\/;\n\
                         return a + b;', 
                    'all':'function (a, b) {\n\
                            var _a = a, _b = b, $ = _a + _b, __$__ = \/function\\s*\\(([\\s\\w_\\$,\\b]*)\\)\\s*\\{([\\w\\W]*)\\}\/;\n\
                             return a + b;\n\
                    }', 'name': ''};

    same(decompiled4.args        ,expected4.args, 'Check fn1 - blank function - args');    
    comparable(decompiled4.content    ,expected4.content, 'Check fn1 - blank function - content');
	comparable(decompiled4.all        ,expected4.all, 'Check fn1 - blank function - all');
    equals(decompiled4.name        ,expected4.name, 'name');
});

test('Check fn5 - blank function with name', function() {
        fn5 = function funcName() {},
        decompiled5 = $.Fun.decompile(fn5),
        expected5 = {'args':[] , 'content':'', 'all':'function funcName() {}', 'name': 'funcName'};
    same(decompiled5.args        ,expected5.args, 'args');
    comparable(decompiled5.content    ,expected5.content, 'content');
	comparable(decompiled5.all        ,expected5.all, 'all');
    equals(decompiled5.name        ,expected5.name, 'name');
})

module("Function compiler test");

test('Recompile functions', function() {
    // Recompile fn1
    var rfn1 = $.Fun.decompile(fn1).compile(),
        rfn2 = $.Fun.decompile(fn2).compile(),
        rfn3 = $.Fun.decompile(fn3).compile(),
        rfn4 = $.Fun.decompile(fn4).compile(),
        rfn5 = $.Fun.decompile(fn5).compile();

    	comparable(rfn1.toString(), fn1.toString(), 'Check if fn1 is intact');
		comparable(rfn2.toString(), fn2.toString(), 'Check if fn2 is intact');
		comparable(rfn3.toString(), fn3.toString(), 'Check if fn3 is intact');
		comparable(rfn4.toString(), fn4.toString(), 'Check if fn4 is intact');
		comparable(rfn5.toString(), fn5.toString(), 'Check if fn5 is intact');
})