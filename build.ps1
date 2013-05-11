Clear-Host

write-host JOOPL
write-host -------------------------------------
write-host 
write-host Starting combination and minimization of JavaScript files.... 

remove-item joopl.min.js

# MINIFY THE COMBINED FILE
$Minifier = “C:\Program Files (x86)\Microsoft\Microsoft Ajax Minifier\AjaxMin.exe”
&$Minifier joopl.js -out joopl.min.js -strict:true

yuidoc -n . --themedir ./yuidoc/themes/default

new-item -ItemType directory -Path .\doc\test -Force
copy-item .\test\*.* .\doc\test -recurse