using System.Runtime.Serialization;

namespace joopl.DependencyBuilder
{
    [DataContract(IsReference = false)]
    public class FileManifestRef
    {
        [DataMember(Name = "fileName")]
        public string FileName
        {
            get;
            set;
        }

        public static implicit operator FileManifestRef(Type type)
        {
            return new FileManifestRef { FileName = type.FileName };
        }
    }
}
