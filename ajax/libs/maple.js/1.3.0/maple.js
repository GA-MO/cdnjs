(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _modelsModuleJs = require('./models/Module.js');

var _modelsModuleJs2 = _interopRequireDefault(_modelsModuleJs);

var _modelsComponentJs = require('./models/Component.js');

var _modelsComponentJs2 = _interopRequireDefault(_modelsComponentJs);

var _helpersSelectorsJs = require('./helpers/Selectors.js');

var _helpersSelectorsJs2 = _interopRequireDefault(_helpersSelectorsJs);

var _helpersUtilityJs = require('./helpers/Utility.js');

var _helpersUtilityJs2 = _interopRequireDefault(_helpersUtilityJs);

var _helpersLoggerJs = require('./helpers/Logger.js');

var _helpersLoggerJs2 = _interopRequireDefault(_helpersLoggerJs);

var _helpersEventsJs = require('./helpers/Events.js');

var _helpersEventsJs2 = _interopRequireDefault(_helpersEventsJs);

var _helpersOptionsJs = require('./helpers/Options.js');

var _helpersOptionsJs2 = _interopRequireDefault(_helpersOptionsJs);

(function main($window, $document) {

    'use strict';

    if (typeof System !== 'undefined') {
        System.transpiler = 'babel';
        System.babelOptions = { blacklist: [] };
    }

    /**
     * @module Maple
     * @link https://github.com/Wildhoney/Maple.js
     * @author Adam Timberlake
     */

    var Maple = (function () {

        /**
         * @constructor
         * @return {void}
         */

        function Maple() {
            _classCallCheck(this, Maple);

            this.findLinks();
            this.findTemplates();

            // Configure the event delegation mappings.
            _helpersEventsJs2['default'].setupDelegation();

            // Listen for any changes to the DOM where HTML imports can be dynamically imported
            // into the document.
            this.observeMutations();
        }

        _createClass(Maple, [{
            key: 'findLinks',

            /**
             * Responsible for finding all of the external link elements, as well as the inline template elements
             * that can be handcrafted, or baked into the HTML document when compiling a project.
             *
             * @method findLinks
             * @return {void}
             */
            value: function findLinks() {
                var _this = this;

                _helpersSelectorsJs2['default'].getImports($document).forEach(function (linkElement) {
                    return _this.waitForLinkElement(linkElement);
                });
            }
        }, {
            key: 'findTemplates',

            /**
             * Responsible for finding all of the template HTML elements that contain the `ref` attribute which
             * is the component's original path before Mapleify.
             *
             * @method findTemplates
             * @return {void}
             */
            value: function findTemplates() {

                _helpersSelectorsJs2['default'].getTemplates($document).forEach(function (templateElement) {

                    var scriptElements = _helpersSelectorsJs2['default'].getAllScripts(templateElement.content);
                    var ref = templateElement.getAttribute('ref');
                    var path = _helpersUtilityJs2['default'].resolver(ref, null).production;

                    scriptElements.forEach(function (scriptElement) {

                        if (path.isLocalPath(scriptElement.getAttribute('src'))) {
                            new _modelsComponentJs2['default'](path, templateElement, scriptElement);
                        }
                    });
                });
            }
        }, {
            key: 'waitForLinkElement',

            /**
             * @method waitForLinkElement
             * @param {HTMLLinkElement} linkElement
             * @return {void}
             */
            value: function waitForLinkElement(linkElement) {

                if (linkElement['import']) {
                    return void new _modelsModuleJs2['default'](linkElement);
                }

                new Promise(function (resolve, reject) {

                    linkElement.addEventListener('load', function () {
                        return resolve(linkElement);
                    });

                    var href = linkElement.getAttribute('href'),
                        errorMessage = 'Timeout of ' + _helpersOptionsJs2['default'].RESOLVE_TIMEOUT / 1000 + ' seconds exceeded whilst waiting for HTML import: "' + href + '"';
                    _helpersUtilityJs2['default'].resolveTimeout(errorMessage, reject);
                }).then(function (linkElement) {
                    return new _modelsModuleJs2['default'](linkElement);
                }, function (message) {
                    return _helpersLoggerJs2['default'].error(message);
                });
            }
        }, {
            key: 'observeMutations',

            /**
             * Listens for changes to the `HTMLHeadElement` node and registers any new imports that are
             * dynamically imported into the document.
             *
             * @method observeMutations
             * @return {void}
             */
            value: function observeMutations() {
                var _this2 = this;

                var observer = new MutationObserver(function (mutations) {

                    mutations.forEach(function (mutation) {

                        var addedNodes = _helpersUtilityJs2['default'].toArray(mutation.addedNodes);

                        addedNodes.forEach(function (node) {

                            if (_helpersUtilityJs2['default'].isHTMLImport(node)) {
                                _this2.waitForLinkElement(node);
                            }
                        });
                    });
                });

                observer.observe($document.head, { childList: true });
            }
        }]);

        return Maple;
    })();

    /**
     * @method initialise
     * @return {Function}
     */
    var initialise = (function initialise() {

        var hasInitiated = false;

        return function () {

            var state = $document.readyState,
                readyStates = ['interactive', 'complete'];

            if (!hasInitiated && ~readyStates.indexOf(state)) {

                hasInitiated = true;

                // No documents, no person.
                new Maple();
            }
        };
    })();

    // Support for async, defer, and normal inclusion.
    initialise();
    $document.addEventListener('DOMContentLoaded', initialise);
})(window, document);

},{"./helpers/Events.js":3,"./helpers/Logger.js":4,"./helpers/Options.js":5,"./helpers/Selectors.js":6,"./helpers/Utility.js":7,"./models/Component.js":8,"./models/Module.js":10}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports["default"] = (function main($window) {

    "use strict";

    /**
     * @property cache
     * @type {Object}
     */
    var cache = {};

    return {

        /**
         * Responsible for delegating to the native `fetch` function (polyfill provided), but will cache the
         * initial promise in order for other invocations to the same URL to yield the same promise.
         *
         * @method fetch
         * @param url {String}
         * @return {Promise}
         */
        fetch: function fetch(url) {

            if (cache[url]) {
                return cache[url];
            }

            cache[url] = new Promise(function (resolve) {

                $window.fetch(url).then(function (response) {
                    return response.text();
                }).then(function (body) {
                    resolve(body);
                });
            });

            return cache[url];
        }

    };
})(window);

module.exports = exports["default"];

},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _UtilityJs = require("./Utility.js");

var _UtilityJs2 = _interopRequireDefault(_UtilityJs);

/**
 * @method overrideStopPropagation
 * @see: http://bit.ly/1dPpxHl
 * @return {void}
 */
(function overrideStopPropagation() {

    "use strict";

    var overriddenStop = Event.prototype.stopPropagation;

    Event.prototype.stopPropagation = function stopPropagation() {
        this.isPropagationStopped = true;
        overriddenStop.apply(this, arguments);
    };
})();

exports["default"] = (function main($document) {

    "use strict";

    /**
     * @property components
     * @type {Array}
     */
    var components = [];

    /**
     * @property eventNames
     * @type {Array|null}
     */
    var eventNames = null;

    return {

        /**
         * Recursively discover a component via its React ID that is set as a data attribute
         * on each React element.
         *
         * @method findById
         * @param id {String}
         * @return {Object}
         */
        findById: function findById(id) {

            var model = undefined;

            /**
             * @method find
             * @param {Object} renderedComponent
             * @param {Object} currentComponent
             * @return {void}
             */
            function find(renderedComponent, currentComponent) {

                if (renderedComponent._rootNodeID === id) {

                    /**
                     * @method bindModel
                     * @return {void}
                     */
                    (function bindModel() {

                        model = {
                            properties: this._currentElement.props,
                            component: currentComponent
                        };
                    }).bind(renderedComponent)();

                    return;
                }

                if (renderedComponent._renderedComponent) {
                    (function () {

                        var children = renderedComponent._renderedComponent._renderedChildren;

                        if (children) {
                            Object.keys(children).forEach(function (index) {
                                find(children[index], currentComponent);
                            });
                        }
                    })();
                }
            }

            components.forEach(function (component) {
                find(component._reactInternalInstance._renderedComponent, component);
            });

            return model;
        },

        /**
         * @method transformKeys
         * @param {Object} map
         * @param {String} [transformer='toLowerCase']
         * @return {Object}
         */
        transformKeys: function transformKeys(map) {
            var transformer = arguments[1] === undefined ? "toLowerCase" : arguments[1];

            var transformedMap = {};

            Object.keys(map).forEach(function forEach(key) {
                transformedMap[key[transformer]()] = map[key];
            });

            return transformedMap;
        },

        /**
         * @method registerComponent
         * @param {Object} component
         * @return {void}
         */
        registerComponent: function registerComponent(component) {
            components.push(component);
        },

        /**
         * @method setupDelegation
         * @return {void}
         */
        setupDelegation: function setupDelegation() {
            var _this = this;

            /**
             * Determines all of the event types supported by the current browser. Will cache the results
             * of this discovery for performance benefits.
             *
             * @property events
             * @type {Array}
             */
            var events = eventNames || (function () {

                var aElement = $document.createElement("a"),
                    matcher = /^on/i,
                    eventNames = [];

                for (var key in aElement) {

                    if (key.match(matcher)) {
                        eventNames.push(key.replace(matcher, ""));
                    }
                }

                return eventNames;
            })();

            events.forEach(function (eventType) {

                $document.addEventListener(eventType, function (event) {

                    var eventName = "on" + event.type,
                        eventList = [];

                    _UtilityJs2["default"].toArray(event.path).forEach(function (item) {

                        if (event.isPropagationStopped) {

                            // Method `stopPropagation` was invoked on the current event, which prevents
                            // us from propagating any further.
                            return;
                        }

                        if (!item.getAttribute || !item.hasAttribute(_UtilityJs2["default"].ATTRIBUTE_REACTID)) {

                            // Current element is not a valid React element because it doesn't have a
                            // React ID data attribute.
                            return;
                        }

                        // Attempt to field the component by the associated React ID.
                        var model = _this.findById(item.getAttribute(_UtilityJs2["default"].ATTRIBUTE_REACTID));

                        if (model && model.properties) {

                            // Transform the current React events into lower case keys, so that we can pair them
                            // up with the event types.
                            var transformed = _this.transformKeys(model.properties);

                            if (eventName in transformed) {

                                // We defer the invocation of the event method, because otherwise React.js
                                // will re-render, and the React IDs will then be "out of sync" for this event.
                                eventList.push(transformed[eventName].bind(model.component, event));
                            }
                        }
                    });

                    // Invoke each found event for the event type.
                    eventList.forEach(function (eventInvocation) {
                        return eventInvocation();
                    });
                });
            });
        }

    };
})(window.document);

module.exports = exports["default"];

},{"./Utility.js":7}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

exports['default'] = (function main($console) {

    'use strict';

    return {

        /**
         * @method warn
         * @param {String} message
         * @return {void}
         */
        warn: function warn(message) {
            $console.log('%cMaple.js: %c' + message + '.', 'color: rgba(0, 0, 0, .5)', 'color: #5F9EA0');
        },

        /**
         * @method info
         * @param {String} message
         * @return {void}
         */
        info: function info(message) {
            $console.log('%cMaple.js: %c' + message + '.', 'color: rgba(0, 0, 0, .5)', 'color: #008DDB');
        },

        /**
         * @method error
         * @param {String} message
         * @return {void}
         */
        error: function error(message) {
            $console.log('%cMaple.js: %c' + message + '.', 'color: rgba(0, 0, 0, .5)', 'color: #CD6090');
        }

    };
})(window.console);

module.exports = exports['default'];

},{}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports["default"] = (function main() {

    "use strict";

    return {

        /**
         * @constant RESOLVE_TIMEOUT
         * @type {Number}
         * @default 60000
         */
        RESOLVE_TIMEOUT: 60000

    };
})();

module.exports = exports["default"];

},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _UtilityJs = require('./Utility.js');

var _UtilityJs2 = _interopRequireDefault(_UtilityJs);

/**
 * @method queryAll
 * @param {String} expression
 * @return {Array}
 */
var queryAll = function queryAll(expression) {

    'use strict';

    expression = Array.isArray(expression) ? expression.join(',') : expression;
    return _UtilityJs2['default'].toArray(this.querySelectorAll(expression));
};

exports['default'] = (function main() {

    'use strict';

    return {

        /**
         * @method getCSSLinks
         * @param {HTMLElement|HTMLDocument} element
         * @return {Array}
         */
        getCSSLinks: function getCSSLinks(element) {
            return queryAll.call(element, 'link[rel="stylesheet"]');
        },

        /**
         * @method getCSSInlines
         * @param {HTMLElement|HTMLDocument} element
         * @return {Array}
         */
        getCSSInlines: function getCSSInlines(element) {
            return queryAll.call(element, ['style[type="text/css"]', 'style:not([type])']);
        },

        /**
         * @method getImports
         * @param {HTMLElement|HTMLDocument} element
         * @return {Array}
         */
        getImports: function getImports(element) {
            return queryAll.call(element, 'link[rel="import"]:not([data-ignore])');
        },

        /**
         * @method getTemplates
         * @param {HTMLElement|HTMLDocument} element
         * @return {Array}
         */
        getTemplates: function getTemplates(element) {
            return queryAll.call(element, 'template[ref]');
        },

        /**
         * @method getScripts
         * @param {HTMLElement|HTMLDocument} element
         * @return {Array}
         */
        getScripts: function getScripts(element) {

            var selectors = ['script[type="text/javascript"]', 'script[type="application/javascript"]', 'script[type="text/ecmascript"]', 'script[type="application/ecmascript"]', 'script:not([type])'];

            return queryAll.call(element, selectors);
        },

        /**
         * @method getAllScripts
         * @param {HTMLElement|HTMLDocument} element
         * @return {Array}
         */
        getAllScripts: function getAllScripts(element) {
            var jsxFiles = queryAll.call(element, 'script[type="text/jsx"]');
            return [].concat(_UtilityJs2['default'].toArray(this.getScripts(element)), _UtilityJs2['default'].toArray(jsxFiles));
        }

    };
})();

module.exports = exports['default'];

},{"./Utility.js":7}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _LoggerJs = require('./Logger.js');

var _LoggerJs2 = _interopRequireDefault(_LoggerJs);

var _OptionsJs = require('./Options.js');

var _OptionsJs2 = _interopRequireDefault(_OptionsJs);

