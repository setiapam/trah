import { wrapInLayout } from "./layout.ts"

interface EmailContent {
  subject: string
  html: string
}

export function getAuthEmailContent(
  actionType: string,
  confirmUrl: string,
  userName: string,
  siteUrl: string,
): EmailContent {
  switch (actionType) {
    case "signup":
      return {
        subject: "Selamat Datang di Trah — Verifikasi Email Anda",
        html: wrapInLayout({
          preheader: "Verifikasi email Anda untuk mulai mencatat silsilah keluarga.",
          title: "Selamat Datang!",
          greeting: `Halo ${userName},`,
          body: `
            <p style="margin:0 0 16px;color:#44403c;font-size:16px;line-height:1.6">
              Terima kasih telah mendaftar di <strong>Trah</strong> — aplikasi pencatatan silsilah keluarga.
            </p>
            <p style="margin:0 0 24px;color:#44403c;font-size:16px;line-height:1.6">
              Klik tombol di bawah untuk memverifikasi email Anda dan mulai membangun pohon keluarga.
            </p>
          `,
          ctaUrl: confirmUrl,
          ctaText: "Verifikasi Email Saya",
          footer: "Jika Anda tidak mendaftar di Trah, abaikan email ini.",
          siteUrl,
        }),
      }

    case "recovery":
      return {
        subject: "Trah — Reset Kata Sandi",
        html: wrapInLayout({
          preheader: "Reset kata sandi akun Trah Anda.",
          title: "Reset Kata Sandi",
          greeting: `Halo ${userName},`,
          body: `
            <p style="margin:0 0 16px;color:#44403c;font-size:16px;line-height:1.6">
              Kami menerima permintaan untuk mereset kata sandi akun Trah Anda.
            </p>
            <p style="margin:0 0 24px;color:#44403c;font-size:16px;line-height:1.6">
              Klik tombol di bawah untuk membuat kata sandi baru. Link ini berlaku selama 1 jam.
            </p>
          `,
          ctaUrl: confirmUrl,
          ctaText: "Reset Kata Sandi",
          footer: "Jika Anda tidak meminta reset kata sandi, abaikan email ini. Kata sandi Anda tidak akan berubah.",
          siteUrl,
        }),
      }

    case "email_change":
      return {
        subject: "Trah — Konfirmasi Perubahan Email",
        html: wrapInLayout({
          preheader: "Konfirmasi alamat email baru Anda.",
          title: "Konfirmasi Email Baru",
          greeting: `Halo ${userName},`,
          body: `
            <p style="margin:0 0 16px;color:#44403c;font-size:16px;line-height:1.6">
              Anda telah meminta perubahan alamat email untuk akun Trah Anda.
            </p>
            <p style="margin:0 0 24px;color:#44403c;font-size:16px;line-height:1.6">
              Klik tombol di bawah untuk mengkonfirmasi alamat email baru Anda.
            </p>
          `,
          ctaUrl: confirmUrl,
          ctaText: "Konfirmasi Email Baru",
          footer: "Jika Anda tidak meminta perubahan email, segera hubungi kami.",
          siteUrl,
        }),
      }

    case "magiclink":
      return {
        subject: "Trah — Link Masuk Anda",
        html: wrapInLayout({
          preheader: "Link untuk masuk ke akun Trah Anda.",
          title: "Masuk ke Trah",
          greeting: `Halo ${userName},`,
          body: `
            <p style="margin:0 0 16px;color:#44403c;font-size:16px;line-height:1.6">
              Klik tombol di bawah untuk masuk ke akun Trah Anda. Link ini berlaku selama 1 jam.
            </p>
          `,
          ctaUrl: confirmUrl,
          ctaText: "Masuk ke Trah",
          footer: "Jika Anda tidak meminta link masuk ini, abaikan email ini.",
          siteUrl,
        }),
      }

    default:
      return {
        subject: "Trah — Konfirmasi",
        html: wrapInLayout({
          preheader: "Konfirmasi aksi pada akun Trah Anda.",
          title: "Konfirmasi",
          greeting: `Halo ${userName},`,
          body: `
            <p style="margin:0 0 24px;color:#44403c;font-size:16px;line-height:1.6">
              Klik tombol di bawah untuk melanjutkan.
            </p>
          `,
          ctaUrl: confirmUrl,
          ctaText: "Konfirmasi",
          footer: "Jika Anda tidak melakukan aksi ini, abaikan email ini.",
          siteUrl,
        }),
      }
  }
}
