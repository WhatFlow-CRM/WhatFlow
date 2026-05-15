// ============================================================
// WHATFLOW CRM - CENTRALIZED CONFIGURATION
// Single source of truth for all external URLs, phone numbers,
// payment info, and security settings.
// DO NOT hardcode these values elsewhere.
// ============================================================
var WHATFLOW_CONFIG = {
    // Admin Dashboard
    ADMIN_SERVER_URL: "https://what-flow.vercel.app",

    // WhatsApp Support (ONLY number used everywhere)
    SUPPORT_PHONE_RAW: "923269580417",
    SUPPORT_WHATSAPP_LINK: "https://wa.me/923269580417",
    SUPPORT_DISPLAY: "+92 3269580417",

    // Payment Account (Easypaisa / JazzCash)
    PAYMENT_ACCOUNT_NUMBER: "03269580417",
    PAYMENT_ACCOUNT_TITLE: "Irfan Ilahee Munir",
    PAYMENT_CURRENCY: "PKR",

    // API Endpoints (relative to ADMIN_SERVER_URL)
    API: {
        EXTENSION_STATUS: "/api/extension/status",
        EXTENSION_PLANS: "/api/extension/plans",
        EXTENSION_PAYMENT_STATUS: "/api/extension/payment-status",
        EXTENSION_ACTIVATE: "/api/extension/activate",
        PAYMENTS: "/api/payments",
    },

    // File Upload Security
    MAX_PROOF_FILE_SIZE_BYTES: 5 * 1024 * 1024, // 5MB max
    ALLOWED_PROOF_MIME_TYPES: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    ALLOWED_PROOF_EXTENSIONS: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
};

// 'Did you know' tips
let DID_YOU_KNOW_TIPS = [
    "You can add batching to reduce the chances of getting your number banned",
    "You can increase the time gap or change it to random to reduce the chances of getting your number banned",
    "You can create a business chat link for your business/organisation's website with the 'Business chat link' feature on the bottom left of the extension",
    "You can customise your messages to the customer while sending messages",
    "You can edit and create your own quick responses to respond to messages faster and efficiently"
];

// Trial and Premium Features list
let TRIAL_FEATURES = ["Export Group Contacts", "Translate Conversation", "Quick Replies", "Customizable Time Gap", "Random Time Gap", "Chat Support", "Batching", "Caption", "Save Message Template", "Detailed Delivery report"];
let PREMIUM_FEATURES = ['Schedule ', 'Business Chat Link ', 'Export Chat Contacts', 'Multiple Attachments '];

// Premium/Advance feature reminder popup data
let PREMIUM_REMINDER = {
    // Premium Features
    time_gap: {
        title: 'Default time gap is 30 seconds',
        description: 'to randomize or customize the time gap'
    },
    download_group_contacts: {
        title: 'Export group contacts is a Premium feature',
        description: 'to download group contacts',
    },
    smart_reply: {
        title: 'Quick reply is a Premium feature',
        description: 'to use quick reply',
    },
    batching: {
        title: 'Batching is a Premium feature',
        description: 'to use batching',
    },
    stop_campaign: {
        title: 'Stop campaign is a Premium feature',
        description: 'to stop your campaign',
    },
    send_message: {
        title: 'Your Premium Plan has expired',
        description: 'to send messages',
    },
    unlimited_messages: {
        title: 'You have exhausted your daily message limit',
        description: 'to send unlimited messages'
    },

    // Advance Features
    verify: {
        title: 'Verifying whatsapp number is a Premium Plan feature',
        description: 'to verify whatsapp number'
    },
    multiple_groups: {
        title: 'Multiple group export is a Premium Plan feature',
        description: 'to export multiple group'
    },
    schedule: {
        title: 'Scheduling is a Premium Plan feature',
        description: 'to schedule your messages',
    },
    business_chat_link: {
        title: 'Business chat link is only for Premium Plan users',
        description: 'to generate a business chat link',
    },
    zoom_call_support: {
        title: 'Zoom call support is only for Premium Plan users',
        description: 'to request zoom call support',
    },
    multiple_attachments: {
        title: 'You can only send 1 attachment at a time',
        description: 'to send multiple attachments',
    },
    pause_campaign: {
        title: 'Pause campaign is a Premium Plan feature',
        description: 'to pause your campaign'
    },
    resume_campaign: {
        title: 'Resume campaign is a Premium Plan feature',
        description: 'to resume your campaign'
    },
    download_chat_contacts: {
        title: 'Export chat contacts is a Premium feature',
        description: 'to download chat contacts',
    },

    // Default data
    default: {
        title: '',
        description: 'to continue using that feature'
    }
};

