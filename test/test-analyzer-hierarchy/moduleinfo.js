$import.mapMany(
{
	"joopl.analyzer.SomeClass": [
		"./ns2/A.js", "./ns2/B.js",
		"./SomeClass.js", "./ns1/A.js",
		"./ns1/B.js"
	],
	"threeclasstest.A": [
		"./ThreeClasses.js"
	],
	"threeclasstest.B": [
		"./ThreeClasses.js"
	],
	"threeclasstest.C": [
		"./ThreeClasses.js"
	],
	"joopl.analyzer.ns2.A": ["./ns2/A.js"],
	"joopl.analyzer.ns2.B": ["./ns2/A.js",
		"./ns2/B.js", "./ns1/A.js",
		"./ns1/B.js"
	],
	"joopl.analyzer.ns3.C": ["./ns2/A.js",
		"./ns2/B.js", "./ns3/C.js",
		"./ns1/A.js", "./ns1/B.js"
	],
	"joopl.analyzer.ns1.A": ["./ns1/A.js"],
	"joopl.analyzer.ns1.B": ["./ns1/A.js",
		"./ns1/B.js"
	]
});