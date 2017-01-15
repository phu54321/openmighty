from PIL import Image
im = Image.open('raw.png')
w, h = im.size
im = im.resize((1300, 750), Image.ANTIALIAS)

for x in range(13):
    for y in range(4):
        subImage = im.crop((x * 100, y * 150, (x + 1) * 100, (y + 1) * 150))
        subImage.save('%s%d.png' % ('cdhs'[y], x + 2))
