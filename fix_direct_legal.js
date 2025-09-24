const fs = require('fs');

// Read the dpl-auth sign-up file
const dplAuthPath = '/Users/campeete/dpl-auth/src/app/sign-up/[[...sign-up]]/page.tsx';

try {
  let content = fs.readFileSync(dplAuthPath, 'utf8');
  
  // Add a more direct approach - try to set legalAcceptedAt directly on the signUp object
  const pattern = /console\.log\('Missing requirements detected'\);/;
  
  if (content.match(pattern)) {
    content = content.replace(pattern, `console.log('Missing requirements detected');
        
        // Try to set legal acceptance using Clerk's direct API
        try {
          console.log('Attempting direct legal acceptance...');
          
          // Set legalAcceptedAt directly if the property exists
          if ('legalAcceptedAt' in signUp) {
            console.log('Setting legalAcceptedAt directly on signUp object');
            (signUp as any).legalAcceptedAt = new Date();
          }
          
          // Also try using the upsert method if available
          if (typeof signUp.upsert === 'function') {
            console.log('Attempting upsert method...');
            const upsertResult = await signUp.upsert({
              legalAcceptedAt: new Date(),
              unsafeMetadata: {
                legal_accepted: true,
                legal_accepted_at: Date.now(),
              }
            });
            console.log('Upsert result:', upsertResult.status);
          }
          
        } catch (directError) {
          console.error('Direct legal acceptance failed:', directError);
        }`);
    
    fs.writeFileSync(dplAuthPath, content);
    console.log('Added direct legal acceptance attempt');
  } else {
    console.log('Pattern not found for missing requirements');
  }
  
} catch (error) {
  console.error('Error updating file:', error.message);
}
