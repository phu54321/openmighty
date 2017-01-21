import base64
import os
import re

cssTemplate = '''.game-card-%s {
    background-image: url(data:image/png;base64,%s);
}

'''


def natural_sort(l):
    convert = lambda text: int(text) if text.isdigit() else text.lower()
    alphanum_key = lambda key: [ convert(c) for c in re.split('([0-9]+)', key) ]
    return sorted(l, key = alphanum_key)


f = open('cards.css', 'w')

for fname in natural_sort(os.listdir('.')):
    if not fname.endswith('.png'):
        continue

    fdata = open(fname, 'rb').read()
    cardIdf = fname[:-4]
    f.write(cssTemplate % (cardIdf, base64.b64encode(fdata).decode('ascii')))

f.close()
