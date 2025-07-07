// src/TermsScreen.js
import { supabase } from '../supabaseClient';

export default function TermsScreen({ user, accepted, onAccepted }) {
  const handleAccept = async () => {
    const { error } = await supabase
      .from('user_profiles')
      .update({ terms_accepted: true })
      .eq('id', user.id);

    if (!error) {
      onAccepted();
    } else {
      alert('Failed to update terms acceptance.');
    }
  };

  return (
    <div className="App">
      <h2>Terms & Conditions</h2>
      <p>
        By using this app, you agree not to leak, screenshot, redistribute, or misuse any content inside this preview.
        This content is private and shared only with trusted users.
      </p>

      {!accepted && <button onClick={handleAccept}>I Agree</button>}
      {accepted && <p style={{ color: 'green' }}>You already accepted the terms. Redirecting...</p>}
    </div>
  );
}
