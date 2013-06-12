using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace joopl.DependencyBuilder
{
    [DataContract(IsReference = false)]
    public class TypeRef
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

        public static implicit operator TypeRef(Type type)
        {
            TypeRef typeRef = new TypeRef();
            typeRef.Name = type.Name;
            typeRef.Parent = type.Parent;

            return typeRef;
        }
    }
}
