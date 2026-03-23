interface LayoutProps {
  preheader: string
  title: string
  greeting: string
  body: string
  ctaUrl: string
  ctaText: string
  footer: string
  siteUrl: string
}

export function wrapInLayout(props: LayoutProps): string {
  const year = new Date().getFullYear()

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${props.title}</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&display=swap');
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f5f0e8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif">
  <!-- Preheader (hidden) -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all">
    ${props.preheader}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f0e8">
    <tr>
      <td align="center" style="padding:32px 16px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">

          <!-- LOGO -->
          <tr>
            <td align="center" style="padding-bottom:24px">
              <a href="${props.siteUrl}" style="text-decoration:none">
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
                <!-- Gold top bar -->
                <tr>
                  <td style="height:4px;background:linear-gradient(90deg,#92400e,#d97706,#fbbf24,#d97706,#92400e)"></td>
                </tr>

                <!-- Decorative kawung pattern strip -->
                <tr>
                  <td align="center" style="padding:24px 0 0">
                    <span style="color:#d97706;font-size:14px;letter-spacing:8px">&#9670; &#9670; &#9670;</span>
                  </td>
                </tr>

                <!-- Title -->
                <tr>
                  <td align="center" style="padding:12px 40px 0">
                    <h1 style="margin:0;font-family:'Playfair Display',Georgia,serif;font-size:24px;font-weight:700;color:#292524">
                      ${props.title}
                    </h1>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding:24px 40px 0">
                    <p style="margin:0 0 16px;color:#78716c;font-size:15px;font-weight:600">
                      ${props.greeting}
                    </p>
                    ${props.body}
                  </td>
                </tr>

                <!-- CTA Button -->
                <tr>
                  <td align="center" style="padding:8px 40px 32px">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="background:linear-gradient(135deg,#92400e,#d97706);border-radius:8px">
                          <a href="${props.ctaUrl}" target="_blank" style="display:inline-block;padding:14px 36px;font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.5px">
                            ${props.ctaText}
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Divider -->
                <tr>
                  <td style="padding:0 40px">
                    <div style="height:1px;background:linear-gradient(90deg,transparent,#d4a574,transparent)"></div>
                  </td>
                </tr>

                <!-- Footer note -->
                <tr>
                  <td style="padding:20px 40px 28px">
                    <p style="margin:0 0 12px;color:#a8a29e;font-size:13px;line-height:1.5">
                      ${props.footer}
                    </p>
                    <p style="margin:0;color:#a8a29e;font-size:13px;line-height:1.5">
                      Jika tombol tidak berfungsi, salin dan buka link berikut di browser:
                    </p>
                    <p style="margin:8px 0 0;word-break:break-all">
                      <a href="${props.ctaUrl}" style="color:#d97706;font-size:12px;text-decoration:underline">${props.ctaUrl}</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- BOTTOM FOOTER -->
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