let SUCCESS_POPUP_DATA = {
    advance_promo_activated: {
        icon: 'success_gif',
        title: 'Congrats!',
        description: "You're now using Premium",
        background_color: '#f99909',
        action_button: {
            text: 'Okay',
            class: 'action-green-btn',
            id: 'close_advance_promo_activated_popup',
        },
    }
};

// Plan reminder / expired popup's data
let POPUP_DATA = {
    common: {
        recommend_text: 'Value for money',
        discount_text: 'Discount applicable for only first month',
        purchase_note: 'While purchasing, please enter the WhatsApp number you want to send messages from',
    },
    free_trial_start: {
        heading: 'Congratulations!',
        title: 'You get free trial for PREMIUM features!',
        icon: 'free_trial_src',
        note: 'Note: Main features will remain free even after trial',
        background_color: '#fff',
        action_button: {
            text: 'Okay',
            class: 'action-green-btn',
            id: 'close_free_trial_start_popup',
        },
    },
    free_trial_reminder: {
        title: 'Your trial of PREMIUM features expires in {VAR_DATE_DIFF} days!',
        description: 'Flat discount of 30% on PREMIUM EXCLUSIVELY for you!',
        background_color: '#f99909',
        pricing_buttons: true,
        recommend_price: false,
        discount_text: true,
        purchase_note: true,
        close_button: true,
    },
    free_trial_expired: {
        title: 'Your trial for PREMIUM features has expired!! But do not worry',
        description: 'Flat discount of 30% on PREMIUM EXCLUSIVELY for you!',
        icon: 'wall_clock_white_icon',
        background_color: '#80C0B7',
        pricing_buttons: true,
        recommend_price: false,
        discount_text: true,
        purchase_note: true,
        close_button: true,
    },
    advance_promo_start: {
        heading: 'Congratulations!',
        heading_icon: 'confetti_gif',
        title: "You've received a coupon for {VAR_DATE_DIFF} days of Premium for Free!",
        background_color: '#A480C0',
        action_button: {
            text: 'Claim Now!',
            class: 'action-green-btn claim-advance-promo',
            id: 'close_advance_promo_start_popup',
        },
    },
    advance_promo_reminder: {
        title: 'Your Promo of PREMIUM features expires in {VAR_DATE_DIFF} days! But do not worry',
        description: 'Flat discount of 30% on PREMIUM EXCLUSIVELY for you!',
        background_color: '#A480C0',
        pricing_buttons: true,
        recommend_price: false,
        discount_text: true,
        purchase_note: true,
        close_button: true,
    },
    advance_promo_expired: {
        title: 'Your Promo for PREMIUM features has expired!! But do not worry',
        description: 'Flat discount of 30% on PREMIUM EXCLUSIVELY for you!',
        background_color: '#A480C0',
        icon: 'wall_clock_white_icon',
        pricing_buttons: true,
        recommend_price: false,
        discount_text: true,
        purchase_note: true,
        close_button: true,
    },
    premium_expired: {
        title: 'Your PREMIUM features {VAR_EXP_TEXT}! BUT don’t worry...',
        background_color: '#80c09b',
        icon: 'wall_clock_white_icon',
        pricing_buttons: true,
        purchase_note: true,
        close_button: true,
    },
    annual_plan_reminder: {
        title: 'Your Annual PREMIUM features expires in {VAR_DATE_DIFF} days!',
        background_color: '#f99909',
        icon: 'wall_clock_white_icon',
        pricing_buttons: true,
        purchase_note: false,
        close_button: true,
    }
};

