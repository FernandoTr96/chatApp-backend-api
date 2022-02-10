const { initializeApp } = require('firebase/app');
const { getStorage,ref } = require('firebase/storage');

// Set the configuration for your app
// TODO: Replace with your app's config object
const firebaseConfig = {
    apiKey: process.env.FIREBASE_KEY,
    authDomain: "chatapp-32c8c.firebaseapp.com",
    projectId: "chatapp-32c8c",
    storageBucket: "chatapp-32c8c.appspot.com",
    messagingSenderId: "681933136290",
    appId: "1:681933136290:web:61b1f0e548f4d2165ed2fb",
    measurementId: "G-SRWKEG9X44"
};
const firebaseApp = initializeApp(firebaseConfig);

// Get a reference to the storage service, which is used to create references in your storage bucket
const storage = getStorage(firebaseApp);
const storageRef = ref(storage);

module.exports = {
    storage,
    storageRef,
    firebaseApp
}

