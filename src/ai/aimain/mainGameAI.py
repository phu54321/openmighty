from DDQN import DDQNLearner
from keras.models import Sequential
from keras.layers.core import Activation, Dense
from keras.optimizers import SGD


gameEnvSize = 317 + 5 + 53
actionSize = 10


def createMainModel():
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
    model.compile(loss='mean_squared_error', optimizer=SGD())
    return model


mainLearner = DDQNLearner(
    'main', createMainModel, gameEnvSize, actionSize, 0.97
)
