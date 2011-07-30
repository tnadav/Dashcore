$.Namespace.add('test', 'http://localhost:8080/dashcore/tests');
$.Require('test.test-require', function() {
    console.log('Callback function of test.test-require');
});