// Country Map for Pricing Data
const COUNTRY_WITH_SPECIFIC_PRICING = {
    "IN": 'india',
    "ID": 'indonesia',
    "AE": 'uae',
    "EG": 'egypt',
    "GB": 'uk',
    "SA": 'saudi_arabia',
    "KW": 'kuwait',
    "SG": 'singapore',
    "IL": 'israel',
    "BR": 'brazil',
}

// PRICING DATA 
let BASIC_DISCOUNTED_PRICE = {
    india: '489*',
    indonesia: '55300* IDR',
    international: '$9.09*',
    uae: 'AED 44.09*',
    egypt: 'EGP 307.99*',
    kuwait: '$11.19*',
    singapore: 'SGD 16.79*',
    israel: 'ILS 44.09*',
    uk: 'GBP 9.79*',
    saudi_arabia: 'SAR 39.89*',
    brazil: 'R$ 100'
}

let BASIC_NORMAL_PRICE = {
    india: '584',
    indonesia: '65850 IDR',
    international: '$10.80',
    uae: 'AED 52.49',
    egypt: 'EGP 366.66',
    kuwait: '$13.33',
    singapore: 'SGD 19.99',
    israel: 'ILS 52.5',
    uk: 'GBP 11.6',
    saudi_arabia: 'SAR 47.5',
    brazil: 'R$ 67'
}

let BASIC_ACTUAL_PRICE = {
    international: '$12.99',
    india: '699',
    indonesia: 'IDR 79000',
    uae: 'AED 62.99',
    egypt: 'EGP 439.99',
    kuwait: '$15.99',
    singapore: 'SGD 23.99',
    israel: 'ILS 62.99',
    uk: 'GBP 13.99',
    saudi_arabia: 'SAR 56.99',
    brazil: 'R$ 79.90'
}

let ADVANCE_DISCOUNTED_PRICE = {
    india: '594*',
    indonesia: '69300* IDR',
    international: '$11.19*',
    uae: 'AED 51.79*',
    egypt: 'EGP 370.99*',
    kuwait: '$13.29*',
    singapore: 'SGD 19.59*',
    israel: 'ILS 51.79*',
    uk: 'GBP 11.89*',
    saudi_arabia: 'SAR 53.19*',
    brazil: 'R$ 125'
}

let ADVANCE_NORMAL_PRICE = {
    india: '709',
    indonesia: '82500 IDR',
    international: '$13.30',
    uae: 'AED 61.66',
    egypt: 'EGP 441.66',
    kuwait: '$15.83',
    singapore: 'SGD 23.33',
    israel: 'ILS 61.6',
    uk: 'GBP 14.2',
    saudi_arabia: 'SAR 63.3',
    brazil: 'R$ 84'
}

let ADVANCE_ACTUAL_PRICE = {
    international: '$15.99',
    india: '849',
    indonesia: 'IDR 99000',
    uae: 'AED 73.99',
    egypt: 'EGP 529.99',
    kuwait: '$18.99',
    singapore: 'SGD 27.99',
    israel: 'ILS 73.99',
    uk: 'GBP 16.99',
    saudi_arabia: 'SAR 75.99',
    brazil: 'R$ 99.90'
}

let MULT25ACCOUNTPRICE = {
    international: '$4',
    india: '213',
    indonesia: 'IDR 24750',
    uae: 'AED 19',
    egypt: 'EGP 133',
    kuwait: '$5',
    singapore: 'SGD 7',
    israel: 'ILS 19',
    uk: 'GBP 5',
    saudi_arabia: 'SAR 19',
}

let BASIC_SLASHED_PRICE = {
    international: '$16.99',
    india: '999',
    indonesia: 'IDR 109000',
    uae: 'AED 89.99',
    egypt: 'EGP 628.99',
    kuwait: '$22.99',
    singapore: 'SGD 33.99',
    israel: 'ILS 89.99',
    uk: 'GBP 19.99',
    saudi_arabia: 'SAR 81.99',
    brazil: 'BRL 119'
};

