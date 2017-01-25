import h5py
import numpy as np

file = h5py.File('model_00000115_q0.h5', 'r')
model_weights = file['model_weights']

with open("model.js", 'w') as outfile:
    outfile.write('const math = require("mathjs");\n\n')

    layerNum = 5
    for i in range(layerNum):
        denseLayer = model_weights['dense_%d' % (i + 1)]
        W = denseLayer['dense_%d_W:0' % (i + 1)]
        b = denseLayer['dense_%d_b:0' % (i + 1)]
        inSize, outSize = W.shape
        outfile.write('exports.W%d = math.matrix([\n' % (i + 1))
        for j in range(inSize):
            outfile.write('    [%s],\n' % ', '.join(np.char.mod('%f', W[j])))
        outfile.write(']);\n\n')
