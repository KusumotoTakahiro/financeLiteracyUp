function getDefaultState() {
  return {
    runningLogin: false,
    tasks: false,
    messages: [],
  }
}

export const state = getDefaultState();

//同期処理
export const mutations = {
  startLogin: (state) => {
    state.runningLogin = true;
  },
  completeLogin: (state) => {
    state.runningLogin = false;
  },
  startTask: (state) => {
    state.tasks = true;
  },
  addMessage: (state, message) => {
    if (!message.dismissible) {
      message.dismissible = false;
    }
    if (!message.time) {
      message.time = 2.5;
    }
    if (message.risk !== 0 && !message.risk) {
      message.risk = 3;
    }
    state.messages.push(message);
  }
}