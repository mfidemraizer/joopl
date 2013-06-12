using System.Collections.Generic;
using System.Runtime.Serialization;

namespace joopl.DependencyBuilder
{
    [DataContract(IsReference = false)]
    public sealed class FileManifest
    {
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
        public List<TypeRef> DependendsOn
        {
            get;
            set;
        }
    }
}