let ADVANCE_SLASHED_PRICE = {
    international: '$20.99',
    india: '1199',
    indonesia: 'IDR 139000',
    uae: 'AED 105.99',
    egypt: 'EGP 756.99',
    kuwait: '$26.99',
    singapore: 'SGD 39.99',
    israel: 'ILS 105.99',
    uk: 'GBP 23.99',
    saudi_arabia: 'SAR 108.99',
    brazil: 'BRL 149'
};

let PRICING = {
    "brazil": {
        "currency": "BRL",
        "tri_annually": {
            "final": "2016",
            "monthly_final": "56",
            "original": "1788",
            "monthly_original": "149"
        },
        "currency_symbol": "R$",
        "annually": {
            "final": "999",
            "monthly_final": "84",
            "original": "1788",
            "monthly_original": "149"
        }
    },
    "egypt": {
        "currency": "EGP ",
        "tri_annually": {
            "final": "10599.84",
            "monthly_final": "294.44",
            "original": "",
            "monthly_original": "756.99"
        },
        "currency_symbol": "ج.م",
        "annually": {
            "final": "5299.99",
            "monthly_final": "441.66",
            "original": "",
            "monthly_original": "756.99"
        }
    },
    "international": {
        "currency": "USD",
        "tri_annually": {
            "final": "319.2",
            "monthly_final": "8.86",
            "original": "209.99",
            "monthly_original": "20.99"
        },
        "currency_symbol": "$",
        "annually": {
            "final": "159.99",
            "monthly_final": "13.3",
            "original": "209.99",
            "monthly_original": "20.99"
        }
    },
    "india": {
        "currency": "INR",
        "tri_annually": {
            "final": "17028",
            "monthly_final": "473",
            "original": "11999",
            "monthly_original": "1199"
        },
        "currency_symbol": "₹",
        "annually": {
            "final": "8499",
            "monthly_final": "709",
            "original": "11999",
            "monthly_original": "1199"
        }
    },
};

let PRICING_DATA = {
    free_trial_reminder: {
        lastPlan: 'freeTrial',
        basic_price: {
            india: '709*',
            international: '$13.30*',
            egypt: 'EGP 441.66*',
            brazil: 'R$ 84'
        },
        advance_price: {
            india: '709*',
            international: '$13.30*',
            egypt: 'EGP 441.66*',
            brazil: 'R$ 84'
        },
    },
    free_trial_expired: {
        lastPlan: 'freeTrial',
        basic_price: {
            india: '709*',
            international: '$13.30*',
            egypt: 'EGP 441.66*',
            brazil: 'R$ 84'
        },
        advance_price: {
            india: '709*',
            international: '$13.30*',
            egypt: 'EGP 441.66*',
            brazil: 'R$ 84'
        },
    },
    premium_expired: {
        lastPlan: 'planExpired',
        basic_price: {
            india: '709*',
            international: '$13.30*',
            egypt: 'EGP 441.66*',
            brazil: 'R$ 84'
        },
        advance_price: {
            india: '709*',
            international: '$13.30*',
            egypt: 'EGP 441.66*',
            brazil: 'R$ 84'
        },
    },
    annual_plan_reminder: {
        lastPlan: 'planExpired',
        basic_price: {
            india: '709*',
            international: '$13.30*',
            egypt: 'EGP 441.66*',
            brazil: 'R$ 84'
        },
        advance_price: {
            india: '709*',
            international: '$13.30*',
            egypt: 'EGP 441.66*',
            brazil: 'R$ 84'
        },
    },
}

