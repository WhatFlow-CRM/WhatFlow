importScripts("Utils/data.js");
importScripts("Utils/ga-code.js");

const countryToCurrency = { AD: 'EUR', AE: 'AED', AF: 'AFN', AG: 'XCD', AI: 'XCD', AL: 'ALL', AM: 'AMD', AN: 'ANG', AO: 'AOA', AQ: 'USD', AR: 'ARS', AS: 'USD', AT: 'EUR', AU: 'AUD', AW: 'AWG', AX: 'EUR', AZ: 'AZN', BA: 'BAM', BB: 'BBD', BD: 'BDT', BE: 'EUR', BF: 'XOF', BG: 'BGN', BH: 'BHD', BI: 'BIF', BJ: 'XOF', BL: 'EUR', BM: 'BMD', BN: 'BND', BO: 'BOB', BQ: 'USD', BR: 'BRL', BS: 'BSD', BT: 'BTN', BV: 'NOK', BW: 'BWP', BY: 'BYN', BZ: 'BZD', CA: 'CAD', CC: 'AUD', CD: 'CDF', CF: 'XAF', CG: 'XAF', CH: 'CHF', CI: 'XOF', CK: 'NZD', CL: 'CLP', CM: 'XAF', CN: 'CNY', CO: 'COP', CR: 'CRC', CU: 'CUP', CV: 'CVE', CW: 'ANG', CX: 'AUD', CY: 'EUR', CZ: 'CZK', DE: 'EUR', DJ: 'DJF', DK: 'DKK', DM: 'XCD', DO: 'DOP', DZ: 'DZD', EC: 'USD', EE: 'EUR', EG: 'EGP', EH: 'MAD', ER: 'ERN', ES: 'EUR', ET: 'ETB', FI: 'EUR', FJ: 'FJD', FK: 'FKP', FM: 'USD', FO: 'DKK', FR: 'EUR', GA: 'XAF', GB: 'GBP', GD: 'XCD', GE: 'GEL', GF: 'EUR', GG: 'GBP', GH: 'GHS', GI: 'GIP', GL: 'DKK', GM: 'GMD', GN: 'GNF', GP: 'EUR', GQ: 'XAF', GR: 'EUR', GS: 'FKP', GT: 'GTQ', GU: 'USD', GW: 'XOF', GY: 'GYD', HK: 'HKD', HM: 'AUD', HN: 'HNL', HR: 'EUR', HT: 'HTG', HU: 'HUF', ID: 'IDR', IE: 'EUR', IL: 'ILS', IM: 'GBP', IN: 'INR', IO: 'USD', IQ: 'IQD', IR: 'IRR', IS: 'ISK', IT: 'EUR', JE: 'GBP', JM: 'JMD', JO: 'JOD', JP: 'JPY', KE: 'KES', KG: 'KGS', KH: 'KHR', KI: 'AUD', KM: 'KMF', KN: 'XCD', KP: 'KPW', KR: 'KRW', KW: 'KWD', KY: 'KYD', KZ: 'KZT', LA: 'LAK', LB: 'LBP', LC: 'XCD', LI: 'CHF', LK: 'LKR', LR: 'LRD', LS: 'LSL', LT: 'EUR', LU: 'EUR', LV: 'EUR', LY: 'LYD', MA: 'MAD', MC: 'EUR', MD: 'MDL', ME: 'EUR', MF: 'EUR', MG: 'MGA', MH: 'USD', MK: 'MKD', ML: 'XOF', MM: 'MMK', MN: 'MNT', MO: 'MOP', MP: 'USD', MQ: 'EUR', MR: 'MRU', MS: 'XCD', MT: 'EUR', MU: 'MUR', MV: 'MVR', MW: 'MWK', MX: 'MXN', MY: 'MYR', MZ: 'MZN', NA: 'NAD', NC: 'XPF', NE: 'XOF', NF: 'AUD', NG: 'NGN', NI: 'NIO', NL: 'EUR', NO: 'NOK', NP: 'NPR', NR: 'AUD', NU: 'NZD', NZ: 'NZD', OM: 'OMR', PA: 'PAB', PE: 'PEN', PF: 'XPF', PG: 'PGK', PH: 'PHP', PK: 'PKR', PL: 'PLN', PM: 'EUR', PN: 'NZD', PR: 'USD', PS: 'ILS', PT: 'EUR', PW: 'USD', PY: 'PYG', QA: 'QAR', RE: 'EUR', RO: 'RON', RS: 'RSD', RU: 'RUB', RW: 'RWF', SA: 'SAR', SB: 'SBD', SC: 'SCR', SD: 'SDG', SE: 'SEK', SG: 'SGD', SH: 'SHP', SI: 'EUR', SJ: 'NOK', SK: 'EUR', SL: 'SLE', SM: 'EUR', SN: 'XOF', SO: 'SOS', SR: 'SRD', SS: 'SSP', ST: 'STN', SV: 'USD', SX: 'ANG', SY: 'SYP', SZ: 'SZL', TC: 'USD', TD: 'XAF', TF: 'EUR', TG: 'XOF', TH: 'THB', TJ: 'TJS', TK: 'NZD', TL: 'USD', TM: 'TMT', TN: 'TND', TO: 'TOP', TR: 'TRY', TT: 'TTD', TV: 'AUD', TW: 'TWD', TZ: 'TZS', UA: 'UAH', UG: 'UGX', UM: 'USD', US: 'USD', UY: 'UYU', UZ: 'UZS', VA: 'EUR', VC: 'XCD', VE: 'VES', VG: 'USD', VI: 'USD', VN: 'VND', VU: 'VUV', WF: 'XPF', WS: 'WST', YE: 'YER', YT: 'EUR', ZA: 'ZAR', ZM: 'ZMW', ZW: 'ZWL' }
const countryToDialCode = { AF: "+93", AL: "+355", DZ: "+213", AS: "+1684", AD: "+376", AO: "+244", AI: "+1264", AQ: "+672", AG: "+1268", AR: "+54", AM: "+374", AW: "+297", AU: "+61", AT: "+43", AZ: "+994", BS: "+1242", BH: "+973", BD: "+880", BB: "+1246", BY: "+375", BE: "+32", BZ: "+501", BJ: "+229", BM: "+1441", BT: "+975", BO: "+591", BA: "+387", BW: "+267", BR: "+55", IO: "+246", BN: "+673", BG: "+359", BF: "+226", BI: "+257", KH: "+855", CM: "+237", CA: "+1", CV: "+238", KY: "+345", CF: "+236", TD: "+235", CL: "+56", CN: "+86", CX: "+61", CC: "+61", CO: "+57", KM: "+269", CG: "+242", CD: "+243", CK: "+682", CR: "+506", CI: "+225", HR: "+385", CU: "+53", CY: "+357", CZ: "+420", CW: "+599", IC: "+34", DK: "+45", DJ: "+253", DM: "+1767", DO: "+1809", EC: "+593", EG: "+20", SV: "+503", GQ: "+240", ER: "+291", EE: "+372", ET: "+251", FK: "+500", FO: "+298", FJ: "+679", FI: "+358", FR: "+33", GF: "+594", PF: "+689", TF: "+262", GA: "+241", GM: "+220", GE: "+995", DE: "+49", GH: "+233", GI: "+350", GR: "+30", GL: "+299", GD: "+1473", GP: "+590", GU: "+1671", GT: "+502", GG: "+44", GN: "+224", GW: "+245", GY: "+592", HT: "+509", HM: "+672", VA: "+379", HN: "+504", HK: "+852", HU: "+36", IS: "+354", IN: "+91", ID: "+62", IR: "+98", IQ: "+964", IE: "+353", IM: "+44", IL: "+972", IT: "+39", JM: "+1658", JP: "+81", JE: "+44", JO: "+962", KZ: "+77", KE: "+254", KI: "+686", KP: "+850", KR: "+82", KW: "+965", KG: "+996", XK: "+383", LA: "+856", LV: "+371", LB: "+961", LS: "+266", LR: "+231", LY: "+218", LI: "+423", LT: "+370", LU: "+352", MO: "+853", MK: "+389", MG: "+261", MW: "+265", MY: "+60", MV: "+960", ML: "+223", MT: "+356", MH: "+692", MQ: "+596", MR: "+222", MU: "+230", YT: "+262", MX: "+52", FM: "+691", MD: "+373", MC: "+377", MN: "+976", ME: "+382", MS: "+1664", MA: "+212", MZ: "+258", MM: "+95", NA: "+264", NR: "+674", NP: "+977", NL: "+31", BQ: "+599", NC: "+687", NZ: "+64", NI: "+505", NE: "+227", NG: "+234", NU: "+683", NF: "+672", MP: "+1670", NO: "+47", OM: "+968", PK: "+92", PW: "+680", PS: "+970", PA: "+507", PG: "+675", PY: "+595", PE: "+51", PH: "+63", PN: "+872", PL: "+48", PT: "+351", PR: "+1787", QA: "+974", RO: "+40", RU: "+7", RW: "+250", RE: "+262", BL: "+590", SH: "+290", KN: "+1869", LC: "+1758", MF: "+590", PM: "+508", VC: "+1784", WS: "+685", SM: "+378", ST: "+239", SA: "+966", SN: "+221", RS: "+381", SC: "+248", SL: "+232", SG: "+65", SK: "+421", SI: "+386", SB: "+677", SO: "+252", ZA: "+27", GS: "+500", ES: "+34", LK: "+94", SD: "+249", SS: "+211", SR: "+597", SJ: "+47", SZ: "+268", SE: "+46", CH: "+41", SY: "+963", SX: "+721", TW: "+886", TJ: "+992", TZ: "+255", TH: "+66", TL: "+670", TG: "+228", TK: "+690", TO: "+676", TT: "+1868", TN: "+216", TR: "+90", TM: "+993", TC: "+1649", TV: "+688", UG: "+256", UA: "+380", AE: "+971", GB: "+44", US: "+1", UY: "+598", UZ: "+998", VU: "+678", VE: "+58", VN: "+84", VG: "+1284", VI: "+1340", WF: "+681", EH: "+212", YE: "+967", ZM: "+260", ZW: "+263", AX: "+358" }
const countryWithSpecificPricing = { "IN": 'india', "BR": 'brazil', "EG": 'egypt' };

