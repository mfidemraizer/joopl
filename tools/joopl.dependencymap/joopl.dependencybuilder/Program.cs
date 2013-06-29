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
using System.IO;
using System.Threading;

namespace joopl.DependencyBuilder
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine("jOOPL Dependency Map Builder");
            Console.WriteLine("v1.0 Beta");
            Console.WriteLine("(c) jOOPL (http://mfidemraizer.github.io/joopl/)");
            Console.WriteLine("(c) Matias Fidemraizer (http://matiasfidemraizer.com)");
            Console.WriteLine();
            Console.WriteLine("-----------------------------------------------------------------------");
            Console.WriteLine();
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.WriteLine("This command line tool uses some portions of other open source projects:");
            Console.WriteLine("\t- Jurassic JavaScript Parser (http://jurassic.codeplex.com)");
            Console.WriteLine("\t- Esprima JavaScript Parser (http://esprima.org)");
            Console.WriteLine();
            Console.ForegroundColor = ConsoleColor.White;
            Console.WriteLine("-----------------------------------------------------------------------");
            Console.WriteLine();

            string baseDirectory = args[Array.IndexOf(args, "-directories") + 1];
            string outputDir = args[Array.IndexOf(args, "-outputdir") + 1];
            string[] excludeFiles = args[Array.IndexOf(args, "-excludefiles") + 1].Split(';');

            DependencyBuilder builder = new DependencyBuilder();

            Console.WriteLine("Detecting defined types...");
            List<Namespace> dependencyMap = builder.BuildDependencyMap(baseDirectory, excludeFiles);

            Console.WriteLine("Building the usage map...");
            List<FileManifest> dependencyUsageMap = builder.BuildDependencyUsageMap(dependencyMap, baseDirectory, excludeFiles);

            JsonSerializerSettings settings = new JsonSerializerSettings { NullValueHandling = Newtonsoft.Json.NullValueHandling.Ignore, ReferenceLoopHandling = ReferenceLoopHandling.Ignore };

            Console.ForegroundColor = ConsoleColor.Green;

            Console.WriteLine("Saving DependencyMap.js to: '{0}'", Path.Combine(outputDir, "DependencyMap.js"));

            File.WriteAllText
            (
                Path.Combine(outputDir, "DependencyMap.js"),
                "\"use strict\";\n$global.__DependencyMap = " + JsonConvert.SerializeObject(dependencyMap, Formatting.Indented, settings) + ';'
            );

            Console.WriteLine("Saving DependencyUsageMap.js to: '{0}'", Path.Combine(outputDir, "DependencyMap.js"));

            File.WriteAllText
            (
                Path.Combine(outputDir, "DependencyUsageMap.js"),
                "\"use strict\";\n$global.__DependencyUsageMap = " + JsonConvert.SerializeObject(dependencyUsageMap, Formatting.Indented, settings) + ';'
            );

            Console.ResetColor();
        }
    }
}