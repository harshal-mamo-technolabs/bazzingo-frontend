export const USER_SLICE_NAME = "user";

// Prefer environment variables (Vite) with sensible fallbacks for local dev
export const API_CONNECTION_HOST_URL = import.meta.env.VITE_API_URL;
export const VAPID_PUBLIC_KEY = "BIYXHY1jiZqnePRbhgA1Tvnny1N7vpjgFcBhXD4hqNYfGm3VHxr8wRHTNC1mhM9V2BWS5jP9CxngbL29mhwq2E4";

export const SIGNUP_ENDPOINT = "/auth/signup";

// Dashboard page endpoints
export const DASHBOARD_ENDPOINT = "/dashboard";  // IQ and Games Played endpoint
export const PROGRESS_CHART_ENDPOINT = "/game/stats/weekly-scores";
export const STREAK_ENDPOINT = "/streak";
export const DAILY_GAMES_ENDPOINT = "/game/suggestions/daily";
export const PLANS_ENDPOINT = "/plans";

// Game endpoints
export const GAMES_ENDPOINT = "/game/games";
export const GAME_SCORE_ENDPOINT = "/game/score";
export const DAILY_SUGGESTIONS_ENDPOINT = "/game/suggestions/daily";

// Assessment page endpoints
export const ASSESSMENT_ENDPOINT = '/assessment';
export const QUICK_ASSESSMENT_ENDPOINT = '/assessment/quick';
export const SUBMIT_ASSESSMENT_ENDPOINT = '/assessment/submit';

// Push notification endpoints
export const PUSH_SUBSCRIBE_ENDPOINT = "/push/subscribe";
export const PUSH_UNSUBSCRIBE_ENDPOINT = "/push/unsubscribe";
export const LOGIN_ENDPOINT = "/auth/login";
export const GOOGLE_LOGIN_ENDPOINT = "/auth/google-login";
export const FORGOT_PASSWORD_ENDPOINT = "/auth/forgot-password";
export const UPDATE_PASSWORD_ENDPOINT = "/auth/reset-password";

export const API_RESPONSE_STATUS_SUCCESS = 'success';
export const API_RESPONSE_STATUS_ERROR = 'error';

export const TOKEN_EXPIRY_DURATION = 7 * 24 * 60 * 60 * 1000;

export const isTokenExpired = (tokenExpiry) => {
    if (!tokenExpiry) return true;
    return Date.now() > tokenExpiry;
};

export const getTokenExpiry = () => {
    return Date.now() + TOKEN_EXPIRY_DURATION;
};

export const countries = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda",
    "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas",
    "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin",
    "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei",
    "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon",
    "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia",
    "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica", "Croatia", "Cuba", "Cyprus",
    "Czech Republic", "Democratic Republic of the Congo", "Denmark", "Djibouti",
    "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador",
    "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini (fmr. " +
    "Swaziland)", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia",
    "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea",
    "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India",
    "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Ivory Coast",
    "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait",
    "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya",
    "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia",
    "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius",
    "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro",
    "Morocco", "Mozambique", "Myanmar (formerly Burma)", "Namibia", "Nauru",
    "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria",
    "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau",
    "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru",
    "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda",
    "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines",
    "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal",
    "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia",
    "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan",
    "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
    "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga",
    "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda",
    "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay",
    "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen",
    "Zambia", "Zimbabwe"
];