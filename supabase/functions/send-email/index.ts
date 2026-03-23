import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0"
import { createTransport } from "npm:nodemailer@6.9.16"
import { getAuthEmailContent } from "./_templates/auth.ts"

const hookSecret = Deno.env.get("SEND_EMAIL_HOOK_SECRET")!

const transporter = createTransport({
  host: Deno.env.get("SMTP_HOST") || "smtp.gmail.com",
  port: parseInt(Deno.env.get("SMTP_PORT") || "465"),
  secure: (Deno.env.get("SMTP_PORT") || "465") === "465",
  auth: {
    user: Deno.env.get("SMTP_USER"),
    pass: Deno.env.get("SMTP_PASS"),
  },
})

interface AuthHookPayload {
  user: {
    id: string
    email: string
    user_metadata?: { full_name?: string }
  }
  email_data: {
    token: string
    token_hash: string
    redirect_to: string
    email_action_type: string
    site_url: string
    token_new?: string
    token_hash_new?: string
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 })
  }

  try {
    const payload = await req.text()
    const headers = Object.fromEntries(req.headers)
    const wh = new Webhook(hookSecret)
    const { user, email_data } = wh.verify(payload, headers) as AuthHookPayload

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const siteUrl = Deno.env.get("SITE_URL") || email_data.site_url
    const redirectTo = email_data.redirect_to || siteUrl

    // Build the verification URL
    const confirmUrl = `${supabaseUrl}/auth/v1/verify?token=${email_data.token_hash}&type=${email_data.email_action_type}&redirect_to=${encodeURIComponent(redirectTo)}`

    const userName = user.user_metadata?.full_name || user.email.split("@")[0]
    const { subject, html } = getAuthEmailContent(
      email_data.email_action_type,
      confirmUrl,
      userName,
      siteUrl,
    )

    const fromName = Deno.env.get("SMTP_FROM_NAME") || "Trah"
    const fromEmail = Deno.env.get("SMTP_FROM") || Deno.env.get("SMTP_USER")

    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: user.email,
      subject,
      html,
    })

    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Send email error:", error)
    return new Response(
      JSON.stringify({
        error: {
          http_code: 500,
          message: error instanceof Error ? error.message : "Failed to send email",
        },
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    )
  }
})
