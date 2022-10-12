import { getAuth, onAuthStateChanged } from 'firebase/auth'

const auth = getAuth();

export const authStateChanged = () => {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        resolve(user);
      }
      else {
        reject(error);
      }
    })
  })
}