/**
    ## In JavaScript, any object is *throwable* as exception
    
    JavaScript, as any other modern language, supports exceptions and exception handling. What makes JavaScript different to other languages and runtimes is it
    is able to throw any object as an exception:

        throw "hello world";
        throw { text: "hello world" };
        throw Error("hello world");
        throw 1;
        throw false;

    Obviously no one is looking to throw a text `as is` but throwing useful objects with data in order to allow proper exception handling.

    ## jOOPL's approach to exception handling

    In jOOPL there is a design decision and it is that exceptions will not be never inheriting `Error` prototype nor internal exceptions throw `Error` instances.

    For now `Error` object has different behavior depending on the browser vendor and version, and there are known issues when playing with custom error types.

    jOOPL introduces a build-in `Exception` class available in the out-of-the-box `joopl` namespace that combines the best of exception handling when using `Error` object
    instances and true exception handling like one found in other software development platforms, languages and technologies. 

    `Exception` class can be inherited with jOOPL inheritance approach.

    When either `Exception` or derived classes of itself are thrown using the `throw new` standard JavaScript syntax, jOOPL will extract useful debugging information and it will add this 
    to the `Exception` instance (line number, stack trace, ...). 

    In addition, `Exception` and its derived classes have a default `toString` override which outputs not only the exception message but also the stack trace! See next picture for a sample:

    <img src="../assets/img/exception_output_sample.png" alt="Exception output sample" />

    ## Handling exceptions by type

    Exceptions may be caught using `try/catch` statements and they can be filtered by type by using the standard `instanceof` operator:

        try {
            throw new $global.joopl.ArgumentException({ argName: "id", reason: "'id' is mandatory" });
        } catch(e) {
            if(e instanceof $global.joopl.ArgumentException) {
                // Do stuff here if thrown exception is an ArgumentException!
            } else {
                // Do other stuff if thrown exception is not an ArgumentException!
            }
        }

    
    <h2 id="global-exception-handler">Global exception handler</h2>

    Since 2.4.x version jOOPL includes a global exception event which can be handled by multiple event handlers:

        $namespace.using("joopl", function(joopl) {
            joopl.Environment.current.exceptionThrown.addEventListener(function(e) {
                // "e" contains a property "thrownException":
                if(e.thrownException instanceof joopl.ArgumentException) {
                    // Do stuff if thrown exception is an ArgumentException
                }
            });

            // This throw will be listened by the event handler added in the Environment class singleton "exceptionThrown" event!
            throw new joopl.ArgumentException({ argName: "id" });
        });

    *Note: `Environment.exceptionThrown` event occurs when any exception is instantiated, even if it's not already thrown.*

    @class Exception handling best practices
*/