const fs = require('fs');

// Read the dpl-auth sign-up file
const dplAuthPath = '/Users/campeete/dpl-auth/src/app/sign-up/[[...sign-up]]/page.tsx';

try {
  let content = fs.readFileSync(dplAuthPath, 'utf8');
  
  // Look for the attemptEmailAddressVerification call and modify it
  // Instead of just setting unsafeMetadata, we need to use Clerk's proper API
  
  const oldPattern = /const result = await signUp\.attemptEmailAddressVerification\(\{\s*code,?\s*\}\);/;
  const newPattern = `const result = await signUp.attemptEmailAddressVerification({
            code,
          });
          
          // Set legal acceptance directly on the sign-up object
          if (result.status === 'missing_requirements' && result.missingFields?.includes('legal_accepted')) {
            console.log('Setting legal acceptance directly...');
            try {
              const updateResult = await signUp.update({
                unsafeMetadata: {
                  legal_accepted: true,
                  legal_accepted_at: Date.now(),
                }
              });
              console.log('Legal update result:', updateResult.status);
              
              // Try to complete the sign-up after setting legal acceptance
              if (updateResult.status === 'complete') {
                result = updateResult;
              }
            } catch (legalError) {
              console.error('Error setting legal acceptance:', legalError);
            }
          }`;
  
  if (content.match(oldPattern)) {
    content = content.replace(oldPattern, newPattern);
    fs.writeFileSync(dplAuthPath, content);
    console.log('Updated legal acceptance handling in dpl-auth');
  } else {
    console.log('Pattern not found, checking current structure...');
    // Look for any attemptEmailAddressVerification calls
    const matches = content.match(/attemptEmailAddressVerification[^}]*}/g);
    if (matches) {
      console.log('Found attemptEmailAddressVerification calls:');
      matches.forEach((match, index) => {
        console.log(`${index + 1}: ${match}`);
      });
    }
  }
} catch (error) {
  console.error('Error updating file:', error.message);
}
