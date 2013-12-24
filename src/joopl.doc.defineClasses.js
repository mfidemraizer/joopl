 /**
    ## <a id="index"></a> Index

    * 1.0\. [Defining a class](#class-define)
        * 1.1\. [Fields](#class-fields)
        * 1.2\. [ctors](#class-ctors)
        * 1.3\. [Properties](#class-properties)
        * 1.4\. [Methods/Functions](#class-methods)
        * 1.5\. [Events](#class-events)
        * 1.6\. [Type property on classes and instances: type metadata](#type-metadata)
    * 2.0\. [Creating instances of classes - the `new` operator](#class-instances)
    * 3.0\. [Object-oriented programming on JavaScript with jOOPL](#class-oop)
        * 3.1\. [Class inheritance](#class-inheritance)
        * 3.2\. [Inheritance with polymorphism](#class-polymorphism)
            * 3.2.1\. [The `this.base` keyword](#class-base)
            * 3.2.2\. [The derived class ctor calls the parent's class ctor](#class-basector)
            * 3.2.3\. [A base class member calls the most specialized implementation](#class-basecallsderived)
        * 3.3\. [The isTypeOf operator](#class-istypeof)

    {{#crossLink "Attribute"}}**See also class attributes for declarative and metadata class programming**{{/crossLink}}

    <h3 id="class-define">1. Defining a class</h3> 
    ([Back to index](#index))

    Since jOOPL 2.4, classes are always declared in a given namespace. Each namespace has a `declareClass(...)` function that will declare a class based
    on given arguments as an object map. Basic parameters are:

    - **ctor** *(optional)*. The ctor of the class is a method called first when an instance of some class is created. If no constructor is provided, jOOPL automatically creates a default parameterless constructor.
    - **members** *(optional)*. An object containing the methods and properties for the whole class.

    A basic class may look like the next code listing:

        $namespace.using("test", function(test) {
            test.declareClass("A", {
                // ctor 
                ctor: function() {
                    this._.name = null;
                },
                members: {
                    get name() {
                        return this._.name;
                    }

                    set name(value) {
                        this._.name = value;
                    }

                    sayYourName: function() {
                        alert("Hey, " + this.name)
                    }
                }
            });
        });

    
    <h4 id="class-fields">1.1 Class fields</h4> 
    ([Back to index](#index))

    A class field is a variable declared in the class that can be accessed from any member (constructors, properties and methods).

    Any class constructor, property or method has a reserved variable called `_` accessible through `this._` on which class fields can be declared and
    manipulated. For example, `this._.myName = "Matias";` will declare a class field called `myName` with a default value `Matías`.

        $namespace.using("test", function(test) {
            test.declareClass("A", {
                ctor: function() {
                    // This is a class field:
                    this._.value = "A string for the class field";
                }
            });
        });

    <h4 id="class-constructors">1.2 Constructors</h4>
    ([Back to index](#index))

    In classes, the constructor is a method/function called once an instance of some class is created. That is, this is a good moment for initializing 
    the whole class.

    For example, class constructors are the place to define class fields:

        $namespace.using("test", function(test) {
            test.declareClass("A", {
                // constructor 
                ctor: function() {
                    this._.myName = "Matias";
                }
            });
        });

    In instance, the class constructor has access to the already declared methods and properties:

        $namespace.using("test", function(test) {
            test.declareClass("A", {
                // constructor 
                ctor: function() {
                    this._.myName = "Matias";

                    // The "someMethod()" method can be called from the constructor!
                    this.initialize();
                }

                members: {
                    initialize: function() {
                        alert("hello world called from the constructor!")
                    }
                }
            });
        });

    ##### See also

    - [Call parent class constructor](#class-basector)

    <h4 id="class-properties">1.3 Properties</h4>
    ([Back to index](#index))

    Any class can declare properties. Apparently, a property looks like a variable by its usage, but it differs from variables on
    how they are declared.

    Properties are the best way to encapsulate the access to private resources held by the class like class fields or calculated values. 

    A property is composed by two possible parts (it can have both or only one of them)
    
    - **Getter**. It is a block like a function defining how a value is obtained.
    - **Setter**. It is a block like a function defining how to set a value.

    For example, without properties, an object would look like the next code listing:

        var myObject = {
            name: "Matias",
            age: 28
        };

    And once the `myObject` variable holds the new object, both `name` and `age` can be altered:

        myObject.name = "John";
        myObject.age = 33;

    But what happens if there is a need to constraint the `name` and `age` variables? A primitive solution would be:

        var possibleName = "John";
        var possibleAge = 33;

        if(possibleName != "John") {
            myObject.name = possibleName;
        } else {
            throw Error("Sorry, John, I do not like you!")
        }

        if(possibleAge > 30) {
            myObject.age = possibleAge;
        } else {
            throw Error("You are too young! Please try again in some years...");
        }

    This is how the above code would be implemented using properties:

        var myObject = {
            // Some regular variables
            _name: null,
            _age: null,

            // A getter for the _name variable:
            get name() { 
                return this._name; 
            },
            // A setter for the _name variable. The setter defines the validation logic!
            set name(value) { 
                if(value != "John") {
                    this._name = value; 
                } else {
                    throw Error("Sorry, John, I do not like you!")
                }
            },

            // A getter for the _name variable:
            get age() { 
                return this._age;
            },
            // A setter for the _name variable. The setter also defines the validation logic here!
            set age(value) {
                if(value > 30) {
                    myObject.age = value;
                } else {
                    throw Error("You are too young! Please try again in some years...");
                }
            }
        }

    Now, if some code tries to assign "John" or an age lesser than 30, the properties setters will throw the error, but this time
    the validation logic is encapsulated:

        myObject.name = "John" // ERROR
        myObject.name = "Matias" // OK

        myObject.age = 28 // ERROR
        myObject.age = 33 // OK

    jOOPL fully supports ECMA-Script 5 properties like the described before:

        $namespace.using("test", function(test) {
            test.declareClass("A", {
                ctor: function() {
                    // Define a class field for later provide access to it through a property getter and setter
                    this._.name = null;
                },
                members: {
                    // Gets the value held by the this._.name class field:
                    get name() {
                        return this._.name;
                    },

                    // Sets a new value to the this._.name class field:
                    set name(value) {
                        this._.name = value;
                    }
                }
            });
        });

        $namespace.using("test", function(test) {
            var instance = new test.A();

            // Set the 'name' property value
            a.name = "Matias";

            // Gets the name property value
            alert(a.name); // Alerts "Matias"
        });
    
    <h4 id="class-methods">1.4  Methods/Functions</h4>
    ([Back to index](#index))

    Methods (*also known as functions*) are the behavior of classes. They are the actions that can be performed by the class. Examples
    of methods can be:

    - do
    - create
    - notify
    - write
    - build
    - ...

    Class methods are defined as regular JavaScript functions and as part of the `members` in a class definition:

        $namespace.using("test", function(test) {
            test.declareClass("A", {
                members: {
                    do: function() {
                        return "do what?";
                    }
                }
            });
        });

    ##### See also

    - [Polymorphism](#class-polymorphism)

    <h4 id="class-events">1.5 Events</h4> 
    ([Back to index](#index))

    ##### Events glossary

    - **Event**. It is an observable action. Classes defining them or others can subscribe to events and react to them.
    - **Event handler**. It is a function assigned to the event which is called when the event happens.

    Events are an out-of-the-box feature that enables any class to create observable objects.

    An observable object is a one emitting notifications when something happens within it. For example, an event may be:

    + When some button is clicked.
    + An asynchronous operation completed.
    + An item was added to a list.

    Events are class members like properties and methods, but they are special in terms of how they are declared. For example, 
    if a class needs to implement an event to notify to others that it said "hello world", an event "saying" would be declared this way:

        $namespace.using("test", function(test) {
           test.declareClass("A", {
                members: {
                    events: ["saying"]
                }
            });
        });

    The above code declares an event "saying". Events are declared as an array of identifiers (names) as value of the `events` special member. Once
    an event is declared, the next step is triggering/raising/firing it somewhere in the whole class:
        
        $namespace.using("test", function(test) {
            test.declareClass("A", {
                members: {
                    events: ["saying"],

                    helloWorld: function() {
                        // This is triggering the event. jOOPL has created an special function called
                        // 'saying' which can receive an object of arguments so the object suscribed to
                        // the class event will receive the whole argument 'text'
                        this.saying.raise({ args: { text: "yes, the object is about to say 'hello world'!"} });

                        // The event 'saying' notified that the class A was about saying something
                        // and, finally, now it says "hello world!" using an alert.
                        alert("hello world!")
                    }
                }
            });
        });

    Finally, the last step is listening for the `saying` event. For that matter, an instance of A is created and the code will set an event handler in order
    to do an action when the `A` class instance says something:

        $namespace.using("test", function(test) {
            var instance = new test.A();

            instance.saying.addEventListener(function(args) {
                // The `args` input argument will hold the text set when the event was triggered
                alert("The instance said: " + args.text);
            });
        });

    Once an event handler added to an event, it is possible to *unsuscribe* from it calling `removeEventListener(...)`.

    For example:

        $namespace.using("test", function(test) {
            var instance = new test.A();

            var handler = function(args) {
            }

            // This adds an event handler to the event
            instance.saying.addEventListener(handler);

            // Setting the same handler again removes it from the event.
            instance.saying.removeEventListener(handler);
        });


    <h4 id="type-metadata">1.6 Type property on classes and instances: type metadata</h4> 
    ([Back to index](#index))

    Since 2.4 version of jOOPL, any class and instance has a built-in property called `type`. This property gives access to both class or instance
    type metadata like its namespace path, name, name with namespace path, ...

    For example, declaring a class like follows:

        $namespace.using("joopl.sample", function(test) {
            test.declareClass("A");
            
            // Getting class name from type property of A class
            var className = test.A.type.name;

            // Gettings class name from type property of A instance
            var instance = new test.A();
            className = instance.type.name;
        });

    Further details can be found on <a href="joopl.Type.html" target="_self">`Type` class documentation</a>.

    <h3 id="class-instances">2. Creating instances of classes</h3>
    ([Back to index](#index))

    Once a class is defined using the namespace's `declareClass(...)` function, an instance of the class must be created in order to use it. 

    In jOOPL and JavaScript, a class is a standard constructor function and instances can be created using also the standard
    `new` operator:

        $namespace.using("test", function(test) {
            test.declareClass("A", {
                members: {
                    someMethod: function() {
                        alert("hello world");
                    }
                }
            });
        });

        $namespace.using("test", function(test) {
            // Creating an instance of A:
            var instance = new test.A();

            // Now the instance variable - a reference to an object of type A - 
            // has its instance methods available to be called:
            instance.someMethod();
        });

    <h3 id="class-oop">3. Object-oriented programming on JavaScript using jOOPL</h3> 
    ([Back to index](#index))
    
    Defining classes and creating instances of it using the namespace's `declareClass(...)` function and `new` operator respectively are just the most basic features of jOOPL.

    jOOPL introduces an state-of-the-art and powerful class inheritance and polymoprhism enabling JavaScript language to 
    work with true object-oriented programming:

    - **Inheritance**. Classes can inherit from others in order to share their behaviors, properties and events.
    - **Polymorphism**. Class methods can be overriden by derived classes (ones inheriting a base class), keep the inherited members signature but alter their implementation.
    - **Encapsulation**. Classes expose their behavior thanks to their members, and the implementation details are hidden to the code consuming a class.
    
    <h4 id="class-inheritance">3.1 Class inheritance</h4>
    ([Back to index](#index))

    Inheritance is one of the most important concepts in object-oriented programming. That is, some class can derive from other.

    The namespace's `declareClass(...)` function supports an additional and optional parameter called `inherits` which specifies that the declaring class inherits another class.

    A class `A` may implement some methods and properties and a class `B` can inherit `A` and it will not need to implement them as all members from `A`
    are already available as members of `B`:

        $namespace.using("test", function(test) {
            // Defining a class A having a method "do()"
            test.declareClass("A", {
                members: {
                    do: function() {
                        // Do some stuff
                    }
                }
            });

            // Class B inherits A
            test.declareClass("B", {
                inherits: test.A
            });
        });

        $namespace.using("test", function(test) {
            var instance = new test.B();

            // The B instance can invoke the do() function 
            // inherited from A
            instance.do();
        });

    jOOPL supports single inheritance. It means that a class can derive another class but not from multiple classes (*no multi-inheritance*), but any
    class can inherit other. There is no limitation of how many levels of inheritance can implement an hierarchy. 

    An important detail is that, if a class does not directly inherit a class (there is no `inherit` input parameter for namespace's `declareClass(...)` function), it will 
    implicitly inherit the top-most class `Object` implemented as a plain JavaScript prototype, which provides basic methods and properties that any class 
    will contain. At the end of the day, **any class inherits Object**.

    <h4 id="class-polymorphism">3.2 Inheritance with polymorphism </h4>
    ([Back to index](#index))

    Polymorphism is a key feature and it is tied to inheritance: it is the ability of an inherited member - methods and properties - to override the base
    implementation found in the parent class. 

    For example, there is a class called `Salutation` which implements a method/function `sayHello` and it returns **"hello world"**, and there is a derived class
    `SpecializedSalutation` that inherits `Salutation` class, the whole derived class can override the `sayHello` method and make it say **"Hello, world!"**:

        $namespace.using("test", function(test) {
            test.declareClass("Salutator", {
                members: {
                    sayHello: function() {
                        return "hello world"
                    }
                }
            });

            test.declareClass("SpecializedSalutator", {
                inherits: test.Salutator,
                members: {
                    // Overrides the parent class sayHello implementation
                    sayHello: function() {
                        return "Hello, world!";
                    }
                }
            });
        });
        
        $namespace.using("test", function(test) {
            var instance = new test.SpecializedSalutator();
            var text = instance.sayHello();

            // This will alert "Hello, world!" since the class has overriden the default implementation
            // which was returning "hello world"
            alert(text); 
        });

    <h4 id="class-base">3.2.1 The `this.base` keyword</h4>
    ([Back to index](#index))

    Any method/function or property is overridable. But what makes polymorphism even more powerful is the chance to call the base implementation from the
    overriden member.

    The overriden members may or may not call the parent class member implementation using the `this.base` keyword. 

    For example, there is a class `Calculator` having a method `add`, and a specialized calculator called `UnsignedCalculator` which makes any addition an absolute number result,
    the code would look like this:

        $namespace.using("test", function(test) {
            test.declareClass("Calculator", {
                members: {
                    add: function(num1, num2) {
                        // It simply adds num2 to num1
                        return num1 + num2;
                    }
                }
            });

            test.declareClass("UnsignedCalculator", {
                members: {
                    add: function(num1, num2) {
                        // This is calling the "add"'s parent class implementation
                        var result = this.base.add(num1, num2);

                        // Now the result from calling the base implementation of this method
                        // is converted to an unsigned number
                        return Math.abs(result);
                    }
                }
            });
        });

    <h4 id="class-basector">3.2.2 The derived class constructor calls the parent's class constructor</h4> 
    ([Back to index](#index))

    Even class constructors can call their parent class constructor. This is extremely useful if the parent class or another class in the same
    hierarchy requires some construction-time initialization:

        $namespace.using("test", function(test) {
            // The top-most parent class Person defines basic data
            // and provides getter and setter properties in order to
            // get or set the whole contained data.
            //
            // The constructor receives as arguments the default data.
            this.declareClass("Person", {
                ctor: function(args) {
                    this._.name = args.name;
                    this._.secondName = args.secondName;
                    this._.age = args.age;
                },
                members: {
                    get name() {
                        return this._.name;
                    },
                    set name(value) {
                        this._.name = value;
                    },

                    get secondName() {
                        return this._.secondName;
                    },
                    set secondName(value) {
                        this._.secondName = value;
                    }

                    get age(){
                        return this._.age;
                    },
                    set age(value) {
                        this._.age = value;
                    }
                }
            });

            // The Employee class inherits Person and adds
            // more data. The Employee constructor both defines
            // new class fields and calls the Person's ctor
            // by invoking this.base.ctor(args), thus the base constructor
            // will receive the expected arguments.
            test.declareClass("Employee", {
               inherits: test.Person,
               ctor: function(args) {
                    this.base.ctor(args);

                    this._.companyName = args.companyName;
                    this._.salary = args.salary;
               } 
            });
        });

        // Now this is creating an instance of Employee. As the Employee ctor
        // calls its base Person class' ctor, it will be correctly initialized 
        // with the data passed as ctor arguments:

        $namespace.using("test", function(test) {
            var instance = new test.Employee({
                name: "Matias",
                secondName: "Fidemraizer",
                age: 28,
                companyName: "ACME",
                salary: 99999
            });
        });

        alert(instance.name); // Popups "Matias"
        alert(instance.secondName); // Popups "Fidemraizer"
        alert(instance.age); // Popups "28"
        alert(instance.companyName); // Popups "ACME"
        alert(instance.salary); // Popups "99999"

    <h4 id="class-basecallsderived">3.2.3 A base class member calls the most specialized implementation</h4> 
    ([Back to index](#index))

    Sometimes it is needed that some method or property in the base class may able to call some most specialized member implementation.

    For example, a parent class `Polygon` overrides the default JavaScript `toString()` method in order to calculate the polygon area and
    return it as a string. That is, `Polygon` implements a `calcArea` method. Now `Square` inherits `Polygon` and overrides the `calcArea`
    method and performs the whole area calculation. The `Square` class will now need to override the base `toString()` `Polygon`'s method in order to
    show the area.

    In jOOPL, the most derived or specialized member is accessed through the special class field `this._.$derived`. 

    Here is a sample of the above explanation:

        $namespace.using("test", function(test) {
            test.declareClass("Polygon", {
                members: {
                    calcArea: function() {
                        // A generic polygon will not know how to calculate the area. The
                        // derived classes will do it!
                    },

                    toString: function() {
                        // See how calcArea() from the most derived class is accessed:
                        return "The area of this polygon is: '" + this.derived.calcArea(); + "'";
                    }
                }
            });

            test.declareClass("Square", {
                inherits: test.Polygon,
                ctor: function(args) {
                    this._.x = args.x;
                    this._.y = args.y;
                },
                members: {
                    get x() {
                        return this._.x;
                    },
                    get y() {
                        return this._.y;
                    },

                    calcArea: function() {
                        return this.x * this.y;
                    }
                }
            });
        });

        $namespace.using("test", function(test) {
            var instance = new test.Square(20, 30);
            
            // This will alert "The area of this polygon is: '600'""
            alert(instance.toString());
        });

    <h3 id="class-istypeof">3.3 The isTypeOf operator</h3> 
    The `isTypeOf` operator is a function/method present in any instance of a class defined by jOOPL. 

    It evaluates if an instance is of type of some given class. An interesting point is `isTypeOf` evaluates
    either if the instance is of type of the most derived class or it can check if an instance is of type of
    a given base class (polymorphism).

    For example, if there is a class `A`, `B` and `C`, and `C` inherits `B` and `B` inherits `A`:

        var instanceOfC = new test.C();

        var isType = instanceOfC.isTypeOf(test.A); // Evals true!
        isType = instanceOfC.isTypeOf(test.B); // Evals true!
        isType = instanceOfC.isTypeOf(test.C); // Evals true!

        var instanceOfA = new test.A();

        isType = instanceOfA.isTypeOf(test.C); // Evals false - A is not C!
        isType = instanceOfA.isTypeOf(test.B); // Evals false - A is not B!
        isType = instanceOfA.isTypeOf(test.A); // Evals true!
   
    @class Classes
*/