exports['default'] = (function main($document) {

    'use strict';

    return {

        /**
         * @constant ATTRIBUTE_REACTID
         * @type {String}
         */
        ATTRIBUTE_REACTID: 'data-reactid',

        /**
         * @method resolver
         * @param {String} url
         * @param {HTMLDocument|null} ownerDocument
         * @return {Object}
         */
        resolver: function resolver(url, ownerDocument) {

            var componentPath = this.getPath(url),
                getPath = this.getPath.bind(this),
                getName = this.getName.bind(this);
            /**
             * @method resolvePath
             * @param {String} path
             * @param {HTMLDocument} overrideDocument
             * @return {String}
             */
            function resolvePath(path) {
                var overrideDocument = arguments[1] === undefined ? $document : arguments[1];

                var a = overrideDocument.createElement('a');
                a.href = path;
                return a.href;
            }

            return {

                /**
                 * @property production
                 * @type {Object}
                 */
                production: {

                    /**
                     * @method getPath
                     * @param {String} path
                     * @return {String}
                     */
                    getPath: function getPath(path) {

                        if (this.isLocalPath(path)) {
                            return '' + this.getAbsolutePath() + '/' + getName(path);
                        }

                        return resolvePath(path, $document);
                    },

                    /**
                     * @method getSrc
                     * @return {String}
                     */
                    getSrc: function getSrc(src) {
                        return getName(src);
                    },

                    /**
                     * @method getAbsolutePath
                     * @return {String}
                     */
                    getAbsolutePath: function getAbsolutePath() {
                        return resolvePath(url);
                    },

                    /**
                     * @method getRelativePath
                     * @return {String}
                     */
                    getRelativePath: function getRelativePath() {
                        return url;
                    },

                    /**
                     * @method isLocalPath
                     * @param {String} path
                     * @return {Boolean}
                     */
                    isLocalPath: function isLocalPath(path) {
                        return !! ~path.indexOf(url);
                    }

                },

                /**
                 * @property development
                 * @type {Object}
                 */
                development: {

                    /**
                     * @method getPath
                     * @param {String} path
                     * @return {String}
                     */
                    getPath: function getPath(path) {

                        if (this.isLocalPath(path)) {
                            return '' + this.getAbsolutePath() + '/' + path;
                        }

                        return resolvePath(path, $document);
                    },

                    /**
                     * @method getSrc
                     * @return {String}
                     */
                    getSrc: function getSrc(src) {
                        return src;
                    },

                    /**
                     * @method getAbsolutePath
                     * @return {String}
                     */
                    getAbsolutePath: function getAbsolutePath() {
                        return resolvePath(componentPath);
                    },

                    /**
                     * @method getRelativePath
                     * @return {String}
                     */
                    getRelativePath: function getRelativePath() {
                        return componentPath;
                    },

                    /**
                     * @method isLocalPath
                     * @param path {String}
                     * @return {Boolean}
                     */
                    isLocalPath: function isLocalPath(path) {
                        path = getPath(resolvePath(path, ownerDocument));
                        return !! ~resolvePath(componentPath).indexOf(path);
                    }

                }

            };
        },

        /**
         * @method toArray
         * @param {*} arrayLike
         * @return {Array}
         */
        toArray: function toArray(arrayLike) {
            return Array.from ? Array.from(arrayLike) : Array.prototype.slice.apply(arrayLike);
        },

        /**
         * @method flattenArray
         * @param {Array} arr
         * @param {Array} [givenArr=[]]
         */
        flattenArray: function flattenArray(arr) {
            var _this = this;

            var givenArr = arguments[1] === undefined ? [] : arguments[1];

            /* jshint ignore:start */

            arr.forEach(function (item) {
                Array.isArray(item) && _this.flattenArray(item, givenArr);
                !Array.isArray(item) && givenArr.push(item);
            });

            /* jshint ignore:end */

            return givenArr;
        },

        /**
         * @method toSnakeCase
         * @param {String} camelCase
         * @param {String} [joiner='-']
         * @return {String}
         */
        toSnakeCase: function toSnakeCase(camelCase) {
            var joiner = arguments[1] === undefined ? '-' : arguments[1];

            return camelCase.split(/([A-Z][a-z]{0,})/g).filter(function (parts) {
                return parts;
            }).join(joiner).toLowerCase();
        },

        /**
         * @method getName
         * @param {String} importPath
         * @return {String}
         */
        getName: function getName(importPath) {
            return importPath.split('/').slice(-1);
        },

        /**
         * @method getPath
         * @param {String} importPath
         * @return {String}
         */
        getPath: function getPath(importPath) {
            return importPath.split('/').slice(0, -1).join('/');
        },

        /**
         * @method removeExtension
         * @param {String} filePath
         * @return {String}
         */
        removeExtension: function removeExtension(filePath) {
            return filePath.split('.').slice(0, -1).join('.');
        },

        /**
         * @method isHTMLImport
         * @param {HTMLElement} htmlElement
         * @return {Boolean}
         */
        isHTMLImport: function isHTMLImport(htmlElement) {

            var isInstance = htmlElement instanceof HTMLLinkElement,
                isImport = String(htmlElement.getAttribute('rel')).toLowerCase() === 'import',
                hasHrefAttr = htmlElement.hasAttribute('href'),
                hasTypeHtml = String(htmlElement.getAttribute('type')).toLowerCase() === 'text/html';

            return isInstance && isImport && hasHrefAttr && hasTypeHtml;
        },

        /**
         * @method resolveTimeout
         * @param {String} errorMessage
         * @param {Function} reject
         * @return {void}
         */
        resolveTimeout: function resolveTimeout(errorMessage, reject) {
            setTimeout(function () {
                return reject(errorMessage);
            }, _OptionsJs2['default'].RESOLVE_TIMEOUT);
        },

        /**
         * Casts primitive values into their respective types. Ignores complex types, including JSON objects.
         * Currently supported are: booleans, integers, and floats.
         *
         * @method typecastProperty
         * @param {String} value
         * @return {*}
         */
        typecastProperty: function typecastProperty(value) {

            if (String(value).match(/^\d+$/)) {
                value = Number(value);
            }

            if (String(value).match(/^\d+\.\d+/i)) {
                value = parseFloat(value);
            }

            if (~['true', 'false'].indexOf(value)) {
                value = value === 'true';
            }

            return value;
        },

        /**
         * @method tryRegisterElement
         * @param {String} name
         * @param {Object} properties
         * @return {void}
         */
        tryRegisterElement: function tryRegisterElement(name, properties) {

            /**
             * @constant ERROR_MAP
             * @type {Object}
             */
            var ERROR_MAP = {
                'A type with that name is already registered': 'Custom element "' + name + '" has already been registered',
                'The type name is invalid': 'Element name ' + name + ' is invalid and must consist of at least one hyphen'
            };

            try {

                $document.registerElement(name, properties);
            } catch (e) {

                var errorData = Object.keys(ERROR_MAP).map(function (error) {

                    var regExp = new RegExp(error, 'i');

                    if (e.message.match(regExp)) {
                        _LoggerJs2['default'].error(ERROR_MAP[error]);
                        return true;
                    }

                    return false;
                });

                if (!errorData.some(function (model) {
                    return model;
                })) {
                    throw e;
                }
            }
        }

    };
})(window.document);

module.exports = exports['default'];

},{"./Logger.js":4,"./Options.js":5}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _ElementJs = require('./Element.js');

var _ElementJs2 = _interopRequireDefault(_ElementJs);

var _helpersUtilityJs = require('./../helpers/Utility.js');

var _helpersUtilityJs2 = _interopRequireDefault(_helpersUtilityJs);

var _helpersLoggerJs = require('./../helpers/Logger.js');

var _helpersLoggerJs2 = _interopRequireDefault(_helpersLoggerJs);

var _helpersOptionsJs = require('./../helpers/Options.js');

var _helpersOptionsJs2 = _interopRequireDefault(_helpersOptionsJs);

var _StateManagerJs = require('./StateManager.js');

/**
 * @module Maple
 * @submodule Component
 * @extends StateManager
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Maple.js
 */

var Component = (function (_StateManager) {

    /**
     * Responsible for loading any prerequisites before the component is delegated to each `CustomElement`
     * object for creating a custom element, and lastly rendering the React component to the designated HTML element.
     *
     * @constructor
     * @param {String} path
     * @param {HTMLTemplateElement} templateElement
     * @param {HTMLScriptElement} scriptElement
     * @return {Module}
     */

    function Component(path, templateElement, scriptElement) {
        var _this = this;

        _classCallCheck(this, Component);

        _get(Object.getPrototypeOf(Component.prototype), 'constructor', this).call(this);
        this.path = path;
        this.elements = { script: scriptElement, template: templateElement };

        var src = scriptElement.getAttribute('src');
        this.setState(_StateManagerJs.State.RESOLVING);

        // Configure the URL of the component for ES6 `System.import`, which is also polyfilled in case the
        // current browser does not provide support for dynamic module loading.
        var url = '' + this.path.getRelativePath() + '/' + _helpersUtilityJs2['default'].removeExtension(src);

        if (src.split('.').pop().toLowerCase() === 'jsx') {
            return void _helpersLoggerJs2['default'].error('Use JS extension instead of JSX – JSX compilation will work as expected');
        }

        System['import']('' + url).then(function (imports) {

            if (!imports['default']) {

                // Components that do not have a default export (i.e: export default class...) will be ignored.
                return;
            }

            // Load all third-party scripts that are a prerequisite of resolving the custom element.
            Promise.all(_this.loadThirdPartyScripts()).then(function () {
                new _ElementJs2['default'](path, templateElement, scriptElement, imports['default']);
                _this.setState(_StateManagerJs.State.RESOLVED);
            }, function (message) {
                return _helpersLoggerJs2['default'].error(message);
            });
        });
    }

    _inherits(Component, _StateManager);

    _createClass(Component, [{
        key: 'loadThirdPartyScripts',

        /**
         * Discover all of the third party JavaScript dependencies that are required to have been loaded before
         * attempting to render the custom element.
         *
         * @method loadThirdPartyScripts
         * @return {Promise[]}
         */
        value: function loadThirdPartyScripts() {
            var _this2 = this;

            var scriptElements = _helpersUtilityJs2['default'].toArray(this.elements.template.content.querySelectorAll('script[type="text/javascript"]')),
                thirdPartyScripts = scriptElements.filter(function (scriptElement) {
                return !_this2.path.isLocalPath(scriptElement.getAttribute('src'));
            });

            return thirdPartyScripts.map(function (scriptElement) {

                var src = scriptElement.getAttribute('src');
                scriptElement = document.createElement('script');
                scriptElement.setAttribute('type', 'text/javascript');
                scriptElement.setAttribute('src', src);

                return new Promise(function (resolve, reject) {

                    scriptElement.addEventListener('load', function () {
                        return resolve();
                    });
                    document.head.appendChild(scriptElement);

                    var href = scriptElement.getAttribute('src'),
                        errorMessage = 'Timeout of ' + _helpersOptionsJs2['default'].RESOLVE_TIMEOUT / 1000 + ' seconds exceeded whilst waiting for third-party script: "' + href + '"';
                    _helpersUtilityJs2['default'].resolveTimeout(errorMessage, reject);
                });
            });
        }
    }]);

    return Component;
})(_StateManagerJs.StateManager);

exports['default'] = Component;
module.exports = exports['default'];

},{"./../helpers/Logger.js":4,"./../helpers/Options.js":5,"./../helpers/Utility.js":7,"./Element.js":9,"./StateManager.js":11}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _helpersEventsJs = require('./../helpers/Events.js');

var _helpersEventsJs2 = _interopRequireDefault(_helpersEventsJs);

var _helpersUtilityJs = require('./../helpers/Utility.js');

var _helpersUtilityJs2 = _interopRequireDefault(_helpersUtilityJs);

var _helpersLoggerJs = require('./../helpers/Logger.js');

var _helpersLoggerJs2 = _interopRequireDefault(_helpersLoggerJs);

var _helpersCacheFactoryJs = require('./../helpers/CacheFactory.js');

var _helpersCacheFactoryJs2 = _interopRequireDefault(_helpersCacheFactoryJs);

var _helpersSelectorsJs = require('./../helpers/Selectors.js');

var _helpersSelectorsJs2 = _interopRequireDefault(_helpersSelectorsJs);

var _StateManagerJs = require('./StateManager.js');

/**
 * @module Maple
 * @submodule CustomElement
 * @extends StateManager
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Maple.js
 */

var CustomElement = (function (_StateManager) {

    /**
     * @constructor
     * @param {String} path
     * @param {HTMLScriptElement} scriptElement
     * @param {HTMLTemplateElement} templateElement
     * @param {String} importScript
     * @return {Element}
     */

    function CustomElement(path, templateElement, scriptElement, importScript) {
        _classCallCheck(this, CustomElement);

        _get(Object.getPrototypeOf(CustomElement.prototype), 'constructor', this).call(this);
        this.path = path;
        this.sass = typeof Sass === 'undefined' ? null : new Sass();
        this.elements = { script: scriptElement, template: templateElement };
        this.script = importScript;

        var descriptor = this.getDescriptor();

        if (!descriptor.extend) {

            return void _helpersUtilityJs2['default'].tryRegisterElement(descriptor.name, {
                prototype: this.getElementPrototype()
            });
        }

        var prototype = 'HTML' + descriptor.extend + 'Element';

        _helpersUtilityJs2['default'].tryRegisterElement(descriptor.name, {
            prototype: this.getElementPrototype(window[prototype].prototype),
            'extends': descriptor.extend.toLowerCase()
        });
    }

    _inherits(CustomElement, _StateManager);

    _createClass(CustomElement, [{
        key: 'loadStyles',

        /**
         * Responsible for loading associated styles into either the shadow DOM, if the path is determined to be local
         * to the component, or globally if not.
         *
         * @method loadStyles
         * @param {ShadowRoot} shadowBoundary
         * @return {Promise[]}
         */
        value: function loadStyles(shadowBoundary) {
            var _this = this;

            /**
             * @method addCSS
             * @param {String} body
             * @return {void}
             */
            function addCSS(body) {
                var styleElement = document.createElement('style');
                styleElement.setAttribute('type', 'text/css');
                styleElement.innerHTML = body;
                shadowBoundary.appendChild(styleElement);
            }

            this.setState(_StateManagerJs.State.RESOLVING);

            var content = this.elements.template.content;
            var linkElements = _helpersSelectorsJs2['default'].getCSSLinks(content);
            var styleElements = _helpersSelectorsJs2['default'].getCSSInlines(content);
            var promises = [].concat(linkElements, styleElements).map(function (element) {
                return new Promise(function (resolve) {

                    if (element.nodeName.toLowerCase() === 'style') {
                        addCSS(element.innerHTML);
                        resolve(element.innerHTML);
                        return;
                    }

                    _helpersCacheFactoryJs2['default'].fetch(_this.path.getPath(element.getAttribute('href'))).then(function (body) {

                        if (element.getAttribute('type') === 'text/scss') {

                            if (!_this.sass) {
                                _helpersLoggerJs2['default'].error('You should include "sass.js" for development runtime SASS compilation');
                                return void reject();
                            }

                            _helpersLoggerJs2['default'].warn('All of your SASS documents should be compiled to CSS for production via your build process');

                            // Compile SCSS document into CSS prior to appending it to the body.
                            return void _this.sass.compile(body, function (response) {
                                addCSS(response.text);
                                resolve(response.text);
                            });
                        }

                        addCSS(body);
                        resolve(body);
                    });
                });
            });

            Promise.all(promises).then(function () {
                return _this.setState(_StateManagerJs.State.RESOLVED);
            });
            return promises;
        }
    }, {
        key: 'getDescriptor',

        /**
         * Extract the element name, and optionally the element extension, from converting the Function to a String via
         * the `toString` method. It's worth noting that this is probably the weakest part of the Maple system because it
         * relies on a regular expression to determine the name of the resulting custom HTML element.
         *
         * @method getDescriptor
         * @return {Object}
         */
        value: function getDescriptor() {

            // With ES6 the `Function.prototype.name` property is beginning to be standardised, which means
            // in many cases we won't have to resort to the feeble `toString` approach. Hoorah!
            var name = this.script.name || this.script.toString().match(/(?:function|class)\s*([a-z_]+)/i)[1],
                extend = null;

            if (~name.indexOf('_')) {

                // Does the element name reference an element to extend?
                var split = name.split('_');
                name = split[0];
                extend = split[1];
            }

            return { name: _helpersUtilityJs2['default'].toSnakeCase(name), extend: extend };
        }
    }, {
        key: 'getElementPrototype',

        /**
         * Yields the prototype for the custom HTML element that will be registered for our custom React component.
         * It listens for when the custom element has been inserted into the DOM, and then sets up the styles, applies
         * default React properties, etc...
         *
         * @method getElementPrototype
         * @param {Object} elementPrototype
         * @return {Object}
         */
        value: function getElementPrototype(elementPrototype) {

            var loadStyles = this.loadStyles.bind(this),
                script = this.script,
                path = this.path;

            return Object.create(elementPrototype || HTMLElement.prototype, {

                /**
                 * @property attachedCallback
                 * @type {Object}
                 */
                attachedCallback: {

                    /**
                     * @method value
                     * @return {void}
                     */
                    value: function value() {

                        /**
                         * @method setDefaultProps
                         * @param {Object} attributes
                         * @return {void}
                         */
                        function setDefaultProps(attributes) {

                            attributes = Array.prototype.slice.apply(attributes);
                            var replacer = /^data-/i;

                            attributes.forEach(function (attribute) {

                                if (attribute.name === _helpersUtilityJs2['default'].ATTRIBUTE_REACTID) {
                                    return;
                                }

                                // Typecast the value depending on the type.
                                var name = attribute.name.replace(replacer, '');
                                script.defaultProps[name] = _helpersUtilityJs2['default'].typecastProperty(attribute.value);
                            });
                        }

                        // Apply properties to the custom element.
                        script.defaultProps = { path: path, element: this.cloneNode(true) };
                        setDefaultProps.call(this, this.attributes);
                        this.innerHTML = '';

                        // Configure the React.js component, importing it under the shadow boundary.
                        var renderedElement = React.createElement(script),
                            contentElement = document.createElement('content'),
                            shadowRoot = this.createShadowRoot();

                        shadowRoot.appendChild(contentElement);
                        var component = React.render(renderedElement, contentElement);

                        // Configure the event delegation for the component.
                        _helpersEventsJs2['default'].registerComponent(component);

                        /**
                         * Import external CSS documents and resolve element.
                         *
                         * @method resolveElement
                         * @return {void}
                         */
                        function resolveElement() {
                            var _this2 = this;

                            Promise.all(loadStyles(shadowRoot)).then(function () {
                                _this2.removeAttribute('unresolved');
                                _this2.setAttribute('resolved', '');
                            });
                        }

                        resolveElement.apply(this);
                    }

                }

            });
        }
    }]);

    return CustomElement;
})(_StateManagerJs.StateManager);

