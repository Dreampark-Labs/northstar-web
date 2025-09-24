"use client";

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

export default function AuthConfigPage() {
  const configSteps = [
    {
      title: "Auth Service Configuration Issue",
      content: "The dpl-auth service (localhost:3002) is not sending user data back to the callback URL."
    },
    {
      title: "Expected Callback URL Format",
      content: "After successful authentication, the auth service should redirect to:",
      code: "http://localhost:3002/auth/callback?token=USER_TOKEN&userId=USER_ID&name=USER_NAME&email=USER_EMAIL"
    },
    {
      title: "Current Configuration",
      content: "When users visit localhost:3002, they are redirected to:",
      code: "http://localhost:3001?redirect_url=http://localhost:3002/auth/callback"
    },
    {
      title: "Required dpl-auth Changes",
      content: "The dpl-auth service needs to:",
      list: [
        "Read the redirect_url parameter",
        "After successful Clerk authentication, extract user data",
        "Redirect back to the callback URL with user data as query parameters",
        "Include: token (JWT), userId, name (optional), email (optional)"
      ]
    },
    {
      title: "Testing Without Fix",
      content: "Until the auth service is fixed, you can:",
      list: [
        "Use the /auth/test page to manually test authentication",
        "Use the /auth/clear-all page to clear sessions",
        "Check /auth/redirect for fallback authentication handling"
      ]
    }
  ];

  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Authentication Configuration Guide
          </h1>
          <p className="text-muted-foreground">
            Configuration needed for dpl-auth service integration
          </p>
        </div>

        <div className="space-y-6">
          {configSteps.map((step, index) => (
            <div key={index} className="bg-card p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-3 text-foreground">
                {index + 1}. {step.title}
              </h2>
              <p className="text-muted-foreground mb-3">
                {step.content}
              </p>
              {step.code && (
                <div className="bg-muted p-3 rounded-md font-mono text-sm mb-3">
                  {step.code}
                </div>
              )}
              {step.list && (
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {step.list.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">
            ⚠️ Current Workaround
          </h3>
          <p className="text-yellow-700 text-sm">
            The authentication flow is currently incomplete because the dpl-auth service
            doesn't send user data back in the callback URL. This needs to be configured
            on the auth service side.
          </p>
        </div>

        <div className="text-center space-x-4">
          <button 
            onClick={() => window.location.href = '/auth/test'}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Test Authentication
          </button>
          <button 
            onClick={() => window.location.href = 'http://localhost:3002'}
            className="px-6 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
          >
            Go to Auth Service
          </button>
        </div>
      </div>
    </div>
  );
}
