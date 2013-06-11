using System.Collections.Generic;
using System.Runtime.Serialization;

namespace joopl.dependencybuilder
{
    [DataContract(IsReference = false)]
    public sealed class FileManifest
    {
        public FileManifest()
        {
        }

        [DataMember(Name = "fileName")]
        public string FileName
        {
            get;
            set;
        }

        [DataMember(Name = "dependsOn")]
        public List<Member> DependendsOn
        {
            get;
            set;
        }
    }
}