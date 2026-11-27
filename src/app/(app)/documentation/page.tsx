"use client";

import React, { useState } from "react";
import { TopHeader } from "@/components/top-header";
import { BookOpen, Languages, Search, Globe, Mail, Send, Inbox, Users, Settings, Sparkles } from "lucide-react";

type Lang = "en" | "hi";

interface DocSection {
  id: string;
  icon: React.ElementType;
  titleEn: string;
  titleHi: string;
  summaryEn: string;
  summaryHi: string;
  stepsEn: string[];
  stepsHi: string[];
}

const DOC_SECTIONS: DocSection[] = [
  {
    id: "lead-discovery",
    icon: Search,
    titleEn: "1. Lead Discovery & Verification",
    titleHi: "1. लीड डिस्कवरी और ईमेल वेरिफिकेशन",
    summaryEn: "Find verified B2B businesses worldwide via Google Search & Google Maps, check their Google Business Profile, and verify email MX records before outreach.",
    summaryHi: "Google Search और Google Maps से दुनिया भर के B2B बिज़नेस खोजें, उनकी Google Business Profile देखें और ईमेल भेजने से पहले DNS MX रिकॉर्ड वेरिफाई करें।",
    stepsEn: [
      "Select Target Country, State/City, Industry, and Service in Lead Discovery.",
      "Click 'Launch Discovery Job' to fetch real businesses via Serper.",
      "Click 'Verify Emails (MX)' in the results bar to filter out invalid or disposable emails.",
      "Click 'Google Business' to open the exact business listing, 'Audit' to scan their site, or 'View in CRM' to add them to your pipeline."
    ],
    stepsHi: [
      "Lead Discovery में Country, State/City, Industry और Service चुनें।",
      "'Launch Discovery Job' पर क्लिक करके Serper से असली बिज़नेस डेटा निकालें।",
      "रिज़ल्ट बार में 'Verify Emails (MX)' दबाकर चेक करें कि कौन-से ईमेल असली और वैलिड हैं।",
      "'Google Business' से उनकी असली लिस्टिंग खोलें, 'Audit' से वेबसाइट स्कैन करें, या 'View in CRM' से सीधे CRM में जोड़ें।"
    ]
  },
  {
    id: "audits",
    icon: Globe,
    titleEn: "2. Website Technical Audits",
    titleHi: "2. वेबसाइट टेक्निकल ऑडिट",
    summaryEn: "Analyze prospect websites for mobile responsiveness, load speed, SEO gaps, and conversion bottlenecks to create personalized pitches.",
    summaryHi: "क्लाइंट की वेबसाइट की स्पीड, मोबाइल रिस्पॉन्सिवनेस और SEO कमियों को स्कैन करें ताकि आप उन्हें सटीक पिच भेज सकें।",
    stepsEn: [
      "Open 'Website Audits' or click 'Audit' from any discovered lead.",
      "Review the performance score and technical issues found.",
      "Use these exact findings inside AI Email Studio to double your reply rate."
    ],
    stepsHi: [
      "'Website Audits' खोलें या किसी भी लीड के आगे 'Audit' पर क्लिक करें।",
      "वेबसाइट का परफॉर्मेंस स्कोर और टेक्निकल कमियाँ देखें।",
      "इन्हीं पॉइंट्स को AI Email Studio में इस्तेमाल करके हाई-रिप्लाई ईमेल भेजें।"
    ]
  },
  {
    id: "email-campaigns",
    icon: Send,
    titleEn: "3. AI Email Studio & Live Campaigns",
    titleHi: "3. AI ईमेल स्टूडियो और लाइव कैंपेन",
    summaryEn: "Generate tailored outreach drafts with AI and dispatch real emails via Resend with automatic open-tracking pixels and unsubscribe headers.",
    summaryHi: "AI से पर्सनलाइज़्ड ईमेल ड्राफ्ट तैयार करें और Resend के ज़रिए असली ईमेल भेजें — ऑटोमैटिक ओपन-ट्रैकिंग और अनसब्सक्राइब लिंक के साथ।",
    stepsEn: [
      "Draft your outreach message in 'AI Email Studio'.",
      "Launch a campaign in 'Campaigns' — emails are automatically checked for compliance & DNS MX validity before sending.",
      "Resend webhooks track Sent, Delivered, Opened, Clicked, Bounced, and Replied events in real time."
    ],
    stepsHi: [
      "'AI Email Studio' में अपना आउटरीच मैसेज जनरेट करें।",
      "'Campaigns' से कैंपेन लॉन्च करें — भेजने से पहले हर ईमेल का DNS MX और कंप्लायंस चेक होता है।",
      "Resend वेबहुक से Sent, Delivered, Opened, Clicked, Bounced और Replied लाइव ट्रैक होते हैं।"
    ]
  },
  {
    id: "inbox-followups",
    icon: Inbox,
    titleEn: "4. Inbox & Automated Follow-Ups",
    titleHi: "4. इनबॉक्स और ऑटोमैटिक फॉलो-अप",
    summaryEn: "Incoming replies are auto-categorized (Interested, Meeting Requested, Not Interested) and daily cron jobs automatically follow up with contacted leads.",
    summaryHi: "आने वाले रिप्लाई अपने-आप कैटेगरी (Interested, Meeting Requested, Not Interested) में टैग होते हैं और रोज़ाना ऑटोमैटिक फॉलो-अप ईमेल जाते हैं।",
    stepsEn: [
      "Check 'Inbox' for categorized prospect replies.",
      "Daily cron (/api/cron/follow-ups) automatically sends up to 3 follow-ups every 4 days to contacted leads.",
      "Daily auto-discovery (/api/cron/auto-discover) fetches fresh leads into your pipeline automatically."
    ],
    stepsHi: [
      "'Inbox' में ऑटो-टैग किए गए क्लाइंट रिप्लाई देखें।",
      "डेली क्रॉन (/api/cron/follow-ups) हर 4 दिन में कॉन्टैक्ट किए गए लीड्स को अपने-आप फॉलो-अप भेजता है (अधिकतम 3 बार)।",
      "डेली ऑटो-डिस्कवरी (/api/cron/auto-discover) हर सुबह नए लीड्स अपने-आप पाइपलाइन में जोड़ता है।"
    ]
  },
  {
    id: "crm",
    icon: Sparkles,
    titleEn: "5. CRM Pipeline, INR Payment Links & WhatsApp",
    titleHi: "5. CRM पाइपलाइन, INR पेमेंट लिंक और WhatsApp",
    summaryEn: "Manage deals across 10 Kanban stages backed by Supabase, generate INR Razorpay/UPI payment links, and send 1-click WhatsApp pitches.",
    summaryHi: "Supabase से जुड़े 10-स्टेज Kanban CRM में डील्स मैनेज करें, INR में Razorpay/UPI पेमेंट लिंक बनाएं और 1-क्लिक में WhatsApp पिच भेजें।",
    stepsEn: [
      "Drag and drop deal cards across stages (New Lead -> Won); all changes persist to Supabase.",
      "Click any deal to open the right drawer, record a formal proposal in INR, and click 'Generate & Copy INR Payment Link'.",
      "If the lead has a phone number, click 'WhatsApp Pitch (1-Click)' to open a pre-filled WhatsApp message."
    ],
    stepsHi: [
      "डील कार्ड्स को ड्रैग-एंड-ड्रॉप करके स्टेज बदलें; सारा डेटा Supabase में सेव होता है।",
      "किसी भी डील पर क्लिक करके INR में प्रपोज़ल रिकॉर्ड करें और 'Generate & Copy INR Payment Link' से पेमेंट लिंक कॉपी करें।",
      "अगर लीड का फोन नंबर है, तो 'WhatsApp Pitch (1-Click)' दबाकर तुरंत WhatsApp पर पिच भेजें।"
    ]
  },
  {
    id: "settings",
    icon: Settings,
    titleEn: "6. Profile, Security & Team Roles",
    titleHi: "6. प्रोफाइल, सिक्योरिटी और टीम रोल्स",
    summaryEn: "Update your profile picture and manage workspace access. Only the primary admin can promote new signups from 'user' to 'operator' or 'admin'.",
    summaryHi: "अपनी प्रोफाइल फोटो और नाम अपडेट करें। नए साइन-अप डिफ़ॉल्ट रूप से 'user' रहते हैं जब तक एडमिन उन्हें 'operator' या 'admin' एक्सेस न दे।",
    stepsEn: [
      "Open 'Settings & Keys' to update your Full Name and Profile Picture URL.",
      "Use 'Team & Role Management' (Admin only) to approve new users and assign roles.",
      "Unapproved users see a 'Pending Admin Approval' screen until granted access."
    ],
    stepsHi: [
      "'Settings & Keys' में जाकर अपना नाम और प्रोफाइल फोटो URL सेट करें।",
      "एडमिन 'Team & Role Management' से नए यूज़र्स को 'operator' या 'admin' रोल दे सकते हैं।",
      "जब तक एडमिन अप्रूव न करे, नए यूज़र्स को 'Pending Admin Approval' स्क्रीन दिखती है।"
    ]
  }
];

