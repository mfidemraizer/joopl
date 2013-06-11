using Jurassic;
using Jurassic.Library;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;

namespace joopl.dependencybuilder
{
    public class JsParser
    {
        public JsParser()
        {
            _engine = new Lazy<ScriptEngine>
            (
                () =>
                {
                    ScriptEngine engine = new ScriptEngine();

                    using (Stream esprimaStream = Assembly.GetExecutingAssembly().GetManifestResourceStream("joopl.dependencybuilder.libs.esprima.js"))
                    using (StreamReader esprimaReader = new StreamReader(esprimaStream))
                    {
                        engine.Evaluate(esprimaReader.ReadToEnd());
                    }

                    engine.Evaluate("function parseCode(codeText) { return esprima.parse(codeText, { tokens: true }); }");

                    return engine;
                }
            );
        }

        private readonly Lazy<ScriptEngine> _engine;

        private ScriptEngine Engine
        {
            get { return _engine.Value; }
        }

        public dynamic ParseSyntax(string codeFilePath)
        {
            PropertyNameAndValue underlyingSyntax = ((ObjectInstance)Engine.CallGlobalFunction("parseCode", File.ReadAllText(codeFilePath)))
                                                         .Properties.Single(prop => prop.Name == "body");

            return underlyingSyntax.Value;
        }

        public List<KeyValuePair<string, string>> ParseTokens(string codeFilePath)
        {
            PropertyNameAndValue underlyingTokens = ((ObjectInstance)Engine.CallGlobalFunction("parseCode", File.ReadAllText(codeFilePath)))
                                                         .Properties.Single(prop => prop.Name == "tokens");

            return ((ArrayInstance)underlyingTokens.Value).Properties
                                        .Where(prop => prop.Value.GetType() != typeof(int))
                                        .Select
                                        (
                                            prop => new KeyValuePair<string, string>
                                            (
                                                (string)((ObjectInstance)prop.Value).Properties.Single(some => some.Name == "type").Value,
                                                ((ObjectInstance)prop.Value).Properties.Single(some => some.Name == "value").Value.ToString().Trim('"')
                                            )
                                        )
                                        .ToList();
        }
    }
}
