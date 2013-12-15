/**
<h2 id="index">Index</h2>

If you are looking for code samples, <a href="../test/enum.test.html" target="_self">please see enumeration tests' and their source code.</a>

* 1.0\. [What is an enumeration?](#enum-definition)
* 2.0\. [What is the goal of enumerations](#enum-goal)
* 3.0\. [Enumerations how-to](#enum-howto)
    * 3.1\. [When and how to use enumerations](#enum-usage)
    * 3.2\. [Enumeration values](#enum-values)
        * 3.2.1\. [Enumeration flags](#enum-flags)

<h3 id="enum-definition">1.0 What is an enumeration?</h3>
<a href="#index">Back to index</a>

An enumeration is an *special class* of constants. 

<h3 id="enum-goal">2.0 What is the goal of enumerations?</h3>
<a href="#index">Back to index</a>

In regular JavaScript, when some code needs to identify states uses integers (`Number`):
    
    // "1" would mean that something is open (for example, an HTTP connection)
    if(someVar == 1) {
        // Do stuff
    }

jOOPL introduces true enumerations and the above code could be turned into:

    $namespace.using("joopl.enumerations", function(enumerations) {
        enumerations.declareEnum("HttpState", {
            closed: 0,
            open: 1
        });

        var someVar = enumerations.HttpState.open;

        if(someVar == enumerations.HttpState.open) {
            // Do stuff
        }
    });

The above code listing demonstrates how enumerations can turn states and kinds into a more verbose code which may
increase code readibility, since developers will not need to check documentation in order to know what `0` or `1` states
mean.

<h3 id="enum-howto">3. Enumerations how-to</h3>
<a href="#index">Back to index</a>

Enumerations are created using the `$enumdef` operator. The `$enumdef` operator is a ctor accepting an object
defining one or more constants:

    $namespace.using("mynamespace", function(mynamespace) {
        mynamespace.declareEnum("State", {
            open: 0,
            closed: 1,
            disconnected: 2,
            working: 3
        });
    });

The given constants **must be always numeric** and the enumeration must contain only numeric properties.

<h4 id="enum-usage">3.1 When and how to use enumerations</h4>
<a href="#index">Back to index</a>

Enumerations are required when some code can define a closed set of values that may not change overtime.

For example, some code may have a class with a method accepting a limited number of HTTP verbs:

    $namespace.using("mynamspace", function(mynamspace) {
        mynamspace.declareEnum("HttpVerb", {
            get: 0,
            post: 1,
            put : 2
        });

        mynamspace.declareClass("MyClass", {
            members: {
                // The @verb argument will only support verbs of the HttpVerb enumeration
                doRequest: function(verb, url, args) {
                    switch(verb) {
                        case mynamspace.HttpVerb.get: 
                            // Perform the HTTP GET request
                            break;

                        case mynamspace.HttpVerb.post:
                            // Perform the HTTP POST request
                            break;

                        default: 
                            throw Error("Only HTTP POST and GET are supported!");
                    }

                }
            }
        });
    });

<h4 id="enum-values">3.2 Enumeration values</h4>
<a href="#index">Back to index</a>

An enumeration value is an instance of standard ECMA-Script `Number` object (the primitive `Number` type wrapper). jOOPL inherits `Number` and
any enumeration value has also a reserved property `enum` ( see {{#crossLink "EnumValue"}}{{/crossLink}} to explore available methods and properties of
an enumeration value).

The `enum` property represents a set of common operations for enum values.

<h5 id="enum-flags">3.2.1 Enumeration flags</h5>
<a href="#index">Back to index</a>

Sometimes enumeration values should support more than a possible state. Using regular enumerations ends in single values:

    var state = mynamspace.State.open;

jOOPL provides support for *flags* (combination of more than an enumeration values) using bit-wise operators like `OR` and `AND` in order to create enumeration 
values containing more than an enumeration value.

For example, taking this enumeration as example:

    $namespace.using("joopl.enumerations", function(mynamspace) {
        mynamspace.declareEnum("States", {
            open: 0,
            closed: 1,
            working: 2
        });
    });

Some code may need to express that something is `open` but it is also `working`. This is achieved by using the `OR` operator:

    var openAndWorking = this.State.open.enum.or(State.working);

And, finally, if some other code needs to evaluate that the enumeration value includes `open` (see `EnumValue.`{{#crossLink "EnumValue/hasFlag:method"}}{{/crossLink}}
method for further details):

    if(openAndWorking.enum.hasFlag(this.State.open)) {
        // Do stuff if it is open already
    }

    @class Declaring enumerations with jOOPL
*/