export default function DocumentationPage() {
  const [lang, setLang] = useState<Lang>("en");

  return (
    <div className="min-h-screen flex flex-col">
      <TopHeader
        title={lang === "en" ? "Platform Documentation & User Guide" : "प्लेटफ़ॉर्म डॉक्यूमेंटेशन और गाइड"}
      />

      <div className="p-6 max-w-5xl mx-auto w-full space-y-6">
        {/* Language Toggle Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-zinc-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-zinc-900 text-white flex items-center justify-center">
              <BookOpen size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900">
                {lang === "en" ? "BrightLoop AI Handbook" : "BrightLoop AI हैंडबुक"}
              </h2>
              <p className="text-xs text-zinc-500">
                {lang === "en"
                  ? "Switch language anytime between English and Hindi"
                  : "कभी भी English और हिंदी के बीच भाषा बदलें"}
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1 bg-zinc-100 p-1 rounded-lg border border-zinc-200">
            <Languages size={14} className="text-zinc-500 ml-2 mr-1" />
            <button
              onClick={() => setLang("en")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                lang === "en" ? "bg-zinc-900 text-white shadow-xs" : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLang("hi")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                lang === "hi" ? "bg-zinc-900 text-white shadow-xs" : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              हिंदी (Hindi)
            </button>
          </div>
        </div>

        {/* Documentation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DOC_SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const title = lang === "en" ? sec.titleEn : sec.titleHi;
            const summary = lang === "en" ? sec.summaryEn : sec.summaryHi;
            const steps = lang === "en" ? sec.stepsEn : sec.stepsHi;

            return (
              <div
                key={sec.id}
                className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs space-y-3 hover:border-zinc-300 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-800">
                    <Icon size={16} />
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900">{title}</h3>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed">{summary}</p>
                <ul className="space-y-1.5 pt-1">
                  {steps.map((step, idx) => (
                    <li key={idx} className="text-xs text-zinc-700 flex items-start gap-2">
                      <span className="mt-0.5 w-4 h-4 rounded-full bg-zinc-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
