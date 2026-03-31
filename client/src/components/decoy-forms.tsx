import { useEffect, useState } from "react";

/**
 * SECURITY COMPONENT: DecoyForms
 * 
 * Renders hidden inputs with realistic names to confuse automated scrapers and bots.
 * Uses randomization to prevent pattern matching.
 * 
 * Styles: Opacity 0, pointer-events none to be invisible to humans but visible to DOM parsers.
 */
export function DecoyForms() {
  const [randomId, setRandomId] = useState("");

  useEffect(() => {
    setRandomId(Math.random().toString(36).substring(7));
  }, []);

  if (!randomId) return null; // Wait for client-side hydration for randomization

  return (
    <div 
      aria-hidden="true" 
      className="fixed top-0 left-0 w-0 h-0 overflow-hidden opacity-0 pointer-events-none -z-50"
    >
      {/* Decoy Login Form */}
      <form action="/fake-login-endpoint" method="post">
        <input type="email" name={`user_email_${randomId}`} tabIndex={-1} autoComplete="off" />
        <input type="password" name={`user_pass_${randomId}`} tabIndex={-1} autoComplete="off" />
        <input type="text" name="ssn_field" tabIndex={-1} />
        <button type="submit" tabIndex={-1}>Login</button>
      </form>

      {/* Decoy Admin Access */}
      <div id={`admin-panel-${randomId}`}>
        <input type="text" name="admin_key" placeholder="Admin API Key" tabIndex={-1} />
      </div>
    </div>
  );
}
