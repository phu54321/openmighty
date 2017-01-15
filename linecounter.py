import os

totlinen = 0
totsize = 0
totstrlist = []

for root, dirs, files in os.walk('server'):
    for f in files:
        if f[-3:] == '.js':
            finalpath = os.path.join(root, f)
            code = open(finalpath, 'r').read()
            totsize += len(code)
            linen = code.count('\n') + 1
            print("%-40s : %4d" % (finalpath, linen))
            totlinen += linen

print('Total lines: %d' % totlinen)
print('Total size: %d' % totsize)
