import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error: any) {
      setError(error.message);
      setLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      return true;
    } catch (error: any) {
      setError(error.message);
      return false;
    }
  };

  // Check if user is staff (you can customize this logic)
  const isStaff = user?.email?.includes('@crestofthewave.org') || false;

  return {
    user,
    loading,
    error,
    signIn,
    logout,
    isStaff,
    isAuthenticated: !!user,
  };
}; 