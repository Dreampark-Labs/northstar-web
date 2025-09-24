'use client';

import { useSignUp } from '@clerk/nextjs';
import { useSearchParams, useRouter } from 'next/navigation';
// import { getPostAuthUrl } from '@/lib/config';
import { useEffect, useState } from 'react';

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirectUrl = searchParams.get('redirect_url');
  
  // Form state
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Verification state
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');
  
  // Determine the redirect URL after successful sign-up
  const afterSignUpUrl = redirectUrl || 'http://localhost:3001/auth/callback';

  useEffect(() => {
    setMounted(true);
  }, []);

  // Helper function to handle Clerk API errors
  const handleClerkError = (err: any) => {
    console.error('Clerk error details:', err);
    
    // Check for rate limiting
    if (err.message && (err.message.includes('429') || err.message.includes('Rate exceeded'))) {
      return 'Clerk development service rate limit exceeded. Please wait 2-3 minutes and try again.';
    }
    
    // Check for service unavailable
    if (err.message && (err.message.includes('503') || err.message.includes('Service Unavailable'))) {
      return 'Authentication service is temporarily unavailable. Please try again in a few minutes.';
    }
    
    // Check for JSON parsing errors (HTML responses)
    if (err.message && err.message.includes('Unexpected token')) {
      return 'Authentication service error. Please try again or contact support.';
    }
    
    // Network errors
    if (err.message && err.message.includes('Failed to fetch')) {
      return 'Network error. Please check your connection and try again.';
    }
    
    // Default error handling
    return err.errors?.[0]?.message || err.message || 'An unexpected error occurred. Please try again.';
  };

  // Add retry logic for Clerk operations with better rate limit handling
  const retryOperation = async (operation: () => Promise<any>, maxRetries = 5, delay = 3000) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error: any) {
        console.log(`Attempt ${i + 1} failed:`, error);
        
        // Check if it's a rate limit error
        const isRateLimit = error.message && (
          error.message.includes('Rate exceeded') || 
          error.message.includes('429') ||
          error.message.includes('Too many requests')
        );
        
        // If it's the last attempt, throw the error
        if (i === maxRetries - 1) {
          if (isRateLimit) {
            throw new Error('Clerk rate limit exceeded. Please wait a few minutes and try again.');
          }
          throw error;
        }
        
        // For rate limits, use longer delays
        const waitTime = isRateLimit ? delay * Math.pow(3, i) : delay * Math.pow(3, i);
        console.log(`Rate limit detected, waiting ${waitTime}ms before retry ${i + 2}...`);
        
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await retryOperation(async () => {
        return await signUp.create({
          emailAddress,
          password,
          firstName,
          lastName,
          unsafeMetadata: {
            legal_accepted: true,
            terms_accepted: true,
            privacy_accepted: true,
            eula_accepted: true,
            legal_accepted_at: Date.now(),
          }
        });
      });

      console.log('Sign-up creation result:', result);

      // Send verification email with retry
      await retryOperation(async () => {
        return await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      });
      
      setPendingVerification(true);
    } catch (err: any) {
      console.error('Sign-up error:', err);
      setError(handleClerkError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setIsLoading(true);
    setError('');

    try {
      // First attempt verification with the provided code
      let result;
      try {
        result = await retryOperation(async () => {
          return await signUp.attemptEmailAddressVerification({
            code: code.trim(),
          });
        });
      } catch (verificationError: any) {
        console.error('Verification error:', verificationError);
        
        // If verification is already complete, try to get the current sign-up status
        if (verificationError.message && verificationError.message.includes('already been verified')) {
          console.log('Verification already completed, checking current sign-up status...');
          
          // Check the current status of the sign-up
          if (signUp.status === 'complete') {
            result = signUp;
          } else if (signUp.status === 'missing_requirements') {
            console.log('Sign-up has missing requirements, attempting to complete...');
            
            // Try to update with missing legal fields
            try {
              result = await retryOperation(async () => {
                return await signUp.update({
                  unsafeMetadata: {
                    legal_accepted: true,
                    terms_accepted: true,
                    privacy_accepted: true,
                    eula_accepted: true,
                    legal_accepted_at: Date.now(),
                  }
                });
              });
            } catch (updateErr: any) {
              console.error('Error updating with legal fields:', updateErr);
              setError('Account verified but additional setup failed. Please try signing in.');
              return;
            }
          } else {
            // Suggest trying to sign in instead
            setError('This email has already been verified. Please try signing in instead.');
            return;
          }
        } else {
          throw verificationError;
        }
      }

      console.log('Verification result:', result);
      console.log('Verification status:', result.status);
      console.log('Unverified fields:', result.unverifiedFields);
      console.log('Missing fields:', result.missingFields);

      if (result.status === 'complete') {
        console.log('Sign-up complete! Attempting to set active session...');
        
        try {
          // Set the active session with retry
          await retryOperation(async () => {
            return await setActive({ session: result.createdSessionId });
          });
          
          console.log('Session activated successfully');
          
          // Redirect back to main app with success
          const callbackUrl = redirectUrl || 'http://localhost:3001/auth/callback';
          const finalUrl = new URL(callbackUrl);
          finalUrl.searchParams.set('auth_success', 'true');
          
          // Add a small delay to ensure session is fully set
          setTimeout(() => {
            window.location.href = finalUrl.toString();
          }, 500);
          
        } catch (sessionErr: any) {
          console.error('Error setting active session:', sessionErr);
          setError('Sign-up succeeded but failed to activate session. Please try signing in.');
        }
      } else if (result.status === 'missing_requirements') {
        console.log('Missing requirements detected');
        console.log('Missing fields:', result.missingFields);
        console.log('Unverified fields:', result.unverifiedFields);
        
        // Check if we need additional verification
        if (result.unverifiedFields && result.unverifiedFields.length > 0) {
          setError(`Additional verification required for: ${result.unverifiedFields.join(', ')}`);
        } else if (result.missingFields && result.missingFields.length > 0) {
          // Try to update with missing legal fields
          try {
            console.log('Attempting to update with missing legal fields...');
            const updateResult = await retryOperation(async () => {
              return await signUp.update({
                unsafeMetadata: {
                  legal_accepted: true,
                  terms_accepted: true,
                  privacy_accepted: true,
                  eula_accepted: true,
                  legal_accepted_at: Date.now(),
                }
              });
            });
            console.log('Update result:', updateResult);
            console.log('Update status:', updateResult.status);
            console.log('Update session ID:', updateResult.createdSessionId);
            
            if (updateResult.status === 'complete') {
              console.log('Update completed successfully! Setting active session...');
              await retryOperation(async () => {
                return await setActive({ session: updateResult.createdSessionId });
              });
              
              console.log('Session activated after update');
              const callbackUrl = redirectUrl || 'http://localhost:3001/auth/callback';
              const finalUrl = new URL(callbackUrl);
              finalUrl.searchParams.set('auth_success', 'true');
              
              setTimeout(() => {
                window.location.href = finalUrl.toString();
              }, 500);
            } else {
              console.log('Update did not complete, status:', updateResult.status);
              console.log('Checking if we can still proceed...');
              
              // Check if there's a session ID even if status isn't complete
              if (updateResult.createdSessionId) {
                console.log('Found session ID, attempting to activate...');
                try {
                  await retryOperation(async () => {
                    return await setActive({ session: updateResult.createdSessionId });
                  });
                  
                  console.log('Session activated despite incomplete status');
                  const callbackUrl = redirectUrl || 'http://localhost:3001/auth/callback';
                  const finalUrl = new URL(callbackUrl);
                  finalUrl.searchParams.set('auth_success', 'true');
                  
                  setTimeout(() => {
                    window.location.href = finalUrl.toString();
                  }, 500);
                } catch (sessionErr) {
                  console.error('Error activating session:', sessionErr);
                  setError('Account is verified but incomplete. Please try signing in instead.');
                }
              } else {
                console.log('No session ID found, suggesting sign in');
                setError('Account is verified but incomplete. Please try signing in instead.');
              }
            }
          } catch (updateErr: any) {
            console.error('Error updating with legal fields:', updateErr);
            console.log('Rate limit during legal update, trying to proceed anyway...'); 
              if (result.createdSessionId) { 
                try { 
                  await retryOperation(async () => { 
                    return await setActive({ session: result.createdSessionId }); 
                  }); 
                  const callbackUrl = redirectUrl || 'http://localhost:3001/auth/callback'; 
                  const finalUrl = new URL(callbackUrl); 
                  finalUrl.searchParams.set('auth_success', 'true'); 
                  setTimeout(() => { window.location.href = finalUrl.toString(); }, 500); 
                } catch { 
                  setError('Account verification succeeded but additional setup failed. Please try signing in.'); 
                } 
              } else { 
                setError('Account verification succeeded but additional setup failed. Please try signing in.'); 
              };
          }
        } else {
          setError('Account verification succeeded but sign-up is incomplete. Please try signing in.');
        }
      } else {
        console.log('Verification incomplete, status:', result.status);
        // If verification already happened but status is not complete or missing_requirements,
        // suggest signing in instead
        if (result.status === undefined || result.status === null) {
          setError('Account may have been created. Please try signing in instead.');
        } else {
          setError(`Verification failed with status: ${result.status}. Please check your code and try again.`);
        }
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      // Handle specific "already verified" error
      if (err.message && err.message.includes('already been verified')) {
        setError('This email has already been verified. Please try signing in instead.');
      } else {
        setError(handleClerkError(err));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (!isLoaded) return;
    
    setIsLoading(true);
    setError('');

    try {
      await retryOperation(async () => {
        return await signUp.authenticateWithRedirect({
          strategy: 'oauth_google',
          redirectUrl: '/sso-callback',
          redirectUrlComplete: afterSignUpUrl,
        });
      });
    } catch (err: any) {
      setError(handleClerkError(err));
      setIsLoading(false);
    }
  };

  const handleAppleSignUp = async () => {
    if (!isLoaded) return;
    
    setIsLoading(true);
    setError('');

    try {
      await retryOperation(async () => {
        return await signUp.authenticateWithRedirect({
          strategy: 'oauth_apple',
          redirectUrl: '/sso-callback',
          redirectUrlComplete: afterSignUpUrl,
        });
      });
    } catch (err: any) {
      setError(handleClerkError(err));
      setIsLoading(false);
    }
  };

  if (!mounted || !isLoaded) {
    return null; // Prevent hydration mismatch
  }

  // Verification view
  if (pendingVerification) {
    return (
      <div className="modal-overlay">
        <div className="modal-content" style={{ maxWidth: '480px' }}>
          {/* Header Section */}
          <div style={{
            padding: 'var(--space-6)',
            borderBottom: '1px solid var(--color-border)',
            textAlign: 'center'
          }}>
            <h1 style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: '600',
              color: 'var(--color-fg)',
              margin: '0 0 var(--space-2) 0',
              lineHeight: '1.2'
            }}>
              Verify your email
            </h1>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-muted)',
              margin: '0'
            }}>
              We've sent a verification code to {emailAddress}
            </p>
          </div>

          {/* Content Section */}
          <div style={{
            padding: 'var(--space-6)',
            flex: '1',
            minHeight: '0',
            overflowY: 'auto'
          }}>
            {/* CAPTCHA container - Keep available for Clerk */}
            <div id="clerk-captcha" style={{ display: 'none', marginBottom: 'var(--space-4)' }}></div>

            {/* Error Message */}
            {error && (
              <div style={{
                padding: 'var(--space-3) var(--space-4)',
                background: 'var(--color-danger-bg)',
                border: '1px solid var(--color-danger)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: 'var(--space-4)'
              }}>
                <p style={{
                  color: 'var(--color-danger)',
                  fontSize: 'var(--text-sm)',
                  margin: '0'
                }}>
                  {error}
                </p>
              </div>
            )}

            {/* Service Status Warning */}
            <div style={{
              padding: 'var(--space-3) var(--space-4)',
              background: 'var(--color-warning-bg)',
              border: '1px solid var(--color-warning)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: 'var(--space-4)'
            }}>
              <p style={{
                color: 'var(--color-warning-fg)',
                fontSize: 'var(--text-sm)',
                margin: '0'
              }}>
                ℹ️ If verification fails, Clerk's development service may be experiencing rate limits. Please wait a few minutes before retrying.
              </p>
            </div>

            {/* Legal Terms Notice */}
            <div style={{
              padding: 'var(--space-3) var(--space-4)',
              background: 'var(--color-success-bg)',
              border: '1px solid var(--color-success)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: 'var(--space-4)'
            }}>
              <p style={{
                color: 'var(--color-success-fg)',
                fontSize: 'var(--text-sm)',
                margin: '0'
              }}>
                ✓ Terms of Service, Privacy Policy, and EULA automatically accepted
              </p>
            </div>

            {/* Verification Form */}
            <form onSubmit={handleVerification} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--text-sm)',
                  fontWeight: '500',
                  color: 'var(--color-fg)',
                  marginBottom: 'var(--space-2)'
                }}>
                  Verification code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter verification code"
                  required
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--color-fg)',
                    fontSize: 'var(--text-sm)',
                    transition: 'border-color 0.2s ease',
                    opacity: isLoading ? '0.6' : '1'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--color-accent)';
                    e.target.style.boxShadow = '0 0 0 1px var(--color-accent)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--color-border)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !code.trim()}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: isLoading || !code.trim() ? 'var(--color-muted)' : 'var(--color-accent)',
                  color: 'var(--color-accent-fg)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: '500',
                  cursor: isLoading || !code.trim() ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--space-2)'
                }}
              >
                {isLoading ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid transparent',
                      borderTop: '2px solid currentColor',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Verifying...
                  </>
                ) : (
                  'Verify Email'
                )}
              </button>
            </form>
            
            {/* Fallback option */}
            <div style={{ 
              marginTop: 'var(--space-6)',
              padding: 'var(--space-4)',
              background: 'var(--color-bg-subtle)',
              borderRadius: 'var(--radius-sm)',
              textAlign: 'center'
            }}>
              <p style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-muted)',
                margin: '0 0 var(--space-3) 0'
              }}>
                Having trouble? You can also try signing in if your account was created successfully.
              </p>
              <button
                onClick={() => {
                  const currentParams = new URLSearchParams(window.location.search);
                  window.location.href = `/sign-in?${currentParams.toString()}`;
                }}
                style={{
                  padding: 'var(--space-2) var(--space-4)',
                  background: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--color-fg)',
                  fontSize: 'var(--text-sm)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Try Sign In Instead
              </button>
            </div>
          </div>

          {/* Footer Section */}
          <div style={{
            padding: 'var(--space-4) var(--space-6)',
            borderTop: '1px solid var(--color-border)',
            background: 'var(--color-bg-subtle)',
            textAlign: 'center'
          }}>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-muted)',
              margin: '0'
            }}>
              Already have an account?{' '}
              <button 
                onClick={() => { 
                  const currentParams = new URLSearchParams(window.location.search); 
                  window.location.href = `/sign-in?${currentParams.toString()}`; 
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-accent)',
                  cursor: 'pointer',
                  fontSize: 'var(--text-sm)',
                  fontWeight: '500',
                  textDecoration: 'none',
                  padding: '0',
                  margin: '0'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.opacity = '0.8';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main sign-up form
  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '480px' }}>
        {/* Header Section */}
        <div style={{
          padding: 'var(--space-6)',
          borderBottom: '1px solid var(--color-border)',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: '600',
            color: 'var(--color-fg)',
            margin: '0 0 var(--space-2) 0',
            lineHeight: '1.2'
          }}>
            Create Account
          </h1>
          <p style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-muted)',
            margin: '0'
          }}>
            Join Dreampark Labs to get started
          </p>
        </div>

        {/* Content Section */}
        <div style={{
          padding: 'var(--space-6)',
          flex: '1',
          minHeight: '0',
          overflowY: 'auto'
        }}>
          {/* Legal Terms Notice */}
          <div style={{
            padding: 'var(--space-3) var(--space-4)',
            background: 'var(--color-success-bg)',
            border: '1px solid var(--color-success)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: 'var(--space-4)',
            textAlign: 'center'
          }}>
            <p style={{
              color: 'var(--color-success-fg)',
              fontSize: 'var(--text-sm)',
              margin: '0'
            }}>
              ✓ By continuing, you automatically agree to our Terms of Service, Privacy Policy, and End-User License Agreement
            </p>
          </div>

          {/* Social Sign-Up Buttons */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-6)' 
          }}>
            <button
              onClick={handleAppleSignUp}
              disabled={isLoading}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-3)',
                padding: '12px 16px',
                background: 'var(--color-card)',
                color: 'var(--color-fg)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)',
                fontWeight: '500',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? '0.6' : '1',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.borderColor = 'var(--color-border-hover)';
                  e.currentTarget.style.background = 'var(--color-bg-subtle)';
                }
              }}
              onMouseOut={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                  e.currentTarget.style.background = 'var(--color-card)';
                }
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              Continue with Apple
            </button>

            <button
              onClick={handleGoogleSignUp}
              disabled={isLoading}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-3)',
                padding: '12px 16px',
                background: 'var(--color-card)',
                color: 'var(--color-fg)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)',
                fontWeight: '500',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? '0.6' : '1',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.borderColor = 'var(--color-border-hover)';
                  e.currentTarget.style.background = 'var(--color-bg-subtle)';
                }
              }}
              onMouseOut={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                  e.currentTarget.style.background = 'var(--color-card)';
                }
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </div>

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 'var(--space-6)',
            gap: 'var(--space-4)'
          }}>
            <div style={{
              flex: '1',
              height: '1px',
              background: 'var(--color-border)'
            }} />
            <span style={{
              color: 'var(--color-muted)',
              fontSize: 'var(--text-sm)',
              fontWeight: '500'
            }}>
              or
            </span>
            <div style={{
              flex: '1',
              height: '1px',
              background: 'var(--color-border)'
            }} />
          </div>

          {/* CAPTCHA container - Required for Clerk */}
          <div id="clerk-captcha" style={{ marginBottom: 'var(--space-4)' }}></div>

          {/* Error Message */}
          {error && (
            <div style={{
              padding: 'var(--space-3) var(--space-4)',
              background: 'var(--color-danger-bg)',
              border: '1px solid var(--color-danger)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: 'var(--space-4)'
            }}>
              <p style={{
                color: 'var(--color-danger)',
                fontSize: 'var(--text-sm)',
                margin: '0'
              }}>
                {error}
              </p>
            </div>
          )}

          {/* Sign-up Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <div style={{ flex: '1' }}>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--text-sm)',
                  fontWeight: '500',
                  color: 'var(--color-fg)',
                  marginBottom: 'var(--space-2)'
                }}>
                  First name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter first name"
                  autoComplete="given-name"
                  required
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--color-fg)',
                    fontSize: 'var(--text-sm)',
                    transition: 'border-color 0.2s ease',
                    opacity: isLoading ? '0.6' : '1'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--color-accent)';
                    e.target.style.boxShadow = '0 0 0 1px var(--color-accent)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--color-border)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              <div style={{ flex: '1' }}>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--text-sm)',
                  fontWeight: '500',
                  color: 'var(--color-fg)',
                  marginBottom: 'var(--space-2)'
                }}>
                  Last name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter last name"
                  autoComplete="family-name"
                  required
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--color-fg)',
                    fontSize: 'var(--text-sm)',
                    transition: 'border-color 0.2s ease',
                    opacity: isLoading ? '0.6' : '1'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--color-accent)';
                    e.target.style.boxShadow = '0 0 0 1px var(--color-accent)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--color-border)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: 'var(--text-sm)',
                fontWeight: '500',
                color: 'var(--color-fg)',
                marginBottom: 'var(--space-2)'
              }}>
                Email address
              </label>
              <input
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                placeholder="Enter email address"
                autoComplete="email"
                required
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--color-fg)',
                  fontSize: 'var(--text-sm)',
                  transition: 'border-color 0.2s ease',
                  opacity: isLoading ? '0.6' : '1'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--color-accent)';
                  e.target.style.boxShadow = '0 0 0 1px var(--color-accent)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--color-border)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: 'var(--text-sm)',
                fontWeight: '500',
                color: 'var(--color-fg)',
                marginBottom: 'var(--space-2)'
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  required
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    paddingRight: '44px',
                    background: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--color-fg)',
                    fontSize: 'var(--text-sm)',
                    transition: 'border-color 0.2s ease',
                    opacity: isLoading ? '0.6' : '1'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--color-accent)';
                    e.target.style.boxShadow = '0 0 0 1px var(--color-accent)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--color-border)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-muted)',
                    cursor: 'pointer',
                    padding: '4px',
                    fontSize: 'var(--text-xs)'
                  }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !emailAddress || !password || !firstName || !lastName}
              style={{
                width: '100%',
                padding: '14px 16px',
                background: isLoading || !emailAddress || !password || !firstName || !lastName ? 'var(--color-muted)' : 'var(--color-accent)',
                color: 'var(--color-accent-fg)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)',
                fontWeight: '500',
                cursor: isLoading || !emailAddress || !password || !firstName || !lastName ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-2)'
              }}
            >
              {isLoading ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid transparent',
                    borderTop: '2px solid currentColor',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        </div>

        {/* Footer Section */}
        <div style={{
          padding: 'var(--space-4) var(--space-6)',
          borderTop: '1px solid var(--color-border)',
          background: 'var(--color-bg-subtle)',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-muted)',
            margin: '0'
          }}>
            Already have an account?{' '}
            <button 
              onClick={() => { 
                const currentParams = new URLSearchParams(window.location.search); 
                window.location.href = `/sign-in?${currentParams.toString()}`; 
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-accent)',
                cursor: 'pointer',
                fontSize: 'var(--text-sm)',
                fontWeight: '500',
                textDecoration: 'none',
                padding: '0',
                margin: '0'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.opacity = '0.8';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
