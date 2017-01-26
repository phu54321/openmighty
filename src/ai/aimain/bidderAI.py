from DDQN import DDQNLearner
from keras.models import load_model

# Envionments:
#   - My deck [53]
# Output num:
#   - (spade~none) (5) * 13~20 (8) = 40
#   - (pass) = 2

gameEnvSize = 53
actionSize = 40 + 1


def createBidderModel():
    return load_model('models/base_bidder_model.h5')


bidderLearn = DDQNLearner(
    'bidder', createBidderModel, gameEnvSize, actionSize, 0.97,
    100, 10, 10, saveFreq=500
)
