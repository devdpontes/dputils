/**
 * dpUtils Custom (alias dp)
 * v1.0.0
 *
 * Author and contributors:
 *  Daniel Pontes - webdpontes@gmail.com
 */
(function (window) {
    var BENCHMARK_MESSAGE = 'Function returned in {time}ms';
    var INVALID_INPUT = 'Invalid input';
    var COOKIE_GET = 'Cookie {name} is currently set to value {value}';
    var COOKIE_SET = 'Cookie {name} has been set to {value} with expiry {expiry} for domain {domain}';
    var COOKIE_REMOVED = 'Cookie {name} has been removed';
    var ADD_TRIM_TO_IE_INIT = 'addTrimToIE has been initialised';

    /**
     * @name dpUtils
     * @description The dpUtils library
     * @namespace dpUtils
     * @type object
     */
    window.dpUtils = this.dpUtils = {};

    // Declare alias dp
    window.dp = this.dp = dpUtils;

    // Default configuration
    dpUtils.config = {
        logging: false,
        benchmarking: false
    };

    /**
     * @name Init
     * @description Initialises dpUtils by providing a config object
     * @namespace dpUtils.init
     * @param {object} [config] An object containing configuration keys
     * @function
     */
    dpUtils.init = function (config) {
        // Set config
        if (typeof config === 'object') {
            // Add defaults to input config object if none are set
            for (var key in dpUtils.config) {
                if (!config[key]) {
                    config[key] = dpUtils.config[key];
                }
            }

            // Reference the input config object
            dpUtils.config = config;


            // Initialise optional modules
            if (config.addTrimToIE) {
                addTrimToIE();
            }
        }
    }

    /**
     * @name Log
     * @description Logs a message to the console
     * @memberof dpUtils
     * @param {string} message The message to log
     * @param {string} namespace The namespace to be attached to this message
     * @function
     */
    dpUtils.log = function (message, namespace) {
        // Abort if logging is turned off or if console is not available
        if (!dpUtils.config.logging || !window.console) {
            return;
        }

        // Input type validation
        if (typeof message !== 'object' && typeof message !== 'string' || typeof namespace !== 'string') {
            console.error('[utils.log | ' + namespace.toString() + '] ' + INVALID_INPUT);

            return null;
        }

        // Input defaults
        namespace = namespace || '';
        
        if (typeof message === 'object') {
            console.log(message);
        } else {
            // Log namespace and message
            var output = this.timeStamp() + ' [' + namespace + '] ' + message;
            console.log(output);
        }
    }

    /**
     * @name logException
     * @description Logs an exception to the console
     * @memberof dpUtils
     * @param {object} exception The exception to log
     * @param {string} namespace The namespace to be attached to this exception
     * @function
     */
    dpUtils.logException = function (exception, namespace) {
        // If console is not available
        if (!window.console) {
            return;
        }

        // Input type validation
        if (typeof exception !== 'object' && typeof exception !== 'string'  || typeof namespace !== 'string') {
            console.error('[utils.logException | ' + namespace.toString() + '] ' + INVALID_INPUT);

            return null;
        }

        // Input defaults
        namespace = namespace || '';

        // Log namespace and message
        console.error('[' + namespace + '] ' + exception.toString());
    }
    
     /**
     * @name timeStamp
     * @description Returns a timestamp with the current date and time
     * @memberof dpUtils
     * @function
     * @returns {string}
     */
    dpUtils.timeStamp = function () {
        var date = new Date(),
            day = date.getDate(),
            month = date.getMonth(),
            year = date.getFullYear(),
            hour = date.getHours(),
            minutes = date.getMinutes(),
            seconds = date.getSeconds(),
            miliseconds = date.getMilliseconds(),
            template = 'day/month/year - hour:minutes:seconds.miliseconds'

        return template
            .replace('day', day)
            .replace('month', month)
            .replace('year', year)
            .replace('hour', hour)
            .replace('minutes', minutes)
            .replace('seconds', seconds)
            .replace('miliseconds', miliseconds);
    }

    /**
     * @name Benchmark
     * @description Measures execution time (in ms)
     * @memberof dpUtils
     * @param {string} namespace The namespace to be attached to this benchmark
     * @constructor
     */
    dpUtils.Benchmark = function (namespace) {
        this.namespace = namespace;

        if (dpUtils.config.benchmarking) {
            this.start = new Date().getTime();
        }
    }
    dpUtils.Benchmark.prototype = (function () {
        return {
            constructor: dpUtils.Benchmark,

            /**
             * @name finish
             * @description Finish the benchmark
             * @memberof dpUtils.Benchmark
             * @function
             */
            finish: function () {
                if (dpUtils.config.benchmarking) {
                    var finish = new Date().getTime();
                    var duration = finish - this.start;
                    var message = BENCHMARK_MESSAGE.replace('{time}', duration.toString());

                    dpUtils.log(message, this.namespace);
                }
            }
        }
    })();

    /**
     * @name cookies
     * @description The cookies library
     * @memberof dpUtils
     * @type object
     */
    dpUtils.cookies = {
        /**
         * @name get
         * @description Get cookie
         * @memberof dpUtils.cookies
         * @param {string} name The cookie name
         * @returns {string} cookie value The cookie value
         * @function
         */
        get: function (name) {
            var namespace = 'dpUtils.cookies.get';

            try {
                if (typeof name !== 'string') {
                    throw new Error(INVALID_INPUT);
                }

                // Get cookies
                var cookies = document.cookie.split(';');

                for (var i = 0, length = cookies.length; i < length; i++) {
                    var cookie = cookies[i];

                    if (cookie.indexOf(name + '=') > -1) {      // Cookie found
                        var cookieValue = cookie.split('=')[1]; // TODO use trim

                        dpUtils.log(COOKIE_GET
                            .replace('{name}', name)
                            .replace('{value}', cookieValue),
                            namespace);

                        return cookieValue;
                    }
                }

                return '';
            } catch (exception) {
                dpUtils.logException(exception, namespace);

                return null;
            }
        },

        /**
         * @name set
         * @description Set cookie
         * @memberof dpUtils.cookies
         * @param {string} name The cookie name
         * @param {string} value The cookie value
         * @param {number} [expiry] The cookie expiry time (in ms), default is zero
         * @param {string} [domain] The domain the cookie applies to, default is '/'
         * @function
         */
        set: function (name, value, expiry, domain) {
            var namespace = 'dpUtils.cookies.set';

            try {
                // Input validation
                if (typeof name !== 'string' ||
                    typeof value !== 'string' ||
                    expiry && typeof expiry !== 'number' ||
                    domain && typeof domain !== 'string') {

                    throw new Error(INVALID_INPUT);
                }

                var expires = '';

                if (expiry) {
                    var expiryDate = new Date();
                    expiryDate.setTime(expiryDate.getTime() + expiry);

                    expires = '; expires=' + expiryDate.toUTCString();
                } else {
                    // Prevents logging 'undefined' for expiry
                    expiry = -1;
                }

                if (!domain) {
                    domain = '/';
                }

                // Set cookie
                document.cookie = name + '=' + value + expires + '; path=' + domain;

                dpUtils.log(COOKIE_SET
                    .replace('{name}', name)
                    .replace('{value}', value)
                    .replace('{expiry}', expiry.toString())
                    .replace('{domain}', domain),
                    namespace);
            } catch (exception) {
                dpUtils.logException(exception, namespace);

                return null;
            }
        },

        /**
         * @name remove
         * @description Remove cookie
         * @memberof dpUtils.cookies
         * @param {string} name The cookie name
         * @function
         */
        remove: function (name) {
            var self = this;
            var namespace = 'dpUtils.cookies.remove';

            try {
                if (typeof name !== 'string') {
                    throw new Error(INVALID_INPUT);
                }

                // Remove cookie by setting it with a negative expiry
                self.set(name, '', -1);

                dpUtils.log(COOKIE_REMOVED.replace('{name}', name), namespace);
            } catch (exception) {
                dpUtils.logException(exception, namespace);

                return null;
            }
        },

        /**
         * @name isCookieSet
         * @description Checks whether a cookie is set
         * @memberof dpUtils.cookies
         * @param {string} name
         * @returns {boolean | null} Is cookie set?
         */
        isCookieSet: function (name) {
            var namespace = 'dpUtils.cookies.isCookieSet';

            try {
                if (typeof name !== 'string') {
                    throw new Error(INVALID_INPUT);
                }

                // Find cookie
                var isCookieSet = false;

                // We cannot check for "name=" as IE8 does not add the = sign
                var cookies = '; ' + document.cookie;

                if (cookies.indexOf('; ' + name) > -1) {
                    isCookieSet = true;
                }

                return isCookieSet;
            } catch (exception) {
                dpUtils.logException(exception, namespace);

                return null;
            }
        }
    }

    /**
     * @name isNumber
     * @namespace dpUtils.isNumber
     * @description Checks if a given value is a valid number
     * @function
     * @returns {boolean}
     */
    dpUtils.isNumber = function (number) {
        return !isNaN(parseFloat(number)) && isFinite(number) && number >= 0;
    }

    /**
     * @name toBoolean
     * @namespace betslipApp.commonServices.toBoolean
     * @description Serialises terms related that equal true
     * @function
     * @returns {boolean}
     */
    dpUtils.toBoolean = function (property) {
        var booleanProperty = (typeof(property) === 'string') ? property.toLowerCase() : property;
        var values = ['true', 'y', 'yes', '1', true];
        return (values.indexOf(booleanProperty) > -1);
    }

    /**
     * @name parseModel
     * @namespace dpUtils.parseModel
     * @description Parses a stringified model
     * @function
     * @returns {object}
     */
    dpUtils.parseJson = function (jsonString) {
        var namespace = dpUtils.parseJson;
        try {
            return (typeof(jsonString) === 'string') ? JSON.parse(jsonString) : jsonString;
        } catch (exception) {
            sQ.logException(exception, namespace);
            sQ.logException(jsonString, namespace);
            return false;
        }
    }

    /**
     * @name getDecimalMark
     * @namespace dpUtils.getDecimalMark
     * @description Gets the decimal mark used
     * @function
     * @returns {string}
     */
    dpUtils.getDecimalMark = function (stringValue) {
        var mark = stringValue.match(/[\.,']/); // Gets the current decimal mark used
        return (mark) ? mark[0] : '.';
    }

    /**
     * @name normalizeDecimal
     * @namespace dpUtils.normalizeDecimal
     * @description Converts any decimal mark type to dot (.)
     * @function
     * @returns {string}
     */
    dpUtils.normalizeDecimal = function (stringValue, decimalMark) {
        if (stringValue.indexOf(decimalMark)){
            return stringValue.replace(decimalMark, '.');
        }
        return stringValue;
    }

    /**
     * @name ordinalWithSuffix
     * @namespace dpUtils.ordinalWithSuffix
     * @description Returns any number as ordinal number with the suffix
     * @function
     * @returns {string}
     * @example 2 returns "2nd"
     */
    dpUtils.ordinalWithSuffix = function (number) {
        var remainder = number % 10;
        if (remainder == 1 && number != 11) {
            return number + "st";
        }
        if (remainder == 2 && number != 12) {
            return number + "nd";
        }
        if (remainder == 3 && number != 13) {
            return number + "rd";
        }
        return number + "th";
    }

    /**
     * @name isArray
     * @namespace dpUtils.isArray
     * @description Checks if object is of type array
     * @function
     * @returns {boolean}
     */
    dpUtils.isArray = function (arrayToCheck) {
        return typeof arrayToCheck === 'object' && arrayToCheck instanceof Array;
    }

    /**
     * @name moveArrayPosition
     * @namespace dpUtils.moveArrayPosition
     * @description Changes an element position in an array
     * @function
     * @returns {object}
     */
    dpUtils.moveArrayPosition = function (arrayList, oldIndex, newIndex) {
        var namespace = 'dpUtils.moveArrayPosition';
        if (dpUtils.isArray(arrayList)) {
            if (newIndex >= arrayList.length) {
                newIndex = arrayList.length -1;
            }
            arrayList.splice(newIndex, 0, arrayList.splice(oldIndex, 1)[0]);
            return arrayList;
        }
        sQ.logException('First argument is not an Array', namespace);
        return [];
    }

    /**
     * @name isEmpty
     * @namespace dpUtils.isEmpty
     * @description Checks if an object is empty
     * @function
     * @returns {boolean}
     */
    dpUtils.isEmpty = function (obj) {
        // null and undefined are "empty"
        if (obj == null) {
            return true;
        }
        // Assume if it has a length property with a non-zero value
        // that that property is correct.
        if (obj.length > 0) {
            return false;
        }
        if (obj.length === 0) {
            return true;
        }
        // Otherwise, does it have any properties of its own?
        // Note that this doesn't handle
        // toString and valueOf enumeration bugs in IE < 9
        for (var key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                return false;
            }
        }
        return true;
    }

    /**
     * @name remainingTime
     * @namespace dpUtils.remainingTime
     * @description Returns the Time difference between a future date and the current date, in milliseconds.
     * @function
     * @returns {number}
     */
    dpUtils.remainingTime = function (time) {
        var currentDate = new Date(),
            endDate = new Date(time);
        return endDate.getTime() - currentDate.getTime();
    }

    /**
     * @name createHashTable
     * @namespace dpUtils.createHashTable
     * @description Creates a hash table of given array of objects. Requires a defined property name.
     * @function
     * @params {object, string}
     */
    dpUtils.createHashTable = function (arrayList, propertyName) {
        var namespace = 'dpUtils.createHashTable',
            hashTable = {};
        if (propertyName && typeof propertyName === 'string') {
            if (dpUtils.isArray(arrayList) && !!arrayList.length) {
                for (var i = 0; i < arrayList.length; i++) {
                    hashTable[arrayList[i][propertyName]] = arrayList[i];
                }
            }
        } else {
            dp.logException('Please provide a string type propertyName', namespace);
        }

        return hashTable;
    }

    /**
     * @name addTrimToIe
     * @description Add trim functionality to strings for IE 8 and below
     * @memberof dpUtils
     * @function
     */
    var addTrimToIE = function () {
        var namespace = 'dpUtils.addTrimToIE';

        try {
            if(typeof String.prototype.trim !== 'function') {
                String.prototype.trim = function() {
                    return this.replace(/^\s+|\s+$/g, '');
                }

                dpUtils.log(ADD_TRIM_TO_IE_INIT, namespace);
            }
        } catch (exception) {
            dpUtils.logException(exception, namespace);

            return null;
        }
    }
})(window);
