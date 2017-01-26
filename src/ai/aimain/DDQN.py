from keras.models import load_model
from keras.optimizers import SGD
import numpy as np
import sys


# Double Q Model


class DDQNLearner:
    def __init__(
        self, name,
        modelFunc, inputN, outputN, discountFactor,
        expBufferLen=200,
        batchFreq=10,
        batchSize=40,
        batchIter=10,
        saveFreq=10000
    ):
        self.models = [modelFunc(), modelFunc()]
        self.inputN = inputN
        self.outputN = outputN
        self.name = name

        # Training parameters
        self.expBufferLen = expBufferLen
        self.discountFactor = discountFactor,
        self.batchFreq = batchFreq
        self.batchSize = batchSize
        self.batchIter = batchIter

        # Experience buffers
        self.bufferIndex = 0
        self.batchCounter = 0
        self.bufferInitialized = False

        self.expS0 = np.zeros((expBufferLen, inputN))
        self.expS1 = np.zeros((expBufferLen, inputN))
        self.expA = np.zeros((expBufferLen,), dtype='uint')
        self.expR = np.zeros((expBufferLen,))
        self.expGC = np.zeros((expBufferLen,), dtype='bool')

        self.trainCount = 0
        self.saveFreq = saveFreq

    def Q(self, stateV, index):
        return self.models[index].predict(stateV, stateV.shape[0])

    def train(self, state0V, actionV, rewardV, state1V, gameCont):
        batchN = state0V.shape[0]
        target = self.Q(state0V, 0)
        targetQ = rewardV
        stateV1Sel = state1V[gameCont]
        if stateV1Sel.shape[0]:
            targetQ[gameCont] += (
                self.discountFactor * np.max(self.Q(stateV1Sel, 1), axis=1)
            )
        target[range(batchN), actionV] = targetQ
        history = self.models[0].fit(
            state0V, target,
            batch_size=self.batchSize,
            nb_epoch=self.batchIter,
            verbose=0
        )
        self.models[:] = self.models[::-1]
        return history.history['loss']

    def predict(self, state):
        return np.argmax(self.Q(np.asarray([state]), 0)[0])

    def addExperience(self, state0, action, reward, state1):
        bufferIndex = self.bufferIndex
        self.expS0[bufferIndex] = state0
        self.expA[bufferIndex] = action
        self.expR[bufferIndex] = reward
        if state1 is not None:
            self.expS1[bufferIndex] = state1
            self.expGC[bufferIndex] = True
        else:
            self.expS1[bufferIndex] = 0
            self.expGC[bufferIndex] = False

        self.bufferIndex = bufferIndex = (bufferIndex + 1) % self.expBufferLen

        if bufferIndex == 0:
            self.bufferInitialized = True
        if self.bufferInitialized:
            self.batchCounter += 1
            if self.batchCounter == self.batchFreq:
                self.batchCounter = 0
                batches = np.random.choice(self.expBufferLen, self.batchSize)
                loss = self.train(
                    self.expS0[batches],
                    self.expA[batches],
                    self.expR[batches],
                    self.expS1[batches],
                    self.expGC[batches]
                )
                self.trainCount += 1

                if self.trainCount % self.saveFreq == 0:
                    # Save automatically
                    sys.stderr.write(
                        '[%s] Trained %d times, loss=%g\n'
                        % (self.name, self.trainCount, np.mean(loss))
                    )
                    modelID = self.trainCount / self.saveFreq
                    self.models[0].save(
                        'models/model_%s_%08d_q0.h5'
                        % (self.name, modelID)
                    )
                    self.models[1].save(
                        'models/model_%s_%08d_q1.h5'
                        % (self.name, modelID)
                    )

    def loadModel(self, modelID):
        self.trainCount = modelID * self.saveFreq
        self.models[0] = load_model(
            'models/model_%s_%08d_q0.h5'
            % (self.name, modelID)
        )
        self.models[1] = load_model(
            'models/model_%s_%08d_q1.h5'
            % (self.name, modelID)
        )
        self.models[0].compile(loss='mean_squared_error', optimizer=SGD())
        self.models[1].compile(loss='mean_squared_error', optimizer=SGD())