// Untranslatable characters mapping for replacements
let REPLACEMENT_HTML_TAGS = {
    BOLD: {
        replacement_regex: /<strong(.*?)>(.*?)<\/strong>/gi,
        replacement_pattern: '◉☰$2☰◉',
        replaceback_regex: /◉☰(.*?)☰◉/gi,
        replaceback_pattern: '<strong class="_ao3e selectable-text copyable-text" data-app-text-template="*${appText}*">$1</strong>',
    },
    ITALIC: {
        replacement_regex: /<em(.*?)>(.*?)<\/em>/gi,
        replacement_pattern: '◈☱$2☱◈',
        replaceback_regex: /◈☱(.*?)☱◈/gi,
        replaceback_pattern: '<em class="_ao3e selectable-text copyable-text" data-app-text-template="_${appText}_">$1</em>',
    },
    STRIKETHROUGH: {
        replacement_regex: /<del(.*?)>(.*?)<\/del>/gi,
        replacement_pattern: '◎☲$2☲◎',
        replaceback_regex: /◎☲(.*?)☲◎/gi,
        replaceback_pattern: '<del class="_ao3e selectable-text copyable-text" data-app-text-template="~${appText}~">$1</del>',
    },
    CODE: {
        replacement_regex: /<code(.*?)>(.*?)<\/code>/gi,
        replacement_pattern: '▮☳$2☳▮',
        replaceback_regex: /▮☳(.*?)☳▮/gi,
        replaceback_pattern: '<code class="_ao3e selectable-text copyable-text x1lcm9me x1yr5g0i xrt01vj x10y3i5r x14bl8p4 x10jhi2x x1e558r4 x150jy0e x1nn3v0j x1120s5i" data-app-text-template="`${appText}`">$1</code>',
    },
    ORDERED_LIST: {
        replacement_regex: /<li(.*?)value="(.*?)"(.*?)><span(.*?)>(.*?)<\/span><\/li>/gi,
        replacement_pattern: '❖⚌$2= $5⚌❖',
        replaceback_regex: /❖⚌(.*?)= (.*?)⚌❖/gi,
        replaceback_pattern: '<li dir="auto" value="$1" class="x1h0ha7o"><span class="_ao3e selectable-text copyable-text" data-pre-plain-text="$1. ">$2</span></li>',
    },
    UNORDERED_LIST: {
        replacement_regex: /<li(.*?)><span(.*?)>(.*?)<\/span><\/li>/gi,
        replacement_pattern: '⚉⚏$3⚏⚉',
        replaceback_regex: /⚉⚏(.*?)⚏⚉/gi,
        replaceback_pattern: '<li dir="auto" class="x1ye3gou x1jieuv1 xo7wnuk x1sy0ulg xt1y1ed xlu7um4 xm78dhd x1r4uxqn"><span class="_ao3e selectable-text copyable-text" data-pre-plain-text="- ">$1</span></li>',
    },
    EMOJI: {
        replacement_regex: /<img(.*?)>/gi,
        replacement_pattern: '▣▤▥'
    },
    MENTION: {
        replacement_regex: /<span role="button"(.*?)><span(.*?)>(.*?)<span(.*?)>(.*?)<\/span><\/span><\/span>/gi,
        replacement_pattern: '▩▨▧'
    },
    LINK: {
        replacement_regex: /<a(.*?)>(.*?)<\/a>/gi,
        replacement_pattern: '◬◭◮'
    },
    ORDERED_LIST_START: {
        replacement_regex: /<ol(.*?)>/gi,
        replacement_pattern: '🀞🀝🀜'
    },
    ORDERED_LIST_END: {
        replacement_regex: /<\/ol>/gi,
        replacement_pattern: '🀜🀝🀞'
    },
    UNORDERED_LIST_START: {
        replacement_regex: /<ul(.*?)>/gi,
        replacement_pattern: '🀕🀔🀓'
    },
    UNORDERED_LIST_END: {
        replacement_regex: /<\/ul>/gi,
        replacement_pattern: '🀓🀔🀕'
    },
};

