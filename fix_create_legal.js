const fs = require('fs');

// Read the dpl-auth sign-up file
const dplAuthPath = '/Users/campeete/dpl-auth/src/app/sign-up/[[...sign-up]]/page.tsx';

try {
  let content = fs.readFileSync(dplAuthPath, 'utf8');
  
  // Find the signUp.create call and add legal metadata there too
  const createPattern = /const result = await signUp\.create\(\{([^}]+)\}\);/;
  
  if (content.match(createPattern)) {
    content = content.replace(createPattern, (match, params) => {
      // Check if unsafeMetadata is already there
      if (params.includes('unsafeMetadata')) {
        return match; // Already has metadata
      } else {
        // Add unsafeMetadata to the create call
        const newParams = params.trim() + `,
          unsafeMetadata: {
            legal_accepted: true,
            legal_accepted_at: Date.now(),
          }`;
        return `const result = await signUp.create({${newParams}});`;
      }
    });
    
    fs.writeFileSync(dplAuthPath, content);
    console.log('Added legal metadata to signUp.create call');
  } else {
    console.log('signUp.create pattern not found');
    
    // Look for create calls in general
    const matches = content.match(/signUp\.create\([^)]*\)/g);
    if (matches) {
      console.log('Found signUp.create calls:');
      matches.forEach((match, index) => {
        console.log(`${index + 1}: ${match}`);
      });
    }
  }
  
} catch (error) {
  console.error('Error updating file:', error.message);
}
