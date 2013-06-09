using System.Collections.Generic;
using System.Runtime.Serialization;

namespace joopl.dependencybuilder
{
    [DataContract(IsReference = false)]
    public sealed class Namespace
    {
        public Namespace()
        {
            Files = new List<string>();
            Members = new List<Member>();
        }

        [DataMember(Name = "kind")]
        public string Kind
        {
            get { return "namespace"; }
        }

        [DataMember(Name = "name")]
        public string Name
        {
            get;
            set;
        }

        [DataMember(Name = "files")]
        public List<string> Files
        {
            get;
            set;
        }

        [DataMember(Name = "members")]
        public List<Member> Members
        {
            get;
            set;
        }

        public override string ToString()
        {
            return Name;
        }
    }
}