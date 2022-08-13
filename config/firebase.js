import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import Constants from 'expo-constants';
import { getFirestore } from "firebase/firestore"
import 'firebase/firestore'
// import firebase from 'firebase/app';
// import 'firebase/firestore';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// add firebase config
const firebaseConfig = {
  apiKey: Constants.manifest.extra.apiKey,
  authDomain: Constants.manifest.extra.authDomain,
  projectId: Constants.manifest.extra.projectId,
  storageBucket: Constants.manifest.extra.storageBucket,
  messagingSenderId: Constants.manifest.extra.messagingSenderId,
  appId: Constants.manifest.extra.appId
};

// initialize firebase
const app = firebase.initializeApp(firebaseConfig);
firebase.firestore().settings({experimentalForceLongPolling: true});

// initialize auth
const auth = getAuth();
export const db = getFirestore(app);


export { auth };