import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Script from "next/script";
import "@/globals.css";

const SITE_URL = "https://meowacademy.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "เก็บชั่วโมง กยศ ออนไลน์ | MeowAcademy",
    template: "%s | MeowAcademy",
  },
  description:
    "บริการรับจ้างเก็บชั่วโมงจิตอาสา กยศ. และกรอกข้อมูลลงระบบ อุ่นใจ ปลอดภัย งานเสร็จไวใน 1-3 วัน เริ่มต้นเพียง 5 บาท/ชม. รองรับทุน กยศ. และทุนเรียนดี",
  keywords: [
    "รับจ้างเก็บชั่วโมงจิตอาสา",
    "เก็บชั่วโมงจิตอาสา กยศ",
    "บริการเก็บชั่วโมง กยศ",
    "จิตอาสา กยศ ออนไลน์",
    "กรอกข้อมูล กยศ",
    "ชั่วโมงจิตอาสา ออนไลน์",
    "MeowAcademy",
    "เก็บชั่วโมงจิตอาสา ราคาถูก",
    "จ้างเก็บชั่วโมง กยศ",
    "บริการ กยศ นักศึกษา",
  ],
  authors: [{ name: "MeowAcademy" }],
  creator: "MeowAcademy",
  openGraph: {
    type: "website",
    locale: "th_TH",
    url: SITE_URL,
    siteName: "MeowAcademy",
    title: "MeowAcademy - รับจ้างเก็บชั่วโมงจิตอาสา กยศ.",
    description:
      "บริการรับจ้างเก็บชั่วโมงจิตอาสา กยศ. และกรอกข้อมูลลงระบบ อุ่นใจ ปลอดภัย งานเสร็จไวใน 1-3 วัน เริ่มต้นเพียง 5 บาท/ชม. รองรับทุน กยศ. และทุนเรียนดี",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "MeowAcademy - บริการเก็บชั่วโมงจิตอาสา กยศ.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MeowAcademy - รับจ้างเก็บชั่วโมงจิตอาสา กยศ.",
    description:
      "บริการรับจ้างเก็บชั่วโมงจิตอาสา กยศ. และกรอกข้อมูลลงระบบ อุ่นใจ ปลอดภัย งานเสร็จไวใน 1-3 วัน เริ่มต้นเพียง 5 บาท/ชม. รองรับทุน กยศ. และทุนเรียนดี",
    images: [`${SITE_URL}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  other: {
    "theme-color": "#FF8A65",
  },
};

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "MeowAcademy",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/images/cat-icons/logo_cat.png`,
      },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        availableLanguage: "Thai",
      },
      sameAs: ["https://line.me/R/ti/p/@807chkoh", "https://facebook.com", "https://instagram.com"],
    },
    {
      "@type": "LocalBusiness",
      "@id": `${SITE_URL}/#localbusiness`,
      name: "MeowAcademy",
      url: SITE_URL,
      telephone: "+66-000-000-000",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Online Service",
        addressLocality: "Bangkok",
        addressRegion: "Bangkok",
        postalCode: "10110",
        addressCountry: "TH"
      },
      image: `${SITE_URL}/images/cat-icons/logo_cat.png`,
      priceRange: "$",
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        reviewCount: "82"
      }
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "MeowAcademy",
      description:
        "บริการรับจ้างเก็บชั่วโมงจิตอาสา กยศ. และกรอกข้อมูลลงระบบ",
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "th-TH",
    },
    {
      "@type": "Service",
      "@id": `${SITE_URL}/#service`,
      name: "บริการเก็บชั่วโมงจิตอาสา กยศ.",
      description:
        "รับจ้างเก็บชั่วโมงจิตอาสาและกรอกข้อมูลลงระบบ กยศ. สำหรับนักศึกษา งานเสร็จไวใน 1-3 วัน",
      provider: { "@id": `${SITE_URL}/#organization` },
      areaServed: {
        "@type": "Country",
        name: "Thailand",
      },
      offers: [
        {
          "@type": "Offer",
          name: "บริการรายชั่วโมง",
          price: "5",
          priceCurrency: "THB",
          description: "เก็บชั่วโมงจิตอาสา เริ่มต้น 5 บาท/ชั่วโมง",
        },
        {
          "@type": "Offer",
          name: "แพ็คเกจ 36 ชั่วโมง",
          price: "150",
          priceCurrency: "THB",
          description: "แพ็คเกจเก็บชั่วโมงจิตอาสา 36 ชม. ประหยัด 17%",
        },
        {
          "@type": "Offer",
          name: "บริการกรอกข้อมูล",
          price: "50",
          priceCurrency: "THB",
          description: "กรอกข้อมูลลงระบบ กยศ. ให้เรียบร้อย",
        },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "รับจ้างเก็บชั่วโมงจิตอาสา กยศ. ปลอดภัยหรือไม่?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "บริการเก็บชั่วโมง กยศ ออนไลน์ของเราปลอดภัย 100% ครับ ข้อมูลส่วนตัวของคุณจะถูกเก็บเป็นความลับสูงสุดและใช้สำหรับการเข้าสู่ระบบเพื่อกรอกข้อมูล กยศ เท่านั้น ไม่มีการนำไปเผยแพร่หรือใช้ในทางอื่นแน่นอน",
          },
        },
        {
          "@type": "Question",
          name: "จ้างเก็บชั่วโมง กยศ ใช้เวลาดำเนินการนานเท่าไหร่?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "โดยปกติทีมงานจะรับจ้างเก็บชั่วโมงจิตอาสาและกรอกข้อมูลให้เสร็จสิ้นภายใน 1-3 วันหลังจากได้รับการยืนยันการชำระเงินครับ รวดเร็วทันใจแน่นอน",
          },
        },
        {
          "@type": "Question",
          name: "ต้องเตรียมข้อมูลอะไรบ้างสำหรับการทำจิตอาสา กยศ ออนไลน์?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "เตรียมแค่ 'รหัสผ่าน กยศ. Connect' และ 'ชื่อบัญชีผู้ใช้' เท่านั้นครับ ส่วนรายละเอียดในการเก็บชั่วโมงจิตอาสา กยศ ทางเราจะจัดการหามาบันทึกและกรอกข้อมูล กยศ ให้ครบถ้วนครับ",
          },
        },
        {
          "@type": "Question",
          name: "ชั่วโมงจิตอาสา ออนไลน์ สามารถใช้ยื่นกู้ได้จริงไหม?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "สามารถใช้ยื่นกู้ได้จริงครับ ทางเรารับจ้างเก็บชั่วโมงจิตอาสาโดยใช้หลักเกณฑ์ที่ถูกต้อง สามารถตรวจสอบได้ และจะได้รับการบันทึกในระบบ E-Studentloan อย่างถูกต้องแน่นอน",
          },
        },
        {
          "@type": "Question",
          name: "ทำไมถึงควรเลือกบริการเก็บชั่วโมง กยศ จาก MeowAcademy?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "เราช่วยประหยัดเวลาอันมีค่าของนักศึกษา เพื่อให้มีเวลาไปอ่านหนังสือสอบ หรือทำกิจกรรมอื่นๆ ที่สำคัญกว่า โดยไม่ต้องกังวลเรื่องการหาที่ทำจิตอาสาและการกรอกข้อมูล กยศ ที่ยุ่งยากครับ เราคือตัวจริงเรื่องบริการเก็บชั่วโมง กยศ",
          },
        },
      ],
    },
    {
      "@type": "Product",
      "@id": `${SITE_URL}/#product`,
      name: "บริการเก็บชั่วโมงจิตอาสา กยศ. ออนไลน์",
      description:
        "รับจ้างเก็บชั่วโมงจิตอาสาและกรอกข้อมูลลงระบบ กยศ. สำหรับนักศึกษา งานเสร็จไวใน 1-3 วัน เริ่มต้นเพียง 5 บาทต่อชั่วโมง",
      image: `${SITE_URL}/images/cat-icons/logo_cat.png`,
      brand: {
        "@type": "Brand",
        name: "MeowAcademy",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        reviewCount: "82",
        bestRating: "5",
        worstRating: "1",
      },
      offers: {
        "@type": "AggregateOffer",
        lowPrice: "5",
        highPrice: "150",
        priceCurrency: "THB",
        offerCount: "3",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <head>
        <link
          rel="icon"
          type="image/png"
          href="/images/cat-icons/logo_cat.png"
        />
        <link
          rel="apple-touch-icon"
          href="/images/cat-icons/logo_cat.png"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {/* Ahrefs Web Analytics */}
        <Script
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="tHuOHJKSMUV0St5k5q2H9A"
          strategy="afterInteractive"
        />

        {/* Google Analytics */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-5KD02S5C7P"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-5KD02S5C7P');
            `,
          }}
        />
        <TooltipProvider>
          <Toaster />
          <Sonner />
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}
