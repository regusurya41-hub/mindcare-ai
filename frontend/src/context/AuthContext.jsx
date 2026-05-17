import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';

import { api } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw =
      localStorage.getItem('mindcare_user');

    return raw ? JSON.parse(raw) : null;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token =
      localStorage.getItem('mindcare_token');

    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get('/auth/me')
      .then(({ data }) => {
        localStorage.setItem(
          'mindcare_user',
          JSON.stringify(data.user)
        );

        setUser(data.user);
      })
      .catch(() => {
        localStorage.removeItem(
          'mindcare_token'
        );

        localStorage.removeItem(
          'mindcare_user'
        );

        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  async function authenticate(
    path,
    payload
  ) {
    const { data } = await api.post(
      `/auth/${path}`,
      payload
    );

    localStorage.setItem(
      'mindcare_token',
      data.token
    );

    localStorage.setItem(
      'mindcare_user',
      JSON.stringify(data.user)
    );

    setUser(data.user);

    return data.user;
  }

  function logout() {
    localStorage.removeItem(
      'mindcare_token'
    );

    localStorage.removeItem(
      'mindcare_user'
    );

    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      setUser,
      loading,

      login: (payload) =>
        authenticate('login', payload),

      signup: (payload) =>
        authenticate('signup', payload),

      logout
    }),

    [user, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () =>
  useContext(AuthContext);