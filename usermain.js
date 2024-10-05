import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDw09H2-C61eCXH1F8QV6vCuba2HHXUNEY",
  authDomain: "fir-auth-8375a.firebaseapp.com",
  projectId: "fir-auth-8375a",
  storageBucket: "fir-auth-8375a.appspot.com",
  messagingSenderId: "127672083049",
  appId: "1:127672083049:web:2c6c7a40e430857eff38f8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Select DOM elements
const userNameElem = document.getElementById('userName');
const userEmailElem = document.getElementById('userEmail');
const userProfilePictureElem = document.getElementById('userProfilePicture');

// Function to get first and last name
function getFirstAndLastName(fullName) {
  const nameParts = fullName.trim().split(' ');
  
  // If there's only one word, return the same word twice (no last name)
  if (nameParts.length === 1) {
    return { firstName: nameParts[0], lastName: nameParts[0] };
  }

  const firstName = nameParts[0]; // First part of the name
  const lastName = nameParts[nameParts.length - 1]; // Last part of the name
  
  return { firstName, lastName };
}

// Listen for auth state changes
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // User is signed in
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const fullName = userData.name || "User";

      // Get first and last name
      const { firstName, lastName } = getFirstAndLastName(fullName);

      // Update the UI with user data
      if ( firstName !== lastName) {
        userNameElem.innerHTML = `${firstName} <br> ${lastName}`;
      } else {
        userNameElem.textContent = `${firstName}`;
      }
      userEmailElem.textContent = user.email || "No email available";
      userProfilePictureElem.src = userData.profilePicture || "../avatar.jpg";
    } else {
      console.log("No such document!");
    }
  } else {
    // No user is signed in
    alert("No user is signed in. Redirecting to login page.");
    window.location.href = 'login.html';
  }
});
