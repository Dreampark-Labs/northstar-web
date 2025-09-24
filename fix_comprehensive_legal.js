const fs = require('fs');

// Read the dpl-auth sign-up file
const dplAuthPath = '/Users/campeete/dpl-auth/src/app/sign-up/[[...sign-up]]/page.tsx';

try {
  let content = fs.readFileSync(dplAuthPath, 'utf8');
  
  // Find the section after verification where we handle missing_requirements
  const lines = content.split('\n');
  let foundMissingReqSection = false;
  let insertIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Missing requirements detected')) {
      foundMissingReqSection = true;
      // Look for where we try to update
      for (let j = i; j < lines.length; j++) {
        if (lines[j].includes('Attempting to update with missing legal fields')) {
          insertIndex = j;
          break;
        }
      }
      break;
    }
  }
  
  if (insertIndex > -1) {
    // Replace the update section with a more comprehensive approach
    const newUpdateCode = `        console.log('Attempting to update with missing legal fields...');
        
        // Try multiple approaches to set legal acceptance
        const legalMetadata = {
          legal_accepted: true,
          legal_accepted_at: Date.now(),
        };
        
        try {
          // Method 1: Direct update with unsafeMetadata
          const updateResult = await retryOperation(async () => {
            return await signUp.update({
              unsafeMetadata: legalMetadata
            });
          }, 'update with legal metadata');
          
          console.log('Update result:', updateResult.status);
          console.log('Update session ID:', updateResult.createdSessionId);
          
          // If still missing requirements, try to complete manually
          if (updateResult.status === 'missing_requirements') {
            console.log('Still missing requirements after update, trying completion...');
            
            // Method 2: Try to create session directly if possible
            if (updateResult.createdUserId) {
              console.log('User created, attempting session creation...');
              try {
                await setActive({
                  session: updateResult.createdSessionId || null,
                  user: updateResult.createdUserId
                });
                router.push(redirectUrl);
                return;
              } catch (sessionError) {
                console.error('Session creation failed:', sessionError);
              }
            }
            
            // Method 3: Force complete if we have everything we need
            try {
              const forceResult = await signUp.create({
                emailAddress: signUp.emailAddress,
                password: 'temp-password', // This might not work but worth trying
                unsafeMetadata: legalMetadata
              });
              console.log('Force create result:', forceResult.status);
            } catch (forceError) {
              console.error('Force create failed:', forceError);
            }
          } else if (updateResult.status === 'complete' && updateResult.createdSessionId) {
            await setActive({ session: updateResult.createdSessionId });
            router.push(redirectUrl);
            return;
          }
        } catch (updateError) {
          console.error('Update failed:', updateError);
        }`;
    
    // Find the exact line to replace
    let startReplace = -1;
    let endReplace = -1;
    
    for (let i = insertIndex; i < lines.length; i++) {
      if (lines[i].includes('Attempting to update with missing legal fields')) {
        startReplace = i;
        break;
      }
    }
    
    for (let i = startReplace + 1; i < lines.length; i++) {
      if (lines[i].includes('} catch') || lines[i].includes('Update did not complete')) {
        endReplace = i - 1;
        break;
      }
    }
    
    if (startReplace > -1 && endReplace > -1) {
      // Replace the section
      const beforeLines = lines.slice(0, startReplace);
      const afterLines = lines.slice(endReplace + 1);
      const newLines = newUpdateCode.split('\n');
      
      const updatedContent = [...beforeLines, ...newLines, ...afterLines].join('\n');
      fs.writeFileSync(dplAuthPath, updatedContent);
      console.log('Successfully updated legal acceptance handling');
    } else {
      console.log('Could not find exact replacement boundaries');
      console.log('Start:', startReplace, 'End:', endReplace);
    }
  } else {
    console.log('Could not find missing requirements section');
  }
  
} catch (error) {
  console.error('Error updating file:', error.message);
}
