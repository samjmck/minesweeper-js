# Build en gebruik

Voor dit project heb ik TypeScript gebruikt. Dit betekent dat de TypeScript bestanden eerst getranspileerd moeten worden naar JavaScript bestanden met de TypeScript compiler (`tsc`) voor ze gebruikt kunnen worden in een browser. De getranspileerde JavaScript code van de laatste commit is al gepusht, maar als de TypeScript bestanden gewijzigd worden moet TypeScript eerst geinstalleerd worden met `npm install` en `tsc` opnieuw uitgevoerd worden.

Doordat ik ook gebruik maak van meerdere scripts die `import` en `export` statements gebruiken, moest ik ook gebruik maken van ES modules in de HTML. Om ES modules te kunnen gebruiken, moet er een lokale webserver gestart worden. Normaal kan dit in de meeste IDEs gebeuren of met Python: `python3 -m http.server`.

Dit project was voor het vak informaticawerktuigen [G0Q30E] aan de KUL.