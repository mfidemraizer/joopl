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
using Jurassic;
using Jurassic.Library;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;

namespace joopl.DependencyBuilder
{
    public class JsParser
    {
        static JsParser()
        {
            _tokenCache = new Dictionary<string, IList<IDictionary<string, string>>>();

            _engine = new Lazy<ScriptEngine>
            (
                () =>
                {
                    ScriptEngine engine = new ScriptEngine();

                    using (Stream esprimaStream = Assembly.GetExecutingAssembly().GetManifestResourceStream("joopl.DependencyBuilder.Libs.esprima.js"))
                    using (StreamReader esprimaReader = new StreamReader(esprimaStream))
                    {
                        engine.Evaluate(esprimaReader.ReadToEnd());
                    }

                    engine.Evaluate("function parseCode(codeText) { return JSON.stringify(esprima.parse(codeText, { tokens: true }).tokens); }");

                    return engine;
                }
            );
        }

        private static readonly Lazy<ScriptEngine> _engine;
        private static readonly Dictionary<string, IList<IDictionary<string, string>>> _tokenCache;

        private ScriptEngine Engine
        {
            get { return _engine.Value; }
        }

        public Dictionary<string, IList<IDictionary<string, string>>> TokenCache
        {
            get
            {
                return _tokenCache;
            }
        }

        public IList<IDictionary<string, string>> ParseTokens(string codeFilePath)
        {
            if (!TokenCache.ContainsKey(codeFilePath))
            {
                TokenCache.Add(codeFilePath, JsonConvert.DeserializeObject<IList<IDictionary<string, string>>>(((string)Engine.CallGlobalFunction("parseCode", File.ReadAllText(codeFilePath))).Replace("\"\"", "\"")));
            }

            return TokenCache[codeFilePath];
        }
    }
}
