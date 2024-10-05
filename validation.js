// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js";

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
const storage = getStorage(app);
const provider = new GoogleAuthProvider();

const form = document.getElementById('form');
const firstname_input = document.getElementById('firstname-input');
const email_input = document.getElementById('email-input');
const password_input = document.getElementById('password-input');
const repeat_password_input = document.getElementById('repeat-password-input');
const error_message = document.getElementById('error-message');
const signInGoogle = document.getElementById('signupwithGoogle');
const imageDisplay = document.getElementById('imageDisplay');
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  let errors = [];

  if (firstname_input) {
    errors = getSignupFormErrors(firstname_input.value, email_input.value, password_input.value, repeat_password_input.value);
  } else {
    errors = getLoginFormErrors(email_input.value, password_input.value);
  }
  if (errors.length > 0) {
    error_message.innerText = errors.join(". ");
    return;
  }

  // Sign up process
  if (firstname_input) {
    const signUpEmail = email_input.value;
    const signUpPassword = password_input.value;
    const name = firstname_input.value;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, signUpEmail, signUpPassword);
      const user = userCredential.user;

      alert('Your account has been created.');

      // Store user data in Firestore
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, { name: name, email: signUpEmail });

      alert("Please log in to continue.");
    } catch (error) {
      console.error('Error during sign-up:', error);
      alert('Sign up failed: ' + error.message);
    }
  }

  // Login
  else {
    const signInEmail = email_input.value;
    const signInPassword = password_input.value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, signInEmail, signInPassword);
      const user = userCredential.user;
      alert(`You have signed in successfully!`);

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userNameFromDB = userDoc.data().name;
        alert(`Welcome back, ${userNameFromDB}!`);

        const profilePictureUrl = userDoc.data().profilePicture;

        // Show wrapper-2 and hide wrapper-1 after login
        document.querySelector('.wrapper-1').style.display = 'none';
        document.querySelector('.wrapper-2').style.display = 'flex';

        if (profilePictureUrl) {
          imageDisplay.src = profilePictureUrl;
        }
        uploadBtn.style.display = "block";
      } else {
        alert("User data not found.");
      }
    } catch (error) {
      alert(`${error.code}: ${error.message}`);
    }
  }
});

// Upload profile picture
const uploadProfilePicture = async () => {
  const file = fileInput.files[0];
  const user = auth.currentUser;

  if (file) {
    const storageRef = ref(storage, `profilePictures/${user.uid}/${file.name}`);
    try {
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      // Update Firestore with the new profile picture URL
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, { profilePicture: downloadURL }, { merge: true });

      imageDisplay.src = downloadURL; // Show the uploaded image

      alert("Profile picture uploaded successfully!");
      document.querySelector('.userMainLink').style.display = "block";
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      alert("Profile picture upload failed: " + error.message);
    }
  } else {
    alert("Please select an image to upload.");
  }
}

uploadBtn.addEventListener('click', uploadProfilePicture);

// Form error validation
function getSignupFormErrors(firstname, email, password, repeatPassword) {
  let errors = [];
  if (!firstname) {
    errors.push('Firstname is required');
    firstname_input.parentElement.classList.add('incorrect');
  }
  if (!email) {
    errors.push('Email is required');
    email_input.parentElement.classList.add('incorrect');
  }
  if (!password) {
    errors.push('Password is required');
    password_input.parentElement.classList.add('incorrect');
  }
  if (password.length < 8) {
    errors.push('Password must have at least 8 characters');
    password_input.parentElement.classList.add('incorrect');
  }
  if (password !== repeatPassword) {
    errors.push('Password does not match repeated password');
    password_input.parentElement.classList.add('incorrect');
    repeat_password_input.parentElement.classList.add('incorrect');
  }
  return errors;
}

function getLoginFormErrors(email, password) {
  let errors = [];
  if (!email) {
    errors.push('Email is required');
    email_input.parentElement.classList.add('incorrect');
  }
  if (!password) {
    errors.push('Password is required');
    password_input.parentElement.classList.add('incorrect');
  }
  return errors;
}

// Input validation on change
const allInputs = [firstname_input, email_input, password_input, repeat_password_input].filter(input => input != null);

allInputs.forEach(input => {
  input.addEventListener('input', () => {
    if (input.parentElement.classList.contains('incorrect')) {
      input.parentElement.classList.remove('incorrect');
      error_message.innerText = '';
    }
  });
});


// Google Sign-In
signInGoogle.addEventListener('click', async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    alert(`You have signed in with Google successfully!`);

    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      const userNameFromDB = userDoc.data().name;
      const profilePictureUrl = userDoc.data().profilePicture;

      alert(`Welcome back, ${userNameFromDB}!`);

      document.querySelector('.wrapper-1').style.display = 'none';
      document.querySelector('.wrapper-2').style.display = 'flex';
    } else {
      alert("User data not found, creating a new user in Firestore.");
      await setDoc(userDocRef, { name: user.displayName, email: user.email, profilePicture: user.photoURL });

      alert("New user created in Firestore.");
    }
  } catch (error) {
    console.error("Error signing in with Google:", error);
    alert("Google sign-in failed: " + error.message);
  }
});

// Logout function
const logoutButton = document.getElementById('logout');
logoutButton.addEventListener('click', () => {
  signOut(auth).then(() => {
    alert('You have signed out successfully!');
    document.querySelector('.wrapper-1').style.display = 'flex';
    document.querySelector('.wrapper-2').style.display = 'none';
  }).catch((error) => {
    console.error('Error signing out:', error);
  });
});

// Elements
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskDate = document.getElementById('task-date');
const taskList = document.getElementById('task-list');

// Event Listeners
taskForm.addEventListener('submit', addTask);

// Add Task Function
async function addTask(e) {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) return alert("You must be logged in to add tasks.");

  const task = {
    title: taskInput.value,
    date: taskDate.value,
    completed: false,
  };

  try {
    const userDocRef = doc(db, "users", user.uid);
    await updateDoc(userDocRef, {
      tasks: firebase.firestore.FieldValue.arrayUnion(task)
    });
    taskInput.value = '';
    taskDate.value = '';
    displayTasks(user.uid);
  } catch (error) {
    console.error("Error adding task:", error);
  }
}

// Display Tasks
async function displayTasks(userId) {
  const userDocRef = doc(db, "users", userId);
  const userDoc = await getDoc(userDocRef);
  if (userDoc.exists()) {
    const tasks = userDoc.data().tasks || [];
    taskList.innerHTML = '';
    tasks.forEach((task, index) => {
      const li = document.createElement('li');
      li.innerHTML = `
                <span class="${task.completed ? 'completed' : ''}">${task.title} - ${task.date}</span>
                <button onclick="toggleTask(${index})">${task.completed ? 'Undo' : 'Complete'}</button>
            `;
      taskList.appendChild(li);
    });
  }
}

// Toggle Task Completion
async function toggleTask(index) {
  const user = auth.currentUser;
  if (!user) return alert("You must be logged in to modify tasks.");

  const userDocRef = doc(db, "users", user.uid);
  const userDoc = await getDoc(userDocRef);
  const tasks = userDoc.data().tasks || [];

  if (tasks[index]) {
    tasks[index].completed = !tasks[index].completed; // Toggle completion
    await updateDoc(userDocRef, {
      tasks: tasks
    });
    displayTasks(user.uid); // Refresh task display
  }
}

// Auth state change listener
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('User is signed in:', user);
    displayTasks(user.uid); // Load tasks when user is signed in
  } else {
    console.log('No user is signed in.');
  }
});