exports['default'] = CustomElement;
module.exports = exports['default'];

},{"./../helpers/CacheFactory.js":2,"./../helpers/Events.js":3,"./../helpers/Logger.js":4,"./../helpers/Selectors.js":6,"./../helpers/Utility.js":7,"./StateManager.js":11}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _ComponentJs = require('./Component.js');

var _ComponentJs2 = _interopRequireDefault(_ComponentJs);

var _helpersUtilityJs = require('./../helpers/Utility.js');

var _helpersUtilityJs2 = _interopRequireDefault(_helpersUtilityJs);

var _helpersLoggerJs = require('./../helpers/Logger.js');

var _helpersLoggerJs2 = _interopRequireDefault(_helpersLoggerJs);

var _helpersOptionsJs = require('./../helpers/Options.js');

var _helpersOptionsJs2 = _interopRequireDefault(_helpersOptionsJs);

var _helpersSelectorsJs = require('./../helpers/Selectors.js');

var _helpersSelectorsJs2 = _interopRequireDefault(_helpersSelectorsJs);

var _StateManagerJs = require('./StateManager.js');

var Module = (function (_StateManager) {

    /**
     * @constructor
     * @param {HTMLLinkElement} linkElement
     * @return {Component}
     */

    function Module(linkElement) {
        var _this = this;

        _classCallCheck(this, Module);

        _get(Object.getPrototypeOf(Module.prototype), 'constructor', this).call(this);
        this.path = _helpersUtilityJs2['default'].resolver(linkElement.getAttribute('href'), linkElement['import']).development;
        this.state = _StateManagerJs.State.UNRESOLVED;
        this.elements = { link: linkElement };
        this.components = [];

        this.loadModule(linkElement).then(function () {

            // Use only the first template, because otherwise Mapleify will have a difficult job attempting
            // to resolve the paths when there's a mismatch between template elements and link elements.
            // PREVIOUS: this.getTemplates().forEach((templateElement) => {

            var templateElements = _this.getTemplates();

            if (templateElements.length > 1) {
                _helpersLoggerJs2['default'].error('Component "' + linkElement.getAttribute('href') + '" is attempting to register two components');
                return;
            }

            [_this.getTemplates()[0]].forEach(function (templateElement) {

                var scriptElements = _helpersSelectorsJs2['default'].getAllScripts(templateElement.content);

                scriptElements.map(function (scriptElement) {

                    var src = scriptElement.getAttribute('src');

                    if (!_this.path.isLocalPath(src)) {
                        return;
                    }

                    var component = new _ComponentJs2['default'](_this.path, templateElement, scriptElement);
                    _this.components.push(component);
                });
            });

            _this.setState(_StateManagerJs.State.RESOLVED);
        }, function (message) {
            return _helpersLoggerJs2['default'].error(message);
        });
    }

    _inherits(Module, _StateManager);

    _createClass(Module, [{
        key: 'setState',

        /**
         * @method setState
         * @param {Number} state
         * @return {void}
         */
        value: function setState(state) {
            this.state = state;
        }
    }, {
        key: 'loadModule',

        /**
         * @method loadModule
         * @param {HTMLTemplateElement} linkElement
         * @return {Promise}
         */
        value: function loadModule(linkElement) {

            this.setState(_StateManagerJs.State.RESOLVING);

            return new Promise(function (resolve, reject) {

                if (linkElement.hasAttribute('ref')) {
                    return void resolve(linkElement);
                }

                if (linkElement['import']) {
                    return void resolve(linkElement);
                }

                linkElement.addEventListener('load', function () {
                    return resolve(linkElement);
                });

                var href = linkElement.getAttribute('href'),
                    errorMessage = 'Timeout of ' + _helpersOptionsJs2['default'].RESOLVE_TIMEOUT / 1000 + ' seconds exceeded whilst waiting for HTML import: "' + href + '"';
                _helpersUtilityJs2['default'].resolveTimeout(errorMessage, reject);
            });
        }
    }, {
        key: 'getTemplates',

        /**
         * @method getTemplates
         * @return {Array}
         */
        value: function getTemplates() {

            var ownerDocument = this.elements.link['import'];
            return _helpersUtilityJs2['default'].toArray(ownerDocument.querySelectorAll('template'));
        }
    }]);

    return Module;
})(_StateManagerJs.StateManager);

