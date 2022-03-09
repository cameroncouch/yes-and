"use strict";
let yesAnd =
    /**
     * @param objStr A string that will be exploded. in: window.example out: !!window && !!window.example.
     * @param options An object containing options. rtnValue (last part of string is prefixed with !! or not). wrap object, containing idx array and method string. method string example is JSON.parse, and idx array is an array of idx in the string to return, where you would like to wrap the string with wrap method. 
     */
    function (objStr, options) {
        try {
            // Array to hold all errors found with supplied arguments
            //BEGIN ERROR CHECKING
            let errStrings = [];
            if (!!objStr && typeof objStr === 'string' && !!objStr.length < 1 || typeof objStr !== 'string' || !objStr) {
                switch (typeof objStr) {
                    case 'string':
                        errStrings.push('You passed an empty string, expected an array/object accessor string.');
                        break;
                    default:
                        errStrings.push(`Type of argument 1 passed was ${typeof objStr}, expected a string.`);
                        break;
                }
            }
            if (!options || typeof options !== 'object') {
                switch (typeof options) {
                    case 'undefined':
                        errStrings.push('You didn\'t provide an options object for agument 2, expects an object with property rtnValue:true/false.');
                        break;
                    default:
                        errStrings.push(`Type of argument 2 was ${typeof options}, expects an object with property rtnValue:true/false.`);
                        break;
                }
            }
            if (!!options && typeof options.rtnValue !== 'boolean') {
                switch (typeof options.rtnValue) {
                    case 'undefined':
                        errStrings.push('You didn\'t provide a rtnValue property in the object of argument 2, expects an object with property rtnValue:true/false.');
                        break;
                    default:
                        errStrings.push(`You provided a rtnValue value property with ${typeof options.rtnValue} data type in the object of argument 2, expects an object with property rtnValue:true/false.`);
                        break;
                }
            }
            //END ERROR CHECKING
            // If we have errors, stop execution and throw into catch block
            if (errStrings.length >= 1) { throw errStrings; }
            //BEGIN STRING BUILD

            //objStr window.something.somethingElse[0]
            var keys = objStr.split(/\.|(\[\d+\])|(\([^.]*\))/);
            //keys ['window', 'something', 'somethingElse', '[0]']

            // filters out possible empty strings from running split with regex
            // https://stackoverflow.com/questions/48054388/javascript-split-with-regex-returning-array-with-empty-manual-removal-or-regex
            keys = keys ? keys.filter(key => !!key) : '';

            if (keys.length > 0) {
                let accessString,
                    accStrPrev;

                for (let i = 0; i < keys.length; i++) {
                    if (i === 0) {
                        //if we are looking at the first idx, initialize accessString and accStrPrev with a starter value. We will always want !!keys[i] to begin with
                        accessString = '!!' + keys[i];
                        accStrPrev = accessString;
                    }
                    else {
                        //concatenate the string with each iteration of the loop. If the value has brackets, don't concat with a '.'
                        accessString = accessString + ' && ' + accStrPrev + (/\[\d+\]|(\(.*\))/.test(keys[i]) ? keys[i] : '.' + keys[i]);
                        //concat & update accStrPrev following the same rules as above, sans &&
                        accStrPrev = accStrPrev + (/\[\d+\]|(\(\d*|\w*\))/.test(keys[i]) ? keys[i] : '.' + keys[i]);
                        //if we are at the last value in the array, and the caller wants a string that would return a value, and not just evaluate truthiness
                        if (i === keys.length - 1 && options.rtnValue) {
                            accessString = accessString + ' && ' + accStrPrev.replaceAll('!', '');
                        }
                    }
                }
                //loop end - string is built at this point
                // accessString -- !!window && !!window.something && !!window.something.somethingElse && !!window.something.somethingElse[0]
                //BEGIN METHOD WRAP LOGIC
                if (options?.wrap?.method && options?.wrap?.target) {
                    let accessStringArr = accessString.split('&&');
                    accessStringArr = accessStringArr.map((el) => el.trim()).filter(el => !!el);
                    //updateTarget is some string we want
                    let updateTarget = options.wrap.target;
                    let idx = accessStringArr.indexOf("!!" + updateTarget);
                    if (options.wrap.append) {
                        updateTarget = '!!' + updateTarget;
                        accessStringArr.splice(idx, 0, updateTarget);
                        idx = accessStringArr.lastIndexOf(updateTarget);
                    }
                    for (let entry in accessStringArr) {
                        //change loop to loop over accessStringArr
                        //update all subsequent occurrences starting at idx onward
                        if (parseInt(entry) >= idx && accessStringArr[entry]) {
                            accessStringArr.splice(
                                entry,
                                1,
                                `${(/!/.test(accessStringArr[entry]) && '!!') || ''}${options.wrap.method}(${accessStringArr[entry].substring(accessStringArr[entry].indexOf(options.wrap.target), accessStringArr[entry].indexOf(options.wrap.target) + options.wrap.target.length)})${accessStringArr[entry].substring(accessStringArr[entry].indexOf(options.wrap.target) + options.wrap.target.length, accessStringArr[entry].length)}`);
                        }
                    }
                    accessString = accessStringArr.reduce((prev, curr) => prev + ' && ' + curr);
                }
                return accessString;
            } else { throw `Something funky happened. KEYS LEN:${keys.len}` }
        } catch (error) {
            if (typeof error === 'object') {
                let errString = '';
                for (let errors in error) {
                    errString = errString ? errString + ' ' + error[errors] : error[errors];
                }
                return errString;
            }
        }
    };

module.exports = yesAnd;