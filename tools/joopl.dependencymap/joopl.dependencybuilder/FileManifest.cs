using System.Collections.Generic;
using System.Diagnostics;
using System.Runtime.Serialization;

namespace joopl.DependencyBuilder
{
    [DebuggerDisplay("{FileName}")]
    [DataContract(IsReference = false)]
    public sealed class FileManifest
    {
        public FileManifest()
        {
            DependendsOn = new List<string>();
        }

        [DataMember(Name = "fileName")]
        public string FileName
        {
            get;
            set;
        }

        [DataMember(Name = "libs")]
        public List<string> Libraries
        {
            get;
            set;
        }

        [DataMember(Name = "dependsOn")]
        public List<string> DependendsOn
        {
            get;
            set;
        }
    }
}