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

using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;

namespace joopl.DependencyBuilder
{
    public sealed class DependencyBuilder
    {
        public IDictionary<string, IList<string>> BuildDependencyUsageMap(List<Namespace> dependencyMap, string baseDirectory, string[] excludeFiles = null, string[] moduleFiles = null)
        {
            IDictionary<string, IList<string>> result = new Dictionary<string, IList<string>>();
            IEnumerable<IDictionary<string, object>> thirdPartyDependencies = null;

            if (File.Exists(Path.Combine(baseDirectory, "ThirdPartyDependencies.json")))
            {
                thirdPartyDependencies = JsonConvert.DeserializeObject<List<ExpandoObject>>(File.ReadAllText(Path.Combine(baseDirectory, "ThirdPartyDependencies.json")));
            }

            IList<IDictionary<string, string>> tokens;
            int tokenIndex = 0;
            string relativeFilePath = null;

            IEnumerable<FileInfo> files = new DirectoryInfo(baseDirectory).GetFiles("*.js", SearchOption.AllDirectories);

            List<Namespace> namespaces = new List<Namespace>();
            List<string> scopeNamespaces = new List<string>();

            FileManifest fileManifest;
            List<FileManifest> usageMap = new List<FileManifest>();

            JsParser jsParser = new JsParser();
            IEnumerable<Type> allTypes = dependencyMap.SelectMany(ns => ns.Members);

            foreach (FileInfo file in files)
            {
                if (excludeFiles != null && excludeFiles.Contains(file.Name))
                {
                    continue;
                }

                tokens = jsParser.ParseTokens(file.FullName);
                relativeFilePath = file.FullName.Replace(baseDirectory, string.Empty).Replace('\\', '/').TrimStart('/');
                fileManifest = new FileManifest();

                while (tokenIndex < tokens.Count)
                {
                    if (tokens[tokenIndex]["value"] == "$namespace" && new[] { "register", "using" }.Any(token => token == tokens[tokenIndex + 2]["value"]))
                    {
                        if (tokens[tokenIndex + 2]["value"] == "using" && tokens[tokenIndex + 4]["value"] == "[")
                        {
                            IEnumerable<string> namespaceDeclaration = tokens.Skip(tokenIndex + 5).Select(token => token["value"]);
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
                            scopeNamespaces.Add(tokens[tokenIndex + 4]["value"]);
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
                        if (tokens[tokenIndex]["value"] == "inherits")
                        {
                            string memberName = null;
                            bool withNs = false;

                            if (tokens[tokenIndex + 2]["value"] == "$global")
                            {
                                withNs = true;

                                memberName = string.Join
                                            (
                                                string.Empty,
                                                tokens.Skip(tokenIndex + 4)
                                                    .TakeWhile(someToken => someToken["value"] != "," && someToken["value"] != ";")
                                                    .Select(someToken => someToken["value"])
                                                    .ToArray()
                                            );
                            }
                            else
                            {
                                memberName = tokens[tokenIndex + 4]["value"];
                            }

                            IEnumerable<Type> mappedMembers = dependencyMap.SelectMany(mappedNs => mappedNs.Members);

                            Type scopedMember;

                            if (withNs)
                            {
                                string[] memberPath = memberName.Split('.');
                                string scopedNs = string.Join(string.Empty, memberPath.Take(memberPath.Length - 1).ToArray());

                                memberName = memberPath.Last();

                                scopedMember = mappedMembers.FirstOrDefault
                                (
                                    member => member.Name == memberName && member.Parent.Name == scopedNs
                                );
                            }
                            else
                            {
                                scopedMember = mappedMembers.FirstOrDefault
                                (
                                    member => member.Name == memberName && scopeNamespaces.Any(scopedNs => scopedNs == member.Namespace)
                                );
                            }

                            if (scopedMember != null)
                            {
                                if (
                                    (scopedMember.FileName != "joopl.js" && scopedMember.FileName != "joopl.min.js")
                                    && !scopedMember.FileName.Contains(file.Name)
                                    && fileManifest.DependendsOn.Count(fileName => fileName == scopedMember.FileName) == 0
                                )
                                {
                                    if (scopedMember.Inherits != null)
                                    {
                                        Stack<Type> hierarchy = GetHierarchy(dependencyMap, scopedMember);
                                        fileManifest.DependendsOn.AddRange(hierarchy.Select(type => type.FileName));
                                    }
                                    else
                                    {
                                        fileManifest.DependendsOn.Add(scopedMember.FileName);
                                    }
                                }
                            }
                        }
                        else if (thirdPartyDependencies != null && thirdPartyDependencies.Count() > 0 && tokens[tokenIndex]["value"].StartsWith("use "))
                        {
                            if (fileManifest.Libraries == null)
                            {
                                fileManifest.Libraries = new List<string>();
                            }

                            string dependencyName = tokens[tokenIndex]["value"].Split(' ').Last();

                            fileManifest.Libraries.Add((string)thirdPartyDependencies.Single(some => (string)some["name"] == dependencyName)["uri"]);

                        }
                        else
                        {
                            Type scopedMember = allTypes.SingleOrDefault
                            (
                                type => scopeNamespaces.Any(ns => ns == type.Namespace) && type.Name == tokens[tokenIndex]["value"]
                            );

                            if (scopedMember == null)
                            {
                                int tokenSearchIndex = tokenIndex - 1;
                                string[] endOfSearchTokens = new string[] { "{", "}", "=", ";", "(", ")" };
                                StringBuilder fullNs = new StringBuilder();
                                bool end = false;

                                while (!end && tokenSearchIndex >= 0 && !endOfSearchTokens.Contains(tokens[tokenSearchIndex]["value"]))
                                {
                                    if (tokens[tokenSearchIndex]["value"] != "$global")
                                    {
                                        fullNs.Append(tokens[tokenSearchIndex]["value"]);
                                    }

                                    tokenSearchIndex--;
                                }

                                string foundNs = fullNs.ToString().Trim('.');

                                scopedMember = allTypes.SingleOrDefault
                                (
                                    type => type.Namespace == foundNs && type.Name == tokens[tokenIndex]["value"]
                                );
                            }

                            if (scopedMember != null)
                            {
                                if (
                                    (scopedMember.FileName != "joopl.js" && scopedMember.FileName != "joopl.min.js")
                                    && !scopedMember.FileName.Contains(file.Name)
                                    && fileManifest.DependendsOn.Count(fileName => fileName == scopedMember.FileName) == 0
                                )
                                {
                                    if (scopedMember.Inherits != null)
                                    {
                                        Stack<Type> hierarchy = GetHierarchy(dependencyMap, scopedMember);
                                        fileManifest.DependendsOn.AddRange(hierarchy.Where(type => !fileManifest.DependendsOn.Any(f => f == type.FileName)).Select(type => type.FileName));
                                    }
                                    else
                                    {
                                        fileManifest.DependendsOn.Add(scopedMember.FileName);
                                    }
                                }
                            }
                        }
                    }

                    tokenIndex++;
                }

                fileManifest.FileName = relativeFilePath;

                if (fileManifest.DependendsOn.Count == 0)
                {
                    fileManifest.DependendsOn = null;
                }

                usageMap.Add(fileManifest);

                scopeNamespaces.Clear();
                tokenIndex = 0;
            }

            foreach (FileManifest manifest in usageMap)
            {
                if (manifest.DependendsOn != null)
                {
                    manifest.DependendsOn.AddRange(((IEnumerable<string>)GetDependencies(usageMap, manifest)).Reverse());
                    manifest.DependendsOn = manifest.DependendsOn.Distinct().ToList();

                    if (moduleFiles != null && Array.IndexOf(moduleFiles, Path.GetFileName(manifest.FileName)) > -1 || moduleFiles == null)
                    {
                        result.Add(manifest.FileName, manifest.DependendsOn);
                    }
                }
            }

            return result;
        }

        private Stack<Type> GetHierarchy(List<Namespace> dependencyMap, Type type)
        {
            Stack<Type> types = new Stack<Type>();
            bool hasBaseType = true;
            Namespace foundNs = null;

            while (hasBaseType)
            {
                foundNs = dependencyMap.SkipWhile(ns => !ns.Members.Any(member => member.Name == type.Name)).Take(1).SingleOrDefault();

                if (foundNs != null)
                {
                    type = foundNs.Members.Single(member => member.Name == type.Name);
                    types.Push(type);

                    if ((hasBaseType = type.Inherits != null))
                    {
                        type = type.Inherits;
                    }
                }
                else
                {
                    hasBaseType = false;
                }
            }

            return types;
        }

        private List<string> GetDependencies(IEnumerable<FileManifest> usageMap, FileManifest parentManifest = null, List<string> dependencies = null)
        {
            dependencies = dependencies ?? new List<string>();

            if (parentManifest == null)
            {
                foreach (FileManifest manifest in usageMap)
                {
                    if (manifest.DependendsOn.Count > 0)
                    {
                        foreach (string fileName in manifest.DependendsOn)
                        {
                            if ((fileName != manifest.FileName && fileName != "joopl.js" && fileName != "joopl.min.js") && !dependencies.Contains(fileName))
                            {
                                dependencies.Add(fileName);

                                GetDependencies(usageMap, usageMap.Single(some => some.FileName == fileName), dependencies);
                            }
                        }
                    }
                }
            }
            else if (parentManifest.DependendsOn != null && parentManifest.DependendsOn.Count > 0)
            {
                foreach (string fileName in parentManifest.DependendsOn)
                {
                    if ((fileName != parentManifest.FileName && fileName != "joopl.js" && fileName != "joopl.min.js") && !dependencies.Contains(fileName))
                    {
                        dependencies.Add(fileName);
                        dependencies.Reverse();
                        GetDependencies(usageMap, usageMap.Single(some => some.FileName == fileName), dependencies);
                    }
                }
            }

            return dependencies;
        }

        public List<Namespace> BuildDependencyMap(string baseDirectory, string[] excludeFiles = null)
        {
            IList<IDictionary<string, string>> tokens;
            int tokenIndex = 0;
            string currentNs = null;
            Namespace ns = null;
            string relativeFilePath = null;

            IEnumerable<FileInfo> files = new DirectoryInfo(baseDirectory).GetFiles("*.js", SearchOption.AllDirectories);

            List<Namespace> namespaces = new List<Namespace>();

            JsParser jsParser = new JsParser();

            string[] declarations = new[] { "declareClass", "declareEnum" };
            Regex declarationRegEx = new Regex("^([A-Z][A-Za-z0-9]+)$");

            foreach (FileInfo file in files)
            {
                if (excludeFiles != null && excludeFiles.Contains(file.Name))
                {
                    continue;
                }

                tokens = jsParser.ParseTokens(file.FullName);
                relativeFilePath = file.FullName.Replace(baseDirectory, string.Empty).Replace('\\', '/').TrimStart('/');

                while (tokenIndex < tokens.Count)
                {
                    if (tokens[tokenIndex]["type"] == "Punctuator")
                    {
                        tokenIndex++;
                        continue;
                    }

                    if (tokens[tokenIndex]["value"] == "$namespace" && tokens[tokenIndex + 2]["value"] == "register")
                    {
                        currentNs = tokens[tokenIndex + 4]["value"];

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
                    else if (declarations.Any(token => token == tokens[tokenIndex]["value"]))
                    {
                        if (ns != null && declarationRegEx.IsMatch(tokens[tokenIndex + 2]["value"]))
                        {
                            ns.Members.Add(new Type { Parent = ns, FileName = relativeFilePath, Name = tokens[tokenIndex + 2]["value"] });
                        }

                        int searchTokenIndex = ++tokenIndex;
                        bool hasInheritance = false;

                        while (!hasInheritance && searchTokenIndex < tokens.Count && !declarations.Any(token => token == tokens[searchTokenIndex]["value"]))
                        {
                            if (tokens[searchTokenIndex]["value"] == "inherits")
                            {
                                hasInheritance = true;

                                string memberName = null;

                                if (tokens[searchTokenIndex + 2]["value"] == "$global")
                                {
                                    memberName = string.Join
                                                (
                                                    string.Empty,
                                                    tokens.Skip(searchTokenIndex + 4)
                                                        .TakeWhile(someToken => someToken["value"] != "," && someToken["value"] != ";")
                                                        .Select(someToken => someToken["value"])
                                                        .ToArray()
                                                );
                                }
                                else
                                {
                                    memberName = currentNs + "." + tokens[searchTokenIndex + 4]["value"];
                                }

                                if (ns.Members.Count > 0)
                                {
                                    ns.Members[ns.Members.Count - 1].Inherits = new Type
                                    {
                                        Name = memberName.Substring(memberName.LastIndexOf('.') + 1),
                                        Parent = new Namespace { Name = memberName.Substring(0, memberName.LastIndexOf('.')) }
                                    };
                                }
                            }

                            searchTokenIndex++;
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