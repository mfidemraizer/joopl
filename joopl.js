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

// Keywords
var $namespace = null; // Holds an object to manage namespaces
var $global = null; // Represents the global scope.
var $manifest = null;

(function (undefined) {
    "use strict";

    var version = "2.4.1";
    var $enumdef = null;
    var $def = null;

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
                    Object.defineProperty(
                        this,
                        className, {
                            value: $def(className, this, classDef),
                            writable: false,
                            configurable: false,
                            enumerable: true
                        }
                    );
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
                    Object.defineProperty(
                        this,
                        name, {
                            value: $enumdef(name, this, enumDef),
                            writable: false,
                            configurable: false,
                            enumerable: true
                        }
                    );
                },
                writable: false,
                enumerable: true,
                configurable: false
            }
        );
    };

    Object.freeze(Namespace);

    $global = new Namespace({ name: "$global", fullName: "$global", parent: null });

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
            if (inmutable == undefined) {
                inmutable = false;
            }

            if (!classDef.prototype.hasOwnProperty(name)) {
                // This case is for a read-write property
                if (getter && setter) {

                    Object.defineProperty(
                        classDef.prototype,
                        name, {
                            get: getter,
                            set: setter,
                            configurable: !inmutable,
                            enumerable: true
                        }
                    );
                } else if (getter) { // This case is for a read-only property
                    Object.defineProperty(
                        classDef.prototype,
                        name, {
                            get: getter,
                            configurable: !inmutable,
                            enumerable: true
                        }
                    );
                } else if (setter) { // This case is for a write-only property
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
            if (source.hasOwnProperty(name)) {
                throw Error("The source object has already defined an event called '" + name + "'");
            }
            var eventManager = new $global.joopl.EventManager({ source: source });

            Object.defineProperty(
                source,
                name,
                {
                    get: function () {
                        return eventManager[name];
                    },
                    set: function (value) {
                        eventManager[name] = value;
                    },
                    configurable: false,
                    enumerable: true
                }
            );

            eventManager.register(name);
        },

        // Builds a class instance into a full jOOPL object supporting inheritance and polymoprhism, and calls the ctor of the whole class instance.
        // @instance: The class instance
        // @args: The ctor arguments.
        buildObject: function (instance, args, callctor) {
            if (typeof instance.base == "function") {
                Object.defineProperty(
                    instance,
                    "base",
                    {
                        value: new instance.base(args, false),
                        writable: false,
                        configurable: false,
                        enumerable: false
                    }
                );

                Object.defineProperty(
                    instance,
                    "_", {
                        value: instance.base._,
                        writable: false,
                        configurable: false,
                        enumerable: false
                    }
                );
            } else {

                Object.defineProperty(
                    instance,
                    "_", {
                        value: {},
                        writable: false,
                        configurable: false,
                        enumerable: false
                    }
                );
            }

            Object.defineProperty(
                instance._,
                "derived", {
                    value: instance,
                    writable: false,
                    configurable: true,
                    enumerable: false
                }
            );

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
                // Adding all class fields to the derived class...
                for (var fieldName in parent.prototype._) {
                    if (!derived.prototype._[fieldName]) {
                        Object.defineProperty(
                            derived.prototype._,
                            fieldName, {
                                value: parent.prototype._[fieldName],
                                writable: true,
                                configurable: false,
                                enumerable: true
                            }
                        );
                    }
                }

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
            return someRef !== undefined && someRef != null;
        }
    };

    Object.freeze(TypeUtil);

    var DependencyUtil = {
        findFileInUsageMap: function (fileName) {
            var usageMap = $global.__DependencyUsageMap;
            var found = false;
            var index = 0;

            while (!found && index < usageMap.length) {
                if (usageMap[index].fileName == fileName) {
                    found = true;
                } else {
                    index++;
                }
            }

            if (found) {
                return usageMap[index];
            } else {
                return null;
            }
        },

        buildDependencyList: function (fileName) {
            var map = $global.__DependencyMap;
            var usageMap = $global.__DependencyUsageMap;

            var fileManifest = this.findFileInUsageMap(fileName);

            var dependencies = [];

            for (var manifestIndex = 0; manifestIndex < fileManifest.dependsOn.length; manifestIndex++) {
                dependencies.add(fileManifest.dependsOn[manifestIndex]);
            }

        }
    };

    Object.freeze(DependencyUtil);

    $manifest = {
        file: function (executingFileName, scopeFunc) {
            var scopeMetadata = {
                executingFileName: executingFileName
            };

            var enableHeadJS = $global.__DependencyUsageMap !== undefined && window.head != undefined && window.head.js != undefined;

            scopeFunc = scopeFunc.bind(scopeMetadata);

            // If HeadJS is available, jOOPL integrates HeadJS asynchronous loading 
            // of DependencyUsageMap dependencies
            if (enableHeadJS) {
                var found = false;
                var index = 0;

                while (!found && index < $global.__DependencyUsageMap.length) {
                    if ($global.__DependencyUsageMap[index].fileName == executingFileName) {
                        found = true;
                    } else {
                        index++;
                    }
                }

                if (found) {
                    var args = $global.__DependencyUsageMap[index].dependsOn.splice(0);
                    args.push(function () {
                        scopeFunc();
                    });

                    head.js.apply(window, args);
                }
            } else {
                scopeFunc();
            }
        }
    };

    Object.freeze($manifest);

    $namespace = {
        register: function (path, scopedFunc) {
            var nsIdentifiers = typeof path == "string" ? path.split(".") : null;

            // The parent namespace of everything is the reserved $global object!
            var parentNs = $global;
            var currentNs = null;
            var nsPath = [];

            for (var nsIndex = 0; nsIndex < nsIdentifiers.length; nsIndex++) {
                currentNs = nsIdentifiers[nsIndex];
                nsPath.push(currentNs);

                // The current namespace  is not registered (if evals true)
                if (!parentNs[currentNs]) {
                    Object.defineProperty(
                        parentNs,
                        currentNs, {
                            value: new Namespace({ parent: parentNs, name: currentNs, fullName: nsPath.join(".") }),
                            writable: false,
                            configurable: false,
                            enumerable: true
                        }
                    );
                }

                parentNs = parentNs[currentNs];
            }

            // If the second parameter holds something if should be a 
            // parameterless function, and this is creating a namespace scope.
            if (typeof scopedFunc == "function") {
                $namespace.using(path, scopedFunc, true);
            }
        },

        /** 
            Aliases an existing namespace.

            @method alias
            @param namespace {Object} The namespace to alias
            @param alias {String} The alias
            @example
                $namespace.register("joopl.samples");
                $namespace.alias($global.joopl.samples, "samples");
        */
        alias: function (namespace, alias) {
            $global[alias] = namespace;
        },

        /**
            Imports the members of given namespace path.

            The `$namespace.using` method will not register a namespace if a given namespace path is not previously registered with `$namespace.register`.

            @method using
            @param paths {Array} An array of strings of the namespaces to import
            @param scopedFunc {Function} A function to create a namespace scope (optional)
            @param scopeIsNs {boolean} USED BY THE SYSTEM. IT IS NOT RECOMMENDED FOR DEVELOPERS. A boolean flag specifying if the this keyword in the scoped function must be the childest namespace or not (optional)
        */
        using: function (paths, scopedFunc, scopeIsNs) {
            if (paths === undefined) {
                debugger;
                throw new $global.joopl.ArgumentException({ argName: "namespace path", reason: "No namespace path has been provided" });
            }

            if (typeof paths == "string") {
                if (paths.length == 0) {
                    debugger;
                    throw new $global.joopl.ArgumentException({ argName: "namespace path", reason: "No namespace path has been provided" });
                }

                paths = [paths];
            }

            if (paths.length == 0) {
                debugger;
                throw new $global.joopl.ArgumentException({ argName: "namespace path", reason: "No namespace path has been provided" });
            }

            var nsIdentifiers = null;
            var currentNs = $global;
            var nsIndex = 0;
            var namespaces = [];

            for (var pathIndex in paths) {
                nsIdentifiers = paths[pathIndex].split(".");

                for (nsIndex = 0; nsIndex < nsIdentifiers.length; nsIndex++) {
                    currentNs = currentNs[nsIdentifiers[nsIndex]];

                    if (!currentNs) {
                        debugger;
                        throw new $global.joopl.ArgumentException({
                            argName: "namespace path",
                            reason: "The namespace path '" + paths[pathIndex] + "' is not valid because the namespace '" + nsIdentifiers[nsIndex] + "' is not declared"
                        });
                    }
                }

                namespaces.push(currentNs);
                currentNs = $global;
            }

            var nsScope = {};
            var tempMember = null;

            for (nsIndex in namespaces) {
                for (var typeName in namespaces[nsIndex]) {
                    if (!nsScope[typeName]) {
                        tempMember = namespaces[nsIndex][typeName];

                        if ((tempMember.prototype !== undefined && !tempMember.prototype.joopl !== undefined) || tempMember.joopl !== undefined) {
                            nsScope[typeName] = tempMember;
                        }
                    }
                    else {
                        throw Error("A type called '" + typeName + "' in current context from another namespace already exists. Create an alias or use a full namespace paths");
                    }
                }
            }

            Object.preventExtensions(nsScope);

            if (scopedFunc !== undefined && typeof scopedFunc == "function") {
                if (scopeIsNs) {
                    scopedFunc.bind(namespaces[nsIndex])();
                } else if (scopedFunc.length == 0) {
                    scopedFunc.bind(nsScope)();
                } else {
                    scopedFunc.bind($global)(nsScope);
                }

                return null;
            } else {
                return nsScope;
            }
        },
    };

    Object.freeze($namespace);


    $def = function (className, namespace, args) {
        var classDef = null;

        if (!args && this) {
            args = this;
        }
        else if (!args && !this) {
            args = {};
        }

        if (args.$inmutable === true && Object.freeze) {
            classDef = function (args, callctor) {
                TypeUtil.buildObject(this, args, callctor === undefined);

                Object.freeze(this);
            };

        } else if (args.dynamic === false && Object.preventExtensions) {
            classDef = function (args, callctor) {
                TypeUtil.buildObject(this, args, callctor === undefined);

                Object.preventExtensions(this);
            };

        } else {
            classDef = function (args, callctor) {
                TypeUtil.buildObject(this, args, callctor === undefined);
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
                "base", {
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
                    debugger;
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
    };

    Object.freeze($def);

    $namespace.register("joopl", function () {
        /**
            @namespace joopl
        */

        var scope = this;

        /** 
            Represents the base type of any class defined by jOOPL

            @class Object
            @constructor
        */
        this.Object = function () {
        };

        this.Object.prototype = {

            /**
                Gets jOOPL library version (f.e. "2.4.0")

                @property joopl
                @type string
                @readonly
            */
            get joopl() { return version; },

            /**
                Determines if a given type is of type of current object

                @method isTypeOf
                @param {class} type The whole type to compare with
                @example obj.isTypeOf(this.A)
                
            */
            isTypeOf: function (type) {
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
            }
        };

        /**
            Represents type information and provides access to types' metadata.

            @class Type
            @final
            @since 2.3.0
        */
        this.declareClass("Type", {
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
                        this.MyClass.type.getAttribute(this.MyAttribute);
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

                $namespace.register("myNamespace", function() {
                    this.declareClass("RequiresAuthenticationAttribute", {
                        inherits: $global.joopl.Attribute
                    });
                });

            Later on, some class that may require authentication to work will apply the whole `RequiresAuthenticationAttribute` as follows:

                $namespace.register("myNamespace", function() {
                    this.declareClass("MyClass", {
                        attributes: [new this.RequiresAuthenticationAttribute()]
                    });
                });

            Finally, some other code which instantiate the `MyClass` class will inspect if the class requires authentication:

                $namespace.using("myNamespace", function() {
                    if(this.MyClass.type.hasAttribute(this.RequiresAuthenticationAttribute)) {
                        // Do some stuff if MyClass has the whole attribute
                    } else {
                        throw Error("Sorry, this code will not execute classes if they do not require authentication...");
                    }
                });

            <h3 id="attribute-params">2.1 Attributes with parameters</h3>
            Sometimes using an attribute *as is* is not enough, because the attribute itself should contain data. 

            For example, some code may require some classes to define a default property. `Person` class may have `FirstName`, `Surname` and `Nickname` properties. Which one will be the one to display in some listing?

                $namespace.register("myNamespace", function() {
                    this.declareClass("DefaultPropertyAttribute", {
                        inherits: $global.joopl.Attribute,
                        ctor: function(args) {
                            this._.defaultPropertyName = args.defaultPropertyName;
                        },
                        members: {
                            get defaultPropertyName() { return this._.defaultPropertyName; }
                        }
                    });

                    this.declareClass("Person", {
                        attributes: [new this.DefaultPropertyAttribute("nickname")],
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

                $namespace.using("myNamespace", function() {
                    
                    // The first step is creating a regular instance of Person
                    var person = new this.Person();
                    person.firstName = "Matias";
                    person.surname = "Fidemraizer";
                    person.nickname = "mfidemraizer";

                    // Secondly, this is checking if the Person class has the whole attribute
                    if(Person.type.hasAttribute(this.DefaultPropertyAttribute)) {
                        // Yes, it has the attribute!
                        //
                        // Then, the attribute instance is retrieved from the type information
                        var defaultProperty = Person.type.getAttribute(this.DefaultPropertyAttribute);

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
        this.declareClass("Attribute", {
            members: {
            }
        });

        /**
            Represents an enumeration value and provides access to common operations for the whole enumeration value.

            See {{#crossLink "$enumdef"}}{{/crossLink}} to learn more about enumerations.

            @class EnumValue
            @final
            @since 2.3.0
        */
        var EnumValue = $def("EnumValue", { name: "joopl" }, {
            ctor: function (args) {
                this._.value = args.value;
            },
            members: {
                /** 
                    Gets the enumeration value.

                    @property value
                    @type Number
                */
                get value() { return this._.value; },

                /** 
                    Performs a bitwise OR with the given enumeration value

                    @method or
                    @param enumValue {Number} An enumeration value
                    @return {Number} The flag of two or more enumeration values
                    @example 
                        var flag = State.open.enum.or(State.closed); // This is State.open | State.closed
                */
                or: function (enumValue) {
                    var value = this.value | enumValue;

                    var result = new Number(value);
                    result.enum = new EnumValue({ value: value });

                    Object.freeze(result);

                    return result;
                },

                /** 
                    Performs a bitwise AND with the given enumeration value

                    @method and
                    @param enumValue {Number} An enumeration value
                    @return {Number} The flag of two or more enumeration values
                    @example var flag = State.open.enum.and(State.closed); // This is State.open & State.closed
                */
                and: function (enumValue) {
                    var value = this.value & enumValue;

                    var result = new Number(value);
                    result.enum = new EnumValue({ value: value });

                    Object.freeze(result);

                    return result;
                },

                /** 
                    Determines if some enumeration value contains other enumeration value.

                    @method hasFlag
                    @param enumValue {Number} An enumeration value
                    @return {Boolean} A boolean specifying if the given enumeration value was found in the flag.
                    @example 
                        var flag = State.open.enum.or(State.closed);
                        var hasOpen = flag.enum.hasFlag(State.open);
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
        this.Enum = new ($def("Enum", this, {
            members: {
                /** 
                    Parses a text into a given enumeration value

                    @method parseName
                    @param enumType {enum} The enumeration definition (i.e. *State*, *ConnectionTypes*, ...)
                    @param valueName {string} The value name to be parsed (i.e. If an enumeration called States would have an *open* and *closed* values, *open* or *closed* would be a value names)
                    @static
                    @example
                        $namespace.using("joopl", function() {
                            this.declareEnum("State", {
                                open: 1,
                                closed: 2
                            });

                            var open = this.Enum.parseName(State, "open")
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
                        $namespace.using("joopl", function() {
                            this.declareEnum("State", {
                                open: 1,
                                closed: 2
                            });

                            this.Enum.parseNames(State, "open, closed")
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

                    return new EnumValue({ value: value });
                }
            }
        }));

        $enumdef = function (name, namespace, enumDef) {
            if (typeof enumDef != "object") {
                throw new scope.ArgumentException({
                    argName: "enumDef",
                    reason: "No definition for the enumeration given"
                });
            }

            var enumerationType = function () {
            };

            enumerationType.prototype = new scope.Object();

            var enumNames = [];
            var enumValue;

            for (var propertyName in enumDef) {
                if (typeof enumDef[propertyName] != "number") {
                    throw new scope.ArgumentException({
                        argName: "enumDef",
                        reason: "An enumeration definition must contain numeric properties only"
                    });
                }

                enumValue = new Number(enumDef[propertyName]);
                enumValue.enum = new EnumValue({ value: enumValue });

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
        };

        Object.freeze($enumdef);

        this.declareClass("Event", {
            ctor: function (args) {
                this._.handlers = [];
                this._.source = args.source;
            },
            members: {
                get handlers() { return this._.handlers; },
                get source() { return this._.source; },

                addEventListener: function (handler) {
                    var index = this.handlers.indexOf(handler);

                    if (index == -1) {
                        this.handlers.push(handler);
                    }
                },

                removeEventListener: function (handler) {
                    var index = this.handlers.indexOf(handler);

                    if (index >= 0) {
                        this.handlers.splice(index, 1);
                    }
                },

                raise: function (args) {
                    if (this.handlers.length > 0) {
                        for (var delegateIndex in this.handlers) {
                            this.handlers[delegateIndex].bind(args ? (args.$this ? args.$this : this.source) : this.source)(args ? (args.args ? args.args : null) : null);
                        }
                    }
                }
            }
        });

        this.declareClass("EventManager", {
            ctor: function (args) {
                this._.source = args.source;
            },
            members: {
                get source() {
                    return this._.source;
                },

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
        this.declareClass("Environment", {
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
            this.Environment,
            "current", {
                value: new this.Environment(),
                writable: false,
                configurable: false,
                enumerable: true
            }
        );

        this.declareClass("Exception", {

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
                var stackTrace = null;

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

        this.declareClass("ArgumentException", {
            inherits: this.Exception,

            /**
                Represents an exception that occurs when some method argument is missing or invalid

                <a href="Exception%20handling%20best%20practices.html" target="_self">Please read more about exception handling by following this link to "Exception handling best practices"</a>

                @class ArgumentException
                @extends joopl.Exception
                @constructor
                @param {string} argName The affected argument name
                @param {string} reason (optional) A reason text explaining what was wrong with the affected argument
                @example
                    throw new Error(new $global.joopl.ArgumentException({ argName: "someArgument"}));
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

        this.declareClass("NotImplementedException", {
            inherits: this.Exception,

            /**
                Represents an exception that occurs when a class member is not implemented.

                <a href="Exception%20handling%20best%20practices.html" target="_self">Please read more about exception handling by following this link to "Exception handling best practices"</a>

                @class NotImplementedException
                @extends joopl.Exception
                @constructor
                @param {string} memberName The affected member name which does not implement something
                @example
                    throw new Error(new $global.joopl.NotImplementedException({ memberName: "someMethod"}));
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