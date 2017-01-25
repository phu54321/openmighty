from DDQN import DDQNLearner
from keras.models import Sequential
from keras.layers.core import Activation, Dense, Dropout
from keras.optimizers import Adam
from keras.utils.np_utils import to_categorical
import numpy as np

# Envionments:
#   - My deck [53]
# Output num:
#   - (spade~none) (5) * 13~20 (8) = 40
#   - (pass) = 2

gameEnvSize = 53
actionSize = 40 + 1


bidderModel = Sequential()
bidderModel.add(Dense(50, input_dim=gameEnvSize))
bidderModel.add(Activation('relu'))
bidderModel.add(Dropout(0.2))
bidderModel.add(Dense(50))
bidderModel.add(Activation('relu'))
bidderModel.add(Dropout(0.2))
bidderModel.add(Dense(actionSize))
bidderModel.add(Activation('softmax'))
bidderModel.compile(optimizer='rmsprop', loss='categorical_crossentropy', metrics=['accuracy'])


deckBase = np.arange(53)
for i in range(1000):
    batchX = []
    batchY = []
    for j in range(100):
        np.random.shuffle(deckBase)
        deck = sorted(deckBase[:10].tolist())
        iv = np.zeros(53)
        iv[deck] = 1
        # Bet if has 'A' and has more than 4 card with shape
        output = 40
        for shape in range(4):
            if (
                iv[13 * shape + 12] == 1 and
                np.sum(iv[13 * shape: 13 * (shape + 1)]) >= 4
            ):
                output = 8 * shape
                break
        batchX.append(iv)
        batchY.append(output)

    bidderModel.fit(np.asarray(batchX), to_categorical(batchY, actionSize), 100, 10, verbose=0)

bidderModel.pop()
bidderModel.compile(loss='mean_squared_error', optimizer=Adam())
bidderModel.save('../models/base_bidder_model.h5')

