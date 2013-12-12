$import.mapMany(
{
	"joopl.analyzer.ns4.SomeClass": [
		"./ClassWithPropertiesAndInstances.js",
		"./ns1/A.js", "./ns2/A.js",
		"./ns2/B.js", "./ns3/C.js",
		"./ns1/B.js"
	],
	"joopl.analyzer.SomeClass": [
		"./ns2/A.js", "./ns2/B.js",
		"./SomeClass.js", "./ns1/A.js",
		"./ns1/B.js"
	],
	"threeclasstest1.A": [
		"./ThreeClassesDifferentNamespace.js"
	],
	"threeclasstest2.B": [
		"./ThreeClassesDifferentNamespace.js"
	],
	"threeclasstest3.C": [
		"./ThreeClassesDifferentNamespace.js"
	],
	"threeclasstest.A": [
		"./ThreeClassesSameNamespace.js"
	],
	"threeclasstest.B": [
		"./ThreeClassesSameNamespace.js"
	],
	"threeclasstest.C": [
		"./ThreeClassesSameNamespace.js"
	],
	"joopl.analyzer.ns3.C": ["./ns2/A.js",
		"./ns2/B.js", "./ns3/C.js",
		"./ns1/A.js", "./ns1/B.js"
	],
	"joopl.analyzer.ns2.A": ["./ns2/A.js"],
	"joopl.analyzer.ns2.B": ["./ns2/A.js",
		"./ns2/B.js", "./ns1/A.js",
		"./ns1/B.js"
	],
	"joopl.analyzer.ns1.A": ["./ns1/A.js"],
	"joopl.analyzer.ns1.B": ["./ns1/A.js",
		"./ns1/B.js"
	]
});