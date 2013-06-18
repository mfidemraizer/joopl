using System.Collections.Generic;
using System.Runtime.Serialization;

namespace joopl.DependencyBuilder
{
    [DataContract(IsReference = false)]
    public sealed class Type
    {
        [DataMember(Name = "kind")]
        public string Kind
        {
            get { return "member"; }
        }

        [IgnoreDataMember]
        public Namespace Parent
        {
            get;
            set;
        }

        [DataMember(Name = "namespace")]
        public string Namespace
        {
            get { return Parent.Name; }
        }

        [DataMember(Name = "name")]
        public string Name
        {
            get;
            set;
        }

        [DataMember(Name = "fileName")]
        public string FileName
        {
            get;
            set;
        }

        public override string ToString()
        {
            return string.Format("{0}.{1}", Parent.Name, Name);
        }
    }
}