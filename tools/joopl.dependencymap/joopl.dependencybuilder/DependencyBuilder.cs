using Newtonsoft.Json;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace joopl.dependencybuilder
{
    public sealed class DependencyBuilder
    {
        public string BuildDependencyMapAsJson(string baseDirectory)
        {
            List<KeyValuePair<string, string>> tokens;
            int tokenIndex = 0;
            string currentNs = null;
            Namespace ns = null;
            string relativeFilePath = null;

            IEnumerable<string> files = new DirectoryInfo(baseDirectory).GetFiles("*.js", SearchOption.AllDirectories)
                                .Select(info => info.FullName);

            List<Namespace> namespaces = new List<Namespace>();

            JsParser jsParser = new JsParser();

            foreach (string file in files)
            {
                tokens = jsParser.ParseTokens(file);
                relativeFilePath = file.Replace(baseDirectory, string.Empty).Replace('\\', '/').TrimStart('/');

                while (tokenIndex < tokens.Count)
                {
                    if (tokens[tokenIndex].Value == "$namespace" && tokens[tokenIndex + 2].Value == "register")
                    {
                        currentNs = tokens[tokenIndex + 4].Value;

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
                    else if (tokens[tokenIndex].Value == "$def" || tokens[tokenIndex].Value == "$enumdef")
                    {

                        ns.Members.Add(new Member { Parent = ns, File = relativeFilePath, Name = tokens[tokenIndex - 2].Value });
                        tokenIndex++;
                    }
                    else
                    {
                        tokenIndex++;
                    }
                }

                tokenIndex = 0;
            }

            return JsonConvert.SerializeObject(namespaces, Formatting.Indented, new JsonSerializerSettings { ReferenceLoopHandling = ReferenceLoopHandling.Ignore });
        }
    }
}