import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Translation resources
const resources = {
  en: {
    translation: {
      // Header
      "sponsorBridge": "SponsorBridge",
      "signIn": "Sign In",
      "getStarted": "Get Started",
      
      // Hero Section
      "heroTitle": "SponsorBridge",
      "heroSubtitle": "Connecting generous sponsors with children in need across Rwanda",
      "heroDescription": "Empowering education, building futures, one child at a time",
      
      // Stats Section
      "sponsors": "Sponsors",
      "childrenHelped": "Children Helped",
      "rwfRaised": "RWF Raised",
      "provinces": "Provinces",
      
      // How It Works Section
      "howItWorks": "How It Works",
      "howItWorksDescription": "Simple steps to connect sponsors with children in need",
      "createProfile": "Create Profile",
      "createProfileDescription": "Sign up as a sponsor or sponsee. Complete your profile with basic information.",
      "connect": "Connect",
      "connectDescription": "Sponsors browse children's profiles. Sponsees share their needs and goals.",
      "support": "Support",
      "supportDescription": "Establish sponsorship and track progress. Help children achieve their dreams.",
      
      // Features Section
      "whyChoose": "Why Choose SponsorBridge?",
      "educationFocus": "Education Focus",
      "educationFocusDescription": "Supporting children's education through school fees, books, and supplies.",
      "localImpact": "Local Impact",
      "localImpactDescription": "Focused on helping children across Rwanda's five provinces.",
      "safeSecure": "Safe & Secure",
      "safeSecureDescription": "Verified profiles and secure transactions for peace of mind.",
      "madeForRwanda": "Made for Rwanda",
      "madeForRwandaDescription": "Designed specifically for the Rwandan context and education system.",
      
      // CTA Section
      "readyToMakeDifference": "Ready to Make a Difference?",
      "joinCommunity": "Join our community and help children in Rwanda achieve their dreams.",
      "getStartedToday": "Get Started Today",
      
      // Footer
      "footerCopyright": "© 2024 SponsorBridge - Academic Project for Rwanda",
      "footerDescription": "Connecting sponsors with children in need across Rwanda"
    }
  },
  rw: {
    translation: {
      // Header
      "sponsorBridge": "SponsorBridge",
      "signIn": "Injira",
      "getStarted": "Tangira",
      
      // Hero Section
      "heroTitle": "SponsorBridge",
      "heroSubtitle": "Guhuza abaterankunga n'abana bakeneye ubufasha mu Rwanda",
      "heroDescription": "Gushimangira uburezi, kubaka ejo hazaza, umwana ku mwana",
      
      // Stats Section
      "sponsors": "Abaterankunga",
      "childrenHelped": "Abana Bafashijwe",
      "rwfRaised": "Amafaranga Yakusanyijwe",
      "provinces": "Intara",
      
      // How It Works Section
      "howItWorks": "Uburyo Bukora",
      "howItWorksDescription": "Intambwe zoroshye zo guhuza abaterankunga n'abana bakeneye ubufasha",
      "createProfile": "Kora Umwirondoro",
      "createProfileDescription": "Iyandikishe nk'umuterankunga cyangwa umunyeshuri. Uzuza umwirondoro wawe n'amakuru y'ibanze.",
      "connect": "Guhuza",
      "connectDescription": "Abaterankunga bareba imyirondoro y'abana. Abanyeshuri basangira ibyo bakeneye n'intego zabo.",
      "support": "Gufasha",
      "supportDescription": "Shyiraho ubuterankunga kandi ukurikirane iterambere. Fasha abana kugera ku nzozi zabo.",
      
      // Features Section
      "whyChoose": "Kuki Uhitamo SponsorBridge?",
      "educationFocus": "Kwibanda ku Burezi",
      "educationFocusDescription": "Gushyigikira uburezi bw'abana binyuze mu mafaranga y'ishuri, ibitabo, n'ibikoresho.",
      "localImpact": "Ingaruka mu Gihugu",
      "localImpactDescription": "Kwibanda ku gufasha abana mu ntara eshanu z'u Rwanda.",
      "safeSecure": "Umutekano n'Ubwizerane",
      "safeSecureDescription": "Imyirondoro yemejwe n'ibikorwa by'amafaranga bifite umutekano kugira ngo ubone amahoro.",
      "madeForRwanda": "Byakozwe kuri Rwanda",
      "madeForRwandaDescription": "Byateguwe byihariye ku miterere y'u Rwanda n'uburyo bw'uburezi.",
      
      // CTA Section
      "readyToMakeDifference": "Witeguye Guhindura?",
      "joinCommunity": "Jya mu muryango wacu kandi ufashe abana bo mu Rwanda kugera ku nzozi zabo.",
      "getStartedToday": "Tangira Uyu Munsi",
      
      // Footer
      "footerCopyright": "© 2024 SponsorBridge - Umushinga w'Amashuri kuri Rwanda",
      "footerDescription": "Guhuza abaterankunga n'abana bakeneye ubufasha mu Rwanda"
    }
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n