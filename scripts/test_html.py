import urllib.request
import re

url = 'https://www.lachiesa.it/bibbia.php?ricerca=citazione&Citazione=mt+15&Versione_TILC=2&VersettoOn=1&Cerca=Cerca'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla'})
html = urllib.request.urlopen(req).read().decode('utf-8')

match = re.search(r'<div id="testo">(.*?)</div>\s*<(?:table|/td)', html, re.DOTALL | re.IGNORECASE)
if match:
    print(match.group(1)[:1000])
else:
    print("No match")
