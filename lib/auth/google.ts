import "server-only"

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

const REDIRECT_URI = `${APP_URL}/api/auth/callback/google`

export function getGoogleAuthUrl() {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error("GOOGLE_CLIENT_ID environment variable is not configured")
  }

  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth"
  
  const options = {
    redirect_uri: REDIRECT_URI,
    client_id: GOOGLE_CLIENT_ID,
    access_type: "offline",
    response_type: "code",
    prompt: "select_account",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
  }

  const qs = new URLSearchParams(options)

  return `${rootUrl}?${qs.toString()}`
}

export type GoogleUserResult = {
  email: string
  email_verified: boolean
  firstName: string
  lastName: string
  avatar: string
}

export async function getGoogleUser(code: string): Promise<GoogleUserResult> {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error("Google OAuth credentials are not fully configured")
  }

  // 1. Exchange auth code for tokens
  const tokenUrl = "https://oauth2.googleapis.com/token"
  const tokenParams = new URLSearchParams({
    code,
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    grant_type: "authorization_code",
  })

  const tokenRes = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: tokenParams.toString(),
  })

  if (!tokenRes.ok) {
    const errorText = await tokenRes.text()
    throw new Error(`Failed to exchange Google OAuth code: ${errorText}`)
  }

  const tokenData = (await tokenRes.json()) as {
    access_token: string
    id_token: string
  }

  // 2. Fetch user profile info from Google
  const profileUrl = "https://www.googleapis.com/oauth2/v3/userinfo"
  const profileRes = await fetch(profileUrl, {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
    },
  })

  if (!profileRes.ok) {
    throw new Error("Failed to fetch user profile from Google")
  }

  const profileData = (await profileRes.json()) as {
    email: string
    email_verified: boolean
    given_name?: string
    family_name?: string
    picture?: string
  }

  return {
    email: profileData.email,
    email_verified: !!profileData.email_verified,
    firstName: profileData.given_name ?? "",
    lastName: profileData.family_name ?? "",
    avatar: profileData.picture ?? "",
  }
}
