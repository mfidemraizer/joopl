using System.Collections.Generic;

namespace joopl.dependencybuilder
{
    public sealed class FileManifest
    {
        public FileManifest()
        {
            DependentFiles = new List<string>();
        }

        public List<string> DependentFiles
        {
            get;
            set;
        }
    }
}