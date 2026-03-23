import { createTransport } from "npm:nodemailer@6.9.16"
import { createClient } from "npm:@supabase/supabase-js@2"

const transporter = createTransport({
  host: Deno.env.get("SMTP_HOST") || "smtp.gmail.com",
  port: parseInt(Deno.env.get("SMTP_PORT") || "465"),
  secure: (Deno.env.get("SMTP_PORT") || "465") === "465",
  auth: {
    user: Deno.env.get("SMTP_USER"),
    pass: Deno.env.get("SMTP_PASS"),
  },
})

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

interface InviteRequest {
  email: string
  treeName: string
  role: string
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders })
  }

  try {
    // Get the user from JWT
    const authHeader = req.headers.get("Authorization")!
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Get inviter profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single()

    const inviterName = profile?.display_name || user.email?.split("@")[0] || "Seseorang"

    const { email, treeName, role } = await req.json() as InviteRequest

    if (!email || !treeName) {
      return new Response(
        JSON.stringify({ error: "email and treeName are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const siteUrl = Deno.env.get("SITE_URL") || "https://trah.app"
    const roleLabel = role === "editor" ? "Editor" : "Viewer"
    const fromName = Deno.env.get("SMTP_FROM_NAME") || "Trah"
    const fromEmail = Deno.env.get("SMTP_FROM") || Deno.env.get("SMTP_USER")
    const year = new Date().getFullYear()

    const html = buildInviteEmail(inviterName, treeName, roleLabel, siteUrl, year)

    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: email,
      subject: `${inviterName} mengundang Anda ke silsilah "${treeName}" di Trah`,
      html,
    })

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Send invite error:", error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to send invitation email" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})

function buildInviteEmail(
  inviterName: string,
  treeName: string,
  roleLabel: string,
  siteUrl: string,
  year: number,
): string {
  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Undangan Silsilah Keluarga</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&display=swap');
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f5f0e8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all">
    ${inviterName} mengundang Anda untuk bergabung di silsilah keluarga "${treeName}".
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f0e8">
    <tr>
      <td align="center" style="padding:32px 16px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">

          <!-- LOGO -->
          <tr>
            <td align="center" style="padding-bottom:24px">
              <a href="${siteUrl}" style="text-decoration:none">
                <span style="font-family:'Playfair Display',Georgia,serif;font-size:32px;font-weight:700;background:linear-gradient(135deg,#d97706,#fbbf24,#d97706);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">
                  Trah
                </span>
              </a>
              <p style="margin:4px 0 0;font-size:11px;color:#a8a29e;letter-spacing:2px;text-transform:uppercase">
                Nguri-uri Trah, Njaga Sejarah
              </p>
            </td>
          </tr>

          <!-- CARD -->
          <tr>
            <td>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(120,53,15,0.08)">
                <tr>
                  <td style="height:4px;background:linear-gradient(90deg,#92400e,#d97706,#fbbf24,#d97706,#92400e)"></td>
                </tr>

                <tr>
                  <td align="center" style="padding:24px 0 0">
                    <span style="color:#d97706;font-size:14px;letter-spacing:8px">&#9670; &#9670; &#9670;</span>
                  </td>
                </tr>

                <tr>
                  <td align="center" style="padding:12px 40px 0">
                    <h1 style="margin:0;font-family:'Playfair Display',Georgia,serif;font-size:24px;font-weight:700;color:#292524">
                      Undangan Silsilah Keluarga
                    </h1>
                  </td>
                </tr>

                <tr>
                  <td style="padding:24px 40px 0">
                    <p style="margin:0 0 16px;color:#44403c;font-size:16px;line-height:1.6">
                      <strong>${inviterName}</strong> mengundang Anda untuk bergabung sebagai
                      kolaborator di silsilah keluarga:
                    </p>

                    <!-- Tree name highlight -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px">
                      <tr>
                        <td style="background:linear-gradient(135deg,#fffbeb,#fef3c7);border-radius:8px;border-left:4px solid #d97706;padding:16px 20px">
                          <p style="margin:0 0 4px;font-size:12px;color:#92400e;text-transform:uppercase;letter-spacing:1px;font-weight:600">
                            Silsilah Keluarga
                          </p>
                          <p style="margin:0;font-family:'Playfair Display',Georgia,serif;font-size:20px;font-weight:700;color:#292524">
                            ${treeName}
                          </p>
                          <p style="margin:8px 0 0;font-size:13px;color:#78716c">
                            Peran Anda: <strong style="color:#d97706">${roleLabel}</strong>
                          </p>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:0 0 24px;color:#44403c;font-size:16px;line-height:1.6">
                      Masuk atau daftar di Trah untuk melihat dan mengelola silsilah ini bersama.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td align="center" style="padding:8px 40px 32px">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="background:linear-gradient(135deg,#92400e,#d97706);border-radius:8px">
                          <a href="${siteUrl}/settings/invitations" target="_blank" style="display:inline-block;padding:14px 36px;font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.5px">
                            Lihat Undangan
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding:0 40px">
                    <div style="height:1px;background:linear-gradient(90deg,transparent,#d4a574,transparent)"></div>
                  </td>
                </tr>

                <tr>
                  <td style="padding:20px 40px 28px">
                    <p style="margin:0;color:#a8a29e;font-size:13px;line-height:1.5">
                      Jika Anda tidak mengenal ${inviterName} atau tidak ingin bergabung, abaikan email ini.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:24px 16px">
              <p style="margin:0 0 4px;color:#a8a29e;font-size:12px">
                &copy; ${year} Trah &mdash; Aplikasi Pencatatan Silsilah Keluarga
              </p>
              <p style="margin:0;color:#c4b5a4;font-size:11px;letter-spacing:4px">
                &#9670; &#9670; &#9670;
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}
