using System;
using System.Collections.Generic;
using System.IO;
using Newtonsoft.Json;

namespace joopl.dependencybuilder
{
    class Program
    {
        static void Main(string[] args)
        {
            string baseDirectory = args[Array.IndexOf(args, "-directory") + 1];

            DependencyBuilder builder = new DependencyBuilder();

            List<Namespace> dependencyMap = builder.BuildDependencyMap(baseDirectory);

            builder.BuildDependencyUsageMapAsJson(dependencyMap, baseDirectory);

            File.WriteAllText
            (
                Path.Combine(baseDirectory, "DependencyMap.json"),
                JsonConvert.SerializeObject(dependencyMap, Formatting.Indented, new JsonSerializerSettings { ReferenceLoopHandling = ReferenceLoopHandling.Ignore })
            );
        }
    }
}