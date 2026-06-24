import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Pharma Lingo',
    short_name: 'PharmaLingo',
    description: 'Assistance Dispenser App',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#0f172a',
    icons: [
      {
        src: '/apple-touch-iconv2.png', // 👈 ชื่อไฟล์ต้องตรงกับที่วางในโฟลเดอร์ public
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