chrome.runtime.onInstalled.addListener((async function (e) {
    send_notification("WhatFlow CRM is installed", '');
    fetchCountryInfo();

    // Check if there is an open WhatsApp Web tab
    chrome.tabs.query({ url: "*://web.whatsapp.com/*" }, function (tabs) {
        if (tabs.length > 0) {
            // If WhatsApp Web is already open, activate that tab and reload it
            chrome.tabs.update(tabs[0].id, { active: true }, function () {
                chrome.tabs.reload(tabs[0].id);
            });
        } else {
            // Else open a new WhatsApp Web tab
            chrome.tabs.create({ url: "https://web.whatsapp.com/" });
        }
    });
}));

// WhatFlow CRM - No external uninstall survey

function messageListner() {
    chrome.runtime.onMessage.addListener(listner);
}

function listner(request, sender, sendResponse) {
    if (request.type === 'send_notification') {
        send_notification(request.title, request.message);
    }
    if (request.type === 'set_uninstall_url') {
        chrome.runtime.setUninstallURL(request.uninstall_url);
    }
}

function send_notification(title, message = '') {
    chrome.notifications.create({
        type: 'basic',
        iconUrl: '../logo/large.png',
        title: title,
        message: message
    });
}

function bcdinit() {
    messageListner();
    chrome.identity.getProfileUserInfo(function (userinfo) {
        chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
            sendResponse({ email: userinfo.email })
        });
    });
}

