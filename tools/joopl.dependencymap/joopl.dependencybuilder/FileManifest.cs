// (c) joopl 
// By Matías Fidemraizer (http://www.matiasfidemraizer.com) (http://www.linkedin.com/in/mfidemraizer/en)
// -------------------------------------------------
// Project site on GitHub: http://mfidemraizer.github.io/joopl/
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
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