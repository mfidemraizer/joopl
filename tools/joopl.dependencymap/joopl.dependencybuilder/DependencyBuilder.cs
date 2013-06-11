using Newtonsoft.Json;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System;
using System.Text.RegularExpressions;

namespace joopl.dependencybuilder
{
    public sealed class DependencyBuilder
    {
        public string BuildDependencyUsageMapAsJson(List<Namespace> dependencyMap, string baseDirectory)
        {
            List<KeyValuePair<string, string>> tokens;
            int tokenIndex = 0;
            Namespace ns = null;
            string relativeFilePath = null;

            IEnumerable<string> files = new DirectoryInfo(baseDirectory).GetFiles("*.js", SearchOption.AllDirectories)
                                .Select(info => info.FullName);

            List<Namespace> namespaces = new List<Namespace>();
            List<string> scopeNamespaces = new List<string>();

            FileManifest fileManifest;
            List<FileManifest> usageMap = new List<FileManifest>();

            JsParser jsParser = new JsParser();

            foreach (string file in files)
            {
                tokens = jsParser.ParseTokens(file);
                relativeFilePath = file.Replace(baseDirectory, string.Empty).Replace('\\', '/').TrimStart('/');
                fileManifest = new FileManifest();

                while (tokenIndex < tokens.Count)
                {
                    if (tokens[tokenIndex].Value == "$namespace" && new[] { "register", "using" }.Any(token => token == tokens[tokenIndex + 2].Value))
                    {
                        if (tokens[tokenIndex + 2].Value == "using" && tokens[tokenIndex + 4].Value == "[")
                        {
                            IEnumerable<string> namespaceDeclaration = tokens.Skip(tokenIndex + 5).Select(token => token.Value);
                            int indexOfEnd = Array.IndexOf(namespaceDeclaration.ToArray(), "]");
                            List<string> remainingTokens = namespaceDeclaration.Take(indexOfEnd).ToList();

                            for (int namespaceIndex = 0; namespaceIndex < remainingTokens.Count(); namespaceIndex++)
                            {
                                if (remainingTokens[namespaceIndex] != ",")
                                {
                                    scopeNamespaces.Add(remainingTokens[namespaceIndex]);
                                }
                            }
                        }
                        else
                        {
                            scopeNamespaces.Add(tokens[tokenIndex + 4].Value);
                        }

                        if (scopeNamespaces.Count > 0)
                        {
                            foreach (string someNs in scopeNamespaces)
                            {
                                if (!namespaces.Any(some => some.Name == someNs))
                                {
                                    namespaces.Add(new Namespace { Name = someNs, Files = new List<string> { relativeFilePath } });
                                }
                            }
                        }
                    }
                    else if (scopeNamespaces.Count > 0)
                    {
                        if (tokens[tokenIndex].Value == "$extends")
                        {
                            string memberName = null;

                            if (tokens[tokenIndex + 2].Value == "$global")
                            {
                                memberName = string.Join
                                            (
                                                string.Empty,
                                                tokens.Skip(tokenIndex + 4)
                                                    .TakeWhile(someToken => someToken.Value != "," && someToken.Value != ";")
                                                    .Select(someToken => someToken.Value)
                                                    .ToArray()
                                            );
                            }

                            Member scopedMember = dependencyMap
                                                        .SelectMany(mappedNs => mappedNs.Members)
                                                        .FirstOrDefault(member => member.Name == memberName && scopeNamespaces.Any(scopedNs => scopedNs == member.Namespace));

                            fileManifest.DependentFiles.Add(scopedMember.File);
                        }
                    }

                    tokenIndex++;
                }

                usageMap.Add(fileManifest);

                scopeNamespaces.Clear();
                tokenIndex = 0;
            }

            return JsonConvert.SerializeObject(namespaces, Formatting.Indented, new JsonSerializerSettings { ReferenceLoopHandling = ReferenceLoopHandling.Ignore });
        }

        public List<Namespace> BuildDependencyMap(string baseDirectory)
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

                        if (!ns.Files.Any(someFile => someFile == relativeFilePath))
                        {
                            ns.Files.Add(relativeFilePath);
                        }

                        tokenIndex += 4;
                    }
                    else if (new[] { "$def", "$enumdef" }.Any(token => token == tokens[tokenIndex].Value))
                    {
                        if (ns != null)
                        {
                            ns.Members.Add(new Member { Parent = ns, File = relativeFilePath, Name = tokens[tokenIndex - 2].Value });
                        }

                        tokenIndex++;
                    }
                    else
                    {
                        tokenIndex++;
                    }
                }

                tokenIndex = 0;
            }

            return namespaces;
        }
    }
}