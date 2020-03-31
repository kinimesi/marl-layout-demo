/*
def q_learning_with_table(env, num_episodes=500):
    q_table = np.zeros((5, 2))
    y = 0.95
    lr = 0.8
    for i in range(num_episodes):
        s = env.reset()
        done = False
        while not done:
            if np.sum(q_table[s,:]) == 0:
                # make a random selection of actions
                a = np.random.randint(0, 2)
            else:
                # select the action with largest q value in state s
                a = np.argmax(q_table[s, :])
            new_s, r, done, _ = env.step(a)
            q_table[s, a] += r + lr*(y*np.max(q_table[new_s, :]) - q_table[s, a])
            s = new_s
    return q_table
*/
var MyRL = {}; // the Recurrent library

(function(global) {
  "use strict";

	var createTable = function(ns, na) {
		var qTable = [];
		for (var s = 0; s < ns; s++) {
			var actions = [];
			for (var a = 0; a < na; a++) {
				actions.push(-Infinity);
			}
			qTable.push(actions);
		}
		return qTable;
	}

var TDAgent = function(env, opt) {
    this.ns = env.getNumStates();
    this.na = env.getMaxNumActions();
	this.qTable = createTable(this.ns, this.na);
	this.lr = opt.alpha;
	this.y = opt.gamma;
}

TDAgent.prototype = {
	act: function(s) {
		for (let i = 0; i < this.qTable[s].length; i++) {
			if (this.qTable[s][i] == -Infinity) {
				return i;
			}
		}

		let index =  this.qTable[s].indexOf(Math.max(...this.qTable[s]));
		return index;
	},

	learn: function(r, s, a) {
		r = Math.round(r);
		var new_s = a;
		var max = Math.max(...this.qTable[new_s]);
		if (this.qTable[s][a] == -Infinity) {
			this.qTable[s][a] = r;
			return
		}
		this.qTable[s][a] += r + this.lr*(this.y*max - this.qTable[s][a]);
	}
}
global.TDAgent = TDAgent;
})(MyRL);
