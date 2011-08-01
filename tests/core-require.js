// Test based on the deleted omgrequire branch of jquery
$.Namespace.add('test', 'http://localhost:8080/dashcore/tests');

module("Require mechanism");
asyncTest("require tree test", 19, function() {
    var loaded = {	1:  false,    
                    2:  false,
                    3:  false,
                    4:  false,
                    5:  false,
                    6:  false,
                    7:  false,
                    8:  false,
					9:  false,    
				    10: false,
				    11: false,
				   	12: false,
				    13: false,
				    14: false,
				    15: false,
				    16: false,
					17: false,    
					18: false,
					19: false,
					20: false,
					21: false,
					22: false
                },
		dependencies =	{	1:  [],    
			                2:  [3, 17],
			                3:  [4, 9, 12],
			                4:  [5, 8],
			                5:  [6, 7],
			                6:  [],
			                7:  [],
			                8:  [],
							9:  [10, 11],    
							10: [],
							11: [],
							12: [13, 16],
							13: [14, 15],
							14: [],
							15: [],
							16: [],
							17: [18, 21],    
							18: [19, 20],
							19: [],
							20: [],
							21: [],
							22: []
			        	},
        count = 0;

    window.requireTest = function(response) {
        var isDependciesLoaded = true;
        loaded[response] = true;

        depLength = dependencies[response].length;
        for(i = 0; i < depLength; i++) {
                ok( loaded[dependencies[response][i]] , "Respose #"+response+": Check that dependency #"+
                dependencies[response][i]+" was loaded before.");
            
        }
        
        if(++count === 22)
            start();
    }

    $.Require('requireTree/1.php');
    $.Require('requireTree/2.php');
    $.Require('requireTree/22.php');
});