exports['default'] = Module;
module.exports = exports['default'];

},{"./../helpers/Logger.js":4,"./../helpers/Options.js":5,"./../helpers/Selectors.js":6,"./../helpers/Utility.js":7,"./Component.js":8,"./StateManager.js":11}],11:[function(require,module,exports){
/**
 * @constant State
 * @type {{UNRESOLVED: number, RESOLVING: number, RESOLVED: number}}
 */
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var State = { UNRESOLVED: 0, RESOLVING: 1, RESOLVED: 2 };

exports.State = State;
/**
 * @module Maple
 * @submodule StateManager
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Maple.js
 */

var StateManager = (function () {

  /**
   * @constructor
   * @return {Abstract}
   */

  function StateManager() {
    _classCallCheck(this, StateManager);

    this.state = State.UNRESOLVED;
  }

  _createClass(StateManager, [{
    key: "setState",

    /**
     * @method setState
     * @param {Number} state
     * @return {void}
     */
    value: function setState(state) {
      this.state = state;
    }
  }]);

  return StateManager;
})();

exports.StateManager = StateManager;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9NYXBsZS5qcy9zcmMvTWFwbGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9NYXBsZS5qcy9zcmMvaGVscGVycy9DYWNoZUZhY3RvcnkuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9NYXBsZS5qcy9zcmMvaGVscGVycy9FdmVudHMuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9NYXBsZS5qcy9zcmMvaGVscGVycy9Mb2dnZXIuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9NYXBsZS5qcy9zcmMvaGVscGVycy9PcHRpb25zLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvTWFwbGUuanMvc3JjL2hlbHBlcnMvU2VsZWN0b3JzLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvTWFwbGUuanMvc3JjL2hlbHBlcnMvVXRpbGl0eS5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L01hcGxlLmpzL3NyYy9tb2RlbHMvQ29tcG9uZW50LmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvTWFwbGUuanMvc3JjL21vZGVscy9FbGVtZW50LmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvTWFwbGUuanMvc3JjL21vZGVscy9Nb2R1bGUuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9NYXBsZS5qcy9zcmMvbW9kZWxzL1N0YXRlTWFuYWdlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7OzhCQ0FzQixvQkFBb0I7Ozs7aUNBQ3BCLHVCQUF1Qjs7OztrQ0FDdkIsd0JBQXdCOzs7O2dDQUN4QixzQkFBc0I7Ozs7K0JBQ3RCLHFCQUFxQjs7OzsrQkFDckIscUJBQXFCOzs7O2dDQUNy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QUFNLENBQUMsQ0FBQzthQUVoRCxDQUFDLENBQUM7U0FFTjs7Ozs7Ozs7ZUFNVyx3QkFBRzs7QUFFWCxnQkFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLFVBQU8sQ0FBQztBQUM5QyxtQkFBTyw4QkFBUSxPQUFPLENBQUMsYUFBYSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7U0FFdEU7OztXQXBHZ0IsTUFBTTttQkFGbkIsWUFBWTs7cUJBRUMsTUFBTTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDSHBCLElBQU0sS0FBSyxHQUFHLEVBQUUsVUFBVSxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsQ0FBQzs7UUFBckQsS0FBSyxHQUFMLEtBQUs7Ozs7Ozs7O0lBUUwsWUFBWTs7Ozs7OztBQU1WLFdBTkYsWUFBWSxHQU1QOzBCQU5MLFlBQVk7O0FBT2pCLFFBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQztHQUNqQzs7ZUFSUSxZQUFZOzs7Ozs7OztXQWViLGtCQUFDLEtBQUssRUFBRTtBQUNaLFVBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0tBQ3RCOzs7U0FqQlEsWUFBWTs7O1FBQVosWUFBWSxHQUFaLFlBQVkiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IE1vZHVsZSAgICBmcm9tICcuL21vZGVscy9Nb2R1bGUuanMnO1xuaW1wb3J0IENvbXBvbmVudCBmcm9tICcuL21vZGVscy9Db21wb25lbnQuanMnO1xuaW1wb3J0IHNlbGVjdG9ycyBmcm9tICcuL2hlbHBlcnMvU2VsZWN0b3JzLmpzJztcbmltcG9ydCB1dGlsaXR5ICAgZnJvbSAnLi9oZWxwZXJzL1V0aWxpdHkuanMnO1xuaW1wb3J0IGxvZ2dlciAgICBmcm9tICcuL2hlbHBlcnMvTG9nZ2VyLmpzJztcbmltcG9ydCBldmVudHMgICAgZnJvbSAnLi9oZWxwZXJzL0V2ZW50cy5qcyc7XG5pbXBvcnQgb3B0aW9ucyAgIGZyb20gJy4vaGVscGVycy9PcHRpb25zLmpzJztcblxuKGZ1bmN0aW9uIG1haW4oJHdpbmRvdywgJGRvY3VtZW50KSB7XG5cbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIGlmICh0eXBlb2YgU3lzdGVtICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBTeXN0ZW0udHJhbnNwaWxlciAgID0gJ2JhYmVsJztcbiAgICAgICAgU3lzdGVtLmJhYmVsT3B0aW9ucyA9IHsgYmxhY2tsaXN0OiBbXSB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtb2R1bGUgTWFwbGVcbiAgICAgKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L01hcGxlLmpzXG4gICAgICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAgICAgKi9cbiAgICBjbGFzcyBNYXBsZSB7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3RydWN0b3IoKSB7XG5cbiAgICAgICAgICAgIHRoaXMuZmluZExpbmtzKCk7XG4gICAgICAgICAgICB0aGlzLmZpbmRUZW1wbGF0ZXMoKTtcblxuICAgICAgICAgICAgLy8gQ29uZmlndXJlIHRoZSBldmVudCBkZWxlZ2F0aW9uIG1hcHBpbmdzLlxuICAgICAgICAgICAgZXZlbnRzLnNldHVwRGVsZWdhdGlvbigpO1xuXG4gICAgICAgICAgICAvLyBMaXN0ZW4gZm9yIGFueSBjaGFuZ2VzIHRvIHRoZSBET00gd2hlcmUgSFRNTCBpbXBvcnRzIGNhbiBiZSBkeW5hbWljYWxseSBpbXBvcnRlZFxuICAgICAgICAgICAgLy8gaW50byB0aGUgZG9jdW1lbnQuXG4gICAgICAgICAgICB0aGlzLm9ic2VydmVNdXRhdGlvbnMoKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJlc3BvbnNpYmxlIGZvciBmaW5kaW5nIGFsbCBvZiB0aGUgZXh0ZXJuYWwgbGluayBlbGVtZW50cywgYXMgd2VsbCBhcyB0aGUgaW5saW5lIHRlbXBsYXRlIGVsZW1lbnRzXG4gICAgICAgICAqIHRoYXQgY2FuIGJlIGhhbmRjcmFmdGVkLCBvciBiYWtlZCBpbnRvIHRoZSBIVE1MIGRvY3VtZW50IHdoZW4gY29tcGlsaW5nIGEgcHJvamVjdC5cbiAgICAgICAgICpcbiAgICAgICAgICogQG1ldGhvZCBmaW5kTGlua3NcbiAgICAgICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgICAgICovXG4gICAgICAgIGZpbmRMaW5rcygpIHtcblxuICAgICAgICAgICAgc2VsZWN0b3JzLmdldEltcG9ydHMoJGRvY3VtZW50KS5mb3JFYWNoKChsaW5rRWxlbWVudCkgPT4gdGhpcy53YWl0Rm9yTGlua0VsZW1lbnQobGlua0VsZW1lbnQpKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJlc3BvbnNpYmxlIGZvciBmaW5kaW5nIGFsbCBvZiB0aGUgdGVtcGxhdGUgSFRNTCBlbGVtZW50cyB0aGF0IGNvbnRhaW4gdGhlIGByZWZgIGF0dHJpYnV0ZSB3aGljaFxuICAgICAgICAgKiBpcyB0aGUgY29tcG9uZW50J3Mgb3JpZ2luYWwgcGF0aCBiZWZvcmUgTWFwbGVpZnkuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBtZXRob2QgZmluZFRlbXBsYXRlc1xuICAgICAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAgICAgKi9cbiAgICAgICAgZmluZFRlbXBsYXRlcygpIHtcblxuICAgICAgICAgICAgc2VsZWN0b3JzLmdldFRlbXBsYXRlcygkZG9jdW1lbnQpLmZvckVhY2goKHRlbXBsYXRlRWxlbWVudCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgbGV0IHNjcmlwdEVsZW1lbnRzID0gc2VsZWN0b3JzLmdldEFsbFNjcmlwdHModGVtcGxhdGVFbGVtZW50LmNvbnRlbnQpO1xuICAgICAgICAgICAgICAgIGxldCByZWYgICAgICAgICAgICA9IHRlbXBsYXRlRWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3JlZicpO1xuICAgICAgICAgICAgICAgIGxldCBwYXRoICAgICAgICAgICA9IHV0aWxpdHkucmVzb2x2ZXIocmVmLCBudWxsKS5wcm9kdWN0aW9uO1xuXG4gICAgICAgICAgICAgICAgc2NyaXB0RWxlbWVudHMuZm9yRWFjaCgoc2NyaXB0RWxlbWVudCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXRoLmlzTG9jYWxQYXRoKHNjcmlwdEVsZW1lbnQuZ2V0QXR0cmlidXRlKCdzcmMnKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBDb21wb25lbnQocGF0aCwgdGVtcGxhdGVFbGVtZW50LCBzY3JpcHRFbGVtZW50KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCB3YWl0Rm9yTGlua0VsZW1lbnRcbiAgICAgICAgICogQHBhcmFtIHtIVE1MTGlua0VsZW1lbnR9IGxpbmtFbGVtZW50XG4gICAgICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICAgICAqL1xuICAgICAgICB3YWl0Rm9yTGlua0VsZW1lbnQobGlua0VsZW1lbnQpIHtcblxuICAgICAgICAgICAgaWYgKGxpbmtFbGVtZW50LmltcG9ydCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB2b2lkIG5ldyBNb2R1bGUobGlua0VsZW1lbnQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cbiAgICAgICAgICAgICAgICBsaW5rRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgKCkgPT4gcmVzb2x2ZShsaW5rRWxlbWVudCkpO1xuXG4gICAgICAgICAgICAgICAgbGV0IGhyZWYgICAgICAgICA9IGxpbmtFbGVtZW50LmdldEF0dHJpYnV0ZSgnaHJlZicpLFxuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2UgPSBgVGltZW91dCBvZiAke29wdGlvbnMuUkVTT0xWRV9USU1FT1VUIC8gMTAwMH0gc2Vjb25kcyBleGNlZWRlZCB3aGlsc3Qgd2FpdGluZyBmb3IgSFRNTCBpbXBvcnQ6IFwiJHtocmVmfVwiYDtcbiAgICAgICAgICAgICAgICB1dGlsaXR5LnJlc29sdmVUaW1lb3V0KGVycm9yTWVzc2FnZSwgcmVqZWN0KTtcblxuICAgICAgICAgICAgfSkudGhlbigobGlua0VsZW1lbnQpID0+IG5ldyBNb2R1bGUobGlua0VsZW1lbnQpLCAobWVzc2FnZSkgPT4gbG9nZ2VyLmVycm9yKG1lc3NhZ2UpKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIExpc3RlbnMgZm9yIGNoYW5nZXMgdG8gdGhlIGBIVE1MSGVhZEVsZW1lbnRgIG5vZGUgYW5kIHJlZ2lzdGVycyBhbnkgbmV3IGltcG9ydHMgdGhhdCBhcmVcbiAgICAgICAgICogZHluYW1pY2FsbHkgaW1wb3J0ZWQgaW50byB0aGUgZG9jdW1lbnQuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBtZXRob2Qgb2JzZXJ2ZU11dGF0aW9uc1xuICAgICAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAgICAgKi9cbiAgICAgICAgb2JzZXJ2ZU11dGF0aW9ucygpIHtcblxuICAgICAgICAgICAgbGV0IG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKG11dGF0aW9ucykgPT4ge1xuXG4gICAgICAgICAgICAgICAgbXV0YXRpb25zLmZvckVhY2goKG11dGF0aW9uKSA9PiB7XG5cbiAgICAgICAgICAgICAgICAgICAgbGV0IGFkZGVkTm9kZXMgPSB1dGlsaXR5LnRvQXJyYXkobXV0YXRpb24uYWRkZWROb2Rlcyk7XG5cbiAgICAgICAgICAgICAgICAgICAgYWRkZWROb2Rlcy5mb3JFYWNoKChub2RlKSA9PiB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh1dGlsaXR5LmlzSFRNTEltcG9ydChub2RlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMud2FpdEZvckxpbmtFbGVtZW50KG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgfSk7XG5cblxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIG9ic2VydmVyLm9ic2VydmUoJGRvY3VtZW50LmhlYWQsIHsgY2hpbGRMaXN0OiB0cnVlIH0pO1xuXG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgaW5pdGlhbGlzZVxuICAgICAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICAgICAqL1xuICAgIGxldCBpbml0aWFsaXNlID0gKGZ1bmN0aW9uIGluaXRpYWxpc2UoKSB7XG4gICAgICAgIFxuICAgICAgICBsZXQgaGFzSW5pdGlhdGVkID0gZmFsc2U7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIGxldCBzdGF0ZSAgICAgICA9ICRkb2N1bWVudC5yZWFkeVN0YXRlLFxuICAgICAgICAgICAgICAgIHJlYWR5U3RhdGVzID0gWydpbnRlcmFjdGl2ZScsICdjb21wbGV0ZSddO1xuXG4gICAgICAgICAgICBpZiAoIWhhc0luaXRpYXRlZCAmJiB+cmVhZHlTdGF0ZXMuaW5kZXhPZihzdGF0ZSkpIHtcblxuICAgICAgICAgICAgICAgIGhhc0luaXRpYXRlZCA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICAvLyBObyBkb2N1bWVudHMsIG5vIHBlcnNvbi5cbiAgICAgICAgICAgICAgICBuZXcgTWFwbGUoKTtcblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgIH1cblxuICAgIH0pKCk7XG5cbiAgICAvLyBTdXBwb3J0IGZvciBhc3luYywgZGVmZXIsIGFuZCBub3JtYWwgaW5jbHVzaW9uLlxuICAgIGluaXRpYWxpc2UoKTtcbiAgICAkZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGluaXRpYWxpc2UpO1xuXG59KSh3aW5kb3csIGRvY3VtZW50KTsiLCJleHBvcnQgZGVmYXVsdCAoZnVuY3Rpb24gbWFpbigkd2luZG93KSB7XG5cbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIC8qKlxuICAgICAqIEBwcm9wZXJ0eSBjYWNoZVxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICovXG4gICAgbGV0IGNhY2hlID0ge307XG5cbiAgICByZXR1cm4ge1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXNwb25zaWJsZSBmb3IgZGVsZWdhdGluZyB0byB0aGUgbmF0aXZlIGBmZXRjaGAgZnVuY3Rpb24gKHBvbHlmaWxsIHByb3ZpZGVkKSwgYnV0IHdpbGwgY2FjaGUgdGhlXG4gICAgICAgICAqIGluaXRpYWwgcHJvbWlzZSBpbiBvcmRlciBmb3Igb3RoZXIgaW52b2NhdGlvbnMgdG8gdGhlIHNhbWUgVVJMIHRvIHlpZWxkIHRoZSBzYW1lIHByb21pc2UuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBtZXRob2QgZmV0Y2hcbiAgICAgICAgICogQHBhcmFtIHVybCB7U3RyaW5nfVxuICAgICAgICAgKiBAcmV0dXJuIHtQcm9taXNlfVxuICAgICAgICAgKi9cbiAgICAgICAgZmV0Y2godXJsKSB7XG5cbiAgICAgICAgICAgIGlmIChjYWNoZVt1cmxdKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhY2hlW3VybF07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNhY2hlW3VybF0gPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuXG4gICAgICAgICAgICAgICAgJHdpbmRvdy5mZXRjaCh1cmwpLnRoZW4oKHJlc3BvbnNlKSA9PiByZXNwb25zZS50ZXh0KCkpLnRoZW4oKGJvZHkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShib2R5KTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBjYWNoZVt1cmxdO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbn0pKHdpbmRvdyk7IiwiaW1wb3J0IHV0aWxpdHkgZnJvbSAnLi9VdGlsaXR5LmpzJztcblxuLyoqXG4gKiBAbWV0aG9kIG92ZXJyaWRlU3RvcFByb3BhZ2F0aW9uXG4gKiBAc2VlOiBodHRwOi8vYml0Lmx5LzFkUHB4SGxcbiAqIEByZXR1cm4ge3ZvaWR9XG4gKi9cbihmdW5jdGlvbiBvdmVycmlkZVN0b3BQcm9wYWdhdGlvbigpIHtcblxuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgbGV0IG92ZXJyaWRkZW5TdG9wID0gRXZlbnQucHJvdG90eXBlLnN0b3BQcm9wYWdhdGlvbjtcblxuICAgIEV2ZW50LnByb3RvdHlwZS5zdG9wUHJvcGFnYXRpb24gPSBmdW5jdGlvbiBzdG9wUHJvcGFnYXRpb24oKSB7XG4gICAgICAgIHRoaXMuaXNQcm9wYWdhdGlvblN0b3BwZWQgPSB0cnVlO1xuICAgICAgICBvdmVycmlkZGVuU3RvcC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG5cbn0pKCk7XG5cbmV4cG9ydCBkZWZhdWx0IChmdW5jdGlvbiBtYWluKCRkb2N1bWVudCkge1xuXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICAvKipcbiAgICAgKiBAcHJvcGVydHkgY29tcG9uZW50c1xuICAgICAqIEB0eXBlIHtBcnJheX1cbiAgICAgKi9cbiAgICBsZXQgY29tcG9uZW50cyA9IFtdO1xuXG4gICAgLyoqXG4gICAgICogQHByb3BlcnR5IGV2ZW50TmFtZXNcbiAgICAgKiBAdHlwZSB7QXJyYXl8bnVsbH1cbiAgICAgKi9cbiAgICBsZXQgZXZlbnROYW1lcyA9IG51bGw7XG5cbiAgICByZXR1cm4ge1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZWN1cnNpdmVseSBkaXNjb3ZlciBhIGNvbXBvbmVudCB2aWEgaXRzIFJlYWN0IElEIHRoYXQgaXMgc2V0IGFzIGEgZGF0YSBhdHRyaWJ1dGVcbiAgICAgICAgICogb24gZWFjaCBSZWFjdCBlbGVtZW50LlxuICAgICAgICAgKlxuICAgICAgICAgKiBAbWV0aG9kIGZpbmRCeUlkXG4gICAgICAgICAqIEBwYXJhbSBpZCB7U3RyaW5nfVxuICAgICAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICAgICAqL1xuICAgICAgICBmaW5kQnlJZChpZCkge1xuXG4gICAgICAgICAgICBsZXQgbW9kZWw7XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQG1ldGhvZCBmaW5kXG4gICAgICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gcmVuZGVyZWRDb21wb25lbnRcbiAgICAgICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBjdXJyZW50Q29tcG9uZW50XG4gICAgICAgICAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBmdW5jdGlvbiBmaW5kKHJlbmRlcmVkQ29tcG9uZW50LCBjdXJyZW50Q29tcG9uZW50KSB7XG5cbiAgICAgICAgICAgICAgICBpZiAocmVuZGVyZWRDb21wb25lbnQuX3Jvb3ROb2RlSUQgPT09IGlkKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIEBtZXRob2QgYmluZE1vZGVsXG4gICAgICAgICAgICAgICAgICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAoZnVuY3Rpb24gYmluZE1vZGVsKCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RlbCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB0aGlzLl9jdXJyZW50RWxlbWVudC5wcm9wcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6IGN1cnJlbnRDb21wb25lbnRcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgfS5iaW5kKHJlbmRlcmVkQ29tcG9uZW50KSkoKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAocmVuZGVyZWRDb21wb25lbnQuX3JlbmRlcmVkQ29tcG9uZW50KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgbGV0IGNoaWxkcmVuID0gcmVuZGVyZWRDb21wb25lbnQuX3JlbmRlcmVkQ29tcG9uZW50Ll9yZW5kZXJlZENoaWxkcmVuO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZHJlbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmtleXMoY2hpbGRyZW4pLmZvckVhY2goKGluZGV4KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmluZChjaGlsZHJlbltpbmRleF0sIGN1cnJlbnRDb21wb25lbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb21wb25lbnRzLmZvckVhY2goKGNvbXBvbmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIGZpbmQoY29tcG9uZW50Ll9yZWFjdEludGVybmFsSW5zdGFuY2UuX3JlbmRlcmVkQ29tcG9uZW50LCBjb21wb25lbnQpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBtb2RlbDtcblxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIHRyYW5zZm9ybUtleXNcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IG1hcFxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gW3RyYW5zZm9ybWVyPSd0b0xvd2VyQ2FzZSddXG4gICAgICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgICAgICovXG4gICAgICAgIHRyYW5zZm9ybUtleXMobWFwLCB0cmFuc2Zvcm1lciA9ICd0b0xvd2VyQ2FzZScpIHtcblxuICAgICAgICAgICAgbGV0IHRyYW5zZm9ybWVkTWFwID0ge307XG5cbiAgICAgICAgICAgIE9iamVjdC5rZXlzKG1hcCkuZm9yRWFjaChmdW5jdGlvbiBmb3JFYWNoKGtleSkge1xuICAgICAgICAgICAgICAgIHRyYW5zZm9ybWVkTWFwW2tleVt0cmFuc2Zvcm1lcl0oKV0gPSBtYXBba2V5XTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gdHJhbnNmb3JtZWRNYXA7XG5cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCByZWdpc3RlckNvbXBvbmVudFxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gY29tcG9uZW50XG4gICAgICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICAgICAqL1xuICAgICAgICByZWdpc3RlckNvbXBvbmVudChjb21wb25lbnQpIHtcbiAgICAgICAgICAgIGNvbXBvbmVudHMucHVzaChjb21wb25lbnQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIHNldHVwRGVsZWdhdGlvblxuICAgICAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAgICAgKi9cbiAgICAgICAgc2V0dXBEZWxlZ2F0aW9uKCkge1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIERldGVybWluZXMgYWxsIG9mIHRoZSBldmVudCB0eXBlcyBzdXBwb3J0ZWQgYnkgdGhlIGN1cnJlbnQgYnJvd3Nlci4gV2lsbCBjYWNoZSB0aGUgcmVzdWx0c1xuICAgICAgICAgICAgICogb2YgdGhpcyBkaXNjb3ZlcnkgZm9yIHBlcmZvcm1hbmNlIGJlbmVmaXRzLlxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIEBwcm9wZXJ0eSBldmVudHNcbiAgICAgICAgICAgICAqIEB0eXBlIHtBcnJheX1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgbGV0IGV2ZW50cyA9IGV2ZW50TmFtZXMgfHwgKCgpID0+IHtcblxuICAgICAgICAgICAgICAgIGxldCBhRWxlbWVudCAgID0gJGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKSxcbiAgICAgICAgICAgICAgICAgICAgbWF0Y2hlciAgICA9IC9eb24vaSxcbiAgICAgICAgICAgICAgICAgICAgZXZlbnROYW1lcyA9IFtdO1xuXG4gICAgICAgICAgICAgICAgZm9yKHZhciBrZXkgaW4gYUVsZW1lbnQpIHtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoa2V5Lm1hdGNoKG1hdGNoZXIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudE5hbWVzLnB1c2goa2V5LnJlcGxhY2UobWF0Y2hlciwgJycpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGV2ZW50TmFtZXM7XG5cbiAgICAgICAgICAgIH0pKCk7XG5cbiAgICAgICAgICAgIGV2ZW50cy5mb3JFYWNoKChldmVudFR5cGUpID0+IHtcblxuICAgICAgICAgICAgICAgICRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50VHlwZSwgKGV2ZW50KSA9PiB7XG5cbiAgICAgICAgICAgICAgICAgICAgbGV0IGV2ZW50TmFtZSA9IGBvbiR7ZXZlbnQudHlwZX1gLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRMaXN0ID0gW107XG5cbiAgICAgICAgICAgICAgICAgICAgdXRpbGl0eS50b0FycmF5KGV2ZW50LnBhdGgpLmZvckVhY2goKGl0ZW0pID0+IHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGV2ZW50LmlzUHJvcGFnYXRpb25TdG9wcGVkKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBNZXRob2QgYHN0b3BQcm9wYWdhdGlvbmAgd2FzIGludm9rZWQgb24gdGhlIGN1cnJlbnQgZXZlbnQsIHdoaWNoIHByZXZlbnRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdXMgZnJvbSBwcm9wYWdhdGluZyBhbnkgZnVydGhlci5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpdGVtLmdldEF0dHJpYnV0ZSB8fCAhaXRlbS5oYXNBdHRyaWJ1dGUodXRpbGl0eS5BVFRSSUJVVEVfUkVBQ1RJRCkpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEN1cnJlbnQgZWxlbWVudCBpcyBub3QgYSB2YWxpZCBSZWFjdCBlbGVtZW50IGJlY2F1c2UgaXQgZG9lc24ndCBoYXZlIGFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBSZWFjdCBJRCBkYXRhIGF0dHJpYnV0ZS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQXR0ZW1wdCB0byBmaWVsZCB0aGUgY29tcG9uZW50IGJ5IHRoZSBhc3NvY2lhdGVkIFJlYWN0IElELlxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG1vZGVsID0gdGhpcy5maW5kQnlJZChpdGVtLmdldEF0dHJpYnV0ZSh1dGlsaXR5LkFUVFJJQlVURV9SRUFDVElEKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtb2RlbCAmJiBtb2RlbC5wcm9wZXJ0aWVzKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUcmFuc2Zvcm0gdGhlIGN1cnJlbnQgUmVhY3QgZXZlbnRzIGludG8gbG93ZXIgY2FzZSBrZXlzLCBzbyB0aGF0IHdlIGNhbiBwYWlyIHRoZW1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB1cCB3aXRoIHRoZSBldmVudCB0eXBlcy5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgdHJhbnNmb3JtZWQgPSB0aGlzLnRyYW5zZm9ybUtleXMobW9kZWwucHJvcGVydGllcyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXZlbnROYW1lIGluIHRyYW5zZm9ybWVkKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2UgZGVmZXIgdGhlIGludm9jYXRpb24gb2YgdGhlIGV2ZW50IG1ldGhvZCwgYmVjYXVzZSBvdGhlcndpc2UgUmVhY3QuanNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gd2lsbCByZS1yZW5kZXIsIGFuZCB0aGUgUmVhY3QgSURzIHdpbGwgdGhlbiBiZSBcIm91dCBvZiBzeW5jXCIgZm9yIHRoaXMgZXZlbnQuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50TGlzdC5wdXNoKHRyYW5zZm9ybWVkW2V2ZW50TmFtZV0uYmluZChtb2RlbC5jb21wb25lbnQsIGV2ZW50KSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBJbnZva2UgZWFjaCBmb3VuZCBldmVudCBmb3IgdGhlIGV2ZW50IHR5cGUuXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50TGlzdC5mb3JFYWNoKChldmVudEludm9jYXRpb24pID0+IGV2ZW50SW52b2NhdGlvbigpKTtcblxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG59KSh3aW5kb3cuZG9jdW1lbnQpOyIsImV4cG9ydCBkZWZhdWx0IChmdW5jdGlvbiBtYWluKCRjb25zb2xlKSB7XG5cbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIHJldHVybiB7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2Qgd2FyblxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gbWVzc2FnZVxuICAgICAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAgICAgKi9cbiAgICAgICAgd2FybihtZXNzYWdlKSB7XG4gICAgICAgICAgICAkY29uc29sZS5sb2coYCVjTWFwbGUuanM6ICVjJHttZXNzYWdlfS5gLCAnY29sb3I6IHJnYmEoMCwgMCwgMCwgLjUpJywgJ2NvbG9yOiAjNUY5RUEwJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgaW5mb1xuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gbWVzc2FnZVxuICAgICAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAgICAgKi9cbiAgICAgICAgaW5mbyhtZXNzYWdlKSB7XG4gICAgICAgICAgICAkY29uc29sZS5sb2coYCVjTWFwbGUuanM6ICVjJHttZXNzYWdlfS5gLCAnY29sb3I6IHJnYmEoMCwgMCwgMCwgLjUpJywgJ2NvbG9yOiAjMDA4RERCJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgZXJyb3JcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IG1lc3NhZ2VcbiAgICAgICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgICAgICovXG4gICAgICAgIGVycm9yKG1lc3NhZ2UpIHtcbiAgICAgICAgICAgICRjb25zb2xlLmxvZyhgJWNNYXBsZS5qczogJWMke21lc3NhZ2V9LmAsICdjb2xvcjogcmdiYSgwLCAwLCAwLCAuNSknLCAnY29sb3I6ICNDRDYwOTAnKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxufSkod2luZG93LmNvbnNvbGUpOyIsImV4cG9ydCBkZWZhdWx0IChmdW5jdGlvbiBtYWluKCkge1xuXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICByZXR1cm4ge1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAY29uc3RhbnQgUkVTT0xWRV9USU1FT1VUXG4gICAgICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICAgICAqIEBkZWZhdWx0IDYwMDAwXG4gICAgICAgICAqL1xuICAgICAgICBSRVNPTFZFX1RJTUVPVVQ6IDYwMDAwXG5cbiAgICB9O1xuXG59KSgpOyIsImltcG9ydCB1dGlsaXR5IGZyb20gJy4vVXRpbGl0eS5qcyc7XG5cbi8qKlxuICogQG1ldGhvZCBxdWVyeUFsbFxuICogQHBhcmFtIHtTdHJpbmd9IGV4cHJlc3Npb25cbiAqIEByZXR1cm4ge0FycmF5fVxuICovXG5sZXQgcXVlcnlBbGwgPSBmdW5jdGlvbiBxdWVyeUFsbChleHByZXNzaW9uKSB7XG5cbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIGV4cHJlc3Npb24gPSBBcnJheS5pc0FycmF5KGV4cHJlc3Npb24pID8gZXhwcmVzc2lvbi5qb2luKCcsJykgOiBleHByZXNzaW9uO1xuICAgIHJldHVybiB1dGlsaXR5LnRvQXJyYXkodGhpcy5xdWVyeVNlbGVjdG9yQWxsKGV4cHJlc3Npb24pKTtcblxufTtcblxuZXhwb3J0IGRlZmF1bHQgKGZ1bmN0aW9uIG1haW4oKSB7XG5cbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIHJldHVybiB7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgZ2V0Q1NTTGlua3NcbiAgICAgICAgICogQHBhcmFtIHtIVE1MRWxlbWVudHxIVE1MRG9jdW1lbnR9IGVsZW1lbnRcbiAgICAgICAgICogQHJldHVybiB7QXJyYXl9XG4gICAgICAgICAqL1xuICAgICAgICBnZXRDU1NMaW5rcyhlbGVtZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gcXVlcnlBbGwuY2FsbChlbGVtZW50LCAnbGlua1tyZWw9XCJzdHlsZXNoZWV0XCJdJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgZ2V0Q1NTSW5saW5lc1xuICAgICAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fEhUTUxEb2N1bWVudH0gZWxlbWVudFxuICAgICAgICAgKiBAcmV0dXJuIHtBcnJheX1cbiAgICAgICAgICovXG4gICAgICAgIGdldENTU0lubGluZXMoZWxlbWVudCkge1xuICAgICAgICAgICAgcmV0dXJuIHF1ZXJ5QWxsLmNhbGwoZWxlbWVudCwgWydzdHlsZVt0eXBlPVwidGV4dC9jc3NcIl0nLCAnc3R5bGU6bm90KFt0eXBlXSknXSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgZ2V0SW1wb3J0c1xuICAgICAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fEhUTUxEb2N1bWVudH0gZWxlbWVudFxuICAgICAgICAgKiBAcmV0dXJuIHtBcnJheX1cbiAgICAgICAgICovXG4gICAgICAgIGdldEltcG9ydHMoZWxlbWVudCkge1xuICAgICAgICAgICAgcmV0dXJuIHF1ZXJ5QWxsLmNhbGwoZWxlbWVudCwgJ2xpbmtbcmVsPVwiaW1wb3J0XCJdOm5vdChbZGF0YS1pZ25vcmVdKScpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIGdldFRlbXBsYXRlc1xuICAgICAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fEhUTUxEb2N1bWVudH0gZWxlbWVudFxuICAgICAgICAgKiBAcmV0dXJuIHtBcnJheX1cbiAgICAgICAgICovXG4gICAgICAgIGdldFRlbXBsYXRlcyhlbGVtZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gcXVlcnlBbGwuY2FsbChlbGVtZW50LCAndGVtcGxhdGVbcmVmXScpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIGdldFNjcmlwdHNcbiAgICAgICAgICogQHBhcmFtIHtIVE1MRWxlbWVudHxIVE1MRG9jdW1lbnR9IGVsZW1lbnRcbiAgICAgICAgICogQHJldHVybiB7QXJyYXl9XG4gICAgICAgICAqL1xuICAgICAgICBnZXRTY3JpcHRzKGVsZW1lbnQpIHtcblxuICAgICAgICAgICAgdmFyIHNlbGVjdG9ycyA9IFsnc2NyaXB0W3R5cGU9XCJ0ZXh0L2phdmFzY3JpcHRcIl0nLCAnc2NyaXB0W3R5cGU9XCJhcHBsaWNhdGlvbi9qYXZhc2NyaXB0XCJdJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3NjcmlwdFt0eXBlPVwidGV4dC9lY21hc2NyaXB0XCJdJywgJ3NjcmlwdFt0eXBlPVwiYXBwbGljYXRpb24vZWNtYXNjcmlwdFwiXScsICdzY3JpcHQ6bm90KFt0eXBlXSknXTtcblxuICAgICAgICAgICAgcmV0dXJuIHF1ZXJ5QWxsLmNhbGwoZWxlbWVudCwgc2VsZWN0b3JzKTtcblxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIGdldEFsbFNjcmlwdHNcbiAgICAgICAgICogQHBhcmFtIHtIVE1MRWxlbWVudHxIVE1MRG9jdW1lbnR9IGVsZW1lbnRcbiAgICAgICAgICogQHJldHVybiB7QXJyYXl9XG4gICAgICAgICAqL1xuICAgICAgICBnZXRBbGxTY3JpcHRzKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIGxldCBqc3hGaWxlcyA9IHF1ZXJ5QWxsLmNhbGwoZWxlbWVudCwgJ3NjcmlwdFt0eXBlPVwidGV4dC9qc3hcIl0nKTtcbiAgICAgICAgICAgIHJldHVybiBbXS5jb25jYXQodXRpbGl0eS50b0FycmF5KHRoaXMuZ2V0U2NyaXB0cyhlbGVtZW50KSksIHV0aWxpdHkudG9BcnJheShqc3hGaWxlcykpO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG59KSgpOyIsImltcG9ydCBsb2dnZXIgIGZyb20gJy4vTG9nZ2VyLmpzJztcbmltcG9ydCBvcHRpb25zIGZyb20gJy4vT3B0aW9ucy5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IChmdW5jdGlvbiBtYWluKCRkb2N1bWVudCkge1xuXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICByZXR1cm4ge1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAY29uc3RhbnQgQVRUUklCVVRFX1JFQUNUSURcbiAgICAgICAgICogQHR5cGUge1N0cmluZ31cbiAgICAgICAgICovXG4gICAgICAgIEFUVFJJQlVURV9SRUFDVElEOiAnZGF0YS1yZWFjdGlkJyxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCByZXNvbHZlclxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gICAgICAgICAqIEBwYXJhbSB7SFRNTERvY3VtZW50fG51bGx9IG93bmVyRG9jdW1lbnRcbiAgICAgICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAgICAgKi9cbiAgICAgICAgcmVzb2x2ZXIodXJsLCBvd25lckRvY3VtZW50KSB7XG5cbiAgICAgICAgICAgIGxldCBjb21wb25lbnRQYXRoID0gdGhpcy5nZXRQYXRoKHVybCksXG4gICAgICAgICAgICAgICAgZ2V0UGF0aCAgICAgICA9IHRoaXMuZ2V0UGF0aC5iaW5kKHRoaXMpLFxuICAgICAgICAgICAgICAgIGdldE5hbWUgICAgICAgPSB0aGlzLmdldE5hbWUuYmluZCh0aGlzKTtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQG1ldGhvZCByZXNvbHZlUGF0aFxuICAgICAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IHBhdGhcbiAgICAgICAgICAgICAqIEBwYXJhbSB7SFRNTERvY3VtZW50fSBvdmVycmlkZURvY3VtZW50XG4gICAgICAgICAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGZ1bmN0aW9uIHJlc29sdmVQYXRoKHBhdGgsIG92ZXJyaWRlRG9jdW1lbnQgPSAkZG9jdW1lbnQpIHtcbiAgICAgICAgICAgICAgICBsZXQgYSAgPSBvdmVycmlkZURvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgICAgICAgICAgICBhLmhyZWYgPSBwYXRoO1xuICAgICAgICAgICAgICAgIHJldHVybiBhLmhyZWY7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB7XG5cbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgKiBAcHJvcGVydHkgcHJvZHVjdGlvblxuICAgICAgICAgICAgICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgcHJvZHVjdGlvbjoge1xuXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBAbWV0aG9kIGdldFBhdGhcbiAgICAgICAgICAgICAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IHBhdGhcbiAgICAgICAgICAgICAgICAgICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgZ2V0UGF0aChwYXRoKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzTG9jYWxQYXRoKHBhdGgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGAke3RoaXMuZ2V0QWJzb2x1dGVQYXRoKCl9LyR7Z2V0TmFtZShwYXRoKX1gO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzb2x2ZVBhdGgocGF0aCwgJGRvY3VtZW50KTtcblxuICAgICAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBAbWV0aG9kIGdldFNyY1xuICAgICAgICAgICAgICAgICAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBnZXRTcmMoc3JjKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZ2V0TmFtZShzcmMpO1xuICAgICAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBAbWV0aG9kIGdldEFic29sdXRlUGF0aFxuICAgICAgICAgICAgICAgICAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBnZXRBYnNvbHV0ZVBhdGgoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzb2x2ZVBhdGgodXJsKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogQG1ldGhvZCBnZXRSZWxhdGl2ZVBhdGhcbiAgICAgICAgICAgICAgICAgICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgZ2V0UmVsYXRpdmVQYXRoKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHVybDtcbiAgICAgICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogQG1ldGhvZCBpc0xvY2FsUGF0aFxuICAgICAgICAgICAgICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gcGF0aFxuICAgICAgICAgICAgICAgICAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgaXNMb2NhbFBhdGgocGF0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICEhfnBhdGguaW5kZXhPZih1cmwpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICogQHByb3BlcnR5IGRldmVsb3BtZW50XG4gICAgICAgICAgICAgICAgICogQHR5cGUge09iamVjdH1cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBkZXZlbG9wbWVudDoge1xuXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBAbWV0aG9kIGdldFBhdGhcbiAgICAgICAgICAgICAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IHBhdGhcbiAgICAgICAgICAgICAgICAgICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgZ2V0UGF0aChwYXRoKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzTG9jYWxQYXRoKHBhdGgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGAke3RoaXMuZ2V0QWJzb2x1dGVQYXRoKCl9LyR7cGF0aH1gO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzb2x2ZVBhdGgocGF0aCwgJGRvY3VtZW50KTtcblxuICAgICAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBAbWV0aG9kIGdldFNyY1xuICAgICAgICAgICAgICAgICAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBnZXRTcmMoc3JjKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3JjO1xuICAgICAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBAbWV0aG9kIGdldEFic29sdXRlUGF0aFxuICAgICAgICAgICAgICAgICAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBnZXRBYnNvbHV0ZVBhdGgoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzb2x2ZVBhdGgoY29tcG9uZW50UGF0aCk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIEBtZXRob2QgZ2V0UmVsYXRpdmVQYXRoXG4gICAgICAgICAgICAgICAgICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGdldFJlbGF0aXZlUGF0aCgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjb21wb25lbnRQYXRoO1xuICAgICAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBAbWV0aG9kIGlzTG9jYWxQYXRoXG4gICAgICAgICAgICAgICAgICAgICAqIEBwYXJhbSBwYXRoIHtTdHJpbmd9XG4gICAgICAgICAgICAgICAgICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBpc0xvY2FsUGF0aChwYXRoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoID0gZ2V0UGF0aChyZXNvbHZlUGF0aChwYXRoLCBvd25lckRvY3VtZW50KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gISF+cmVzb2x2ZVBhdGgoY29tcG9uZW50UGF0aCkuaW5kZXhPZihwYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCB0b0FycmF5XG4gICAgICAgICAqIEBwYXJhbSB7Kn0gYXJyYXlMaWtlXG4gICAgICAgICAqIEByZXR1cm4ge0FycmF5fVxuICAgICAgICAgKi9cbiAgICAgICAgdG9BcnJheShhcnJheUxpa2UpIHtcbiAgICAgICAgICAgIHJldHVybiBBcnJheS5mcm9tID8gQXJyYXkuZnJvbShhcnJheUxpa2UpIDogQXJyYXkucHJvdG90eXBlLnNsaWNlLmFwcGx5KGFycmF5TGlrZSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgZmxhdHRlbkFycmF5XG4gICAgICAgICAqIEBwYXJhbSB7QXJyYXl9IGFyclxuICAgICAgICAgKiBAcGFyYW0ge0FycmF5fSBbZ2l2ZW5BcnI9W11dXG4gICAgICAgICAqL1xuICAgICAgICBmbGF0dGVuQXJyYXkoYXJyLCBnaXZlbkFyciA9IFtdKSB7XG5cbiAgICAgICAgICAgIC8qIGpzaGludCBpZ25vcmU6c3RhcnQgKi9cblxuICAgICAgICAgICAgYXJyLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgICAgICAgICAoQXJyYXkuaXNBcnJheShpdGVtKSkgJiYgKHRoaXMuZmxhdHRlbkFycmF5KGl0ZW0sIGdpdmVuQXJyKSk7XG4gICAgICAgICAgICAgICAgKCFBcnJheS5pc0FycmF5KGl0ZW0pKSAmJiAoZ2l2ZW5BcnIucHVzaChpdGVtKSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLyoganNoaW50IGlnbm9yZTplbmQgKi9cblxuICAgICAgICAgICAgcmV0dXJuIGdpdmVuQXJyO1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgdG9TbmFrZUNhc2VcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IGNhbWVsQ2FzZVxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gW2pvaW5lcj0nLSddXG4gICAgICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgICAgICovXG4gICAgICAgIHRvU25ha2VDYXNlKGNhbWVsQ2FzZSwgam9pbmVyID0gJy0nKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FtZWxDYXNlLnNwbGl0KC8oW0EtWl1bYS16XXswLH0pL2cpLmZpbHRlcihwYXJ0cyA9PiBwYXJ0cykuam9pbihqb2luZXIpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgZ2V0TmFtZVxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gaW1wb3J0UGF0aFxuICAgICAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICAgICAqL1xuICAgICAgICBnZXROYW1lKGltcG9ydFBhdGgpIHtcbiAgICAgICAgICAgIHJldHVybiBpbXBvcnRQYXRoLnNwbGl0KCcvJykuc2xpY2UoLTEpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIGdldFBhdGhcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IGltcG9ydFBhdGhcbiAgICAgICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAgICAgKi9cbiAgICAgICAgZ2V0UGF0aChpbXBvcnRQYXRoKSB7XG4gICAgICAgICAgICByZXR1cm4gaW1wb3J0UGF0aC5zcGxpdCgnLycpLnNsaWNlKDAsIC0xKS5qb2luKCcvJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgcmVtb3ZlRXh0ZW5zaW9uXG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBmaWxlUGF0aFxuICAgICAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICAgICAqL1xuICAgICAgICByZW1vdmVFeHRlbnNpb24oZmlsZVBhdGgpIHtcbiAgICAgICAgICAgIHJldHVybiBmaWxlUGF0aC5zcGxpdCgnLicpLnNsaWNlKDAsIC0xKS5qb2luKCcuJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgaXNIVE1MSW1wb3J0XG4gICAgICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGh0bWxFbGVtZW50XG4gICAgICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAgICAgICAqL1xuICAgICAgICBpc0hUTUxJbXBvcnQoaHRtbEVsZW1lbnQpIHtcblxuICAgICAgICAgICAgbGV0IGlzSW5zdGFuY2UgID0gaHRtbEVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MTGlua0VsZW1lbnQsXG4gICAgICAgICAgICAgICAgaXNJbXBvcnQgICAgPSBTdHJpbmcoaHRtbEVsZW1lbnQuZ2V0QXR0cmlidXRlKCdyZWwnKSkudG9Mb3dlckNhc2UoKSA9PT0gJ2ltcG9ydCcsXG4gICAgICAgICAgICAgICAgaGFzSHJlZkF0dHIgPSBodG1sRWxlbWVudC5oYXNBdHRyaWJ1dGUoJ2hyZWYnKSxcbiAgICAgICAgICAgICAgICBoYXNUeXBlSHRtbCA9IFN0cmluZyhodG1sRWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3R5cGUnKSkudG9Mb3dlckNhc2UoKSA9PT0gJ3RleHQvaHRtbCc7XG5cbiAgICAgICAgICAgIHJldHVybiBpc0luc3RhbmNlICYmIGlzSW1wb3J0ICYmIGhhc0hyZWZBdHRyICYmIGhhc1R5cGVIdG1sO1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgcmVzb2x2ZVRpbWVvdXRcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IGVycm9yTWVzc2FnZVxuICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSByZWplY3RcbiAgICAgICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgICAgICovXG4gICAgICAgIHJlc29sdmVUaW1lb3V0KGVycm9yTWVzc2FnZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHJlamVjdChlcnJvck1lc3NhZ2UpLCBvcHRpb25zLlJFU09MVkVfVElNRU9VVCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENhc3RzIHByaW1pdGl2ZSB2YWx1ZXMgaW50byB0aGVpciByZXNwZWN0aXZlIHR5cGVzLiBJZ25vcmVzIGNvbXBsZXggdHlwZXMsIGluY2x1ZGluZyBKU09OIG9iamVjdHMuXG4gICAgICAgICAqIEN1cnJlbnRseSBzdXBwb3J0ZWQgYXJlOiBib29sZWFucywgaW50ZWdlcnMsIGFuZCBmbG9hdHMuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBtZXRob2QgdHlwZWNhc3RQcm9wZXJ0eVxuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gdmFsdWVcbiAgICAgICAgICogQHJldHVybiB7Kn1cbiAgICAgICAgICovXG4gICAgICAgIHR5cGVjYXN0UHJvcGVydHkodmFsdWUpIHtcblxuICAgICAgICAgICAgaWYgKFN0cmluZyh2YWx1ZSkubWF0Y2goL15cXGQrJC8pKSB7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBOdW1iZXIodmFsdWUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoU3RyaW5nKHZhbHVlKS5tYXRjaCgvXlxcZCtcXC5cXGQrL2kpKSB7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBwYXJzZUZsb2F0KHZhbHVlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKH5bJ3RydWUnLCAnZmFsc2UnXS5pbmRleE9mKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUgPT09ICd0cnVlJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgdHJ5UmVnaXN0ZXJFbGVtZW50XG4gICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBwcm9wZXJ0aWVzXG4gICAgICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICAgICAqL1xuICAgICAgICB0cnlSZWdpc3RlckVsZW1lbnQobmFtZSwgcHJvcGVydGllcykge1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEBjb25zdGFudCBFUlJPUl9NQVBcbiAgICAgICAgICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGNvbnN0IEVSUk9SX01BUCA9IHtcbiAgICAgICAgICAgICAgICAnQSB0eXBlIHdpdGggdGhhdCBuYW1lIGlzIGFscmVhZHkgcmVnaXN0ZXJlZCc6IGBDdXN0b20gZWxlbWVudCBcIiR7bmFtZX1cIiBoYXMgYWxyZWFkeSBiZWVuIHJlZ2lzdGVyZWRgLFxuICAgICAgICAgICAgICAgICdUaGUgdHlwZSBuYW1lIGlzIGludmFsaWQnOiBgRWxlbWVudCBuYW1lICR7bmFtZX0gaXMgaW52YWxpZCBhbmQgbXVzdCBjb25zaXN0IG9mIGF0IGxlYXN0IG9uZSBoeXBoZW5gXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB0cnkge1xuXG4gICAgICAgICAgICAgICAgJGRvY3VtZW50LnJlZ2lzdGVyRWxlbWVudChuYW1lLCBwcm9wZXJ0aWVzKTtcblxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuXG4gICAgICAgICAgICAgICAgbGV0IGVycm9yRGF0YSA9IE9iamVjdC5rZXlzKEVSUk9SX01BUCkubWFwKChlcnJvcikgPT4ge1xuXG4gICAgICAgICAgICAgICAgICAgIGxldCByZWdFeHAgPSBuZXcgUmVnRXhwKGVycm9yLCAnaScpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChlLm1lc3NhZ2UubWF0Y2gocmVnRXhwKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKEVSUk9SX01BUFtlcnJvcl0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGlmICghZXJyb3JEYXRhLnNvbWUoKG1vZGVsKSA9PiBtb2RlbCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3coZSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxufSkod2luZG93LmRvY3VtZW50KTsiLCJpbXBvcnQgQ3VzdG9tRWxlbWVudCBmcm9tICcuL0VsZW1lbnQuanMnO1xuaW1wb3J0IHV0aWxpdHkgICAgICAgZnJvbSAnLi8uLi9oZWxwZXJzL1V0aWxpdHkuanMnO1xuaW1wb3J0IGxvZ2dlciAgICAgICAgZnJvbSAnLi8uLi9oZWxwZXJzL0xvZ2dlci5qcyc7XG5pbXBvcnQgb3B0aW9ucyAgICAgICBmcm9tICcuLy4uL2hlbHBlcnMvT3B0aW9ucy5qcyc7XG5pbXBvcnQge1N0YXRlTWFuYWdlciwgU3RhdGV9IGZyb20gJy4vU3RhdGVNYW5hZ2VyLmpzJztcblxuLyoqXG4gKiBAbW9kdWxlIE1hcGxlXG4gKiBAc3VibW9kdWxlIENvbXBvbmVudFxuICogQGV4dGVuZHMgU3RhdGVNYW5hZ2VyXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9NYXBsZS5qc1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb21wb25lbnQgZXh0ZW5kcyBTdGF0ZU1hbmFnZXIge1xuXG4gICAgLyoqXG4gICAgICogUmVzcG9uc2libGUgZm9yIGxvYWRpbmcgYW55IHByZXJlcXVpc2l0ZXMgYmVmb3JlIHRoZSBjb21wb25lbnQgaXMgZGVsZWdhdGVkIHRvIGVhY2ggYEN1c3RvbUVsZW1lbnRgXG4gICAgICogb2JqZWN0IGZvciBjcmVhdGluZyBhIGN1c3RvbSBlbGVtZW50LCBhbmQgbGFzdGx5IHJlbmRlcmluZyB0aGUgUmVhY3QgY29tcG9uZW50IHRvIHRoZSBkZXNpZ25hdGVkIEhUTUwgZWxlbWVudC5cbiAgICAgKlxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoXG4gICAgICogQHBhcmFtIHtIVE1MVGVtcGxhdGVFbGVtZW50fSB0ZW1wbGF0ZUVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge0hUTUxTY3JpcHRFbGVtZW50fSBzY3JpcHRFbGVtZW50XG4gICAgICogQHJldHVybiB7TW9kdWxlfVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHBhdGgsIHRlbXBsYXRlRWxlbWVudCwgc2NyaXB0RWxlbWVudCkge1xuXG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMucGF0aCAgICAgPSBwYXRoO1xuICAgICAgICB0aGlzLmVsZW1lbnRzID0geyBzY3JpcHQ6IHNjcmlwdEVsZW1lbnQsIHRlbXBsYXRlOiB0ZW1wbGF0ZUVsZW1lbnQgfTtcblxuICAgICAgICBsZXQgc3JjID0gc2NyaXB0RWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3NyYycpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKFN0YXRlLlJFU09MVklORyk7XG5cbiAgICAgICAgLy8gQ29uZmlndXJlIHRoZSBVUkwgb2YgdGhlIGNvbXBvbmVudCBmb3IgRVM2IGBTeXN0ZW0uaW1wb3J0YCwgd2hpY2ggaXMgYWxzbyBwb2x5ZmlsbGVkIGluIGNhc2UgdGhlXG4gICAgICAgIC8vIGN1cnJlbnQgYnJvd3NlciBkb2VzIG5vdCBwcm92aWRlIHN1cHBvcnQgZm9yIGR5bmFtaWMgbW9kdWxlIGxvYWRpbmcuXG4gICAgICAgIGxldCB1cmwgPSBgJHt0aGlzLnBhdGguZ2V0UmVsYXRpdmVQYXRoKCl9LyR7dXRpbGl0eS5yZW1vdmVFeHRlbnNpb24oc3JjKX1gO1xuXG4gICAgICAgIGlmIChzcmMuc3BsaXQoJy4nKS5wb3AoKS50b0xvd2VyQ2FzZSgpID09PSAnanN4Jykge1xuICAgICAgICAgICAgcmV0dXJuIHZvaWQgbG9nZ2VyLmVycm9yKGBVc2UgSlMgZXh0ZW5zaW9uIGluc3RlYWQgb2YgSlNYIOKAkyBKU1ggY29tcGlsYXRpb24gd2lsbCB3b3JrIGFzIGV4cGVjdGVkYCk7XG4gICAgICAgIH1cblxuICAgICAgICBTeXN0ZW0uaW1wb3J0KGAke3VybH1gKS50aGVuKChpbXBvcnRzKSA9PiB7XG5cbiAgICAgICAgICAgIGlmICghaW1wb3J0cy5kZWZhdWx0KSB7XG5cbiAgICAgICAgICAgICAgICAvLyBDb21wb25lbnRzIHRoYXQgZG8gbm90IGhhdmUgYSBkZWZhdWx0IGV4cG9ydCAoaS5lOiBleHBvcnQgZGVmYXVsdCBjbGFzcy4uLikgd2lsbCBiZSBpZ25vcmVkLlxuICAgICAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBMb2FkIGFsbCB0aGlyZC1wYXJ0eSBzY3JpcHRzIHRoYXQgYXJlIGEgcHJlcmVxdWlzaXRlIG9mIHJlc29sdmluZyB0aGUgY3VzdG9tIGVsZW1lbnQuXG4gICAgICAgICAgICBQcm9taXNlLmFsbCh0aGlzLmxvYWRUaGlyZFBhcnR5U2NyaXB0cygpKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICBuZXcgQ3VzdG9tRWxlbWVudChwYXRoLCB0ZW1wbGF0ZUVsZW1lbnQsIHNjcmlwdEVsZW1lbnQsIGltcG9ydHMuZGVmYXVsdCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShTdGF0ZS5SRVNPTFZFRCk7XG4gICAgICAgICAgICB9LCAobWVzc2FnZSkgPT4gbG9nZ2VyLmVycm9yKG1lc3NhZ2UpKTtcblxuICAgICAgICB9KTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERpc2NvdmVyIGFsbCBvZiB0aGUgdGhpcmQgcGFydHkgSmF2YVNjcmlwdCBkZXBlbmRlbmNpZXMgdGhhdCBhcmUgcmVxdWlyZWQgdG8gaGF2ZSBiZWVuIGxvYWRlZCBiZWZvcmVcbiAgICAgKiBhdHRlbXB0aW5nIHRvIHJlbmRlciB0aGUgY3VzdG9tIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBAbWV0aG9kIGxvYWRUaGlyZFBhcnR5U2NyaXB0c1xuICAgICAqIEByZXR1cm4ge1Byb21pc2VbXX1cbiAgICAgKi9cbiAgICBsb2FkVGhpcmRQYXJ0eVNjcmlwdHMoKSB7XG5cbiAgICAgICAgbGV0IHNjcmlwdEVsZW1lbnRzICAgID0gdXRpbGl0eS50b0FycmF5KHRoaXMuZWxlbWVudHMudGVtcGxhdGUuY29udGVudC5xdWVyeVNlbGVjdG9yQWxsKCdzY3JpcHRbdHlwZT1cInRleHQvamF2YXNjcmlwdFwiXScpKSxcbiAgICAgICAgICAgIHRoaXJkUGFydHlTY3JpcHRzID0gc2NyaXB0RWxlbWVudHMuZmlsdGVyKChzY3JpcHRFbGVtZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICF0aGlzLnBhdGguaXNMb2NhbFBhdGgoc2NyaXB0RWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3NyYycpKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB0aGlyZFBhcnR5U2NyaXB0cy5tYXAoKHNjcmlwdEVsZW1lbnQpID0+IHtcblxuICAgICAgICAgICAgbGV0IHNyYyAgICAgICA9IHNjcmlwdEVsZW1lbnQuZ2V0QXR0cmlidXRlKCdzcmMnKTtcbiAgICAgICAgICAgIHNjcmlwdEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcbiAgICAgICAgICAgIHNjcmlwdEVsZW1lbnQuc2V0QXR0cmlidXRlKCd0eXBlJywgJ3RleHQvamF2YXNjcmlwdCcpO1xuICAgICAgICAgICAgc2NyaXB0RWxlbWVudC5zZXRBdHRyaWJ1dGUoJ3NyYycsIHNyYyk7XG5cbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cbiAgICAgICAgICAgICAgICBzY3JpcHRFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCAoKSA9PiByZXNvbHZlKCkpO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc2NyaXB0RWxlbWVudCk7XG5cbiAgICAgICAgICAgICAgICBsZXQgaHJlZiAgICAgICAgID0gc2NyaXB0RWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3NyYycpLFxuICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2UgPSBgVGltZW91dCBvZiAke29wdGlvbnMuUkVTT0xWRV9USU1FT1VUIC8gMTAwMH0gc2Vjb25kcyBleGNlZWRlZCB3aGlsc3Qgd2FpdGluZyBmb3IgdGhpcmQtcGFydHkgc2NyaXB0OiBcIiR7aHJlZn1cImA7XG4gICAgICAgICAgICAgICAgdXRpbGl0eS5yZXNvbHZlVGltZW91dChlcnJvck1lc3NhZ2UsIHJlamVjdCk7XG5cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH0pO1xuXG4gICAgfVxuXG59IiwiaW1wb3J0IGV2ZW50cyAgICAgICBmcm9tICcuLy4uL2hlbHBlcnMvRXZlbnRzLmpzJztcbmltcG9ydCB1dGlsaXR5ICAgICAgZnJvbSAnLi8uLi9oZWxwZXJzL1V0aWxpdHkuanMnO1xuaW1wb3J0IGxvZ2dlciAgICAgICBmcm9tICcuLy4uL2hlbHBlcnMvTG9nZ2VyLmpzJztcbmltcG9ydCBjYWNoZUZhY3RvcnkgZnJvbSAnLi8uLi9oZWxwZXJzL0NhY2hlRmFjdG9yeS5qcyc7XG5pbXBvcnQgc2VsZWN0b3JzICAgIGZyb20gJy4vLi4vaGVscGVycy9TZWxlY3RvcnMuanMnO1xuaW1wb3J0IHtTdGF0ZU1hbmFnZXIsIFN0YXRlfSBmcm9tICcuL1N0YXRlTWFuYWdlci5qcyc7XG5cbi8qKlxuICogQG1vZHVsZSBNYXBsZVxuICogQHN1Ym1vZHVsZSBDdXN0b21FbGVtZW50XG4gKiBAZXh0ZW5kcyBTdGF0ZU1hbmFnZXJcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L01hcGxlLmpzXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEN1c3RvbUVsZW1lbnQgZXh0ZW5kcyBTdGF0ZU1hbmFnZXIge1xuXG4gICAgLyoqXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHBhdGhcbiAgICAgKiBAcGFyYW0ge0hUTUxTY3JpcHRFbGVtZW50fSBzY3JpcHRFbGVtZW50XG4gICAgICogQHBhcmFtIHtIVE1MVGVtcGxhdGVFbGVtZW50fSB0ZW1wbGF0ZUVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gaW1wb3J0U2NyaXB0XG4gICAgICogQHJldHVybiB7RWxlbWVudH1cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihwYXRoLCB0ZW1wbGF0ZUVsZW1lbnQsIHNjcmlwdEVsZW1lbnQsIGltcG9ydFNjcmlwdCkge1xuXG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMucGF0aCAgICAgPSBwYXRoO1xuICAgICAgICB0aGlzLnNhc3MgICAgID0gKHR5cGVvZiBTYXNzID09PSAndW5kZWZpbmVkJykgPyBudWxsIDogbmV3IFNhc3MoKTtcbiAgICAgICAgdGhpcy5lbGVtZW50cyA9IHsgc2NyaXB0OiBzY3JpcHRFbGVtZW50LCB0ZW1wbGF0ZTogdGVtcGxhdGVFbGVtZW50IH07XG4gICAgICAgIHRoaXMuc2NyaXB0ICAgPSBpbXBvcnRTY3JpcHQ7XG5cbiAgICAgICAgbGV0IGRlc2NyaXB0b3IgPSB0aGlzLmdldERlc2NyaXB0b3IoKTtcblxuICAgICAgICBpZiAoIWRlc2NyaXB0b3IuZXh0ZW5kKSB7XG5cbiAgICAgICAgICAgIHJldHVybiB2b2lkIHV0aWxpdHkudHJ5UmVnaXN0ZXJFbGVtZW50KGRlc2NyaXB0b3IubmFtZSwge1xuICAgICAgICAgICAgICAgIHByb3RvdHlwZTogdGhpcy5nZXRFbGVtZW50UHJvdG90eXBlKClcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcHJvdG90eXBlID0gYEhUTUwke2Rlc2NyaXB0b3IuZXh0ZW5kfUVsZW1lbnRgO1xuXG4gICAgICAgIHV0aWxpdHkudHJ5UmVnaXN0ZXJFbGVtZW50KGRlc2NyaXB0b3IubmFtZSwge1xuICAgICAgICAgICAgcHJvdG90eXBlOiB0aGlzLmdldEVsZW1lbnRQcm90b3R5cGUod2luZG93W3Byb3RvdHlwZV0ucHJvdG90eXBlKSxcbiAgICAgICAgICAgIGV4dGVuZHM6IGRlc2NyaXB0b3IuZXh0ZW5kLnRvTG93ZXJDYXNlKClcbiAgICAgICAgfSk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXNwb25zaWJsZSBmb3IgbG9hZGluZyBhc3NvY2lhdGVkIHN0eWxlcyBpbnRvIGVpdGhlciB0aGUgc2hhZG93IERPTSwgaWYgdGhlIHBhdGggaXMgZGV0ZXJtaW5lZCB0byBiZSBsb2NhbFxuICAgICAqIHRvIHRoZSBjb21wb25lbnQsIG9yIGdsb2JhbGx5IGlmIG5vdC5cbiAgICAgKlxuICAgICAqIEBtZXRob2QgbG9hZFN0eWxlc1xuICAgICAqIEBwYXJhbSB7U2hhZG93Um9vdH0gc2hhZG93Qm91bmRhcnlcbiAgICAgKiBAcmV0dXJuIHtQcm9taXNlW119XG4gICAgICovXG4gICAgbG9hZFN0eWxlcyhzaGFkb3dCb3VuZGFyeSkge1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIGFkZENTU1xuICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gYm9keVxuICAgICAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAgICAgKi9cbiAgICAgICAgZnVuY3Rpb24gYWRkQ1NTKGJvZHkpIHtcbiAgICAgICAgICAgIGxldCBzdHlsZUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgICAgICAgICAgc3R5bGVFbGVtZW50LnNldEF0dHJpYnV0ZSgndHlwZScsICd0ZXh0L2NzcycpO1xuICAgICAgICAgICAgc3R5bGVFbGVtZW50LmlubmVySFRNTCA9IGJvZHk7XG4gICAgICAgICAgICBzaGFkb3dCb3VuZGFyeS5hcHBlbmRDaGlsZChzdHlsZUVsZW1lbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZShTdGF0ZS5SRVNPTFZJTkcpO1xuXG4gICAgICAgIGxldCBjb250ZW50ICAgICAgID0gdGhpcy5lbGVtZW50cy50ZW1wbGF0ZS5jb250ZW50O1xuICAgICAgICBsZXQgbGlua0VsZW1lbnRzICA9IHNlbGVjdG9ycy5nZXRDU1NMaW5rcyhjb250ZW50KTtcbiAgICAgICAgbGV0IHN0eWxlRWxlbWVudHMgPSBzZWxlY3RvcnMuZ2V0Q1NTSW5saW5lcyhjb250ZW50KTtcbiAgICAgICAgbGV0IHByb21pc2VzICAgICAgPSBbXS5jb25jYXQobGlua0VsZW1lbnRzLCBzdHlsZUVsZW1lbnRzKS5tYXAoKGVsZW1lbnQpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG5cbiAgICAgICAgICAgIGlmIChlbGVtZW50Lm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdzdHlsZScpIHtcbiAgICAgICAgICAgICAgICBhZGRDU1MoZWxlbWVudC5pbm5lckhUTUwpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoZWxlbWVudC5pbm5lckhUTUwpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY2FjaGVGYWN0b3J5LmZldGNoKHRoaXMucGF0aC5nZXRQYXRoKGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdocmVmJykpKS50aGVuKChib2R5KSA9PiB7XG5cbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3R5cGUnKSA9PT0gJ3RleHQvc2NzcycpIHtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMuc2Fzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdZb3Ugc2hvdWxkIGluY2x1ZGUgXCJzYXNzLmpzXCIgZm9yIGRldmVsb3BtZW50IHJ1bnRpbWUgU0FTUyBjb21waWxhdGlvbicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZvaWQgcmVqZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBsb2dnZXIud2FybignQWxsIG9mIHlvdXIgU0FTUyBkb2N1bWVudHMgc2hvdWxkIGJlIGNvbXBpbGVkIHRvIENTUyBmb3IgcHJvZHVjdGlvbiB2aWEgeW91ciBidWlsZCBwcm9jZXNzJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gQ29tcGlsZSBTQ1NTIGRvY3VtZW50IGludG8gQ1NTIHByaW9yIHRvIGFwcGVuZGluZyBpdCB0byB0aGUgYm9keS5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZvaWQgdGhpcy5zYXNzLmNvbXBpbGUoYm9keSwgKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhZGRDU1MocmVzcG9uc2UudGV4dCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3BvbnNlLnRleHQpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGFkZENTUyhib2R5KTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKGJvZHkpO1xuXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9KSk7XG5cbiAgICAgICAgUHJvbWlzZS5hbGwocHJvbWlzZXMpLnRoZW4oKCkgPT4gdGhpcy5zZXRTdGF0ZShTdGF0ZS5SRVNPTFZFRCkpO1xuICAgICAgICByZXR1cm4gcHJvbWlzZXM7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFeHRyYWN0IHRoZSBlbGVtZW50IG5hbWUsIGFuZCBvcHRpb25hbGx5IHRoZSBlbGVtZW50IGV4dGVuc2lvbiwgZnJvbSBjb252ZXJ0aW5nIHRoZSBGdW5jdGlvbiB0byBhIFN0cmluZyB2aWFcbiAgICAgKiB0aGUgYHRvU3RyaW5nYCBtZXRob2QuIEl0J3Mgd29ydGggbm90aW5nIHRoYXQgdGhpcyBpcyBwcm9iYWJseSB0aGUgd2Vha2VzdCBwYXJ0IG9mIHRoZSBNYXBsZSBzeXN0ZW0gYmVjYXVzZSBpdFxuICAgICAqIHJlbGllcyBvbiBhIHJlZ3VsYXIgZXhwcmVzc2lvbiB0byBkZXRlcm1pbmUgdGhlIG5hbWUgb2YgdGhlIHJlc3VsdGluZyBjdXN0b20gSFRNTCBlbGVtZW50LlxuICAgICAqXG4gICAgICogQG1ldGhvZCBnZXREZXNjcmlwdG9yXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIGdldERlc2NyaXB0b3IoKSB7XG5cbiAgICAgICAgLy8gV2l0aCBFUzYgdGhlIGBGdW5jdGlvbi5wcm90b3R5cGUubmFtZWAgcHJvcGVydHkgaXMgYmVnaW5uaW5nIHRvIGJlIHN0YW5kYXJkaXNlZCwgd2hpY2ggbWVhbnNcbiAgICAgICAgLy8gaW4gbWFueSBjYXNlcyB3ZSB3b24ndCBoYXZlIHRvIHJlc29ydCB0byB0aGUgZmVlYmxlIGB0b1N0cmluZ2AgYXBwcm9hY2guIEhvb3JhaCFcbiAgICAgICAgbGV0IG5hbWUgICA9IHRoaXMuc2NyaXB0Lm5hbWUgfHwgdGhpcy5zY3JpcHQudG9TdHJpbmcoKS5tYXRjaCgvKD86ZnVuY3Rpb258Y2xhc3MpXFxzKihbYS16X10rKS9pKVsxXSxcbiAgICAgICAgICAgIGV4dGVuZCA9IG51bGw7XG5cbiAgICAgICAgaWYgKH5uYW1lLmluZGV4T2YoJ18nKSkge1xuXG4gICAgICAgICAgICAvLyBEb2VzIHRoZSBlbGVtZW50IG5hbWUgcmVmZXJlbmNlIGFuIGVsZW1lbnQgdG8gZXh0ZW5kP1xuICAgICAgICAgICAgbGV0IHNwbGl0ID0gbmFtZS5zcGxpdCgnXycpO1xuICAgICAgICAgICAgbmFtZSAgICAgID0gc3BsaXRbMF07XG4gICAgICAgICAgICBleHRlbmQgICAgPSBzcGxpdFsxXTtcblxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHsgbmFtZTogdXRpbGl0eS50b1NuYWtlQ2FzZShuYW1lKSwgZXh0ZW5kOiBleHRlbmQgfTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFlpZWxkcyB0aGUgcHJvdG90eXBlIGZvciB0aGUgY3VzdG9tIEhUTUwgZWxlbWVudCB0aGF0IHdpbGwgYmUgcmVnaXN0ZXJlZCBmb3Igb3VyIGN1c3RvbSBSZWFjdCBjb21wb25lbnQuXG4gICAgICogSXQgbGlzdGVucyBmb3Igd2hlbiB0aGUgY3VzdG9tIGVsZW1lbnQgaGFzIGJlZW4gaW5zZXJ0ZWQgaW50byB0aGUgRE9NLCBhbmQgdGhlbiBzZXRzIHVwIHRoZSBzdHlsZXMsIGFwcGxpZXNcbiAgICAgKiBkZWZhdWx0IFJlYWN0IHByb3BlcnRpZXMsIGV0Yy4uLlxuICAgICAqXG4gICAgICogQG1ldGhvZCBnZXRFbGVtZW50UHJvdG90eXBlXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnRQcm90b3R5cGVcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgZ2V0RWxlbWVudFByb3RvdHlwZShlbGVtZW50UHJvdG90eXBlKSB7XG5cbiAgICAgICAgbGV0IGxvYWRTdHlsZXMgPSB0aGlzLmxvYWRTdHlsZXMuYmluZCh0aGlzKSxcbiAgICAgICAgICAgIHNjcmlwdCAgICA9IHRoaXMuc2NyaXB0LFxuICAgICAgICAgICAgcGF0aCAgICAgID0gdGhpcy5wYXRoO1xuXG4gICAgICAgIHJldHVybiBPYmplY3QuY3JlYXRlKGVsZW1lbnRQcm90b3R5cGUgfHwgSFRNTEVsZW1lbnQucHJvdG90eXBlLCB7XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQHByb3BlcnR5IGF0dGFjaGVkQ2FsbGJhY2tcbiAgICAgICAgICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGF0dGFjaGVkQ2FsbGJhY2s6IHtcblxuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIEBtZXRob2QgdmFsdWVcbiAgICAgICAgICAgICAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIHZhbHVlOiBmdW5jdGlvbiB2YWx1ZSgpIHtcblxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogQG1ldGhvZCBzZXREZWZhdWx0UHJvcHNcbiAgICAgICAgICAgICAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGF0dHJpYnV0ZXNcbiAgICAgICAgICAgICAgICAgICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHNldERlZmF1bHRQcm9wcyhhdHRyaWJ1dGVzKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMgICA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5hcHBseShhdHRyaWJ1dGVzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCByZXBsYWNlciA9IC9eZGF0YS0vaTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlcy5mb3JFYWNoKChhdHRyaWJ1dGUpID0+IHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhdHRyaWJ1dGUubmFtZSA9PT0gdXRpbGl0eS5BVFRSSUJVVEVfUkVBQ1RJRCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVHlwZWNhc3QgdGhlIHZhbHVlIGRlcGVuZGluZyBvbiB0aGUgdHlwZS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbmFtZSAgPSBhdHRyaWJ1dGUubmFtZS5yZXBsYWNlKHJlcGxhY2VyLCAnJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NyaXB0LmRlZmF1bHRQcm9wc1tuYW1lXSA9IHV0aWxpdHkudHlwZWNhc3RQcm9wZXJ0eShhdHRyaWJ1dGUudmFsdWUpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gQXBwbHkgcHJvcGVydGllcyB0byB0aGUgY3VzdG9tIGVsZW1lbnQuXG4gICAgICAgICAgICAgICAgICAgIHNjcmlwdC5kZWZhdWx0UHJvcHMgPSB7IHBhdGg6IHBhdGgsIGVsZW1lbnQ6IHRoaXMuY2xvbmVOb2RlKHRydWUpIH07XG4gICAgICAgICAgICAgICAgICAgIHNldERlZmF1bHRQcm9wcy5jYWxsKHRoaXMsIHRoaXMuYXR0cmlidXRlcyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5uZXJIVE1MICAgICAgPSAnJztcblxuICAgICAgICAgICAgICAgICAgICAvLyBDb25maWd1cmUgdGhlIFJlYWN0LmpzIGNvbXBvbmVudCwgaW1wb3J0aW5nIGl0IHVuZGVyIHRoZSBzaGFkb3cgYm91bmRhcnkuXG4gICAgICAgICAgICAgICAgICAgIGxldCByZW5kZXJlZEVsZW1lbnQgPSBSZWFjdC5jcmVhdGVFbGVtZW50KHNjcmlwdCksXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50RWxlbWVudCAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjb250ZW50JyksXG4gICAgICAgICAgICAgICAgICAgICAgICBzaGFkb3dSb290ICAgICAgPSB0aGlzLmNyZWF0ZVNoYWRvd1Jvb3QoKTtcblxuICAgICAgICAgICAgICAgICAgICBzaGFkb3dSb290LmFwcGVuZENoaWxkKGNvbnRlbnRFbGVtZW50KTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNvbXBvbmVudCA9IFJlYWN0LnJlbmRlcihyZW5kZXJlZEVsZW1lbnQsIGNvbnRlbnRFbGVtZW50KTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBDb25maWd1cmUgdGhlIGV2ZW50IGRlbGVnYXRpb24gZm9yIHRoZSBjb21wb25lbnQuXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50cy5yZWdpc3RlckNvbXBvbmVudChjb21wb25lbnQpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBJbXBvcnQgZXh0ZXJuYWwgQ1NTIGRvY3VtZW50cyBhbmQgcmVzb2x2ZSBlbGVtZW50LlxuICAgICAgICAgICAgICAgICAgICAgKlxuICAgICAgICAgICAgICAgICAgICAgKiBAbWV0aG9kIHJlc29sdmVFbGVtZW50XG4gICAgICAgICAgICAgICAgICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiByZXNvbHZlRWxlbWVudCgpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgUHJvbWlzZS5hbGwobG9hZFN0eWxlcyhzaGFkb3dSb290KSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVBdHRyaWJ1dGUoJ3VucmVzb2x2ZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZSgncmVzb2x2ZWQnLCAnJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZUVsZW1lbnQuYXBwbHkodGhpcyk7XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KTtcblxuICAgIH1cblxufSIsImltcG9ydCBDb21wb25lbnQgZnJvbSAnLi9Db21wb25lbnQuanMnO1xuaW1wb3J0IHV0aWxpdHkgICBmcm9tICcuLy4uL2hlbHBlcnMvVXRpbGl0eS5qcyc7XG5pbXBvcnQgbG9nZ2VyICAgIGZyb20gJy4vLi4vaGVscGVycy9Mb2dnZXIuanMnO1xuaW1wb3J0IG9wdGlvbnMgICBmcm9tICcuLy4uL2hlbHBlcnMvT3B0aW9ucy5qcyc7XG5pbXBvcnQgc2VsZWN0b3JzIGZyb20gJy4vLi4vaGVscGVycy9TZWxlY3RvcnMuanMnO1xuaW1wb3J0IHtTdGF0ZU1hbmFnZXIsIFN0YXRlfSBmcm9tICcuL1N0YXRlTWFuYWdlci5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1vZHVsZSBleHRlbmRzIFN0YXRlTWFuYWdlciB7XG5cbiAgICAvKipcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge0hUTUxMaW5rRWxlbWVudH0gbGlua0VsZW1lbnRcbiAgICAgKiBAcmV0dXJuIHtDb21wb25lbnR9XG4gICAgICovXG4gICAgY29uc3RydWN0b3IobGlua0VsZW1lbnQpIHtcblxuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLnBhdGggICAgICAgPSB1dGlsaXR5LnJlc29sdmVyKGxpbmtFbGVtZW50LmdldEF0dHJpYnV0ZSgnaHJlZicpLCBsaW5rRWxlbWVudC5pbXBvcnQpLmRldmVsb3BtZW50O1xuICAgICAgICB0aGlzLnN0YXRlICAgICAgPSBTdGF0ZS5VTlJFU09MVkVEO1xuICAgICAgICB0aGlzLmVsZW1lbnRzICAgPSB7IGxpbms6IGxpbmtFbGVtZW50IH07XG4gICAgICAgIHRoaXMuY29tcG9uZW50cyA9IFtdO1xuXG4gICAgICAgIHRoaXMubG9hZE1vZHVsZShsaW5rRWxlbWVudCkudGhlbigoKSA9PiB7XG5cbiAgICAgICAgICAgIC8vIFVzZSBvbmx5IHRoZSBmaXJzdCB0ZW1wbGF0ZSwgYmVjYXVzZSBvdGhlcndpc2UgTWFwbGVpZnkgd2lsbCBoYXZlIGEgZGlmZmljdWx0IGpvYiBhdHRlbXB0aW5nXG4gICAgICAgICAgICAvLyB0byByZXNvbHZlIHRoZSBwYXRocyB3aGVuIHRoZXJlJ3MgYSBtaXNtYXRjaCBiZXR3ZWVuIHRlbXBsYXRlIGVsZW1lbnRzIGFuZCBsaW5rIGVsZW1lbnRzLlxuICAgICAgICAgICAgLy8gUFJFVklPVVM6IHRoaXMuZ2V0VGVtcGxhdGVzKCkuZm9yRWFjaCgodGVtcGxhdGVFbGVtZW50KSA9PiB7XG5cbiAgICAgICAgICAgIGxldCB0ZW1wbGF0ZUVsZW1lbnRzID0gdGhpcy5nZXRUZW1wbGF0ZXMoKTtcblxuICAgICAgICAgICAgaWYgKHRlbXBsYXRlRWxlbWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihgQ29tcG9uZW50IFwiJHtsaW5rRWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKX1cIiBpcyBhdHRlbXB0aW5nIHRvIHJlZ2lzdGVyIHR3byBjb21wb25lbnRzYCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBbdGhpcy5nZXRUZW1wbGF0ZXMoKVswXV0uZm9yRWFjaCgodGVtcGxhdGVFbGVtZW50KSA9PiB7XG5cbiAgICAgICAgICAgICAgICBsZXQgc2NyaXB0RWxlbWVudHMgPSBzZWxlY3RvcnMuZ2V0QWxsU2NyaXB0cyh0ZW1wbGF0ZUVsZW1lbnQuY29udGVudCk7XG5cbiAgICAgICAgICAgICAgICBzY3JpcHRFbGVtZW50cy5tYXAoKHNjcmlwdEVsZW1lbnQpID0+IHtcblxuICAgICAgICAgICAgICAgICAgICBsZXQgc3JjID0gc2NyaXB0RWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3NyYycpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5wYXRoLmlzTG9jYWxQYXRoKHNyYykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGxldCBjb21wb25lbnQgPSBuZXcgQ29tcG9uZW50KHRoaXMucGF0aCwgdGVtcGxhdGVFbGVtZW50LCBzY3JpcHRFbGVtZW50KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb21wb25lbnRzLnB1c2goY29tcG9uZW50KTtcblxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShTdGF0ZS5SRVNPTFZFRCk7XG5cbiAgICAgICAgfSwgKG1lc3NhZ2UpID0+IGxvZ2dlci5lcnJvcihtZXNzYWdlKSk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNldFN0YXRlXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHN0YXRlXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBzZXRTdGF0ZShzdGF0ZSkge1xuICAgICAgICB0aGlzLnN0YXRlID0gc3RhdGU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBsb2FkTW9kdWxlXG4gICAgICogQHBhcmFtIHtIVE1MVGVtcGxhdGVFbGVtZW50fSBsaW5rRWxlbWVudFxuICAgICAqIEByZXR1cm4ge1Byb21pc2V9XG4gICAgICovXG4gICAgbG9hZE1vZHVsZShsaW5rRWxlbWVudCkge1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoU3RhdGUuUkVTT0xWSU5HKTtcblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXG4gICAgICAgICAgICBpZiAobGlua0VsZW1lbnQuaGFzQXR0cmlidXRlKCdyZWYnKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB2b2lkIHJlc29sdmUobGlua0VsZW1lbnQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobGlua0VsZW1lbnQuaW1wb3J0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZvaWQgcmVzb2x2ZShsaW5rRWxlbWVudCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxpbmtFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCAoKSA9PiByZXNvbHZlKGxpbmtFbGVtZW50KSk7XG5cbiAgICAgICAgICAgIGxldCBocmVmICAgICAgICAgPSBsaW5rRWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKSxcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2UgPSBgVGltZW91dCBvZiAke29wdGlvbnMuUkVTT0xWRV9USU1FT1VUIC8gMTAwMH0gc2Vjb25kcyBleGNlZWRlZCB3aGlsc3Qgd2FpdGluZyBmb3IgSFRNTCBpbXBvcnQ6IFwiJHtocmVmfVwiYDtcbiAgICAgICAgICAgIHV0aWxpdHkucmVzb2x2ZVRpbWVvdXQoZXJyb3JNZXNzYWdlLCByZWplY3QpO1xuXG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGdldFRlbXBsYXRlc1xuICAgICAqIEByZXR1cm4ge0FycmF5fVxuICAgICAqL1xuICAgIGdldFRlbXBsYXRlcygpIHtcblxuICAgICAgICBsZXQgb3duZXJEb2N1bWVudCA9IHRoaXMuZWxlbWVudHMubGluay5pbXBvcnQ7XG4gICAgICAgIHJldHVybiB1dGlsaXR5LnRvQXJyYXkob3duZXJEb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCd0ZW1wbGF0ZScpKTtcblxuICAgIH1cblxufSIsIi8qKlxuICogQGNvbnN0YW50IFN0YXRlXG4gKiBAdHlwZSB7e1VOUkVTT0xWRUQ6IG51bWJlciwgUkVTT0xWSU5HOiBudW1iZXIsIFJFU09MVkVEOiBudW1iZXJ9fVxuICovXG5leHBvcnQgY29uc3QgU3RhdGUgPSB7IFVOUkVTT0xWRUQ6IDAsIFJFU09MVklORzogMSwgUkVTT0xWRUQ6IDIgfTtcblxuLyoqXG4gKiBAbW9kdWxlIE1hcGxlXG4gKiBAc3VibW9kdWxlIFN0YXRlTWFuYWdlclxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvTWFwbGUuanNcbiAqL1xuZXhwb3J0IGNsYXNzIFN0YXRlTWFuYWdlciB7XG5cbiAgICAvKipcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKiBAcmV0dXJuIHtBYnN0cmFjdH1cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IFN0YXRlLlVOUkVTT0xWRUQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZXRTdGF0ZVxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBzdGF0ZVxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgc2V0U3RhdGUoc3RhdGUpIHtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHN0YXRlO1xuICAgIH1cblxufSJdfQ==
