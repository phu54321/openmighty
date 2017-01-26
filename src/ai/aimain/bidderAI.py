from DDQN import DDQNLearner
from keras.models import Sequential
from keras.layers.core import Activation, Dense
from keras.optimizers import SGD

# Envionments:
#   - My deck [53]
# Output num:
#   - (spade~none) (5) * 13~20 (8) = 40
#   - (pass) = 2

gameEnvSize = 53
actionSize = 40 + 1


def createBidderModel():
    model = Sequential()
    model.add(Dense(50, input_dim=gameEnvSize))
    model.add(Activation('relu'))
    model.add(Dense(50))
    model.add(Activation('relu'))
    model.add(Dense(actionSize))
    model.compile(loss='mean_squared_error', optimizer=SGD())
    return model


bidderLearner = DDQNLearner(
    'bidder', createBidderModel, gameEnvSize, actionSize, 0.97,
    expBufferLen=400,
    batchFreq=10,
    batchSize=100,
    batchIter=2,
    saveFreq=1000
)
