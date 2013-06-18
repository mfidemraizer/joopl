using System;
using System.Collections.Generic;
using System.IO;
using Newtonsoft.Json;

namespace joopl.DependencyBuilder
{
    class Program
    {
        static void Main(string[] args)
        {
            string baseDirectory = args[Array.IndexOf(args, "-directories") + 1];
            string outputDir = args[Array.IndexOf(args, "-outputdir") + 1];
            string[] excludeFiles = args[Array.IndexOf(args, "-excludefiles") + 1].Split(';');

            DependencyBuilder builder = new DependencyBuilder();

            List<Namespace> dependencyMap = builder.BuildDependencyMap(baseDirectory, excludeFiles);
            List<FileManifest> dependencyUsageMap = builder.BuildDependencyUsageMap(dependencyMap, baseDirectory, excludeFiles);

            JsonSerializerSettings settings = new JsonSerializerSettings { NullValueHandling = Newtonsoft.Json.NullValueHandling.Ignore, ReferenceLoopHandling = ReferenceLoopHandling.Ignore };

            File.WriteAllText
            (
                Path.Combine(outputDir, "DependencyMap.js"),
                "\"use strict\";\n$global.__DependencyMap = " + JsonConvert.SerializeObject(dependencyMap, Formatting.Indented, settings) + ';'
            );

            File.WriteAllText
            (
                Path.Combine(outputDir, "DependencyUsageMap.js"),
                "\"use strict\";\n$global.__DependencyUsageMap = " + JsonConvert.SerializeObject(dependencyUsageMap, Formatting.Indented, settings) + ';'
            );
        }
    }
}