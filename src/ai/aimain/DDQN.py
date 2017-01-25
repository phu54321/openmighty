import numpy as np
from keras.models import Sequential
from keras.layers.core import Activation, Dense
from keras.optimizers import Adagrad

# Training parameters
experienceBufferLength = 100
discountFactor = 0.97
exploreFactor = 0.05
batchFreq = 10
batchSize = 10

# Main model
gameEnvSize = 317 + 5 + 53
actionSize = 10

####################################


def createModel():
    model = Sequential()
    model.add(Dense(100, input_dim=gameEnvSize))
    model.add(Activation('relu'))
    model.add(Dense(50))
    model.add(Activation('relu'))
    model.add(Dense(50))
    model.add(Activation('relu'))
    model.add(Dense(50))
    model.add(Activation('relu'))
    model.add(Dense(actionSize))
    model.compile(loss='mean_squared_error', optimizer=Adagrad())
    return model


# Double Q Model
models = [createModel(), createModel()]


def Q(stateV, index):
    return models[index].predict(stateV, stateV.shape[0])


def train(state0V, actionV, rewardV, state1V, gameCont):
    batchN = state0V.shape[0]
    target = Q(state0V, 0)
    targetQ = rewardV
    stateV1Sel = state1V[gameCont]
    if stateV1Sel.shape[0]:
        targetQ[gameCont] += discountFactor * np.max(Q(stateV1Sel, 1), axis=1)
    target[range(batchN), actionV] = targetQ
    models[0].train_on_batch(state0V, target)
    models[:] = models[::-1]


def predict(state):
    return np.argmax(Q(np.asarray([state]), 0)[0])


# Experience buffer
bufferLen = experienceBufferLength
bufferIndex = 0
batchCounter = 0
bufferInitialized = False

expS0 = np.zeros((bufferLen, gameEnvSize))
expS1 = np.zeros((bufferLen, gameEnvSize))
expA = np.zeros((bufferLen,), dtype='uint')
expR = np.zeros((bufferLen,))
expGC = np.zeros((bufferLen,), dtype='bool')


trainCount = 0
saveFreq = 10000


def addExperience(state0, action, reward, state1):
    global bufferIndex, bufferInitialized, batchCounter, trainCount
    expS0[bufferIndex] = state0
    expA[bufferIndex] = action
    expR[bufferIndex] = reward
    if state1 is not None:
        expS1[bufferIndex] = state1
        expGC[bufferIndex] = True
    else:
        expS1[bufferIndex] = 0
        expGC[bufferIndex] = False

    bufferIndex = (bufferIndex + 1) % bufferLen

    if bufferIndex == 0:
        bufferInitialized = True
    if bufferInitialized:
        batchCounter += 1
        if batchCounter == batchFreq:
            batchCounter = 0
            batches = np.random.choice(bufferLen, batchSize)
            train(
                expS0[batches],
                expA[batches],
                expR[batches],
                expS1[batches],
                expGC[batches]
            )
            trainCount += 1

        if trainCount % saveFreq == 0:
            # Save automatically
            models[0].save('models/model_%08d_q0.h5' % (trainCount / saveFreq))
            models[1].save('models/model_%08d_q1.h5' % (trainCount / saveFreq))
