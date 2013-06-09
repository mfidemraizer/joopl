using Jurassic;
using Jurassic.Library;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;

namespace joopl.dependencybuilder
{
    class Program
    {
        static void Main(string[] args)
        {
            ScriptEngine engine = new ScriptEngine();

            using(Stream esprimaStream = Assembly.GetExecutingAssembly().GetManifestResourceStream("joopl.dependencybuilder.libs.esprima.js"))
            using (StreamReader esprimaReader = new StreamReader(esprimaStream))
            {
                engine.Evaluate(esprimaReader.ReadToEnd());
            }

            engine.Evaluate("function parseCode(codeText) { return esprima.parse(codeText, { tokens: true }); }");

            KeyValuePair<string, string>[] tokenArr;
            PropertyNameAndValue tokens;
            int tokenIndex = 0;
            string currentNs = null;
            Namespace ns = null;
            string relativeFilePath = null;

            string baseDirectory = args[Array.IndexOf(args, "-directory") + 1];

            IEnumerable<string> files = new DirectoryInfo(baseDirectory).GetFiles("*.js", SearchOption.AllDirectories)
                                .Select(info => info.FullName);

            List<Namespace> namespaces = new List<Namespace>();

            foreach (string file in files)
            {
                tokens = ((ObjectInstance)engine.CallGlobalFunction("parseCode", File.ReadAllText(file)))
                                                        .Properties.Single(prop => prop.Name == "tokens");

                relativeFilePath = file.Replace(baseDirectory, string.Empty).Replace('\\', '/').TrimStart('/');

                tokenArr = ((ArrayInstance)tokens.Value).Properties
                                            .Where(prop => prop.Value.GetType() != typeof(int))
                                            .Select
                                            (
                                                prop => new KeyValuePair<string, string>
                                                (
                                                    (string)((ObjectInstance)prop.Value).Properties.Single(some => some.Name == "type").Value,
                                                    ((ObjectInstance)prop.Value).Properties.Single(some => some.Name == "value").Value.ToString().Trim('"')
                                                )
                                             )
                                             .ToArray();

                while (tokenIndex < tokenArr.Length)
                {
                    if (tokenArr[tokenIndex].Value == "$namespace" && tokenArr[tokenIndex + 2].Value == "register")
                    {
                        currentNs = tokenArr[tokenIndex + 4].Value;

                        if (namespaces.Count(some => some.Name == currentNs) == 0)
                        {
                            ns = new Namespace { Name = currentNs };
                            namespaces.Add(ns);
                        }
                        else
                        {
                            ns = namespaces.Single(some => some.Name == currentNs);
                        }

                        ns.Files.Add(relativeFilePath);

                        tokenIndex += 4;
                    }
                    else if (tokenArr[tokenIndex].Value == "$def" || tokenArr[tokenIndex].Value == "$enumdef")
                    {

                        ns.Members.Add(new Member { Parent = ns, File = relativeFilePath, Name = tokenArr[tokenIndex - 2].Value });
                        tokenIndex++;
                    }
                    else
                    {
                        tokenIndex++;
                    }
                }

                tokenIndex = 0;
            }

            string map = JsonConvert.SerializeObject(namespaces, Formatting.Indented, new JsonSerializerSettings { ReferenceLoopHandling = ReferenceLoopHandling.Ignore });

            File.WriteAllText(Path.Combine(baseDirectory, "DependencyMap.json"), map);
        }
    }
}
