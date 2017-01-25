from mainGameAI import mainLeaner
from bidderAI import bidderLearn
import numpy as np
import sys
import json


class Agent:
    def __init__(self):
        self.state0 = None
        self.action = None
        self.reward = 0

    # Bidding related

    def bidPredict(self, deck):
        deckRepr = np.zeros(53)
        deckRepr[deck] = 1
        self.deckrepr = repr
        return bidderLearn.predict(deckRepr)

    def bidReward(self, deck, bid, reward):
        deckRepr = np.zeros(53)
        deckRepr[deck] = 1
        bidderLearn.addExperience(deckRepr, bid, reward, None)

    # Main game related

    def predict(self):
        return mainLeaner.predict(self.state0)

    def setState(self, state):
        assert self.state0 is None or self.action is not None
        if self.state0 is not None:
            mainLeaner.addExperience(
                self.state0, self.action, self.reward, state)
        self.state0 = state
        self.action = None
        self.reward = 0

    def doAction(self, action):
        self.action = action

    def addReward(self, reward):
        self.reward += reward

    def endGame(self):
        assert self.action is not None
        if self.state0 is not None:
            mainLeaner.addExperience(
                self.state0, self.action, self.reward, None)
        self.state0 = None
        self.action = None
        self.reward = 0


agentMap = {}

if __name__ == '__main__':
    mainLeaner.loadModel(246)
    sys.stderr.write('AI Agent loaded\n')

    while True:
        line = sys.stdin.readline()
        obj = json.loads(line)
        if obj['type'] == 'create':
            agentMap[obj['aiIdf']] = Agent()
        elif obj['type'] == 'bidpredict':
            sys.stdout.write(chr(agentMap[obj['aiIdf']].bidPredict(
                obj['deck']
            )))
        elif obj['type'] == 'bidreward':
            agentMap[obj['aiIdf']].bidReward(
                obj['deck'],
                obj['bid'],
                obj['reward']
            )
        elif obj['type'] == 'predict':
            sys.stdout.write(chr(agentMap[obj['aiIdf']].predict()))
        elif obj['type'] == 'setstate':
            agentMap[obj['aiIdf']].setState(obj['state'])
        elif obj['type'] == 'action':
            agentMap[obj['aiIdf']].doAction(obj['action'])
        elif obj['type'] == 'reward':
            if 'reward' not in obj:
                sys.stderr.write(str(obj) + '\n')
            agentMap[obj['aiIdf']].addReward(obj['reward'])
        elif obj['type'] == 'endgame':
            agentMap[obj['aiIdf']].endGame()
        else:
            sys.stderr.write("Unknown type %s\n" % obj['type'])
        sys.stdout.flush()
        sys.stderr.flush()
