const fs = require('fs');

// Read the dpl-auth sign-up file
const dplAuthPath = '/Users/campeete/dpl-auth/src/app/sign-up/[[...sign-up]]/page.tsx';

try {
  let content = fs.readFileSync(dplAuthPath, 'utf8');
  
  // Find the update call and modify it to include legalAcceptedAt
  const updatePattern = /await signUp\.update\(\{[\s\S]*?unsafeMetadata:[\s\S]*?\}\)/;
  
  if (content.match(updatePattern)) {
    content = content.replace(updatePattern, (match) => {
      // Add legalAcceptedAt to the update call
      return match.replace(/\{[\s\S]*?unsafeMetadata:/, `{
            legalAcceptedAt: new Date(),
            unsafeMetadata:`);
    });
    
    fs.writeFileSync(dplAuthPath, content);
    console.log('Added legalAcceptedAt to update call');
  } else {
    console.log('Update pattern not found');
    
    // Look for update calls
    const matches = content.match(/signUp\.update\([^)]*\)/g);
    if (matches) {
      console.log('Found signUp.update calls:');
      matches.forEach((match, index) => {
        console.log(`${index + 1}: ${match.substring(0, 100)}...`);
      });
    }
  }
  
} catch (error) {
  console.error('Error updating file:', error.message);
}
