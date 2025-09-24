import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    });
  }

  // Get the body
  const payload = await req.text();
  const body = JSON.parse(payload);

  // Get the CLERK_WEBHOOK_SECRET
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('CLERK_WEBHOOK_SECRET not found, skipping webhook verification');
    // For development, we'll just process the webhook without verification
    // In production, you should add the webhook secret
  }

  let evt: WebhookEvent;

  // Verify the payload with the headers
  if (WEBHOOK_SECRET) {
    try {
      const wh = new Webhook(WEBHOOK_SECRET);
      evt = wh.verify(payload, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return new Response('Error occured', {
        status: 400
      });
    }
  } else {
    // For development without webhook secret
    evt = body as WebhookEvent;
  }

  // Get the ID and type
  const { id } = evt.data;
  const eventType = evt.type;

  console.log(`Webhook with an ID of ${id} and type of ${eventType}`);
  console.log('Webhook body:', body);

  // Handle the user.created event
  if (eventType === 'user.created') {
    const userData = evt.data;
    
    console.log('User created event received:', userData);
    
    // Check if legal acceptance metadata is present
    const unsafeMetadata = userData.unsafe_metadata || {};
    const legalAcceptedAt = unsafeMetadata.legal_accepted_at;
    
    if (!legalAcceptedAt) {
      console.log('Legal acceptance metadata missing, updating user...');
      
      // Update the user with legal acceptance if it's missing
      try {
        // You would typically use Clerk's admin API here to update the user
        // For now, we'll just log that we need to update
        console.log('User needs legal acceptance update:', userData.id);
        
        // If you have Clerk's admin API configured, you can update the user here:
        // await clerkClient.users.updateUser(userData.id, {
        //   unsafeMetadata: {
        //     ...unsafeMetadata,
        //     legal_accepted_at: Date.now(),
        //     terms_accepted: true,
        //     privacy_policy_accepted: true,
        //     eula_accepted: true,
        //   }
        // });
        
      } catch (error) {
        console.error('Error updating user legal metadata:', error);
      }
    } else {
      console.log('User already has legal acceptance metadata:', legalAcceptedAt);
    }
  }

  return NextResponse.json({ message: 'Webhook processed successfully' });
}
