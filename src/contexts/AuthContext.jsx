import { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { auth, ALLOWED_EMAILS, USER_DIRECTORY } from '../firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [blocked, setBlocked] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const emailOk = ALLOWED_EMAILS.includes(
          (firebaseUser.email || '').toLowerCase()
        )
        if (!emailOk) {
          setBlocked(true)
          await signOut(auth)
          setUser(null)
        } else {
          setBlocked(false)
          setUser(firebaseUser)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  async function login(username, password) {
    const cleanUsername = username.trim().toLowerCase()
    const email = USER_DIRECTORY[cleanUsername]
    if (!email || !ALLOWED_EMAILS.includes(email)) {
      // Mensagem genérica de propósito — não revela se o usuário existe ou não.
      throw new Error('invalid-login')
    }
    return signInWithEmailAndPassword(auth, email, password)
  }

  async function logout() {
    return signOut(auth)
  }

  return (
    <AuthContext.Provider value={{ user, loading, blocked, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
