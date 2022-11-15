import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'
import { addDoc, serverTimestamp, collection } from 'firebase/firestore';
import { fireStore } from './firebase';

const auth = getAuth();

export const authStateChanged = () => {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("ok!! login User!!");
        // let name, mailAddress, photoUrl, uid, emailVerified;
        // name = user.displayName;
        // mailAddress = user.email;
        // photoUrl = user.photoURL;
        // uid = user.uid;
        // emailVerified = user.emailVerified;
        resolve(user);
      }
      else {
        console.log('ユーザの認証errorです')
        redirect('/login');
      }
    })
  })
}

export const userLogout = () => {
  return new Promise((resolve, reject) => {
    signOut(auth).then(()=> {
      console.log("ログアウトしました");
    })
    .catch( (error) => {
      console.log(`ログアウト時にエラーが発生しました(${error})`);
    })
  })
}


export const saveHistory = (roomPath, userUid, stringData) => {
  return new Promise((resolve, reject) => {
    console.log('saveHistory() in auth.js');
    if (!roomPath) {
      console.log('roomPathがみつかりません');
    }
    try {
      const hiscoll = collection(fireStore, "groups", roomPath, "history");
      addDoc(hiscoll, {
        rid: userUid,
        cid: null,
        date: serverTimestamp(),
        data: stringData,
      })
      console.log('save history')
      resolve();
    }
    catch (error) {
      console.log(error);
    }
  })
}