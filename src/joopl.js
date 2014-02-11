// (c) joopl 
// By Matías Fidemraizer (http://www.matiasfidemraizer.com) (http://www.linkedin.com/in/mfidemraizer/en)
// -------------------------------------------------
// Project site on GitHub: http://mfidemraizer.github.io/joopl/
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

if (typeof $namespace == "undefined") {
    // Keywords
    var $namespace = null; // Holds an object to manage namespaces
    var $global = null; // Represents the global namespace.
    var $import = null;

    (function (undefined) {
        "use strict";

        /** 
            Represents a namespace which can declare classes and enumerations, and provides metadata.

            @class Namespace
            @constructor
        */
        var Namespace = function (args) {

            /**
                Gets namespace name

                @property name
                @type string
            */
            Object.defineProperty(
                this,
                "name", {
                    value: args.name,
                    writable: false,
                    configurable: false,
                    enumerable: true
                }
            );

            /**
                Gets namespace full namespace path

                @property fullName
                @type string
            */
            Object.defineProperty(
                this,
                "fullName", {
                    value: args.fullName,
                    writable: false,
                    configurable: false,
                    enumerable: true
                }
            );

            /**
                Gets the parent namespace object

                @property parent
                @type Namespace
            */
            Object.defineProperty(
                this,
                "parent", {
                    value: args.parent,
                    writable: false,
                    configurable: false,
                    enumerable: true
                }
            );

            /**
                Declares a class inside the namespace (see <a href="define classes with joopl.html" target="_self">how to define classes</a>)

                @method declareClass
                @param {string} className A class name (f.e. "MyClass", "Person", "Order", "Product"...)
                @param {object} classDef A class definition 
            */
            Object.defineProperty(
                this,
                "declareClass", {
                    value: function (className, classDef) {
                        if (!this.hasOwnProperty(className)) {
                            var builtDef = TypeUtil.declareClass(className, this, classDef);
                            $global.__types__[this.fullName + "." + className] = builtDef;

                            Object.defineProperty(
                                this,
                                className, {
                                    value: builtDef,
                                    writable: false,
                                    configurable: false,
                                    enumerable: true
                                }
                            );

                            $namespace._classes[this.fullName + "." + className] = builtDef;
                        } else {
                            console.warn("Trying to define '" + className + "' class while it is already declared on '" + this.fullName + "' namespace");
                        }
                    },
                    writable: false,
                    enumerable: true,
                    configurable: false
                }
            );

            Object.defineProperty(
                this,
                "declareEnum", {
                    value: function (name, enumDef) {
                        if (!this.hasOwnProperty(name)) {
                            var builtDef = TypeUtil.declareEnum(name, this, enumDef);
                            $global.__types__[this.fullName + "." + name] = builtDef;

                            Object.defineProperty(
                                this,
                                name, {
                                    value: builtDef,
                                    writable: false,
                                    configurable: false,
                                    enumerable: true
                                }
                            );

                            $namespace._classes[this.fullName + "." + name] = builtDef;
                        } else {
                            console.warn("Trying to define '%s' enumeration while it is already declared on '%s' namespace", name, this.fullName);
                        }
                    },
                    writable: false,
                    enumerable: true,
                    configurable: false
                }
            );
        };

        Object.freeze(Namespace);

        var globalNamespace = new Namespace({ name: "$global", fullName: "$global", parent: null });

        $global = Object.create(globalNamespace, {
            __types__: {
                value: {},
                writable: false,
                configurable: false,
                enumerable: false
            },

            getType: {
                value: function (fullName) {
                    if ($global.__types__.hasOwnProperty(fullName)) {
                        return $global.__types__[fullName];
                    } else {
                        return null;
                    }
                },
                writable: false,
                configurable: false,
                enumerable: true
            }
        });

        var BrowserUtil = {
            get isIE() {
                if (!window) {
                    return false;
                }

                var div = document.createElement("div");
                div.innerHTML = "<!--[if IE]><i></i><![endif]-->";

                return div.getElementsByTagName("i").length == 1 || navigator.userAgent.toLowerCase().indexOf("trident") > 0;
            },

            get isWebkit() {
                var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
                var isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);

                return isChrome || isSafari;
            }
        };

        Object.freeze(BrowserUtil);

        // An object containing a set of core features used by jOOPL
        var TypeUtil = {
            declareClass: function (className, namespace, args) {
                var classDef = null;

                if (!args && this) {
                    args = this;
                }
                else if (!args && !this) {
                    args = {};
                }

                if (args.$inmutable === true && Object.freeze) {
                    classDef = function (args, callctor) {
                        TypeUtil.buildObject(this, args, typeof callctor == "undefined");

                        Object.freeze(this);
                    };

                } else if (args.dynamic === false && Object.preventExtensions) {
                    classDef = function (args, callctor) {
                        TypeUtil.buildObject(this, args, typeof callctor == "undefined");

                        Object.preventExtensions(this);
                    };

                } else {
                    classDef = function (args, callctor) {
                        TypeUtil.buildObject(this, args, typeof callctor == "undefined");
                    };
                }

                classDef.prototype = new $global.joopl.Object();

                var ctor = null;

                if (args.ctor) {
                    ctor = args.ctor;
                } else {
                    ctor = function () { };
                }

                Object.defineProperty(
                    classDef.prototype,
                    "ctor", {
                        value: ctor,
                        writable: false,
                        configurable: false,
                        enumerable: false
                    }
                );

                if (args.members) {
                    var propertyDescriptor = null;

                    for (var memberName in args.members) {
                        propertyDescriptor = Object.getOwnPropertyDescriptor(args.members, memberName);

                        if (typeof propertyDescriptor.value == "function") {
                            if (classDef.prototype.hasOwnProperty(memberName)) {
                                Object.defineProperty(
                                    classDef.prototype,
                                    memberName, {
                                        value: args.members[memberName]
                                    }
                                );
                            } else {
                                Object.defineProperty(
                                    classDef.prototype,
                                    memberName, {
                                        value: args.members[memberName],
                                        writable: false,
                                        configurable: true,
                                        enumerable: true
                                    }
                                );
                            }
                        } else if (memberName == "events" && typeof propertyDescriptor.value == "object") {
                            for (var eventIndex in propertyDescriptor.value) {
                                TypeUtil.createEvent(classDef.prototype, propertyDescriptor.value[eventIndex]);
                            }

                        } else if (propertyDescriptor.hasOwnProperty("value") || propertyDescriptor.hasOwnProperty("get") || propertyDescriptor.hasOwnProperty("set")) {
                            TypeUtil.createPropertyFromDescriptor(classDef, memberName, propertyDescriptor);
                        }
                    }
                }


                if (args.inherits) {
                    TypeUtil.buildInheritance(classDef, args.inherits);

                    Object.defineProperty(
                        classDef.prototype,
                        "__base__", {
                            value: args.inherits,
                            writable: false,
                            configurable: false,
                            enumerable: false
                        }
                    );
                }

                var hasMetadata = false;

                if (Array.isArray(args.attributes)) {
                    for (var attrIndex in args.attributes) {
                        if (!args.attributes[attrIndex] && !(args.attributes[attrIndex].isTypeOf instanceof Function) && !args.attributes[attrIndex].isTypeOf($global.joopl.Attribute)) {
                            throw new $global.joopl.ArgumentException({
                                argName: "attributes",
                                reason: "A non-attribute type given as attribute"
                            });
                        }
                    }

                    hasMetadata = true;
                }

                if (typeof $global.joopl.Type == "function") {
                    var typeDescriptor = {
                        configurable: true,
                        enumerable: true,
                        writable: false,
                        value: new $global.joopl.Type({ name: className, baseType: args.inherits ? args.inherits.type : null, namespace: namespace, attributes: hasMetadata ? args.attributes : [] })
                    };

                    Object.defineProperty(classDef, "type", typeDescriptor);
                    Object.defineProperty(classDef.prototype, "type", typeDescriptor);
                }

                return classDef;
            },

            declareEnum: function (name, namespace, enumDef) {
                if (typeof enumDef != "object") {
                    throw new $global.joopl.ArgumentException({
                        argName: "enumDef",
                        reason: "No definition for the enumeration given"
                    });
                }

                var enumerationType = function () {
                };

                enumerationType.prototype = new $global.joopl.Object();

                var enumNames = [];
                var enumValue;

                for (var propertyName in enumDef) {
                    if (typeof enumDef[propertyName] != "number") {
                        throw new $global.joopl.ArgumentException({
                            argName: "enumDef",
                            reason: "An enumeration definition must contain numeric properties only"
                        });
                    }

                    enumValue = new Number(enumDef[propertyName]);
                    enumValue.enum = new $global.joopl.EnumValue({ value: enumValue, name: propertyName });

                    Object.defineProperty(
                        enumerationType,
                        propertyName, {
                            value: enumValue,
                            configurable: false,
                            enumerable: true,
                            writable: false
                        }
                    );

                    enumNames.push(propertyName);
                }

                Object.defineProperty(
                    enumerationType,
                    "valueNames",
                    {
                        value: enumNames,
                        configurable: false,
                        enumerable: true,
                        writable: false
                    }
                );

                Object.defineProperty(
                    enumerationType,
                    "type", {
                        value: new $global.joopl.Type({ name: name, fullName: namespace.fullName + "." + name, namespace: namespace }),
                        writable: false,
                        configurable: false,
                        enumerable: true
                    }
                );

                Object.freeze(enumerationType);

                return enumerationType;
            },

            //  Creates a property on the given class definition based on a provided property descriptor.
            // @classDef: The class definition (it must be the ctor function!
            // @name: The property name
            // @descriptor: An object representing the property descriptor
            // @context: An optional context object that will work as the "this" keyword binder for the getter and/or setter when defining the property.
            createPropertyFromDescriptor: function (classDef, name, descriptor, context) {
                if (context) {
                    if (descriptor.get) {
                        descriptor.get = descriptor.get.bind(context);
                    }

                    if (descriptor.set) {
                        descriptor.set = descriptor.set.bind(context);
                    }
                }

                Object.defineProperty(
                    context ? context : classDef.prototype,
                    name,
                    descriptor
                );
            },

            // Creates a property.
            // @classDef: A class definition (it must be the class ctor function).
            // @name: The property name.
            // @getter: The getter parameterless function.
            // @setter: The setter function with a parameter representing the value to set.
            // @inmutable: A boolean flag specifying if the created property is configurable or not.
            createProperty: function (classDef, name, getter, setter, inmutable) {
                if (typeof inmutable == "undefined") {
                    inmutable = false;
                }

                if (!classDef.prototype.hasOwnProperty(name)) {
                    // This case is for a read-write property
                    if (typeof getter != "undefined" && typeof setter != "undefined") {

                        Object.defineProperty(
                            classDef.prototype,
                            name, {
                                get: getter,
                                set: setter,
                                configurable: !inmutable,
                                enumerable: true
                            }
                        );
                    } else if (typeof getter != "undefined") { // This case is for a read-only property
                        Object.defineProperty(
                            classDef.prototype,
                            name, {
                                get: getter,
                                configurable: !inmutable,
                                enumerable: true
                            }
                        );
                    } else if (typeof setter != "undefined") { // This case is for a write-only property
                        Object.defineProperty(
                            classDef.prototype,
                            name, {
                                set: setter,
                                configurable: !inmutable,
                                enumerable: true
                            }
                        );
                    }
                }
            },

            createEvent: function (source, name) {
                Object.defineProperty(
                    source,
                    name,
                    {
                        get: function () {
                            if (!this._.hasOwnProperty("__eventManager__")) {
                                Object.defineProperty(
                                    this._,
                                    "__eventManager__", {
                                        value: new $global.joopl.EventManager({ source: this }),
                                        configurable: false,
                                        writable: false,
                                        enumerable: true
                                    }
                                );
                            }

                            if (!this._.__eventManager__.hasOwnProperty(name)) {
                                this._.__eventManager__.register(name);
                            }

                            return this._.__eventManager__[name];
                        },
                        configurable: false,
                        enumerable: true
                    }
                );;
            },

            // Builds a class instance into a full jOOPL object supporting inheritance and polymoprhism, and calls the ctor of the whole class instance.
            // @instance: The class instance
            // @args: The ctor arguments.
            buildObject: function (instance, args, callctor) {
                if (instance.__base__ instanceof Function) {
                    Object.defineProperty(
                        instance,
                        "base",
                        {
                            get: function () {
                                if (instance.__base__ instanceof Function) {
                                    Object.defineProperty(
                                        instance,
                                        "__base__", {
                                            value: new instance.__base__(args, false),
                                            configurable: false,
                                            writable: false,
                                            enumerable: false
                                        }
                                    );
                                }

                                return instance.__base__;
                            },
                            configurable: false,
                            enumerable: true
                        }
                    );

                    Object.defineProperty(
                        instance,
                        "__fields__", {
                            value: instance.base._,
                            writable: false,
                            configurable: false,
                            enumerable: false
                        }
                    );
                } else {
                    Object.defineProperty(
                        instance,
                        "__fields__", {
                            value: {},
                            writable: false,
                            configurable: false,
                            enumerable: false
                        }
                    );
                }

                Object.defineProperty(
                    instance._,
                    "__derived__", {
                        value: instance,
                        writable: false,
                        enumerable: false,
                        configurable: true
                    }
                );

                // Fix for PhantomJS, which doesn't fully support
                // ES5 property definitions in prototypes...
                if ($userAgent_phantomjs) {
                    Object.defineProperty(
                        instance,
                        "derived", {
                            value: instance
                        }
                    );
                }

                if (callctor) {
                    instance.ctor.call(instance, args);
                }

                return instance;
            },

            // Builds a given class inheritance with the given parent class.
            // @derived: The child class.
            // @parent: The parent class.
            buildInheritance: function (derived, parent) {
                if (parent != null) {
                    var propertyDescriptor = null;

                    // Adding both methods and properties to the derived class...
                    for (var memberName in parent.prototype) {
                        if (!derived.prototype.hasOwnProperty(memberName) && !$global.joopl.Object.prototype.hasOwnProperty(memberName)) {
                            propertyDescriptor = Object.getOwnPropertyDescriptor(parent.prototype, memberName);

                            // If it has a property descriptor...
                            if (propertyDescriptor) {
                                // and the value of the descriptor is a function it means that it's inheriting a method.
                                if (typeof propertyDescriptor.value == "function") {
                                    Object.defineProperty(
                                        derived.prototype,
                                        memberName, {
                                            value: parent.prototype[memberName],
                                            writable: false,
                                            enumerable: true,
                                            configurable: true
                                        }
                                    );
                                    // derived.prototype[memberName] = parent.prototype[memberName];
                                } else { // If not, it is a property accessor.
                                    this.createPropertyFromDescriptor(derived, memberName, propertyDescriptor);
                                }
                            } else if (typeof parent.prototype[memberName] == "function") { // It can also happen that it's a function defined in the $global.joopl.Object prototype...
                                Object.defineProperty(
                                    derived.prototype,
                                    memberName, {
                                        value: parent.prototype[memberName],
                                        writable: false,
                                        enumerable: true,
                                        configurable: false
                                    }
                                );
                            }
                        }
                    }
                }

                return parent ? parent.prototype : null;
            },

            // Whether determines if some object reference has an associated value (object) and returns true/false.
            // @someRef: The object reference.
            hasValue: function (someRef) {
                return typeof someRef != "undefined" && someRef != null;
            }
        };

        Object.freeze(TypeUtil);

        $import = {
            _dependencyMaps: {},
            _loadedFiles: [],

            mapMany: function (dependencyMaps) {
                for (var uri in dependencyMaps) {
                    this.map(uri, dependencyMaps[uri]);
                }
            },

            map: function (uri, dependencies) {
                if (!this._dependencyMaps.hasOwnProperty(uri)) {
                    this._dependencyMaps[uri] = dependencies;
                }
            },

            modules: function () {
                var scopeModules = [];
                var that = this;
                var scopeFunc = null;
                var arg = null;

                for (var argIndex = 0; argIndex < arguments.length; argIndex++) {
                    arg = arguments[argIndex];

                    if (typeof arg == "function") {
                        scopeFunc = arg;
                    } else if (typeof arg == "string") {
                        scopeModules.push(arg);
                    } else {
                        throw new $global.joopl.ArgumentException({ argName: "paths", reason: "Some of given module names is not a string literal" });
                    }
                };

                if (scopeFunc == null) {
                    throw new $global.joopl.ArgumentException({ argName: "scopeFunc", reason: "No modules' scope function given" });
                }

                var enableHeadJS = Object.keys(this._dependencyMaps).length > 0 && typeof head != "undefined" && typeof window.head.js != "undefined";

                // If HeadJS is available, jOOPL integrates HeadJS asynchronous loading 
                // of DependencyUsageMap dependencies
                if (enableHeadJS) {
                    var dependencyMaps = this._dependencyMaps;

                    var args = [];
                    var dependencies = null;
                    var currentFile = null;

                    for (var moduleIndex in scopeModules) {
                        dependencies = dependencyMaps[scopeModules[moduleIndex]];

                        if (dependencies instanceof Array) {
                            for (var dependencyIndex in dependencies) {
                                currentFile = dependencies[dependencyIndex];

                                if (this._loadedFiles.indexOf(currentFile) == -1) {
                                    this._loadedFiles.push(currentFile);
                                    args.push(currentFile);
                                }
                            }
                        }
                    }

                    if (args.length > 0) {
                        args.push(function () {
                            scopeFunc();
                        });

                        head.js.apply(window, args);
                    } else {
                        scopeFunc();
                    }

                } else {
                    scopeFunc();
                }
            }
        };

        Object.freeze($import);

        $namespace = {
            _namespaces: {},
            _classes: {},

            __register__: function (path, scopedFunc) {

                var nsIdentifiers = typeof path == "string" ? path.split(".") : null;

                if (!this._namespaces.hasOwnProperty(path)) {
                    // The parent namespace of everything is the reserved $global object!
                    var parentNs = $global;
                    var currentNs = null;
                    var nsPath = [];

                    for (var nsIndex = 0; nsIndex < nsIdentifiers.length; nsIndex++) {
                        currentNs = nsIdentifiers[nsIndex];
                        nsPath.push(currentNs);

                        // The current namespace  is not registered (if evals true)
                        if (typeof parentNs[currentNs] == "undefined") {
                            var ns = new Namespace({ parent: parentNs, name: currentNs, fullName: nsPath.join(".") });

                            Object.defineProperty(
                                parentNs,
                                currentNs, {
                                    value: ns,
                                    writable: false,
                                    configurable: false,
                                    enumerable: true
                                }
                            );

                            this._namespaces[ns.fullName] = ns;
                        }

                        parentNs = parentNs[currentNs];
                    }
                }
            },

            using: function () {
                var scopeNamespaces = [];
                var that = this;
                var scopeFunc = null;
                var arg = null;

                for (var argIndex = 0; argIndex < arguments.length; argIndex++) {
                    arg = arguments[argIndex];

                    if (typeof arg == "function") {
                        scopeFunc = arg;
                    } else if (typeof arg == "string") {
                        if (!that._namespaces.hasOwnProperty(arg)) {
                            that.__register__(arg);
                        }

                        scopeNamespaces.push(that._namespaces[arg]);
                    } else {
                        throw new $global.joopl.ArgumentException({ argName: "paths", reason: "Some of given namespace paths is not a string literal" });
                    }
                };

                if (scopeFunc == null) {
                    throw new $global.joopl.ArgumentException({ argName: "scopeFunc", reason: "No namespace scope function given" });
                }

                scopeFunc.apply(scopeNamespaces, scopeNamespaces);
            },
        };

        Object.freeze($namespace);

        $namespace.using("joopl", function (joopl) {
            /**
                @namespace joopl
            */

            /** 
                Represents the base type of any class defined by jOOPL

                @class Object
                @constructor
            */
            joopl.Object = function () {
            };
            joopl.Object.prototype = {};
            joopl.Object.prototype = Object.defineProperties(joopl.Object.prototype, {
                joopl: {
                    get: function () {
                        return "2.5.3";
                    },
                    configurable: false,
                    enumerable: true
                },

                _: {
                    get: function () {
                        return this.__fields__;
                    },
                    configurable: false,
                    enumerable: true
                },

                derived: {
                    get: function () {
                        return this._.__derived__;
                    },
                    configurable: false,
                    enumerable: true
                },

                /**
                    Determines if a given type is of type of current object

                    @method isTypeOf
                    @param {class} type The whole type to compare with
                    @example 
                        obj.isTypeOf(this.A)
                    
                */
                isTypeOf: {
                    value: function (type) {
                        var allBases = [];
                        var lastBase = this;
                        var isMember = false;

                        if (this instanceof type) {
                            isMember = true;
                        } else {
                            while (!isMember && lastBase.base) {
                                if (!(isMember = lastBase.base instanceof type)) {
                                    lastBase = lastBase.base;
                                }
                            }
                        }

                        return isMember;
                    },
                    configurable: false,
                    enumerable: true,
                    writable: false
                }
            });

            /**
                Represents type information and provides access to types' metadata.

                @class Type
                @final
                @since 2.3.0
            */
            joopl.declareClass("Type", {
                ctor: function (args) {
                    this._.attributes = args.attributes;
                    this._.name = args.name;
                    this._.namespace = args.namespace;
                    this._.baseType = args.baseType;
                },
                members: {
                    /**
                        Gets type name (f.e. "MyClass")

                        @property name
                        @type string
                        @readonly
                    */
                    get name() {
                        return this._.name;
                    },

                    /**
                        Gets current type name including full namespace path (f.e. "joopl.test.MyClass")

                        @property fullName
                        @type string
                        @readonly
                    */
                    get fullName() {
                        return this.namespace.fullName + "." + this.name;
                    },

                    /**
                        Gets current base type (i.e. parent class) metadata.

                        @property baseType
                        @type joopl.Type
                        @readonly
                    */
                    get baseType() {
                        return this._.baseType;
                    },

                    /**
                        Gets current namespace instance

                        @property baseType
                        @type joopl.Namespace
                        @readonly
                    */
                    get namespace() {
                        return this._.namespace;
                    },

                    /**
                        Gets all type's attributes.

                        @property attributes
                        @type joopl.Attribute
                        @readonly
                    */
                    get attributes() {
                        return this._.attributes;
                    },

                    /**
                        Gets an attribute instance by giving its type, if the type has the whole attribute

                        @method getAttribute
                        @param {joopl.Attribute} An attribute class definition (rather than an instance!)
                        @return {joopl.Attribute} The attribute instance or `null` if the type does not have the given attribute type
                        @example 
                            myNamespace.MyClass.type.getAttribute(this.MyAttribute);
                    */
                    getAttribute: function (attributeType) {
                        var found = false;
                        var index = 0;

                        while (!found && index < this.attributes.length) {
                            if (this.attributes[index] instanceof attributeType) {
                                found = true;
                            } else {
                                index++;
                            }
                        }

                        if (found) {
                            return this.attributes[index];
                        } else {
                            return null;
                        }
                    },

                    /**
                        Determines whether a given type has an attribute giving its class (rather than giving an instance!)

                        @method hasAttribute
                        @param {joopl.Attribute} The whole attribute class
                        @example
                            this.SomeClass.type.hasAttribute(SomeAttribute);
                    */
                    hasAttribute: function (attributeType) {
                        return this.getAttribute(attributeType) != null;
                    }
                }
            });

            /**
                <h2 id="index">Index</h2>

                * 1.0\. [What is an attribute?](#attribute-definition)
                * 2.0\. [How to implement and consume an attribute](#attribute-howto)
                    * 2.1\. [Attributes with parameters](#attribute-params)

                <h2 id="attribute-definition">1.0 What is an attribute?</h2>
                
                Usually class definitions contain a class ctor, properties, methods and/or events, also known as *class members*. Class members define the information and behavior of a given class. 

                In some cases, classes require some descriptive information that may be useful by the consumers. 

                For example, a class may need to define that requires user authentication and the minimum security role to use its members is *administrator*. 

                How can an arbitrary class tell the environment "*I will not work if the authenticated user is not an administrator*"? **The answer is *attributes**.*

                An attribute is an inherited class of `Attribute` which defines some metadata that can be identified by other pieces and it is added to the class definition during desing-time.

                Finally, a class supports as many attributes as the code requires. The `attributes` parameters for the `$def` operator is an array of attributes.

                <h2 id="attribute-howto">2.0 How to implement and consume an attribute</h2>
                
                The so-called *I will not work if the authenticated user is not an administrator* attribute may be implemented as a class called `RequiresAuthenticationAttribute`:

                    $namespace.using("joopl", "myNamespace", function(joopl, myNamespace) {
                        myNamespace.declareClass("RequiresAuthenticationAttribute", {
                            inherits: joopl.Attribute
                        });
                    });

                Later on, some class that may require authentication to work will apply the whole `RequiresAuthenticationAttribute` as follows:

                    $namespace.using("myNamespace", function(myNamespace) {
                        myNamespace.declareClass("MyClass", {
                            attributes: [new myNamespace.RequiresAuthenticationAttribute()]
                        });
                    });

                Finally, some other code which instantiate the `MyClass` class will inspect if the class requires authentication:

                    $namespace.using("myNamespace", function(myNamespace) {
                        if(myNamespace.MyClass.type.hasAttribute(myNamespace.RequiresAuthenticationAttribute)) {
                            // Do some stuff if MyClass has the whole attribute
                        } else {
                            throw Error("Sorry, this code will not execute classes if they do not require authentication...");
                        }
                    });

                <h3 id="attribute-params">2.1 Attributes with parameters</h3>
                Sometimes using an attribute *as is* is not enough, because the attribute itself should contain data. 

                For example, some code may require some classes to define a default property. `Person` class may have `FirstName`, `Surname` and `Nickname` properties. Which one will be the one to display in some listing?

                    $namespace.using("joopl", "myNamespace", function(joopl, myNamespace) {
                        myNamespace.declareClass("DefaultPropertyAttribute", {
                            inherits: oopl.Attribute,
                            ctor: function(args) {
                                this._.defaultPropertyName = args.defaultPropertyName;
                            },
                            members: {
                                get defaultPropertyName() { return this._.defaultPropertyName; }
                            }
                        });

                        myNamespace.declareClass("Person", {
                            attributes: [new myNamespace.DefaultPropertyAttribute("nickname")],
                            ctor: function() {
                                this._.firstName = null;
                                this._.surname = null;
                                this._.nickname = null;
                            }
                            members: {
                                get firstName() { return this._.firstName; },
                                set firstName(value) { this._.firstName = value; },

                                get surname() { return this._.surname; },
                                set surname(value) { this._.surname = value; },

                                get nickname() { return this._.nickname; },
                                set nickname(value) { this._.nickname = value; }
                            }
                        });
                    });

                
                Now, some code consumes instances of `Person` and creates some HTML listing using standard DOM and the display name for the whole person will be taken from the `DefaultPropertyValueAttribute`:

                    $namespace.using("myNamespace", function(myNamespace) {
                        
                        // The first step is creating a regular instance of Person
                        var person = new myNamespace.Person();
                        person.firstName = "Matias";
                        person.surname = "Fidemraizer";
                        person.nickname = "mfidemraizer";

                        // Secondly, this is checking if the Person class has the whole attribute
                        if(Person.type.hasAttribute(myNamespace.DefaultPropertyAttribute)) {
                            // Yes, it has the attribute!
                            //
                            // Then, the attribute instance is retrieved from the type information
                            var defaultProperty = Person.type.getAttribute(myNamespace.DefaultPropertyAttribute);

                            // Once the attribute is retrieved, the code can access the "defaultPropertyName" instance property
                            // of the DefaultPropertyAttribute
                            var defaultPropertyName = defaultProperty.defaultPropertyName;
                            
                            // Since any object is also an associative array (this is plain JavaScript!), 
                            // the default property can be retrieved by using the "defaultPropertyName" variable
                            // as key of the array
                            var defaultPropertyValue = person[defaultPropertyName];

                            // Finally, this is creating a paragraph containing the defaultPropertyValue. In this case, 
                            // it will be "mfidemraizer", because the Person class has the DefaultPropertyAttribute set to "nickname"!
                            var p = document.createElement("p");
                            p.appendChild(document.createTextNode(defaultPropertyValue));
                            document.body.appendChild(p);
                        }
                    });
            
                @class Attribute
                @since 2.3.0
            */
            joopl.declareClass("Attribute", {
                members: {
                }
            });

            /**
                Represents an enumeration value and provides access to common operations for the whole enumeration value.

                See {{#crossLink "Enumerations"}}{{/crossLink}} to learn more about enumerations.

                @class EnumValue
                @final
                @since 2.3.0
            */
            var EnumValue = joopl.declareClass("EnumValue", {
                ctor: function (args) {
                    this._.value = args.value;
                    this._.name = args.name;
                },
                members: {
                    /** 
                        Gets the enumeration value.

                        @property value
                        @type Number
                    */
                    get value() { return this._.value; },

                    /**
                        Gets the enumeration value name

                        @property name
                        @type string
                        @readOnly
                    */
                    get name() { return this._.name; },

                    /** 
                        Performs a bitwise OR with the given enumeration value

                        @method or
                        @param enumValue {Number} An enumeration value
                        @return {Number} The flag of two or more enumeration values
                        @example 
                            var flag = myNamespace.State.open.enum.or(State.closed); // This is State.open | State.closed
                    */
                    or: function (enumValue) {
                        var value = this.value | enumValue;

                        var result = new Number(value);
                        result.enum = new $global.joopl.EnumValue({ value: value });

                        Object.freeze(result);

                        return result;
                    },

                    /** 
                        Performs a bitwise AND with the given enumeration value

                        @method and
                        @param enumValue {Number} An enumeration value
                        @return {Number} The flag of two or more enumeration values
                        @example 
                            var flag = myNamespace.State.open.enum.and(myNamespace.State.closed); // This is State.open & State.closed
                    */
                    and: function (enumValue) {
                        var value = this.value & enumValue;

                        var result = new Number(value);
                        result.enum = new $global.joopl.EnumValue({ value: value });

                        Object.freeze(result);

                        return result;
                    },

                    /** 
                        Determines if some enumeration value contains other enumeration value.

                        @method hasFlag
                        @param enumValue {Number} An enumeration value
                        @return {Boolean} A boolean specifying if the given enumeration value was found in the flag.
                        @example 
                            var flag = myNamespace.State.open.enum.or(myNamespace.State.closed);
                            var hasOpen = flag.enum.hasFlag(myNamespace.State.open);
                    */
                    hasFlag: function (enumValue) {
                        return (this.value & enumValue) === Number(enumValue);
                    }
                }
            });

            /**
                Represents an utility class to work with enumerations.

                @class Enum
                @static
                @since 2.3.0
            */
            joopl.Enum = new (TypeUtil.declareClass("Enum", this, {
                members: {
                    /** 
                        Parses a text into a given enumeration value

                        @method parseName
                        @param enumType {enum} The enumeration definition (i.e. *State*, *ConnectionTypes*, ...)
                        @param valueName {string} The value name to be parsed (i.e. If an enumeration called States would have an *open* and *closed* values, *open* or *closed* would be a value names)
                        @static
                        @example
                            $namespace.using("joopl", function(joopl) {
                                joopl.declareEnum("State", {
                                    open: 1,
                                    closed: 2
                                });

                                var open = joopl.Enum.parseName(State, "open")
                            });
                    */
                    parseName: function (enumType, valueName) {
                        if (enumType.valueNames.indexOf(valueName) > -1) {
                            return enumType[valueName];
                        } else {
                            throw new scope.ArgumentException({
                                argName: "valueName",
                                reason: "Given value name could not be found as value of the given enumeration type"
                            });
                        }
                    },

                    /** 
                        Parses a comma-separated list of text values as a mask of given enumeration

                        @method parseNames
                        @param enumType {enum} The enumeration definition (i.e. *State*, *ConnectionTypes*, ...)
                        @param valueNames {String} A comma-separated list of a mask of given enumeration type (i.e. "open, closed, working").
                        @static
                        @example
                            $namespace.using("joopl", function(joopl) {
                                joopl.declareEnum("State", {
                                    open: 1,
                                    closed: 2
                                });

                                joopl.Enum.parseNames(State, "open, closed")
                            });
                    */
                    parseNames: function (enumType, valueNames) {
                        if (!(valueNames && typeof valueNames == "string")) {
                            throw new scope.ArgumentException({
                                argName: "valueName",
                                reason: "Wrong value names"
                            });
                        }

                        var valueNamesArr = valueNames.replace(" ", "").split(",");
                        var value = 0;

                        for (var nameIndex = 0; nameIndex < valueNamesArr.length; nameIndex++) {
                            value += this.parseName(enumType, valueNamesArr[nameIndex])
                        }

                        return new $global.joopl.EnumValue({ value: value });
                    }
                }
            }));

            /**
                Represents a multi-cast event. 

                An event is an observable object which notifies multiple objects listening event raises.

                @class Event
                @final
                @constructor
                @param {object} source The object who will be raising this event
            */
            joopl.declareClass("Event", {
                ctor: function (args) {
                    this._.handlers = [];
                    this._.source = args.source;
                },
                members: {

                    /**
                        Gets an array of event handlers listenting for event raise

                        @property handlers
                        @return Array
                        @private
                    */
                    get handlers() { return this._.handlers; },

                    /**
                        Gets the object who raises the event

                        @property source
                        @type Object
                        @private
                    */
                    get source() { return this._.source; },

                    /**
                        Adds and binds a function to this event that will be called whenever
                        this event is raised.

                        It supports unlimited event listeners and they will be called in order *FIFO*.

                        @method addEventListener
                        @param {function} handler A function reference which handles the event
                        @return {void}
                    */
                    addEventListener: function (handler) {
                        var index = this.handlers.indexOf(handler);

                        if (index == -1) {
                            this.handlers.push(handler);
                        }
                    },

                    /**
                        Removes and unbinds a function from this event.
                        
                        Given function handler should be the one that was previously added with `addEventListener`.

                        @method addEventListener
                        @param {function} handler A function reference which handles the event
                        @return {void}
                    */
                    removeEventListener: function (handler) {
                        var index = this.handlers.indexOf(handler);

                        if (index >= 0) {
                            this.handlers.splice(index, 1);
                        }
                    },

                    raise: function (args) {
                        if (this.handlers.length > 0) {
                            for (var delegateIndex in this.handlers) {
                                this.handlers[delegateIndex].call(
                                    args ? (args.$this ? args.$this : this.source) : this.source,
                                    args ? (args.args ? args.args : null) : null
                                );
                            }
                        }
                    }
                }
            });

            /**
                Represents an event manager for some class supporting events.

                It is capable of registering events and managing their life-cycle.

                @class EventManager
                @final
                @constructor 
                @param {object} source The object who is associated with the event manager
            */
            joopl.declareClass("EventManager", {
                ctor: function (args) {
                    this._.source = args.source;
                },
                members: {
                    /**
                        Gets the object who is associated with the event manager

                        @property source
                        @type object
                        @private
                    */
                    get source() {
                        return this._.source;
                    },

                    /**
                        Registers an event in the event manager
                        
                        @method register
                        @return void
                    */
                    register: function (eventName) {
                        var delegates = [];
                        var that = this;
                        var source = this.source;

                        Object.defineProperty(
                            this,
                            eventName, {
                                value: new $global.joopl.Event({ source: this.source }),
                                writable: false,
                                configurable: false,
                                enumerable: true
                            }
                        );
                    }
                },
            });

            /**
                Represents a set of environmental values and operations

                @class Environment
                @final
            */
            joopl.declareClass("Environment", {
                members: {
                    /**
                        Occurs when any exception of any type is thrown within current application

                        @event exceptionThrown
                        @param {joopl.Exception} thrownException The exception that has been thrown
                        @example
                            // Listening exceptions...
                            $global.joopl.Environment.current.exceptionThrown.addEventListener(function(e) {
                                var exception = e.thrownException;
                            });

                            // Raising the event...
                            $global.joopl.Environment.current.notifyException(someException);
                    */
                    events: ["exceptionThrown"],

                    /**
                        Notifies a given exception to all subscribers

                        @method notifyException
                        @param {joopl.Exception} exception The exception to be notified
                        @example 
                            $global.joopl.Environment.current.notifyException(someException);
                    */
                    notifyException: function (exception) {
                        this.exceptionThrown.raise({ args: { thrownException: exception } });
                    }
                }
            });

            /**
                Gets current Environment instance

                @property current
                @type Environment
                @readonly
                @static
            */
            Object.defineProperty(
                joopl.Environment,
                "current", {
                    value: new joopl.Environment(),
                    writable: false,
                    configurable: false,
                    enumerable: true
                }
            );

            joopl.declareClass("Exception", {

                /**
                    Represents the base class for any exception 

                    <a href="Exception%20handling%20best%20practices.html" target="_self">Please read more about exception handling by following this link to "Exception handling best practices"</a>

                    @class Exception
                    @constructor
                    @param {string} message A human-readable reason text for the whole exception
                    @param {Exception} innerException An inner exception that is more specific to occured error
                    @example 
                        throw new $global.joopl.Exception({ message: "Some", innerException: otherException });
                */
                ctor: function (args) {
                    this._.message = args.message;
                    this._.innerException = args.innerException;

                    var error = Error(args.message);

                    if (BrowserUtil.isIE) {
                        try {
                            throw error;
                        } catch (e) {
                            error = e;
                        }
                    }

                    var stackTrace = error.stack.split("\n");
                    var found = false;
                    var index = BrowserUtil.isIE || BrowserUtil.isWebkit ? 0 : -1;
                    var stackRegex = BrowserUtil.isIE || BrowserUtil.isWebkit ? /(joopl[.A-Za-z0-9]+\.js[:0-9]+\)$)|(at Error)/ : /joopl[.A-Za-z0-9]+\.js[:0-9]+$/;

                    while (!found && index < stackTrace.length) {
                        if (!stackRegex.test(stackTrace[++index])) {
                            found = true;
                        }
                    }

                    if (found) {
                        stackTrace.splice(0, index);

                        this._.stackTrace = stackTrace;
                    }

                    this._.error = error;

                    $global.joopl.Environment.current.notifyException(this._.derived);
                },

                members:
                {
                    /**
                        Gets the human-readable reason text for this exception

                        @property message
                        @type string
                        @readonly
                    */
                    get message() {
                        return this._.message;
                    },

                    /**
                        Gets an inner exception (optional) which provides information about the sorrounding one

                        @property innerException
                        @type Exception
                        @readonly
                    */
                    get innerException() {
                        return this._.innerException;
                    },

                    /**
                        Gets the exception's stack trace as an array where each index is a code line  

                        @property stackTrace
                        @type Array
                        @readonly
                    */
                    get stackTrace() {
                        return this._.stackTrace;
                    },

                    /**
                        Gets underlying `Error` instance  

                        @property error
                        @type Error
                        @readonly
                    */
                    get error() {
                        return this._.error;
                    },

                    /**
                        Returns the exception message plus the stack trace as a concatenated string

                        @method toString
                        @return {String} The exception message plus the stack trace as a concatenated string
                    */
                    toString: function () {
                        var text = "An exception of type '" + this.type.fullName + "' has been thrown with message '" + this.message + "'\n\n";
                        text += "Stack trace:\n_________________________\n\n";
                        text += this.stackTrace.join("\n");

                        return text;
                    }
                }
            });

            joopl.declareClass("ArgumentException", {
                inherits: joopl.Exception,

                /**
                    Represents an exception that occurs when some method argument is missing or invalid

                    <a href="Exception%20handling%20best%20practices.html" target="_self">Please read more about exception handling by following this link to "Exception handling best practices"</a>

                    @class ArgumentException
                    @extends joopl.Exception
                    @constructor
                    @param {string} argName The affected argument name
                    @param {string} reason (optional) A reason text explaining what was wrong with the affected argument
                    @example
                        throw new $global.joopl.ArgumentException({ argName: "someArgument"});
                */
                ctor: function (args) {
                    this._.argName = args.argName;

                    var message = "The given argument '" + args.argName + "' is not valid";

                    if (args.reason) {
                        message += " (Reason: " + args.reason + ")";
                    }

                    this.base.ctor({
                        message: message
                    });
                },
                members: {
                    /**
                        Gets the affected argument name

                        @property argName
                        @type string
                        @readonly
                    */
                    get argName() {
                        return this._.argName;
                    }
                }
            });

            joopl.declareClass("NotImplementedException", {
                inherits: joopl.Exception,

                /**
                    Represents an exception that occurs when a class member is not implemented.

                    <a href="Exception%20handling%20best%20practices.html" target="_self">Please read more about exception handling by following this link to "Exception handling best practices"</a>

                    @class NotImplementedException
                    @extends joopl.Exception
                    @constructor
                    @param {string} memberName The affected member name which does not implement something
                    @example
                        throw new $global.joopl.NotImplementedException({ memberName: "someMethod"});
                */
                ctor: function (args) {
                    this.base.ctor(
                        {
                            message: !TypeUtil.hasValue(args) || !TypeUtil.hasValue(args.memberName) ?
                                            "A method or property is not implemented"
                                            :
                                            "Method or property '" + args.memberName + "' is not implemented"
                        }
                    );

                    this._.memberName = args.memberName;
                },
                members: {
                    /**
                        Gets the not implemented member name

                        @property memberName
                        @type string
                        @readonly
                    */
                    get memberName() {
                        return this._.memberName;
                    }
                }
            });
        });
    })(undefined);
}