// i18n configuration for multi-language support
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Translation files
const resources = {
  en: {
    translation: {
      // Hero
      "hero.badge": "Citizen Welfare Portal",
      "hero.title": "Discover Schemes",
      "hero.subtitle": "Built For You",
      "hero.description":
        "Connect with government welfare programs tailored to your profile. Simplified access, verified eligibility, seamless applications.",
      "hero.cta": "Explore Schemes",

      // Featured
      "featured.title": "Featured Schemes",
      "featured.subtitle": "Handpicked programs with maximum impact",

      // Eligible
      "eligible.title": "You're Eligible For",
      "eligible.subtitle":
        "Based on your profile, these schemes match your eligibility",

      // All Schemes
      "all.title": "All Schemes",
      "all.subtitle": "Browse through all available government welfare programs",

      // Common
      "common.viewDetails": "View Details",
      "common.applyNow": "Apply Now",
      "common.benefits": "Benefits",
      "common.keyBenefit": "Key Benefit",
      "common.match": "Match",
      "common.loading": "Loading...",
    },
  },
  hi: {
    translation: {
      "hero.badge": "नागरिक कल्याण पोर्टल",
      "hero.title": "योजनाएं खोजें",
      "hero.subtitle": "आपके लिए बनाई गई",
      "hero.description":
        "अपनी प्रोफ़ाइल के अनुरूप सरकारी कल्याण कार्यक्रमों से जुड़ें। सरल पहुंच, सत्यापित पात्रता, सहज आवेदन।",
      "hero.cta": "योजनाएं देखें",
      "featured.title": "विशेष योजनाएं",
      "featured.subtitle": "अधिकतम प्रभाव वाले चुनिंदा कार्यक्रम",
      "eligible.title": "आप पात्र हैं",
      "eligible.subtitle":
        "आपकी प्रोफ़ाइल के आधार पर, ये योजनाएं आपकी पात्रता से मेल खाती हैं",
      "all.title": "सभी योजनाएं",
      "all.subtitle": "सभी उपलब्ध सरकारी कल्याण कार्यक्रम ब्राउज़ करें",
      "common.viewDetails": "विवरण देखें",
      "common.applyNow": "अभी आवेदन करें",
      "common.benefits": "लाभ",
      "common.keyBenefit": "Key Benefit",
      "common.match": "Match",
      "common.loading": "Loading...",
      "common.logout": "Logout",

      // Navigation
      "nav.home": "Home",
      "nav.schemes": "Schemes",
      "nav.help": "Help",

      // Header
      "header.tagline": "Empowering Citizens",

      // Footer
      "footer.tagline": "Empowering Citizens Nationwide",
      "footer.description": "Connect with government welfare programs tailored to your profile. Simplified access, verified eligibility, seamless applications.",
      "footer.quickLinks": "Quick Links",
      "footer.home": "Home",
      "footer.allSchemes": "All Schemes",
      "footer.myProfile": "My Profile",
      "footer.myApplications": "My Applications",
      "footer.categories": "Categories",
      "footer.education": "Education",
      "footer.health": "Health",
      "footer.agriculture": "Agriculture",
      "footer.women": "Women Welfare",
      "footer.support": "Support",
      "footer.help": "Help Center",
      "footer.faq": "FAQ",
      "footer.contact": "Contact Us",
      "footer.privacy": "Privacy Policy",
      "footer.rights": "All rights reserved.",
      "footer.govtIndia": "Government of India",

      // Chatbot
      "chatbot.title": "Scheme Assistant",
      "chatbot.status": "Online • Ready to help",
      "chatbot.welcome": "Hello! I'm here to help you find the perfect government scheme. How can I assist you today?",
      "chatbot.education": "I can help you with educational schemes! We have scholarships, skill development programs, and student welfare schemes. Would you like to see schemes for a specific education level?",
      "chatbot.health": "I found several health-related schemes! These include health insurance, medical assistance, and wellness programs. Would you like to know more about a specific health scheme?",
      "chatbot.agriculture": "Great! We have multiple agriculture and farmer welfare schemes including crop insurance, subsidies, and equipment support. What aspect of agriculture are you interested in?",
      "chatbot.women": "We have dedicated women empowerment schemes covering financial assistance, skill training, and entrepreneurship support. Let me help you find the right one!",
      "chatbot.eligibility": "To check your eligibility, I'll need some basic information. Have you completed your profile? You can also browse schemes and see your eligibility score for each one!",
      "chatbot.default": "I understand you're looking for information about government schemes. Could you please tell me more about your specific needs or the category you're interested in? (Education, Health, Agriculture, Women Welfare, etc.)",
      "chatbot.findSchemes": "Find Schemes",
      "chatbot.checkEligibility": "Check Eligibility",
      "chatbot.howToApply": "How to Apply",
      "chatbot.trackApplication": "Track Application",
      "chatbot.placeholder": "Type your message...",
    },
  },
  ta: {
    translation: {
      "hero.badge": "குடிமக்கள் நல போர்டல்",
      "hero.title": "திட்டங்களைக் கண்டறியவும்",
      "hero.subtitle": "உங்களுக்காக உருவாக்கப்பட்டது",
      "hero.description":
        "உங்கள் சுயவிவரத்திற்கு ஏற்ப அரசாங்க நல திட்டங்களுடன் இணையுங்கள். எளிமையான அணுகல், சரிபார்க்கப்பட்ட தகுதி, தடையற்ற விண்ணப்பங்கள்.",
      "hero.cta": "திட்டங்களை ஆராயுங்கள்",
      "featured.title": "சிறப்பு திட்டங்கள்",
      "featured.subtitle": "அதிகபட்ச தாக்கத்துடன் தேர்ந்தெடுக்கப்பட்ட திட்டங்கள்",
      "eligible.title": "நீங்கள் தகுதியுடையவர்",
      "eligible.subtitle":
        "உங்கள் சுயவிவரத்தின் அடிப்படையில், இந்த திட்டங்கள் உங்கள் தகுதியுடன் பொருந்துகின்றன",
      "all.title": "அனைத்து திட்டங்கள்",
      "all.subtitle": "கிடைக்கக்கூடிய அனைத்து அரசாங்க நல திட்டங்களையும் உலாவவும்",
      "common.viewDetails": "விவரங்களைக் காண்க",
      "common.applyNow": "இப்போது விண்ணப்பிக்கவும்",
      "common.benefits": "நன்மைகள்",
      "common.keyBenefit": "முக்கிய நன்மை",
      "common.match": "பொருத்தம்",
      "common.loading": "ஏற்றுகிறது...",
    },
  },
  te: {
    translation: {
      "hero.badge": "పౌరుల సంక్షేమ పోర్టల్",
      "hero.title": "పథకాలను కనుగొనండి",
      "hero.subtitle": "మీ కోసం నిర్మించబడింది",
      "hero.description":
        "మీ ప్రొఫైల్‌కు అనుగుణంగా ప్రభుత్వ సంక్షేమ కార్యక్రమాలతో కనెక్ట్ అవ్వండి. సరళీకృత ప్రాప్యత, ధృవీకరించబడిన అర్హత, సతతమైన దరఖాస్తులు.",
      "hero.cta": "పథకాలను అన్వేషించండి",
      "featured.title": "ప్రత్యేక పథకాలు",
      "featured.subtitle": "గరిష్ట ప్రభావంతో ఎంపిక చేయబడిన కార్యక్రమాలు",
      "eligible.title": "మీరు అర్హులు",
      "eligible.subtitle":
        "మీ ప్రొఫైల్ ఆధారంగా, ఈ పథకాలు మీ అర్హతతో సరిపోతాయి",
      "all.title": "అన్ని పథకాలు",
      "all.subtitle": "అందుబాటులో ఉన్న అన్ని ప్రభుత్వ సంక్షేమ కార్యక్రమాలను బ్రౌజ్ చేయండి",
      "common.viewDetails": "వివరాలు చూడండి",
      "common.applyNow": "ఇప్పుడు దరఖాస్తు చేయండి",
      "common.benefits": "ప్రయోజనాలు",
      "common.keyBenefit": "ప్రధాన ప్రయోజనం",
      "common.match": "సరిపోయింది",
      "common.loading": "లోడ్ అవుతోంది...",
    },
  },
  bn: {
    translation: {
      "hero.badge": "নাগরিক কল্যাণ পোর্টাল",
      "hero.title": "প্রকল্পগুলি আবিষ্কার করুন",
      "hero.subtitle": "আপনার জন্য নির্মিত",
      "hero.description":
        "আপনার প্রোফাইলের জন্য উপযুক্ত সরকারি কল্যাণ কর্মসূচির সাথে সংযুক্ত হন। সরলীকৃত অ্যাক্সেস, যাচাইকৃত যোগ্যতা, নিরবচ্ছিন্ন আবেদন।",
      "hero.cta": "প্রকল্পগুলি দেখুন",
      "featured.title": "বৈশিষ্ট্যযুক্ত প্রকল্পগুলি",
      "featured.subtitle": "সর্বাধিক প্রভাব সহ নির্বাচিত প্রোগ্রাম",
      "eligible.title": "আপনি যোগ্য",
      "eligible.subtitle":
        "আপনার প্রোফাইলের ভিত্তিতে, এই প্রকল্পগুলি আপনার যোগ্যতার সাথে মেলে",
      "all.title": "সমস্ত প্রকল্প",
      "all.subtitle": "সমস্ত উপলব্ধ সরকারি কল্যাণ কর্মসূচি ব্রাউজ করুন",
      "common.viewDetails": "বিস্তারিত দেখুন",
      "common.applyNow": "এখনই আবেদন করুন",
      "common.benefits": "সুবিধা",
      "common.keyBenefit": "মূল সুবিধা",
      "common.match": "মেলে",
      "common.loading": "লোড হচ্ছে...",
    },
  },
  mr: {
    translation: {
      "hero.badge": "नागरिक कल्याण पोर्टल",
      "hero.title": "योजना शोधा",
      "hero.subtitle": "तुमच्यासाठी तयार",
      "hero.description":
        "तुमच्या प्रोफाइलनुसार सरकारी कल्याणकारी कार्यक्रमांशी कनेक्ट व्हा। सुलभ प्रवेश, सत्यापित पात्रता, सुलभ अर्ज.",
      "hero.cta": "योजना एक्सप्लोर करा",
      "featured.title": "वैशिष्ट्यीकृत योजना",
      "featured.subtitle": "कमाल प्रभाव असलेले निवडलेले कार्यक्रम",
      "eligible.title": "तुम्ही पात्र आहात",
      "eligible.subtitle":
        "तुमच्या प्रोफाइलवर आधारित, या योजना तुमच्या पात्रतेशी जुळतात",
      "all.title": "सर्व योजना",
      "all.subtitle": "सर्व उपलब्ध सरकारी कल्याणकारी कार्यक्रम ब्राउझ करा",
      "common.viewDetails": "तपशील पहा",
      "common.applyNow": "आता अर्ज करा",
      "common.benefits": "फायदे",
      "common.keyBenefit": "मुख्य फायदा",
      "common.match": "जुळते",
      "common.loading": "लोड होत आहे...",
    },
  },
  gu: {
    translation: {
      "hero.badge": "નાગરિક કલ્યાણ પોર્ટલ",
      "hero.title": "યોજનાઓ શોધો",
      "hero.subtitle": "તમારા માટે બનાવ્યું",
      "hero.description":
        "તમારી પ્રોફાઇલને અનુરૂપ સરકારી કલ્યાણ કાર્યક્રમો સાથે જોડાઓ. સરળ ઍક્સેસ, ચકાસાયેલ યોગ્યતા, સરળ અરજીઓ.",
      "hero.cta": "યોજનાઓ શોધો",
      "featured.title": "વિશેષ યોજના",
      "featured.subtitle": "મહત્તમ અસર સાથે પસંદ કરેલા કાર્યક્રમો",
      "eligible.title": "તમે યોગ્ય છો",
      "eligible.subtitle":
        "તમારી પ્રોફાઇલના આધારે, આ યોજનાઓ તમારી યોગ્યતા સાથે મેળ ખાય છે",
      "all.title": "બધી યોજનાઓ",
      "all.subtitle": "ઉપલબ્ધ તમામ સરકારી કલ્યાણ કાર્યક્રમો બ્રાઉઝ કરો",
      "common.viewDetails": "વિગતો જુઓ",
      "common.applyNow": "હમણાં અરજી કરો",
      "common.benefits": "ફાયદા",
      "common.keyBenefit": "મુખ્ય ફાયદો",
      "common.match": "મેળ",
      "common.loading": "લોડ થઈ રહ્યું છે...",
    },
  },
  kn: {
    translation: {
      "hero.badge": "ನಾಗರಿಕ ಕಲ್ಯಾಣ ಪೋರ್ಟಲ್",
      "hero.title": "ಯೋಜನೆಗಳನ್ನು ಅನ್ವೇಷಿಸಿ",
      "hero.subtitle": "ನಿಮಗಾಗಿ ನಿರ್ಮಿಸಲಾಗಿದೆ",
      "hero.description":
        "ನಿಮ್ಮ ಪ್ರೊಫೈಲ್‌ಗೆ ಸೂಕ್ತವಾದ ಸರ್ಕಾರಿ ಕಲ್ಯಾಣ ಕಾರ್ಯಕ್ರಮಗಳೊಂದಿಗೆ ಸಂಪರ್ಕ ಹೊಂದಿ. ಸರಳೀಕೃತ ಪ್ರವೇಶ, ಪರಿಶೀಲಿಸಿದ ಅರ್ಹತೆ, ತಡೆರಹಿತ ಅರ್ಜಿಗಳು.",
      "hero.cta": "ಯೋಜನೆಗಳನ್ನು ಅನ್ವೇಷಿಸಿ",
      "featured.title": "ವೈಶಿಷ್ಟ್ಯಗೊಳಿಸಿದ ಯೋಜನೆಗಳು",
      "featured.subtitle": "ಗರಿಷ್ಠ ಪ್ರಭಾವದೊಂದಿಗೆ ಆಯ್ಕೆಮಾಡಿದ ಕಾರ್ಯಕ್ರಮಗಳು",
      "eligible.title": "ನೀವು ಅರ್ಹರಾಗಿದ್ದೀರಿ",
      "eligible.subtitle":
        "ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ಆಧಾರದ ಮೇಲೆ, ಈ ಯೋಜನೆಗಳು ನಿಮ್ಮ ಅರ್ಹತೆಯೊಂದಿಗೆ ಹೊಂದಿಕೆಯಾಗುತ್ತವೆ",
      "all.title": "ಎಲ್ಲಾ ಯೋಜನೆಗಳು",
      "all.subtitle": "ಲಭ್ಯವಿರುವ ಎಲ್ಲಾ ಸರ್ಕಾರಿ ಕಲ್ಯಾಣ ಕಾರ್ಯಕ್ರಮಗಳನ್ನು ಬ್ರೌಸ್ ಮಾಡಿ",
      "common.viewDetails": "ವಿವರಗಳನ್ನು ವೀಕ್ಷಿಸಿ",
      "common.applyNow": "ಈಗ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ",
      "common.benefits": "ಪ್ರಯೋಜನಗಳು",
      "common.keyBenefit": "ಪ್ರಮುಖ ಪ್ರಯೋಜನ",
      "common.match": "ಹೊಂದಿಕೆ",
      "common.loading": "ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
