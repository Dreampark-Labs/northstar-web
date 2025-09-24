'use client';

import { useSignUp } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function CustomSignUp() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [code, setCode] = useState('');
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Add retry logic for Clerk operations
  const retryOperation = async (operation: () => Promise<any>, maxRetries = 3, delay = 2000) => {
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
            throw new Error('Service is temporarily rate limited. Please wait a few minutes and try again.');
          }
          throw error;
        }
        
        // For rate limits, use longer delays
        const waitTime = isRateLimit ? delay * Math.pow(2, i) : delay;
        console.log(`Waiting ${waitTime}ms before retry ${i + 2}...`);
        
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  };

  // Add debug function to inspect Clerk objects
  const debugClerkState = (signUpObject: any, label: string) => {
    console.log(`=== ${label} DEBUG ===`);
    console.log('Status:', signUpObject.status);
    console.log('Missing fields:', signUpObject.missingFields);
    console.log('Unverified fields:', signUpObject.unverifiedFields);
    console.log('Created session ID:', signUpObject.createdSessionId);
    console.log('Unsafe metadata:', signUpObject.unsafeMetadata);
    console.log('Full object keys:', Object.keys(signUpObject));
    console.log('Full object:', JSON.stringify(signUpObject, null, 2));
    console.log(`=== END ${label} DEBUG ===`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !legalAccepted || isSubmitting) return;

    setIsSubmitting(true);

    try {
      console.log('Starting sign-up process...');
      
      const legalMetadata = {
        legal_accepted_at: Date.now(),
        terms_accepted: true,
        privacy_policy_accepted: true,
        eula_accepted: true,
        legal_accepted: true,
        // Try additional legal fields that Clerk might expect
        privacy_accepted: true,
        terms_of_service_accepted: true,
        end_user_license_agreement_accepted: true,
        legal_consent_given: true,
        legal_agreement_timestamp: Date.now(),
      };
      
      console.log('Legal metadata to be sent:', JSON.stringify(legalMetadata, null, 2));
      
      // Create the sign-up with legal metadata from the start
      const result = await retryOperation(async () => {
        return await signUp.create({
          emailAddress: email,
          password,
          firstName,
          lastName,
          unsafeMetadata: legalMetadata,
        });
      });

      console.log('Sign-up creation result:', result);
      console.log('Sign-up creation status:', result.status);
      debugClerkState(result, 'AFTER_SIGNUP_CREATE');

      // Send the email verification code
      await retryOperation(async () => {
        return await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      });
      setPendingVerification(true);
    } catch (error) {
      console.error('Error during sign-up:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || isSubmitting) return;

    setIsSubmitting(true);

    try {
      console.log('Attempting verification...');
      
      const completeSignUp = await retryOperation(async () => {
        return await signUp.attemptEmailAddressVerification({
          code,
        });
      });

      console.log('Verification result:', completeSignUp);
      console.log('Verification status:', completeSignUp.status);
      console.log('Unverified fields:', completeSignUp.unverifiedFields);
      console.log('Missing fields:', completeSignUp.missingFields);
      console.log('Missing fields details:', JSON.stringify(completeSignUp.missingFields, null, 2));
      debugClerkState(completeSignUp, 'AFTER_VERIFICATION_ATTEMPT');

      if (completeSignUp.status === 'complete') {
        console.log('Verification complete, setting active session...');
        await retryOperation(async () => {
          return await setActive({ session: completeSignUp.createdSessionId });
        });
        router.push('/app/v1/dashboard');
      } else if (completeSignUp.status === 'missing_requirements') {
        console.log('Missing requirements detected');
        console.log('Missing fields:', completeSignUp.missingFields);
        console.log('Unverified fields:', completeSignUp.unverifiedFields);

        // Try to update with missing legal fields
        console.log('Attempting to update with missing legal fields...');
        console.log('Specific missing fields:', JSON.stringify(completeSignUp.missingFields, null, 2));
        
        const updateMetadata = {
          legal_accepted_at: Date.now(),
          terms_accepted: true,
          privacy_policy_accepted: true,
          eula_accepted: true,
          legal_accepted: true,
          // Try additional legal fields that Clerk might expect
          privacy_accepted: true,
          terms_of_service_accepted: true,
          end_user_license_agreement_accepted: true,
          legal_consent_given: true,
          legal_agreement_timestamp: Date.now(),
        };
        
        console.log('Update metadata to be sent:', JSON.stringify(updateMetadata, null, 2));
        
        try {
          const updateResult = await retryOperation(async () => {
            return await signUp.update({
              unsafeMetadata: updateMetadata,
            });
          });

          console.log('Update result:', updateResult);
          console.log('Update status:', updateResult.status);
          console.log('Update session ID:', updateResult.createdSessionId);
          debugClerkState(updateResult, 'AFTER_METADATA_UPDATE');

          if (updateResult.status === 'complete') {
            console.log('Update completed, setting active session...');
            await retryOperation(async () => {
              return await setActive({ session: updateResult.createdSessionId });
            });
            router.push('/app/v1/dashboard');
          } else {
            console.log('Update did not complete, status:', updateResult.status);
            console.log('Checking if we can still proceed...');
            
            // Try to manually complete the sign-up again
            try {
              console.log('Attempting final verification with comprehensive legal metadata...');
              
              // First, try to update the sign-up with even more comprehensive legal data
              const comprehensiveMetadata = {
                ...updateMetadata,
                // Add timestamp as string as well (in case format matters)
                legal_accepted_at_iso: new Date().toISOString(),
                legal_accepted_at_epoch: Date.now(),
                // Add consent tracking
                consent_version: "1.0",
                consent_ip: "localhost", // In production, you'd get the real IP
                consent_user_agent: navigator.userAgent,
                // Specific legal document acknowledgments
                terms_version: "1.0",
                privacy_version: "1.0", 
                eula_version: "1.0",
              };
              
              console.log('Trying comprehensive metadata update...');
              try {
                await signUp.update({
                  unsafeMetadata: comprehensiveMetadata,
                });
              } catch (updateError) {
                console.log('Comprehensive metadata update failed, continuing with verification...', updateError);
              }
              
              const finalAttempt = await signUp.attemptEmailAddressVerification({
                code,
              });
              
              console.log('Final attempt result:', finalAttempt);
              
              if (finalAttempt.createdSessionId) {
                console.log('Found session ID, setting active...');
                await retryOperation(async () => {
                  return await setActive({ session: finalAttempt.createdSessionId });
                });
                router.push('/app/v1/dashboard');
              } else if (finalAttempt.status === 'complete') {
                // Sometimes the session ID might not be immediately available
                console.log('Sign-up completed, attempting to create session...');
                // Try a slight delay and then redirect to sign-in
                setTimeout(() => {
                  router.push('/sign-in?message=signup-complete');
                }, 1000);
              } else {
                console.log('No session ID found, trying alternative approach...');
                
                // Alternative approach: try to force session creation
                try {
                  console.log('Attempting to create session manually...');
                  
                  // Check if there's a session available in the current sign-up object
                  if (signUp.createdSessionId) {
                    console.log('Found session ID in main signUp object:', signUp.createdSessionId);
                    await retryOperation(async () => {
                      return await setActive({ session: signUp.createdSessionId });
                    });
                    router.push('/app/v1/dashboard');
                    return;
                  }
                  
                  // Check if the user was actually created successfully
                  if (signUp.status === 'complete' || (finalAttempt.status as string) === 'complete') {
                    console.log('User appears to be created, redirecting to sign-in...');
                    router.push('/sign-in?message=signup-complete-please-signin');
                    return;
                  }
                  
                  router.push('/sign-in?message=verification-complete');
                } catch (altError) {
                  console.error('Alternative approach failed:', altError);
                  router.push('/sign-in?message=please-sign-in');
                }
              }
            } catch (finalError) {
              console.error('Final attempt failed:', finalError);
              router.push('/sign-in?message=please-sign-in');
            }
          }
        } catch (updateError) {
          console.error('Error updating metadata:', updateError);
          router.push('/sign-in?message=please-sign-in');
        }
      } else {
        console.log('Unexpected status:', completeSignUp.status);
        // For any other status, redirect to sign-in
        router.push('/sign-in?message=please-sign-in');
      }
    } catch (error) {
      console.error('Error during verification:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  if (pendingVerification) {
    return (
      <div className="mx-auto max-w-md space-y-6 bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Verify your email</h1>
          <p className="mt-2 text-sm text-gray-600">
            We sent a verification code to {email}
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
              Verification code
            </label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter verification code"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Verifying...' : 'Verify email'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-6 bg-white p-8 rounded-lg shadow-lg">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
        <p className="mt-2 text-sm text-gray-600">
          Already have an account?{' '}
          <a href="/sign-in" className="text-blue-600 hover:underline">
            Sign in
          </a>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              First name
            </label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Last name
            </label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>

        <div className="space-y-3">
          <label className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={legalAccepted}
              onChange={(e) => setLegalAccepted(e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              required
            />
            <span className="text-sm text-gray-700">
              I agree to the{' '}
              <a href="/legal/terms" target="_blank" className="text-blue-600 hover:underline">
                Terms of Service
              </a>
              ,{' '}
              <a href="/legal/privacy" target="_blank" className="text-blue-600 hover:underline">
                Privacy Policy
              </a>
              , and{' '}
              <a href="/legal/eula" target="_blank" className="text-blue-600 hover:underline">
                End User License Agreement
              </a>
              .
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={!legalAccepted || isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </div>
  );
}
