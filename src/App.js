import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import AuthForm from './components/AuthForm';
import TermsScreen from './components/TermsScreen';
import BookPreview from './components/BookPreview';

import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);


  useEffect(() => {
    // Check current session/user
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };

    getSession();

    // Listen for login/logout in real-time
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const checkEmailVerification = async () => {
      if (!user) return;
      const { data, error } = await supabase.auth.getUser();
      if (error) console.error(error);
      const emailVerified = !!data?.user?.email_confirmed_at;
      setIsVerified(emailVerified);
    };

    const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!data && !error) {
      // Insert default profile
      await supabase.from('user_profiles').insert({
        id: user.id,
        email: user.email,
        terms_accepted: false,
      });
      setProfile({ terms_accepted: false });
    } else if (data) {
      setProfile(data);
      setAcceptedTerms(data.terms_accepted);
    }
  };

  if (user) {
    checkEmailVerification();
    fetchProfile();
  }


    checkEmailVerification();
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsVerified(false);
  };

  if (loading) return <p>Loading...</p>;

  if (!user) {
    return (
      <div className="App">
        <h1>📘 Private Book App</h1>
        <AuthForm />
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="App">
        <h2>Please verify your email</h2>
        <p>Check your inbox and click the confirmation link.</p>
        <button onClick={handleLogout}>Log Out</button>
      </div>
    );
  }

    if (!acceptedTerms) {
      return <TermsScreen user={user} accepted={false} onAccepted={() => setAcceptedTerms(true)} />;
    }

    // Show T&C briefly even after acceptance
    if (user && isVerified && acceptedTerms && !profile?.shownTnC) {
      setTimeout(() => {
        setProfile((prev) => ({ ...prev, shownTnC: true }));
      }, 2000);

      return <TermsScreen user={user} accepted={true} onAccepted={() => {}} />;
    }

  if (user && isVerified && acceptedTerms) {
      return (
        <>
          <BookPreview />
          <div className="App">
            <button onClick={handleLogout}>Log Out</button>
          </div>
        </>
      );
    }

  return (
    <div className="App">
      <h1>📘 Private Book</h1>
      <p>Welcome! Your email is verified.</p>
      <button onClick={handleLogout}>Log Out</button>
    </div>
  );
}

export default App;