//Classes or Selectors used in whatsapp content 
let DOCUMENT_ELEMENT_SELECTORS = {
    "app_div": [
        "#app"
    ],
    "main_panel": [
        "#main"
    ],
    "side_panel": [
        "#side"
    ],
    "left_side_contacts_panel": [
        "#pane-side"
    ],
    "contact_profile_div": [
        "._ak8h",
        "img.x1hc1fzr._ao3e",
        "svg.x1g40iwv"
    ],
    "conversation_panel_profile": [
        "[title=\"Profile details\"]"
    ],
    "today_yesterday_div": [
        "._1fyro",
        "._ao3e"
    ],
    "profile_header": [
        "._604FD",
        "._ak0z",
        "span.x1okw0bk"
    ],
    "conversation_panel": [
        "[data-testid=\"conversation-panel-messages\"]",
        "._5kRIK",
        "._ajyl",
        ".x1ewm37j"
    ],
    "left_side_contacts_name": [
        "#side ._ak8q span"
    ],
    "left_side_contacts_message": [
        "#side ._ak8j .x1cy8zhl"
    ],
    "conversation_panel_wrapper": [
        "[data-testid=\"conversation-panel-body\"]",
        "._3B19s",
        "._amm9",
        ".xnpuxes"
    ],
    "conversation_header": [
        "[data-testid=\"conversation-header\"]",
        "#main header"
    ],
    "conversation_header_name_div": [
        "._amie",
        "#main header .xeuugli"
    ],
    "conversation_message_div": [
        "[data-testid^=\"conv-msg\"]",
        "[data-id^=\"true\"]",
        "[data-id^=\"false\"]"
    ],
    "conversation_non_message_div": [
        ".focusable-list-item"
    ],
    "conversation_title_div": [
        "[data-testid=\"conversation-info-header-chat-title\"]",
        "#main header span"
    ],
    "conversation_compose_div": [
        "[data-testid=\"conversation-compose-box-input\"]",
        "._4r9rJ",
        "._ak1p",
        "._ak1r"
    ],
    "block_message_div": [
        "[data-testid=\"block-message\"]",
        "._1alON"
    ],
    "input_message_div": [
        "#main [contenteditable=\"true\"][role=\"textbox\"]",
        "#main p.selectable-text.copyable-text",
        "div[aria-placeholder=\"Type a message\"]",
        "div[aria-placeholder=\"Digite uma mensagem\"]",
        "div[aria-placeholder=\"اكتب رسالة\"]",
        "div[aria-activedescendant]"
    ],
    "footer_div": [
        "footer._3E8Fg",
        "footer._ak1i"
    ],
    "new_chat_btn": [
        "[data-icon=\"new-chat-outline\"]"
    ],
    "new_chat_parent": [
        "[aria-label=\"New chat\"]"
    ],
    "starting_chat_popup": [
        "[aria-label='Starting chat']",
        "[data-animate-modal-popup=\"true\"]:has(svg circle)"
    ],
    "invalid_chat_popup": [
        "[aria-label='Phone number shared via url is invalid.']",
        "[data-animate-modal-popup=\"true\"]:not(:has(svg circle))"
    ],
    "invalid_popup_ok_btn": [
        "[data-testid=\"popup-controls-ok\"]",
        "[data-animate-modal-popup=\"true\"]:not(:has(svg circle)) button"
    ],
    "send_message_btn": [
        "span[data-icon=\"send\"]",
        "span[data-icon=\"wds-ic-send-filled\"]",
        "button[aria-label=\"Send\"]",
        "button[aria-label=\"Enviar\"]",
        "button[aria-label=\"إرسال\"]"
    ]
};

// Google Analytics Config Data
let GA_CONFIG = {
    GA_ENDPOINT: 'https://www.google-analytics.com/mp/collect',
    GA_DEBUG_ENDPOINT: 'https://www.google-analytics.com/debug/mp/collect',
    MEASUREMENT_ID: 'G-RKJ49K5JXL',
    API_SECRET: 'jJNQa1g_Qw64CF4MRAKj7A',
    DEFAULT_ENGAGEMENT_TIME_MSEC: 100,
    SESSION_EXPIRATION_IN_MIN: 30,
}

// AWS APIs / URLs
let AWS_API = {
    PLAN_FETCH: 'https://hxxz800mgj.execute-api.ap-south-1.amazonaws.com/prod',
    PRO_SENDER_PLAN_FETCH: 'https://2mr6ohue7ctqve46cmne6px23q0zamhc.lambda-url.ap-south-1.on.aws/',
    GET_MULT_ACC_DATA: 'https://1y8vjujto4.execute-api.ap-south-1.amazonaws.com/prod',
    GET_CONFIG_DATA: 'https://hpm53jwusnnb4vmbpmyzjppecy0omfxw.lambda-url.ap-south-1.on.aws/',
    GET_INVOICE_DATES: 'https://gxa6gw54dz6j2gfotwqrdp225y0bwnrb.lambda-url.ap-south-1.on.aws/',
}

