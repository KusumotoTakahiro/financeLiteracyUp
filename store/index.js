import {fireStore} from '@/plugins/firebase'
import {
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
} from 'firebase/firestore'

const usersRef = collection(fireStore, "users");

function getDefaultState() {
  return {
    runningLogin: false,
    tasks: false,
    messages: [],
    title: "金融リテラシーを高める!",
    user: null,
    idToken: null,
    shop: {},
    present: {},
    work: {},
    tax: {},
    fine: {},
    history: {},
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
  },
  setUser: (state, user) => {
    state.user = user;
  },
  setIdToken: (state, idToken) => {
    state.idToken = idToken;
  },
  setWork: (state, work) => {
    state.work = work;
  },
  setFine: (state, fine) => {
    state.fine = fine;
  },
  setPresent: (state, present) => {
    state.present = present;
  },
  setShop: (state, shop) => {
    state.shop = shop;
  },
  setTax: (state, tax) => {
    state.tax = tax;
  },
  setHistory: (state, history) => {
    state.history = history;
  }
}

// stateの内容を加工して返す処理
export const getters = {
  latestMsg: (state) => {
    const messages = state.messages;
    const length = messages.length;
    return state.messages[length-1].text;
  },
  isAuthenticated(state) {
    return state.user != null;
  },
  getMessages: (state) => {
    return state.messages;
  },
  getTitle: (state) => {
    return state.title;
  },
  getUser: (state) => {
    return state.user;
  },
  getIdToken: (state) => {
    return state.idToken;
  },
  getShop: (state) => {
    return state.shop;
  },
  getWork: (state) => {
    return state.work;
  },
  getFine: (state) => {
    return state.fine;
  },
  getHistory: (state) => {
    return state.history;
  },
  getTax: (state) => {
    return state.tax;
  },
  getPresent: (state) => {
    return state.present;
  },
}

export const actions = {
  async fetchUserData() {
    
  }
}
