from PIL import Image

for shape in 'j':
    for num in range(1):
        im = Image.open('%s%d.png' % (shape, num))
        im = im.crop((2, 2, 123, 179))
        im.save('%s%d.png' % (shape, num))
