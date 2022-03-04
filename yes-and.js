let yesAnd = function (objStr, options) {
    try {
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
        if(!!options  && typeof options.rtnValue !== 'boolean') {
            switch (typeof options.rtnValue) {
                case 'undefined':
                    errStrings.push('You didn\'t provide a rtnVal property in the object of argument 2, expects an object with property rtnValue:true/false.');
                    break;
                default:
                    errStrings.push(`You provided a rtnValue value property with ${typeof options.rtnValue} data type in the object of argument 2, expects an object with property rtnValue:true/false.`);
                    break;
            }
        }
        // If we have errors, stop execution and return them
        if(errStrings.length >= 1) { throw errStrings; }

        var keys = objStr.split(/\.|(\[\d+\])|(\([^.]+\))/);
        keys = keys.filter(key => !!key);
        for (let i = 0; i < keys.length; i++) {
            if (i === 0) {
                string = '!!' + keys[i];
                prev = string;
            }
            else {
                string = string + ' && ' + prev + (/\[\d+\]|(\(.*\))/.test(keys[i]) ? keys[i] : '.' + keys[i]);
                prev = prev + (/\[\d+\]|(\(\d*|\w*\))/.test(keys[i]) ? keys[i] : '.' + keys[i]);
                if (i === keys.length - 1 && options.rtnValue) {
                    string = string + ' && ' + prev.replaceAll('!', '');
                }
            }
        }
        if (options?.wrap?.method && options?.wrap?.idx) {
            string = string.split('&&');
            for (idx in options.wrap.idx) {
                if (string[options.wrap.idx[idx]]) {
                    string.splice(options.wrap.idx[idx], 1, `${options.wrap.method}(${string[options.wrap.idx[idx]]})`)
                }
            }
            string = string.reduce((prev, curr) => prev + ' && ' + curr);
        }
        return string;
    } catch (error) {
        if(typeof error === 'object') {
            let errString = '';
            for(errors in error) {
                errString = errString ? errString + ' ' + error[errors] : error[errors];
            }
            return errString;
        }
    }
};

module.exports = yesAnd;