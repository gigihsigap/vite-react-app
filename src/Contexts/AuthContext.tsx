import React, { useContext, useState, useEffect } from 'react'
import { auth } from '../firebase'
import {
  GoogleAuthProvider,
  signInWithPopup,
  GithubAuthProvider,
} from 'firebase/auth'

interface IAuthProviderProps {
  children: JSX.Element
}

const AuthContext = React.createContext({})

export function useAuth(): any {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: IAuthProviderProps): JSX.Element {
  const [currentUser, setCurrentUser] = useState<any>()
  const [loading, setLoading] = useState(true)

  async function signup(email: string,  username: string, password: string) {
    // return auth.createUserWithEmailAndPassword(email, password)
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const uid = userCredential.user?.uid;

      // Send a request to your backend server to create a user record in Postgres
      const response = await fetch(`${import.meta.env.VITE_SERVER_BASE_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid,
          username,
          email
          // latestLogin: new Date().toISOString(),
          // softDelete: false,
        }),
      });

      if (response.ok) {
        // User registration successful, handle accordingly
        console.log('User registered successfully!');
      } else {
        // Handle server-side errors
        console.error('Failed to register user');
      }
    } catch {
      // Handle Firebase authentication errors
      console.error('Error registering user');
    }
  }

  function googleSignin(): Promise<any> {
    const provider = new GoogleAuthProvider()
    return signInWithPopup(auth, provider)
  }

  function githubSignin(): Promise<any> {
    const provider = new GithubAuthProvider()
    return signInWithPopup(auth, provider)
  }

  function login(email: string, password: string): Promise<any> {
    return auth.signInWithEmailAndPassword(email, password)
  }

  function logout(): Promise<any> {
    return auth.signOut()
  }

  function resetPassword(email: string): Promise<any> {
    return auth.sendPasswordResetEmail(email)
  }

  function updateEmail(email: string): Promise<any> {
    return currentUser.updateEmail(email)
  }

  function updatePassword(password: string): Promise<any> {
    return currentUser.updatePassword(password)
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = {
    currentUser,
    login,
    signup,
    googleSignin,
    githubSignin,
    logout,
    resetPassword,
    updateEmail,
    updatePassword,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
