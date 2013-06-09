using System.Runtime.Serialization;

namespace joopl.dependencybuilder
{
    [DataContract(IsReference = false)]
    public sealed class Member
    {
        [DataMember(Name = "kind")]
        public string Kind
        {
            get { return "member"; }
        }

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

        [DataMember(Name = "file")]
        public string File
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