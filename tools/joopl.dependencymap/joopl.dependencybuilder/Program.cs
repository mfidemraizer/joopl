using System;
using System.IO;

namespace joopl.dependencybuilder
{
    class Program
    {
        static void Main(string[] args)
        {
            string baseDirectory = args[Array.IndexOf(args, "-directory") + 1];

            DependencyBuilder builder = new DependencyBuilder();

            File.WriteAllText(Path.Combine(baseDirectory, "DependencyMap.json"), builder.BuildDependencyMapAsJson(baseDirectory));
        }
    }
}