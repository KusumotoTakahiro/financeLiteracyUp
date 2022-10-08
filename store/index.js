function getDefaultState() {
  return {
    runningLogin: false,
    tasks: false,
    messages: [],
    title: "金融リテラシーを高める!",
  }
}

export const state = getDefaultState();

// 同期処理
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
  completeTask: (state) => {
    state.tasks = false;
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
  },
  removeMessage: (state) => {
    state.messages.shift();
  },
  setTitle: (state, next) => {
    state.title = next.title;
  }
}

// stateの内容を加工して返す処理
export const getters = {
  latestMsg: (state) => {
    const messages = state.messages;
    const length = messages.length;
    return state.messages[length-1].text;
  },
  getMessages: (state) => {
    return state.messages;
  },
  getTitle: (state) => {
    return state.title;
  }
}