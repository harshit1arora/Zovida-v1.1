
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translations
const resources = {
  en: {
    translation: {
      "app.title": "Zovida",
      "app.subtitle": "Medical Assistant",
      "nav.home": "Home",
      "nav.scan": "Scan",
      "nav.doctors": "Doctors",
      "nav.signin": "Sign In",
      "hero.title": "Check Your Medicine Safety in",
      "hero.highlight": "Seconds",
      "hero.desc": "Scan your prescription and instantly detect dangerous drug interactions. Powered by Azure AI, verified by doctors.",
      "hero.protecting": "Protecting lives with AI",
      "scan.button": "Scan Prescription",
      "scan.consent.title": "Data Privacy & Consent",
      "scan.consent.desc": "Before we proceed, please review how we handle your data.",
      "scan.consent.point1": "Your data is processed locally on your device whenever possible.",
      "scan.consent.point2": "We do not store your prescription images without your explicit permission.",
      "scan.consent.point3": "Anonymized data may be used to improve our AI models.",
      "scan.agree": "I Agree & Continue",
      "results.export.pdf": "Export PDF",
      "results.share.whatsapp": "Share on WhatsApp",
      "network.online": "You are Online",
      "network.offline": "You are Offline",
      "network.syncing": "Syncing...",
      "session.summary": "Session Summary",
      "hero.badge": "Next-Gen AI Healthcare",
      "hero.title1": "Your Personal",
      "hero.title2": "AI Health Guardian",
      "hero.desc_new": "Zovida uses advanced Vision AI to scan prescriptions, identify risks, and keep your family safe with smart health monitoring.",
      "hero.scan_btn": "Scan Prescription",
      "hero.manual_btn": "Add Manually",
      "hero.hipaa": "HIPAA Compliant",
      "hero.instant": "Instant Results",
      "hero.monitoring": "Real-time Monitoring",
      "stats.lives_at_risk": "Lives at risk yearly",
      "stats.accuracy": "Detection accuracy",
      "stats.doctors": "Doctors onboard",
      "stats.lives_desc": "Reducing preventable medical errors globally.",
      "stats.accuracy_desc": "Industry-leading accuracy in drug detection.",
      "stats.doctors_desc": "Trusted by healthcare professionals worldwide.",
      "dashboard.title": "Smart Health Dashboard",
      "dashboard.desc": "Everything you need to manage your family's health in one place. Powered by intelligent insights and real-time tracking.",
      "dashboard.view_analytics": "View Detailed Analytics",
      "dashboard.safescore": "SafeScore™"
    }
  },
  es: {
    translation: {
      "app.title": "Zovida",
      "app.subtitle": "Asistente Médico",
      "nav.home": "Inicio",
      "nav.scan": "Escanear",
      "nav.doctors": "Doctores",
      "nav.signin": "Iniciar Sesión",
      "hero.title": "Verifique la seguridad de su medicina en",
      "hero.highlight": "Segundos",
      "hero.desc": "Escanee su receta y detecte instantáneamente interacciones peligrosas entre medicamentos. Impulsado por Azure AI, verificado por médicos.",
      "hero.protecting": "Protegiendo vidas con IA",
      "scan.button": "Escanear Receta",
      "scan.consent.title": "Privacidad de Datos y Consentimiento",
      "scan.consent.desc": "Antes de continuar, revise cómo manejamos sus datos.",
      "scan.consent.point1": "Sus datos se procesan localmente en su dispositivo siempre que es posible.",
      "scan.consent.point2": "No almacenamos las imágenes de sus recetas sin su permiso explícito.",
      "scan.consent.point3": "Los datos anónimos pueden usarse para mejorar nuestros modelos de IA.",
      "scan.agree": "Acepto y Continuar",
      "results.export.pdf": "Exportar PDF",
      "results.share.whatsapp": "Compartir en WhatsApp",
      "network.online": "Estás en línea",
      "network.offline": "Estás desconectado",
      "network.syncing": "Sincronizando...",
      "session.summary": "Resumen de la Sesión",
      "hero.badge": "Atención Médica con IA de Próxima Generación",
      "hero.title1": "Tu Personal",
      "hero.title2": "Guardián de Salud IA",
      "hero.desc_new": "Zovida utiliza IA de visión avanzada para escanear recetas, identificar riesgos y mantener a su familia segura con un monitoreo de salud inteligente.",
      "hero.scan_btn": "Escanear Receta",
      "hero.manual_btn": "Agregar Manualmente",
      "hero.hipaa": "Cumple con HIPAA",
      "hero.instant": "Resultados Instantáneos",
      "hero.monitoring": "Monitoreo en Tiempo Real",
      "stats.lives_at_risk": "Vidas en riesgo anualmente",
      "stats.accuracy": "Precisión de detección",
      "stats.doctors": "Médicos a bordo",
      "stats.lives_desc": "Reduciendo errores médicos prevenibles a nivel mundial.",
      "stats.accuracy_desc": "Precisión líder en la industria en detección de fármacos.",
      "stats.doctors_desc": "Confiado por profesionales de la salud en todo el mundo.",
      "dashboard.title": "Panel de Salud Inteligente",
      "dashboard.desc": "Todo lo que necesita para administrar la salud de su familia en un solo lugar. Impulsado por conocimientos inteligentes y seguimiento en tiempo real.",
      "dashboard.view_analytics": "Ver Análisis Detallados",
      "dashboard.safescore": "SafeScore™"
    }
  },
  hi: {
    translation: {
      "app.title": "Zovida",
      "app.subtitle": "चिकित्सा सहायक",
      "nav.home": "होम",
      "nav.scan": "स्कैन करें",
      "nav.doctors": "डॉक्टर",
      "nav.signin": "साइन इन करें",
      "hero.title": "अपनी दवा की सुरक्षा जांचें",
      "hero.highlight": "कुछ सेकंड में",
      "hero.desc": "अपनी पर्ची को स्कैन करें और तुरंत खतरनाक दवा इंटरैक्शन का पता लगाएं। Azure AI द्वारा संचालित, डॉक्टरों द्वारा सत्यापित।",
      "hero.protecting": "AI के साथ जीवन की रक्षा",
      "scan.button": "पर्ची स्कैन करें",
      "scan.consent.title": "डेटा गोपनीयता और सहमति",
      "scan.consent.desc": "आगे बढ़ने से पहले, कृपया देखें कि हम आपके डेटा को कैसे संभालते हैं।",
      "scan.consent.point1": "जहां संभव हो, आपका डेटा आपके डिवाइस पर स्थानीय रूप से संसाधित किया जाता है।",
      "scan.consent.point2": "हम आपकी स्पष्ट अनुमति के बिना आपकी पर्ची की छवियों को संग्रहीत नहीं करते हैं।",
      "scan.consent.point3": "हमारे AI मॉडल को बेहतर बनाने के लिए गुमनाम डेटा का उपयोग किया जा सकता है।",
      "scan.agree": "मैं सहमत हूं और जारी रखें",
      "results.export.pdf": "PDF निर्यात करें",
      "results.share.whatsapp": "WhatsApp पर साझा करें",
      "network.online": "आप ऑनलाइन हैं",
      "network.offline": "आप ऑफ़लाइन हैं",
      "network.syncing": "सिंक हो रहा है...",
      "session.summary": "सत्र सारांश",
      "hero.badge": "अगली पीढ़ी की AI स्वास्थ्य सेवा",
      "hero.title1": "आपका व्यक्तिगत",
      "hero.title2": "AI स्वास्थ्य रक्षक",
      "hero.desc_new": "ज़ोविडा पर्ची को स्कैन करने, जोखिमों की पहचान करने और स्मार्ट स्वास्थ्य निगरानी के साथ आपके परिवार को सुरक्षित रखने के लिए उन्नत विज़न AI का उपयोग करता है।",
      "hero.scan_btn": "पर्ची स्कैन करें",
      "hero.manual_btn": "मैन्युअल रूप से जोड़ें",
      "hero.hipaa": "HIPAA अनुपालन",
      "hero.instant": "त्वरित परिणाम",
      "hero.monitoring": "रीयल-टाइम मॉनिटरिंग",
      "stats.lives_at_risk": "सालाना जोखिम में जान",
      "stats.accuracy": "सटीकता का पता लगाना",
      "stats.doctors": "बोर्ड पर डॉक्टर",
      "stats.lives_desc": "विश्व स्तर पर रोकी जा सकने वाली चिकित्सा त्रुटियों को कम करना।",
      "stats.accuracy_desc": "दवा का पता लगाने में उद्योग की अग्रणी सटीकता।",
      "stats.doctors_desc": "दुनिया भर में स्वास्थ्य पेशेवरों द्वारा भरोसा किया गया।",
      "dashboard.title": "स्मार्ट हेल्थ डैशबोर्ड",
      "dashboard.desc": "अपने परिवार के स्वास्थ्य को एक ही स्थान पर प्रबंधित करने के लिए आवश्यक सब कुछ। बुद्धिमान अंतर्दृष्टि और रीयल-टाइम ट्रैकिंग द्वारा संचालित।",
      "dashboard.view_analytics": "विस्तृत विश्लेषण देखें",
      "dashboard.safescore": "SafeScore™"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
