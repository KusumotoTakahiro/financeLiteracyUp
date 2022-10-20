import { getAuth, onAuthStateChanged } from 'firebase/auth'

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
        reject(error);
      }
    })
  })
}