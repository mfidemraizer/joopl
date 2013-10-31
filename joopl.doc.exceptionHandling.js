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

    ## Debuggers like Firebug don't like custom objects as exceptions

    A big limitation when throwing any kind of object instead of throwing the built-in `Error` one (i.e. `throw Error("exception message")) is that Web browser
    debuggers will be able to output the exception in their debugging console but it will not mark where it happened at all and the console log will not be *clickable*
    turning exception debugging into a big issue.

    Firebug will only output an exception to the console tab as *clickable* in order to go to the code line where it was thrown if the thrown exception is a
    build-in `Error` object.

    There is a solution to fix this situation: both throw an `Error` and provide the custom exception as argument of `Error` constructor:

        throw new Error(new $global.joopl.ArgumentException({ argName: "myArgument" }));

    All built-in jOOPL exception types override the polymorphic `toString()` method from any JavaScript object and since `Error` constructor expects a string,
    JavaScript will implicitly call `toString()` to any object given as constructor argument. The result is Web browser debuggers like Firefox will be able
    to determine where the exception was thrown and also it will output the concrete exception message!

    @class Exception throwing best practices
*/