// Languages supported for translation
let ALL_LANGUAGE_CODES = ["af", "am", "an", "ar", "ast", "az", "be", "bg", "bn", "br", "bs", "ca", "ckb", "co", "cs", "cy", "da", "de", "el", "en", "eo", "es", "et", "eu", "fa", "fi", "fil", "fo", "fr", "fy", "ga", "gd", "gl", "gn", "gu", "ha", "haw", "he", "hi", "hr", "hu", "hy", "ia", "id", "is", "it", "ja", "ka", "kk", "km", "kn", "ko", "ku", "ky", "la", "ln", "lo", "lt", "lv", "mk", "ml", "mn", "mo", "mr", "ms", "mt", "nb", "ne", "nl", "nn", "no", "oc", "om", "or", "pa", "pl", "ps", "pt", "qu", "rm", "ro", "ru", "sd", "sh", "si", "sk", "sl", "sn", "so", "sq", "sr", "st", "su", "sv", "sw", "ta", "te", "tg", "th", "ti", "tk", "to", "tr", "tt", "tw", "ug", "uk", "ur", "uz", "vi", "wa", "xh", "yi", "yo", "zh", "zu"];

// RTL Direction Language codes
const RTL_LANGUAGE_CODES = ["ar", "he", "fa", "ur", "ps", "ug", "sd", "yi"];

// Languages supported for "Help Message"
let HELP_MESSAGE_LANGUAGE_CODES = ["en", "pt", "es", "id", "ar", "zh", "ru", "fr", "it", "tr", "he", "de"];

// Help Messages
let HELP_MESSAGES = {
    REQUEST_CHAT_SUPPORT_BASIC: "Hi, I would like to request chat support for Pro Sender Basic.",
    REQUEST_CHAT_SUPPORT_ADVANCE: "Hi, I would like to request chat support for Pro Sender Premium.",
    REQUEST_ZOOM_SUPPORT_BASIC: "Hi, I would like to request video call support for Pro Sender Basic.",
    REQUEST_ZOOM_SUPPORT_ADVANCE: "Hi, I would like to request video call support for Pro Sender Premium.",
    REQUEST_CALL_SUPPORT_ADVANCE: "Hi, I would like to request call support for Pro Sender Premium.",
    REQUEST_CALL_SUPPORT_BASIC: "Hi, I would like to request call support for Pro Sender Basic.",
    UNSUBSCRIBE_PLAN: "Hi, I would like to unsubscribe from my plan.",
    LEARN_SCHEDULE: "Hi, I want to learn more about the Schedule feature.",
    NEED_HELP_NON_PREMIUM: "Hi, I need help in using Pro Sender.",
};

let SHOW_UPDATE_REMINDER_POPUP = false;

// FAQs
let FAQS = [
    {
        question: "Does it work in the desktop app?",
        answer: "No, it is a chrome extension and it works only on Google Chrome (Mac, Windows, and Linux)."
    },
    {
        question: "Does it work in my country?",
        answer: "Yes, every country in the world can use the extension."
    },
    {
        question: "How to send clickable links through Pro Sender?",
        answer: "You can send a clickable link to anyone who</br>- Either has your number saved in their phone book</br>- Or has replied to you at least once."
    },
    {
        question: "How to correctly format the numbers column in CSV file?",
        answer: "1. Select the numbers column -> Right click -> Click on ‘Format Cells’.</br>2. Go to the ‘Number‘ category -> Go to ‘Decimal Places‘ box</br>3. Change it ‘0’ and click ‘OK’.</br>4. Verify that the numbers are now coming correctly."
    },
    {
        question: "How to send an attachment?",
        answer: "1. Click on 'Add Attachment' and select the type of attachment</br>2. Select the file you want to send</br>3. Your personal chat would open up - send the file in the chat.</br>4. Now open the extension and click on 'Send Message'. Your file will be sent one by one to all the contacts."
    },
    {
        question: "Can I send message to people in a group separately without saving their contacts?",
        answer: "Yes, you can. Here's how:</br>1. Open the respective group and click on the extension</br>2. Click on 'Download Group Contacts' and an excel of contact numbers will be downloaded</br>3. Upload this csv and enter the message you want to send in the extension."
    }
];

