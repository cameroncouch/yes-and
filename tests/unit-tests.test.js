const yesAnd = require('../yes-and')


describe('Catch bad arguments', () => {
    test('passing undefined for argument 1 should return a debug message', () => {
        let rtnValue = yesAnd(null);
        expect(rtnValue).toEqual(`Type of argument 1 passed was object, expected a string. You didn't provide an options object for agument 2, expects an object with property rtnValue:true/false.`);
    });

    test('passing undefined string for argument 1 should return a debug message', () => {
        let rtnValue = yesAnd(undefined);
        expect(rtnValue).toEqual(`Type of argument 1 passed was undefined, expected a string. You didn't provide an options object for agument 2, expects an object with property rtnValue:true/false.`);
    });

    test('passing empty string for argument 1 should return a debug message', () => {
        let rtnValue = yesAnd('');
        expect(rtnValue).toEqual(`You passed an empty string, expected an array/object accessor string. You didn't provide an options object for agument 2, expects an object with property rtnValue:true/false.`);
    });

    test('passing undefined for argument 2 should return a debug message', () => {
        let rtnValue = yesAnd('abc', undefined);
        expect(rtnValue).toEqual(`You didn't provide an options object for agument 2, expects an object with property rtnValue:true/false.`);
    });

    test('passing not-an-object for argument 2 should return a debug message', () => {
        let rtnValue = yesAnd('abc', 'string');
        expect(rtnValue).toEqual(`Type of argument 2 was string, expects an object with property rtnValue:true/false. You didn't provide a rtnValue property in the object of argument 2, expects an object with property rtnValue:true/false.`);
    });

    test('passing bad args should return a compound debug message', () => {
        let rtnValue = yesAnd(undefined, 'string');
        expect(rtnValue).toEqual(`Type of argument 1 passed was undefined, expected a string. Type of argument 2 was string, expects an object with property rtnValue:true/false. You didn't provide a rtnValue property in the object of argument 2, expects an object with property rtnValue:true/false.`);
    });

    test('passing an object without rtnValue property should return an error', () => {
        let rtnValue = yesAnd('window.test', { 'test': 'notRtnVal' });
        expect(rtnValue).toEqual("You didn't provide a rtnValue property in the object of argument 2, expects an object with property rtnValue:true/false.");
    });

    //Test arg2 object but rtnVal val not a bool
    test('passing an object with rtnValue property !== bool should return an error', () => {
        let rtnValue = yesAnd('window.test', { 'rtnValue': 'notBool' });
        expect(rtnValue).toEqual("You provided a rtnValue value property with string data type in the object of argument 2, expects an object with property rtnValue:true/false.");
    });
    //Test arg2 object wrap prop present but no idx
    //Test arg2 object wrap prop present but single idx !== number
    //Test arg2 object wrap prop present but idx at [i] !== number
    //Test arg2 object wrap prop present but no method
    //Test arg2 object wrap prop present but method contains parens/brackets/braces
});

describe('String built to return values', () => {
    const obj = {
        "prop1": "value",
        "array1": [
            {
                "nestedProp1": "nestedArrValue"
            },
            "simpleArrValue"
        ]
    }

    test('an object chain string with one property accessed with dot, and one with bracket should return the value accessor string', () => {
        let rtnValue = yesAnd('obj.array1[0].nestedProp1', { rtnValue: true });
        expect(rtnValue).toEqual('!!obj && !!obj.array1 && !!obj.array1[0] && !!obj.array1[0].nestedProp1 && obj.array1[0].nestedProp1');
    });

    test('an object chain string with one property accessed with dot, and one with bracket should return the value', () => {
        let rtnValue = yesAnd('obj.array1[1]', { rtnValue: true });
        let evald = eval(rtnValue);
        expect(evald).toEqual('simpleArrValue');
    });

    test.only('Handle crazy but common string', () => {
        let rtnValue = yesAnd("document.querySelector('#id.abc [name='name']').closest('.xyz').querySelector('div span').innerText", {rtnValue: true, wrap:{method:"JSON.stringify",target:"document.querySelector('#id.abc [name='name']').closest('.xyz').querySelector('div span')",append:true}});
        console.log(rtnValue);
        expect(rtnValue).toEqual("!!document && !!document.querySelector && !!document.querySelector('#id.abc [name='name']') && !!document.querySelector('#id.abc [name='name']').closest && !!document.querySelector('#id.abc [name='name']').closest('.xyz') && !!document.querySelector('#id.abc [name='name']').closest('.xyz').querySelector && !!document.querySelector('#id.abc [name='name']').closest('.xyz').querySelector('div span') && !!document.querySelector('#id.abc [name='name']').closest('.xyz').querySelector('div span').innerText && document.querySelector('#id.abc [name='name']').closest('.xyz').querySelector('div span').innerText")
    })
});

describe('Wrapping method', () => {
    test('Provided a target idx and wrapping method, wrap portions of the obj string with the wrapping method', () => {
        let rtnValue = yesAnd('window.something.somethingElse.name', { 
            rtnValue: true, 
            wrap: {
                target: 'window.something.somethingElse.name',
                method: 'JSON.parse'
            } 
        });
        expect(rtnValue).toEqual('!!window && !!window.something && !!window.something.somethingElse && !!JSON.parse(window.something.somethingElse.name) && JSON.parse(window.something.somethingElse.name)')
    });
    test('Add final property to the end of the accessor string when specified', () => {
        let rtnValue = yesAnd(
            'window.something.somethingElse.name.thing',
            {
                rtnValue: true,
                wrap: {
                    method: 'JSON.parse',
                    target: 'window.something.somethingElse',
                    append: true
                }
            }
        );
        expect(rtnValue).toEqual('!!window && !!window.something && !!window.something.somethingElse && !!JSON.parse(window.something.somethingElse) && !!JSON.parse(window.something.somethingElse).name && !!JSON.parse(window.something.somethingElse).name.thing && JSON.parse(window.something.somethingElse).name.thing')
    });
    //NOT PASSING
    test('Wrap options idx is string', () => {
        let rtnValue = yesAnd(
            'window.something.somethingElse.name.thing',
            {
                rtnValue: true,
                wrap: {
                    method: 'JSON.parse',
                    target: 'window.something.somethingElse',
                    append: true
                }
            }
        );
        expect(rtnValue).toEqual('idx needs to be an integer, or coearcable to an int');
    })
});