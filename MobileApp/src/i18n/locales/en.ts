// Base language resource. Every other language is produced at runtime by
// batch-translating these exact strings through the backend's
// @vitalets/google-translate-api endpoint — see src/i18n/index.ts.
export default {
    common: {
        back: 'Back',
        tryAgain: 'Try again',
        loading: 'Loading...',
    },
    settings: {
        title: 'Settings',
        themes: 'Themes',
        language: 'Language',
        measurementUnits: 'Measurement units',
    },
    theme: {
        title: 'Theme',
        system: 'System default',
        light: 'Light',
        dark: 'Dark',
    },
    language: {
        title: 'Language',
    },
    measurement: {
        title: 'Measurement units',
        useMetric: 'Use metric system',
        weight: 'Weight',
        volume: 'Volume',
        length: 'Length',
        temperature: 'Temperature',
    },
    home: {
        weaningTitle: "Let's get weaning!",
        weaningDescription:
            "We take the stress out of weaning and put the fun into mealtimes. Explore our weaning hub as we guide you through every stage of your little one's journey.",
        journeyTitle: "Your little one's weaning journey",
        expertSectionTitle: 'Meet the experts',
        expertDescription:
            'We work closely with trusted nutritionists and child-care experts to provide helpful guidance throughout your little one’s weaning journey.',
        expertButton: 'Tell us more',
        popularCategoryTitle: 'Popular category',
        letsGo: "Let's go!",
        time: 'Time',
    },
};
