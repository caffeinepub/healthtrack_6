import { useSettings } from "../contexts/SettingsContext";

type TranslationKey =
  | "dashboard"
  | "history"
  | "goals"
  | "workouts"
  | "automation"
  | "settings"
  | "logToday"
  | "editGoals"
  | "noWorkouts"
  | "logWorkout"
  | "logYourFirstWorkout"
  | "aiSuggestions"
  | "aiInsights"
  | "language"
  | "weightUnit"
  | "distanceUnit"
  | "save"
  | "cancel"
  | "signOut"
  | "theme"
  | "notifications"
  | "profile"
  | "displayName"
  | "pushNotifications"
  | "units"
  | "appearance"
  | "steps"
  | "sleep"
  | "water"
  | "calories"
  | "weight"
  | "mood"
  | "today"
  | "yesterday"
  | "trackYourExercise"
  | "healthInsights"
  | "suggestedWorkouts"
  | "athleteStories"
  | "reviews"
  | "addToLog";

type Translations = Record<TranslationKey, string>;
type LangMap = Record<string, Translations>;

const translations: LangMap = {
  en: {
    dashboard: "Dashboard",
    history: "History",
    goals: "Goals",
    workouts: "Workouts",
    automation: "Automation",
    settings: "Settings",
    logToday: "Log Today",
    editGoals: "Edit Goals",
    noWorkouts: "No workouts logged yet",
    logWorkout: "Log Workout",
    logYourFirstWorkout: "Log Your First Workout",
    aiSuggestions: "AI Suggestions",
    aiInsights: "AI Health Insights",
    language: "Language",
    weightUnit: "Weight Unit",
    distanceUnit: "Distance Unit",
    save: "Save",
    cancel: "Cancel",
    signOut: "Sign Out",
    theme: "Theme",
    notifications: "Notifications",
    profile: "Profile",
    displayName: "Display Name",
    pushNotifications: "Push Notifications",
    units: "Units",
    appearance: "Appearance",
    steps: "Steps",
    sleep: "Sleep",
    water: "Water",
    calories: "Calories",
    weight: "Weight",
    mood: "Mood",
    today: "Today",
    yesterday: "Yesterday",
    trackYourExercise: "Track your exercise sessions",
    healthInsights: "Health Insights",
    suggestedWorkouts: "Suggested Workouts",
    athleteStories: "Athlete Stories",
    reviews: "Reviews",
    addToLog: "Add to Log",
  },
  es: {
    dashboard: "Panel",
    history: "Historial",
    goals: "Objetivos",
    workouts: "Entrenamientos",
    automation: "Automatización",
    settings: "Configuración",
    logToday: "Registrar Hoy",
    editGoals: "Editar Objetivos",
    noWorkouts: "Sin entrenamientos registrados",
    logWorkout: "Registrar Entrenamiento",
    logYourFirstWorkout: "Registra Tu Primer Entrenamiento",
    aiSuggestions: "Sugerencias de IA",
    aiInsights: "Perspectivas de Salud IA",
    language: "Idioma",
    weightUnit: "Unidad de Peso",
    distanceUnit: "Unidad de Distancia",
    save: "Guardar",
    cancel: "Cancelar",
    signOut: "Cerrar Sesión",
    theme: "Tema",
    notifications: "Notificaciones",
    profile: "Perfil",
    displayName: "Nombre de Pantalla",
    pushNotifications: "Notificaciones Push",
    units: "Unidades",
    appearance: "Apariencia",
    steps: "Pasos",
    sleep: "Sueño",
    water: "Agua",
    calories: "Calorías",
    weight: "Peso",
    mood: "Estado de Ánimo",
    today: "Hoy",
    yesterday: "Ayer",
    trackYourExercise: "Registra tus sesiones de ejercicio",
    healthInsights: "Perspectivas de Salud",
    suggestedWorkouts: "Entrenamientos Sugeridos",
    athleteStories: "Historias de Atletas",
    reviews: "Reseñas",
    addToLog: "Agregar al Registro",
  },
  fr: {
    dashboard: "Tableau de Bord",
    history: "Historique",
    goals: "Objectifs",
    workouts: "Entraînements",
    automation: "Automatisation",
    settings: "Paramètres",
    logToday: "Enregistrer Aujourd'hui",
    editGoals: "Modifier les Objectifs",
    noWorkouts: "Aucun entraînement enregistré",
    logWorkout: "Enregistrer l'Entraînement",
    logYourFirstWorkout: "Enregistrez Votre Premier Entraînement",
    aiSuggestions: "Suggestions IA",
    aiInsights: "Perspectives Santé IA",
    language: "Langue",
    weightUnit: "Unité de Poids",
    distanceUnit: "Unité de Distance",
    save: "Sauvegarder",
    cancel: "Annuler",
    signOut: "Se Déconnecter",
    theme: "Thème",
    notifications: "Notifications",
    profile: "Profil",
    displayName: "Nom d'Affichage",
    pushNotifications: "Notifications Push",
    units: "Unités",
    appearance: "Apparence",
    steps: "Pas",
    sleep: "Sommeil",
    water: "Eau",
    calories: "Calories",
    weight: "Poids",
    mood: "Humeur",
    today: "Aujourd'hui",
    yesterday: "Hier",
    trackYourExercise: "Suivez vos séances d'exercice",
    healthInsights: "Perspectives Santé",
    suggestedWorkouts: "Entraînements Suggérés",
    athleteStories: "Histoires d'Athlètes",
    reviews: "Avis",
    addToLog: "Ajouter au Journal",
  },
  de: {
    dashboard: "Übersicht",
    history: "Verlauf",
    goals: "Ziele",
    workouts: "Training",
    automation: "Automatisierung",
    settings: "Einstellungen",
    logToday: "Heute Eintragen",
    editGoals: "Ziele Bearbeiten",
    noWorkouts: "Noch keine Trainings eingetragen",
    logWorkout: "Training Eintragen",
    logYourFirstWorkout: "Erstes Training Eintragen",
    aiSuggestions: "KI-Vorschläge",
    aiInsights: "KI-Gesundheitseinblicke",
    language: "Sprache",
    weightUnit: "Gewichtseinheit",
    distanceUnit: "Entfernungseinheit",
    save: "Speichern",
    cancel: "Abbrechen",
    signOut: "Abmelden",
    theme: "Design",
    notifications: "Benachrichtigungen",
    profile: "Profil",
    displayName: "Anzeigename",
    pushNotifications: "Push-Benachrichtigungen",
    units: "Einheiten",
    appearance: "Erscheinungsbild",
    steps: "Schritte",
    sleep: "Schlaf",
    water: "Wasser",
    calories: "Kalorien",
    weight: "Gewicht",
    mood: "Stimmung",
    today: "Heute",
    yesterday: "Gestern",
    trackYourExercise: "Verfolge deine Trainingseinheiten",
    healthInsights: "Gesundheitseinblicke",
    suggestedWorkouts: "Empfohlene Trainings",
    athleteStories: "Athleten-Geschichten",
    reviews: "Bewertungen",
    addToLog: "Zum Protokoll Hinzufügen",
  },
  hi: {
    dashboard: "डैशबोर्ड",
    history: "इतिहास",
    goals: "लक्ष्य",
    workouts: "व्यायाम",
    automation: "स्वचालन",
    settings: "सेटिंग्स",
    logToday: "आज दर्ज करें",
    editGoals: "लक्ष्य संपादित करें",
    noWorkouts: "कोई व्यायाम दर्ज नहीं",
    logWorkout: "व्यायाम दर्ज करें",
    logYourFirstWorkout: "पहला व्यायाम दर्ज करें",
    aiSuggestions: "AI सुझाव",
    aiInsights: "AI स्वास्थ्य अंतर्दृष्टि",
    language: "भाषा",
    weightUnit: "वजन इकाई",
    distanceUnit: "दूरी इकाई",
    save: "सहेजें",
    cancel: "रद्द करें",
    signOut: "साइन आउट",
    theme: "थीम",
    notifications: "सूचनाएं",
    profile: "प्रोफ़ाइल",
    displayName: "प्रदर्शन नाम",
    pushNotifications: "पुश सूचनाएं",
    units: "इकाइयां",
    appearance: "उपस्थिति",
    steps: "कदम",
    sleep: "नींद",
    water: "पानी",
    calories: "कैलोरी",
    weight: "वजन",
    mood: "मनोदशा",
    today: "आज",
    yesterday: "कल",
    trackYourExercise: "अपने व्यायाम सत्र ट्रैक करें",
    healthInsights: "स्वास्थ्य अंतर्दृष्टि",
    suggestedWorkouts: "सुझाए गए व्यायाम",
    athleteStories: "खिलाड़ियों की कहानियां",
    reviews: "समीक्षाएं",
    addToLog: "लॉग में जोड़ें",
  },
  ar: {
    dashboard: "لوحة التحكم",
    history: "السجل",
    goals: "الأهداف",
    workouts: "التمارين",
    automation: "الأتمتة",
    settings: "الإعدادات",
    logToday: "سجل اليوم",
    editGoals: "تعديل الأهداف",
    noWorkouts: "لا تمارين مسجلة",
    logWorkout: "تسجيل التمرين",
    logYourFirstWorkout: "سجل تمرينك الأول",
    aiSuggestions: "اقتراحات الذكاء الاصطناعي",
    aiInsights: "رؤى صحية بالذكاء الاصطناعي",
    language: "اللغة",
    weightUnit: "وحدة الوزن",
    distanceUnit: "وحدة المسافة",
    save: "حفظ",
    cancel: "إلغاء",
    signOut: "تسجيل الخروج",
    theme: "المظهر",
    notifications: "الإشعارات",
    profile: "الملف الشخصي",
    displayName: "اسم العرض",
    pushNotifications: "إشعارات الدفع",
    units: "الوحدات",
    appearance: "المظهر",
    steps: "الخطوات",
    sleep: "النوم",
    water: "الماء",
    calories: "السعرات الحرارية",
    weight: "الوزن",
    mood: "المزاج",
    today: "اليوم",
    yesterday: "أمس",
    trackYourExercise: "تتبع جلسات التمرين",
    healthInsights: "رؤى صحية",
    suggestedWorkouts: "تمارين مقترحة",
    athleteStories: "قصص الرياضيين",
    reviews: "المراجعات",
    addToLog: "إضافة للسجل",
  },
};

export function useTranslation(): { t: (key: string) => string } {
  const { language } = useSettings();
  const t = (key: string): string => {
    const langMap = translations[language] || translations.en;
    return (
      (langMap as Record<string, string>)[key] ||
      (translations.en as Record<string, string>)[key] ||
      key
    );
  };
  return { t };
}