// Other Variables
let RUNTIME_CONFIG = {
    "reloadInject": false,
    "useOldMessageSending": false,
    "displayNotification": false,
    "displayReviewPopup": true,
    "useOldInjectMethod": true,
    "useOldPricingLinks": false,
    "basePricingUrl": "",
    "uninstallUrl": "",
    "templateExcelUrl": "",
    "reviewUrl": ""
}

let MESSAGE_LIMIT = {
    "FreeTrialExpired": {
        "isActive": false,
        "phases": [
            {
                "startAfterDays": 0,
                "dailyLimit": 2000
            },
            {
                "startAfterDays": 90,
                "dailyLimit": 1000
            }
        ]
    },
    "AdvancePromoExpired": {
        "isActive": true,
        "phases": [
            {
                "startAfterDays": 0,
                "dailyLimit": 1000
            }
        ]
    }
}

// WhatFlow CRM uses Easypaisa/JazzCash payment proof system
// See WHATFLOW_CONFIG at top of file for current payment configuration
let PRICING_PAGE_LINK = {};

const PLAN_PRICING_POPUP_FEATURES = {
    UnlimitedMessaging: {
        description: 'Broadcast to multiple chats at once, effortlessly scaling your communication. No need for template approvals and extra fees.'
    },
    AllFreeFeatures: {
        description: 'Unlimited Broadcasting, Attachment, Message Customization, Chat Support, Save Message Template, Detailed Delivery Report'
    },
    SendAttachments: {
        description: 'You can attach and send images, documents, videos, etc. along with your message to users'
    },
    MessageCustomization: {
        description: 'You can customize your message according to the customer with their name, email, order number, etc'
    },
    ChatSupport: {
        description: 'You can click on \'Chat Support\' on the extension to get your queries resolved.'
    },
    Caption: {
        description: 'Add a caption to your attachments'
    },
    SaveCampaignDetails: {
        description: 'Get a detailed report of your campaigns to improve sales and utilize Prime Sender to the fullest'
    },
    SaveMessageTemplate: {
        description: 'Use saved message template in a single click'
    },
    DetailedDeliveryReport: {
        description: 'Get a detailed report of your campaigns to improve sales and utilize Prime Sender to the fullest'
    },
    TranslateConversation: {
        description: 'Now you can translate your messages to any language with just a single click'
    },
    BlurConversations: {
        description: 'Blur conversations to protect sensitive information.'
    },
    PrioritySupport: {
        description: 'We provide priority support to our premium customers, to help them with their queries'
    },
    Nominimumtimegap: {
        description: 'Save time and quickly send messages by reducing the time gap between messages.'
    },
    RandomTimeGap: {
        description: 'Randomise the time gap between messages'
    },
    Batching: {
        description: 'Send your messages in batches and add a time interval between the batches'
    },
    StopCampaign: {
        description: 'Ability to stop messaging mid-campaign'
    },
    GroupContactsExport: {
        description: 'Download unsaved contacts from groups'
    },
    QuickReplies: {
        description: 'You can respond to your customers quickly, with pre-saved responses'
    },
    PauseCampaign: {
        description: 'Ability to resume messaging mid-campaign'
    },
    MultipleAttachments: {
        description: 'You can attach and send multiple images, documents, videos, etc. along with your message to users at once'
    },
    Schedule: {
        description: 'You can schedule at what time to send your messages to users and your messages would be sent automatically at the set time'
    },
    BusinessChatLink: {
        description: 'Generate a link to your WhatsApp number\'s chat and let customers directly connect with you'
    },
    ExportUnsavedChatContacts: {
        description: 'Download unsaved chat contacts'
    },
    MeetZoomSupport: {
        description: 'Support for meet and zoom integration'
    },
    ExportUnsavedContacts: {
        description: 'Export unsaved contacts from chats'
    },
    GroupMessage: {
        description: 'Send messages to groups'
    },
    CustomizableTimeGap: {
        description: 'Customize the time gap between messages'
    }
}    