const default_country_code = "IN";

async function fetchCountryInfo() {
    // Test build 
    if (default_country_code !== "IN") {
        let default_country_name = Object.keys(countryWithSpecificPricing).includes(default_country_code) ? countryWithSpecificPricing[default_country_code] : 'international';
        let test_country_info = {
            name: default_country_name,
            name_code: default_country_code,
            dial_code: countryToDialCode[default_country_code],
            currency: countryToCurrency[default_country_code],
            default: true
        };
        chrome.storage.local.set({ country_info: test_country_info, location_info: test_country_info });
        return;
    }

    // Normal build
    let default_country_info = { name: 'India', name_code: 'IN', dial_code: '91', currency: 'INR', default: true };
    let default_location_info = { name: 'international', name_code: "US", currency: "USD", default: true };

    let current_country_info = await new Promise((resolve, reject) => {
        fetch('https://get.geojs.io/v1/ip/geo.json')
            .then((res) => res.json())
            .then((data) =>
                resolve({
                    name: data.country,
                    name_code: data.country_code,
                    dial_code: countryToDialCode[data.country_code],
                    currency: countryToCurrency[data.country_code],
                    city: data.city,
                    region: data.region,
                    country: data.country,
                    default: false
                })
            )
            .catch((error) => {
                GoogleAnalytics.trackEvent('get_location_api_error', error);
                resolve(null)
            });
    });

    // country_info: used in popup js for country code selector
    // location_info: used in content js for contry wise pricing 
    if (current_country_info === null) {
        chrome.storage.local.set({ country_info: default_country_info, location_info: default_location_info });
    } else {
        chrome.storage.local.set({ country_info: current_country_info, location_info: current_country_info });
    }
}

chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' });

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    try {
        if (tab.url && tab.url.includes("web.whatsapp.com")) {
            if (changeInfo.status === 'loading') {
                chrome.storage.session.remove('whatsapp_session', () => {
                    console.log('WhatsApp session cleared on tab reload.');
                });
            }
        }
    } catch (error) {
        console.error("Error getting tab info:", error);
    }
});

bcdinit();

// ===== WHATFLOW CRM: Periodic activation status sync =====
// Syncs plan/activation status from server every 30 minutes
var WHATFLOW_ADMIN_URL = (typeof WHATFLOW_CONFIG !== 'undefined') ? WHATFLOW_CONFIG.ADMIN_SERVER_URL : "https://what-flow.vercel.app";

function syncActivationStatus() {
    chrome.storage.local.get(['my_number'], function(result) {
        if (!result.my_number || !WHATFLOW_ADMIN_URL) return;
        
        var statusUrl = WHATFLOW_ADMIN_URL + ((typeof WHATFLOW_CONFIG !== 'undefined') ? WHATFLOW_CONFIG.API.EXTENSION_STATUS : "/api/extension/status") + "?whatsappNumber=" + encodeURIComponent(result.my_number);
        
        try {
            fetch(statusUrl)
                .then(function(res) { return res.json(); })
                .then(function(data) {
                    if (data && data.planType) {
                        var updates = {
                            plan_type: data.planType,
                            last_sync: Date.now()
                        };
                        if (data.isActive !== undefined) updates.plan_is_active = data.isActive;
                        if (data.expiresAt) updates.plan_expires_at = data.expiresAt;
                        if (data.dailyMessageLimit) updates.daily_message_limit = data.dailyMessageLimit;
                        if (data.features) updates.plan_features = JSON.stringify(data.features);
                        
                        chrome.storage.local.set(updates);
                    }
                })
                .catch(function(err) {
                    console.log("Activation status sync failed:", err);
                });
        } catch(e) {
            // Silently fail
        }
    });
}

// Sync every 30 minutes (1800000 ms)
setInterval(syncActivationStatus, 1800000);

// Also sync on startup after a short delay
setTimeout(syncActivationStatus, 5000);

// Handle messages from content script to open popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type === 'open_popup') {
        chrome.action.openPopup();
        sendResponse({success: true});
    }
    // Handle activation status request from popup
    if (request.type === 'get_activation_status') {
        chrome.storage.local.get(['my_number'], function(result) {
            if (!result.my_number || !WHATFLOW_ADMIN_URL) {
                sendResponse({error: 'No number or server not configured'});
                return;
            }
            var statusUrl = WHATFLOW_ADMIN_URL + ((typeof WHATFLOW_CONFIG !== 'undefined') ? WHATFLOW_CONFIG.API.EXTENSION_STATUS : "/api/extension/status") + "?whatsappNumber=" + encodeURIComponent(result.my_number);
            fetch(statusUrl)
                .then(function(res) { return res.json(); })
                .then(function(data) {
                    sendResponse(data);
                })
                .catch(function(err) {
                    sendResponse({error: 'Failed to fetch status'});
                });
        });
        return true; // Keep message channel open for async response
    }
    // Handle manual activation sync trigger
    if (request.type === 'sync_activation_now') {
        syncActivationStatus();
        sendResponse({success: true});
    }
});