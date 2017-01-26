import h5py
import numpy as np


def writeModel(mtype, modelID, layerNum):
    file = h5py.File('model_%s_%08d_q0.h5' % (mtype, modelID), 'r')
    model_weights = file['model_weights']

    outFile = open("model%s.js" % mtype.capitalize(), 'w')

    # Basic math.js import
    outFile.write('''\
const math = require('mathjs');
const mmul = math.multiply;
const madd = math.add;

function Dense(v, W, b) {
    return madd(mmul(v, W), b);
}

function ReLU(v) {
    return v.map(x => Math.max(x, 0));
}
''')

    # Layer info
    for i in range(layerNum):
        denseLayer = model_weights['dense_%d' % (i + 1)]
        W = denseLayer['dense_%d_W:0' % (i + 1)]
        b = denseLayer['dense_%d_b:0' % (i + 1)]
        inSize, outSize = W.shape
        outFile.write('const W%d = math.matrix([\n' % i)
        for j in range(inSize):
            outFile.write('    [%s],\n' % ', '.join(
                np.char.mod('%f', W[j])))
        outFile.write(']);\n')
        outFile.write('const b%d = math.matrix([[%s]]);\n\n' % (
            i,
            ', '.join(np.char.mod('%f', b))
        ))
        outFile.write('/' * 79 + '\n\n')

    # Forward functions
    outFile.write('''\
exports.forward = function (env) {
    let v = math.matrix([env]);
''')

    for i in range(layerNum):
        outFile.write('    v = Dense(v, W%d, b%d);\n' % (i, i))
        if i != layerNum - 1:
            outFile.write('    v = ReLU(v);\n')

    outFile.write('''\
    let out = v.toArray()[0];
    let index = %s;
    index.sort((a, b) => out[b] - out[a]);
    return index;
};
''' % (list(range(outSize)),))
