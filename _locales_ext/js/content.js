var close_img_src = chrome.runtime.getURL("logo/closeBtn.png");
var free_trial_src = chrome.runtime.getURL("logo/free-trial.png");
var advance_promo_src = chrome.runtime.getURL("logo/advance_promo.png");
var success_gif = chrome.runtime.getURL("logo/success.gif");
var recommend_tick = chrome.runtime.getURL("logo/recommend-tickmark.png");
var export_chat_contacts_img_src = chrome.runtime.getURL("logo/prime_export-unsaved-contacts.png");
var export_img_src = chrome.runtime.getURL("logo/prime_export.png");
var export_contacts_text_src = chrome.runtime.getURL("logo/export-contact.svg");
var email_icon_src = chrome.runtime.getURL("logo/email.png");
var error_icon_src = chrome.runtime.getURL("logo/error.png");
var help_icon_src = chrome.runtime.getURL("logo/help.png")
var read_icon_src = chrome.runtime.getURL("logo/read.png");
var wall_clock_white_icon = chrome.runtime.getURL("logo/wall-clock-white.png");
var smile_icon = chrome.runtime.getURL("logo/smile.png");
var logo_img = chrome.runtime.getURL("logo/logo-img.png");
var large_logo_img = chrome.runtime.getURL("logo/large.png");
var medium_logo_img = chrome.runtime.getURL("logo/medium.png");
var arrow_left = chrome.runtime.getURL("logo/prime_arrow-left.png");
var arrow_right = chrome.runtime.getURL("logo/arrow-right.png");
var bulb_icon = chrome.runtime.getURL("logo/lightbulb.png");
var how_to_use1 = chrome.runtime.getURL("logo/how-to-use-1.gif");
var how_to_use2 = chrome.runtime.getURL("logo/how-to-use-2.gif");
var how_to_use3 = chrome.runtime.getURL("logo/how-to-use-3.gif");
var man_thinking = chrome.runtime.getURL("logo/man-thinking.png");
var cross_icon_src = chrome.runtime.getURL("logo/close-1.png");
var check_icon_src = chrome.runtime.getURL("logo/check-mark.png");
var eye_visible = chrome.runtime.getURL("logo/prime_eye-visible.png");
var eye_hidden = chrome.runtime.getURL("logo/prime_eye-hidden.png");
var pause_icon_src = chrome.runtime.getURL("logo/pause_logo.png");
var alarm_clock = chrome.runtime.getURL("logo/alarm_clock.png");
var yellow_star = chrome.runtime.getURL("logo/yellow_star.png");
var yellow_star2 = chrome.runtime.getURL("logo/yellow_star2.png");
var white_star = chrome.runtime.getURL("logo/white_star.png");
var multiple_users_icon = chrome.runtime.getURL("logo/multiple-users-white.png"); 
var multiple_users = chrome.runtime.getURL("logo/multiple-users-silhouette.png"); 
var delete_icon_src = chrome.runtime.getURL("logo/delete-icon.png");
var edit_icon_src = chrome.runtime.getURL("logo/edit_icon.png");   
var down_arrow_src = chrome.runtime.getURL("logo/down-arrow.png");
var download_icon = chrome.runtime.getURL("logo/prime_download.png");
var drag_icon_src = chrome.runtime.getURL("logo/drag_icon.png");
var attachment_icon = chrome.runtime.getURL("logo/prime_attach_symbol.png")
var confetti_gif = chrome.runtime.getURL("logo/confetti.gif")
var hourglass_gif = chrome.runtime.getURL("logo/hourglass.gif")
var new_img = chrome.runtime.getURL("logo/prime_new.png");
var how_to_use1 = chrome.runtime.getURL("logo/how_to_use1.gif");
var renewPlan = chrome.runtime.getURL("logo/refresh.png");
var upgradePlan = chrome.runtime.getURL("logo/prime_signal-status.png");
var upgradePlanBasic = chrome.runtime.getURL("logo/prime_signal-basic.png");
var money_investment = chrome.runtime.getURL("logo/money-investment.png");
var stopwatch_brown = chrome.runtime.getURL("logo/stopwatch_brown.png");
var multiple_users_brown = chrome.runtime.getURL("logo/multiple_users_brown.png");
var mult_user = chrome.runtime.getURL("logo/mult_user.png");

let link = document.createElement("link");
link.rel = "stylesheet";
link.href =
    "https://fonts.googleapis.com/css2?family=Palanquin+Dark:wght@400;500;700&family=PT+Sans+Caption&family=Reem+Kufi+Ink&display=swap";
document.head.appendChild(link);

let my_number = null, 
    my_email = null, 
    my_name = null, 
    my_account_type = null;

let my_name_email_pushed = false, 
    my_name_fetched = false, 
    my_email_fetched = false;

let logged_in_user = null, 
    plan_type = "Expired", 
    last_plan_type = "FreeTrial", 
    plan_duration = "",
    expiry_date = "";

let trial_popups_shown = false;

var rows = [],
    notifications_hash = {},
    stop = false,
    groupIdToName = {},
    contactIdToName = {},
    channelIdToName={};

var messages = ['Hello! how can we help you?', 'Hello!', 'Thank you for using service!'], reload_quick_reply_div = false, imageData;

let totalConvertedSize = 0;;

var location_info = { name: 'international', name_code: "US", currency: "USD", default: true };

var init_store_type = null, whatsapp_version = null, extension_version = chrome.runtime.getManifest().version;

(function addInject() {
    let jsPath = "/js/inject.js";
    let script_element = document.createElement("script");
    script_element.setAttribute("type", "text/javascript");
    script_element.setAttribute("id", "inject");
    script_element.src = chrome.runtime.getURL(jsPath);
    script_element.onload = function () {
        this.parentNode.removeChild(this);
    };
    document.head.appendChild(script_element);
})();

// InjectJS Message Listener
window.addEventListener("message", injectMessageListner, false);

function injectMessageListner(event) {
    if (event.source != window || !event.data.type)
        return;

    let message_type = event.data.type;
    let message_payload = event.data.payload;

    // Handle error and success
    if (message_payload) {
        if (message_payload.error) {
            trackError(message_type, message_payload.error);
        } else if (message_type.includes('send')) {
            trackSuccess(message_type + "_success");
        }
    }

    // Handle message type
    switch (message_type) {
        case "get_init_store_type":
            init_store_type = localStorage.getItem('pro-sender::init_store_type');
            if (!init_store_type || init_store_type != message_payload) {
                init_store_type = message_payload;
                localStorage.setItem('pro-sender::init_store_type', init_store_type);
                trackSystemEvent("init_store_type", init_store_type);
                reload_my_number();
            }
            break;

        case "get_whatsapp_version":
            whatsapp_version = localStorage.getItem('pro-sender::whatsapp-version');
            if (!whatsapp_version || whatsapp_version != message_payload) {
                whatsapp_version = message_payload;
                localStorage.setItem('pro-sender::whatsapp-version', whatsapp_version);
                trackSystemEvent("whatsapp_version", whatsapp_version);
            }
            break;

        case "get_all_groups":
            setGroupDataToLocalStorage(message_payload);
            break;

        case "get_all_contacts":
            setContactDataToLocalStorage(message_payload);
            break;
            
        case "get_all_labels":
            setLabelDataToLocalStorage(message_payload)
            break;
        
        case "get_all_lists":
            setListDataToLocalStorage(message_payload)
            break;
            
        case "get_all_channels":
            setChannelDataToLocalStorage(message_payload)
            break;

        case "verify_whatsapp_number":
            sendChromeMessage({type : message_type, response: message_payload})
            break;
        

        // Handle send_message responses
        case "send_message_to_number":
        case "send_message_to_number_error":
            resolveSendMessageToNumber(message_payload);
            break;

        case "send_message_to_group":
        case "send_message_to_group_error":
            resolveSendMessageToGroup(message_payload);
            break;

        // Handle send_attachments responses
        case "send_attachments_to_number":
        case "send_attachments_to_number_error":
            resolveSendAttachmentsToNumber(message_payload);
            break;

        case "send_message_to_newsletter":
        case "send_message_to_newsletter_error":
            resolveSendMessageToNewsletter(message_payload);
            break;

        case "send_attachments_to_group":
        case "send_attachments_to_grpup_error":
            resolveSendAttachmentsToGroup(message_payload);
            break;

        default:
            break;
    }
}

function setGroupDataToLocalStorage(data) {
    let finalGroupData = data.map((group) => {
        return {
            ...group,
            objId: 'g' + group.id._serialized.replace(/\D+/g, ""),
        }
    })
    chrome.storage.local.set({ "allGroupData": finalGroupData });

    const groupData = data;
    groupData.forEach((group) => {
        const groupid = group.id._serialized;
        if (groupid && group.name)
            groupIdToName[groupid] = group.name;
    })
}

function setContactDataToLocalStorage(data) {
    let finalContactData = data.map((contact) => {
        return {
            ...contact,
            objId: 'c' + contact.id._serialized.replace(/\D+/g, ""),
        }
    })
    chrome.storage.local.set({ "allContactData": finalContactData });

    const contactData = data;
    contactData.forEach((contact) => {
        const contact_id = contact.id._serialized;
        if (contact_id && contact.name)
            contactIdToName[contact_id] = contact.name;
        if (contact.number && contact.number === my_number){
            my_name = contact.pushname;
            my_account_type = contact.isBusiness ? "Business" : "Normal";
            chrome.storage.local.set({"my_account_type" : my_account_type});
        }
    })
    my_name_fetched = true;
}

function setLabelDataToLocalStorage(data){
    if(my_account_type === "Normal"){
        data = data.filter((label) => (label.name !== "Groups" && label.name !== "Communities"));
    }
    chrome.storage.local.set({ "allLabelData" : data })
}

function setChannelDataToLocalStorage(data){
    chrome.storage.local.set({ "allChannelData" : data })

    const channelData = data;
    channelData.forEach((channel) => {
        const channelid = channel.id._serialized;
        if (channelid && channel.name)
            channelIdToName[channelid] = channel.name;
    })
}

function setListDataToLocalStorage(data){
     let finalListData = data.map((list) => {
        return {
            ...list,
            objId: list.number ? 'c'+ list.number : 'g'+ list.id.replace(/\D+/g, ""),
        }
    })
    chrome.storage.local.set({ "allListData" : finalListData })
}

function init() {
    messageListener();
    fetchConfigData();
    handleRuntimeConfig();
    callIfNoOtherPopups(showHowToUsePopup);

    window.onload = function () {
        if (window.location.host === "web.whatsapp.com") {
            reload_my_number();
            chrome.storage.local.get(["messages"], function (result) {
                if (result.messages) messages = result.messages;
            });

            setInterval(() => {
                const quick_reply_div = document.getElementById("quick_reply_div");
                if (!quick_reply_div || reload_quick_reply_div) {
                    quick_reply_messages();
                }

                const download_group_btn = document.getElementById("download_group_btn");
                if (!download_group_btn) {
                    download_group_contacts();
                }

                const translate_div = document.getElementById("translate_div");
                if(!translate_div) {
                    translate_messages();
                }

                const profile_header_buttons_div = document.getElementById('profile_header_buttons_div');
                if (!profile_header_buttons_div) {
                    profile_header_buttons();
                }

                const main_panel = getDocumentElement('main_panel');
                const side_panel = getDocumentElement('side_panel');

                if (side_panel || main_panel) {
                    toggle_blur(null);
                }

                if (!trial_popups_shown && side_panel) {
                    trial_popups_shown = true;
                    callIfNoOtherPopups(showHowToUsePopup);
                    show_trial_popups();
                }

                if (!my_name_email_pushed && my_email_fetched && my_name_fetched) {
                    fetch_plan_details();
                }
            }, 500);

            trackSystemEvent('whatsapp_visit', my_number);
        }
        const profileHeaderInterval = setInterval(() => {
            const profile_header = getDocumentElement("profile_header");
            if (profile_header) {
                clearInterval(profileHeaderInterval);
                handleScheduleCampaigns();
            }
        }, 100);
    };

    chrome.runtime.sendMessage({}, function(response) {
        my_email = response.email;
        my_email_fetched = true;
        trackSystemEvent('logged_mail', my_email);
    });
};
init();

function messageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        switch (request.type) {
            case "number_message":
            case "group_message":
            case 'list_message':
            case "channel_message" :
                messenger(
                    request.numbers || request.groups || request.lists || request.channels,
                    request.message,
                    request.time_gap,
                    request.csv_data,
                    request.customization,
                    request.caption_customization,
                    request.random_delay,
                    request.batch_size,
                    request.batch_gap,
                    request.caption,
                    request.send_attachment_first,
                    request.campaign_type,
                    request.startIndex,
                    request.paused_report_rows,
                    request.paused_sent_count,
                    request.attachmentsData
                );
                break;

            case "reload_my_number":
                reload_my_number();
                break;
            case "schedule_message":
                handleScheduleCampaigns();
                break;
            case "clear_schedule_timeout":
                clearTimeout(request.timeoutId);
                break;
            
            case "add_attachments":
                handleAddAttachment();
                break;
            case "export-groups":
                window.dispatchEvent(new CustomEvent("ProSender::export-group", {
                    detail: {
                        "groupIds": request.exportGroups
                    }
                }));
                break;

            case "verify_whatsappNumber":
                window.dispatchEvent(new CustomEvent("ProSender::verify-whatsapp-number", {
                    detail: {
                        "numbers": request.numbers
                    }
                }));
                break;

            case "reload_contacts":
                window.dispatchEvent(new CustomEvent("ProSender::get-all-contacts"));
                break;

            case "reload_labels":
                window.dispatchEvent(new CustomEvent("ProSender::get-all-labels"));
                break;

            case "reload_channels":
                window.dispatchEvent(new CustomEvent("ProSender::get-all-channels"));
                break;
            case "show_advance_popup":
                premium_reminder(request.feature,'Premium');
                break;
            case "show_premium_popup":
                premium_reminder(request.feature,'Premium');
                break;
            case "show_pricing_popup":
                show_pricing_popup();
                break;
            case "show_advance_pricing_popup":
                show_plan_pricing_popup('advance');
                break;
            
            case "help":
                handle_help();
                break;

            default:
                console.warn("Unknown request type:", request.type);
                break;
        }
    });
}

function profile_header_buttons() {
    const profile_header = getDocumentElement('profile_header');
    if (!profile_header) return;

    const profile_header_buttons_div = document.createElement('div');
    profile_header_buttons_div.id = 'profile_header_buttons_div';

    const profile_header_buttons_list = profile_header.children[0];
    profile_header_buttons_list.insertBefore(profile_header_buttons_div, profile_header_buttons_list.children[0]);

    // Profile Header Buttons

    add_profile_header_btn('prosender_profile', 'Profile - WhatFlow CRM', medium_logo_img, prosender_profile_popup); 
    add_profile_header_btn('blur_contacts', 'Blur chat, contact name and profile picture - WhatFlow CRM', eye_hidden, generateBlurDropdown);
    add_profile_header_btn('download_unsaved_contacts', 'Export contacts - WhatFlow CRM', export_chat_contacts_img_src, download_unsaved_contacts);

    // Handle other 
    const new_chat_btn = getDocumentElement('new_chat_btn');
    if (new_chat_btn && !new_chat_btn.classList.contains('CtaBtn')) {
        new_chat_btn.classList.add('CtaBtn');
    }
    const new_chat_parent = getDocumentElement('new_chat_parent');
    if (new_chat_parent) {
        new_chat_btn.title = "";
        handleShowTooltip({
            query: DOCUMENT_ELEMENT_SELECTORS['new_chat_parent'][0],
            text: "New chat",
            bottom: "-30px",
        });
    }
}

function download_group_contacts() {
    let conv_header = getDocumentElement('conversation_header');
    if (!conv_header) return;
    
    let conv_msg_div = getDocumentElement('conversation_message_div');
    if(!conv_msg_div || !conv_msg_div.dataset['id'].includes('@g.us')) return;
    let curr_chat_id = conv_msg_div.dataset['id'];

    let group_id = curr_chat_id.split('_')[1];
    let download_group_btn = document.createElement("div");

    let export_contacts_text = document.createElement("span");
    export_contacts_text.classList.add('export_contacts_text');
    let export_contacts_text_class = "";
    let groupTitleElement = getDocumentElement('conversation_title_div');
    let groupTitle = groupTitleElement.innerText;

    if(document.body.classList.contains('dark')){
        export_contacts_text_class = "export_gif_bright";
    }

    export_contacts_text.innerHTML =` Export Contacts`;

    download_group_btn.id = "download_group_btn";
    download_group_btn.className = "CtaBtn shimmer"
    download_group_btn.innerHTML = `<img src=${download_icon} />`;
    download_group_btn.appendChild(export_contacts_text);

    chrome.storage.local.get(['countOfExportUsed','lastDayExportUsed','groupDataForShimmer'], function(result) {
        let today = new Date().toDateString();
        let countOfExportUsed = result.countOfExportUsed || 0;
        let lastDayExportUsed = result.lastDayExportUsed || "";
        let groupDataForShimmer = result.groupDataForShimmer || [{}];

        if(today!==lastDayExportUsed){
            lastDayExportUsed = today;
            countOfExportUsed++;
            chrome.storage.local.set({'countOfExportUsed':countOfExportUsed,'lastDayExportUsed':lastDayExportUsed});
        }
        
        if(countOfExportUsed <= 5){
            let groupIndex = groupDataForShimmer.findIndex((group) => group.groupName === groupTitle);
            if (groupIndex !== -1) {
                if (groupDataForShimmer[groupIndex].lastShimmerDay !== today && groupDataForShimmer[groupIndex].shimmerCount <= 5) {
                    groupDataForShimmer[groupIndex].lastShimmerDay = today;
                    groupDataForShimmer[groupIndex].shimmerCount = groupDataForShimmer[groupIndex].shimmerCount + 1;
                    chrome.storage.local.set({'groupDataForShimmer': groupDataForShimmer})
                } else {
                    download_group_btn.classList.remove('shimmer');
                    export_contacts_text.innerHTML = `Export Contacts`;
                }
            }else{
                groupDataForShimmer.push({ groupName: groupTitle, lastShimmerDay: today, shimmerCount: 1 });
                chrome.storage.local.set({'groupDataForShimmer': groupDataForShimmer})
            }
            setTimeout(() => {
                download_group_btn.classList.remove('shimmer');
                export_contacts_text.innerHTML = `Export Contacts`;
            }, 5000);
        }else{
            download_group_btn.classList.remove('shimmer');
            export_contacts_text.innerHTML = `Export Contacts`;
        }
    });  

    conv_header.insertBefore(download_group_btn, conv_header.childNodes[2]);
    let groupTitleParent = groupTitleElement?.parentElement?.parentElement;
    if (groupTitleElement) {
        groupTitleParent.style.overflowX = 'hidden';
    }

    download_group_btn.addEventListener('click', function () {
        if(isPremiumFeatureAvailable()) {
            window.dispatchEvent(new CustomEvent("ProSender::export-group", {
                detail: {
                    "groupIds": [group_id]
                }
            }));
            trackButtonClick('download_group_contacts_premium');
        } else {
            premium_reminder('download_group_contacts', 'Premium');
        }
        // updating premium usage for group contact export
        chrome.storage.local.get(['premiumUsageObject'], function(result){
            if(result.premiumUsageObject!==undefined){
                let updatedPremiumUsageObject = {...result.premiumUsageObject, groupContactExport: true};
                chrome.storage.local.set({'premiumUsageObject': updatedPremiumUsageObject});
            }
        });

        trackButtonClick('download_group_contacts');
    });
} 

function add_profile_header_btn(btn_id, btn_title, btn_image = null, on_click) {
    const profile_header_buttons_div = document.querySelector('#profile_header_buttons_div');
    if (!profile_header_buttons_div) return;

    const existing_btn = document.querySelector(`#${btn_id}`);
    if (existing_btn) return;

    const btn = document.createElement('div');
    btn.id = btn_id;
    btn.classList.add('profile_header_button');
    btn.innerHTML = `<img src=${btn_image} class='${btn_id}_icon CtaBtn' alt='${btn_id}'>`;
    btn.addEventListener('click', on_click);

    profile_header_buttons_div.appendChild(btn);
    handleShowTooltip({
        query: `#${btn_id}`,
        text: btn_title,
        bottom: "-30px",
    });
}

async function prosender_profile_popup() {
    
    const parentDiv = document.querySelector('#profile_header_buttons_div');
    const notificationWrapper = document.querySelector(".notification-wrapper");
    const side_panel = getDocumentElement('side_panel');
    const prosender_profile_popup = document.querySelector("#prosender_profile_popup");
    if (!parentDiv) return;

    if(notificationWrapper){
        side_panel.style.marginTop = "0px"
        notificationWrapper.remove();
    }

    if(prosender_profile_popup){
        prosender_profile_popup.remove();
    }

    const mainDiv = document.createElement("div");
    mainDiv.id = "prosender_profile_popup";
    mainDiv.classList.add("prime_profile_main", "prime_content_popup");
    mainDiv.dir = "ltr";

    const topSection = document.createElement("div");
    topSection.classList.add("prime_profile_top");
    topSection.innerHTML = `
    <div class="prime_profile_cross" id="close_prime_profile_popup">
      <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M405 136.798L375.202 107 256 226.202 136.798 107 107 136.798 226.202 256 107 375.202 136.798 405 256 285.798 375.202 405 405 375.202 285.798 256z"></path></svg>
    </div>
    <div class="prime_profile_logo">
        <div class="prime_profile_img">
            <img src="${medium_logo_img}" alt="">
        </div>
         <div class="prime_profile_text">
             WhatFlow CRM
         </div>
    </div>`;

    const bodySection = document.createElement("div");
    bodySection.classList.add("prime_profile_body");

    let bodyHtml = await new Promise((resolve) => {
        chrome.storage.local.get(['my_number', 'plan_type', 'customer_name', 'customer_email'], async function (result) {
            let bodyHtml = '';
            const order = [
                { key: 'customer_name', label: 'Name' },
                { key: 'customer_email', label: 'Email' },
                { key: 'my_number', label: 'Number' },
                { key: 'plan_type', label: 'Plan Type' },
            ];

            for (const item of order) {
                let label = item.label;
                let value = result[item.key];
                if (item.key === 'my_number' && value) {
                    value = `+${value}`;
                }
                if(item.key === 'plan_type' && (value === "Advance" || value === "Basic")){
                    value = "Premium";
                }
                
                if(value){
                    bodyHtml += `
                    <div class="prime_rows">
                        <p class="prime_col prime_col_end"><span>${label}</span> <span>:</span></p>
                        <span class="prime_col">${value}</span>
                    </div>`;
                }
            }

            resolve(bodyHtml);
        });
    });
    
    const buyPremiumHtml = await showBuyPremiumButtons();
    bodyHtml += `<div class="premium_feature_block" id="buy_premium_block" style="border:none;display:flex;justify-content:center;align-items:center;gap:10px;" dir="ltr">${buyPremiumHtml}</div>`;

    bodySection.innerHTML = bodyHtml;

    if(currentLanguage==="es"){
        mainDiv.style.top="35%";
    }

    mainDiv.append(topSection);
    mainDiv.append(bodySection);

    parentDiv.appendChild(mainDiv);

    let close_popup_btn = document.getElementById("close_prime_profile_popup");
    close_popup_btn.addEventListener("click", () => {
        parentDiv.removeChild(mainDiv);
    })
}


async function generateBlurDropdown() {
    const blurBtn = document.getElementById("blur_contacts");
    const parentDiv = document.querySelector('#profile_header_buttons_div');
    const { isBlurred } = await chrome.storage.local.get("isBlurred");

    if (isBlurred) {
        await chrome.storage.local.set({ isBlurred: false });
        await toggle_blur(true);
        return;
    }

    if (!parentDiv || !blurBtn) return;

    const existingDropdown = document.querySelector('#blur_dropdown');
    if (existingDropdown) {
        existingDropdown.remove();
        return;
    }

    const mainDiv = document.createElement("div");
    mainDiv.id = "blur_dropdown";
    mainDiv.classList.add("prime_profile_main", "blur_main");
    mainDiv.dir = "ltr";

    const topSection = document.createElement("div");
    topSection.classList.add("prime_profile_top");
    topSection.innerHTML = `
        <div class="prime_profile_cross" id="close_blur_dropdown">
            <svg stroke="currentColor" fill="currentColor" stroke-width="0" 
                viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                <path d="M405 136.798L375.202 107 256 226.202 136.798 107 
                         107 136.798 226.202 256 107 375.202 136.798 405 
                         256 285.798 375.202 405 405 375.202 285.798 256z"></path>
            </svg>
        </div>
        <div class="prime_profile_logo">
            <div class="prime_profile_img blur_img">
                <img src="${logo_img}" alt="">
            </div>
            <h1>Blur Settings</h1>
        </div>`;

    const blurOptions = [
        { key: 'blur_chat_name', label: 'Chat Name' },
        { key: 'blur_profile_pic', label: 'Profile Picture' },
        { key: 'blur_chat_messages', label: 'Chat Messages' },
    ];

    const bodySection = document.createElement("div");
    bodySection.classList.add("prime_profile_body", "blur_body");

    const storedValues = await chrome.storage.local.get(blurOptions.map(opt => opt.key));

    let html = '';
    for (const item of blurOptions) {
        const checked = storedValues[item.key] ? 'checked' : '';
        html += `
            <div class="prime_rows blur_rows">
                <p class="prime_col prime_col_end blur_end">
                    <input type="checkbox" class="blur_checkbox" id="${item.key}" ${checked}>
                </p>
                <span class="prime_col">${item.label}</span>
            </div>`;
    }
    html += `<button class="blur_btn" id="blur_btn">Blur</button>`;
    bodySection.innerHTML = html;

    bodySection.querySelectorAll('.blur_checkbox').forEach((checkbox) => {
        checkbox.addEventListener('change', () => {
            chrome.storage.local.set({ [checkbox.id]: checkbox.checked });
        });
    });

    mainDiv.append(topSection, bodySection);
    parentDiv.appendChild(mainDiv);

    document.getElementById("blur_btn").addEventListener("click", async (e) => {
        e.stopPropagation();
        await chrome.storage.local.set({ isBlurred: true });
        await toggle_blur(true);
        mainDiv.remove()
    });

    document.getElementById("close_blur_dropdown").addEventListener("click", (e) => {
        e.stopPropagation();
        mainDiv.remove();
    });
}

async function toggle_blur(click_event) {
    try {
        const blurContactsBtn = document.getElementById('blur_contacts');
        const { isBlurred } = await chrome.storage.local.get("isBlurred");
        const blurKeys = ['blur_chat_name', 'blur_profile_pic', 'blur_chat_messages'];
        const blurSettings = await chrome.storage.local.get(blurKeys);
   
        const blurGroups = {
            blur_chat_name: [
                getDocumentElement('conversation_header_name_div'),
                ...getDocumentElement('left_side_contacts_name', true)
            ],
            blur_profile_pic: [...getDocumentElement('contact_profile_div', true),
                ...getDocumentElement("conversation_panel_profile",true)
            ],
            blur_chat_messages: [...getDocumentElement('conversation_message_div', true),
                ...getDocumentElement("left_side_contacts_message",true),
                ...getDocumentElement('conversation_non_message_div', true)
            ],

        };

        const alwaysBlur = [
            document.querySelector('#reply_div')
        ];

        for (const [key, elements] of Object.entries(blurGroups)) {
            if (blurSettings[key]) {
                elements.forEach(el => {
                    applyOrRemoveBlur(el, 'blur', isBlurred);
                });
            }
        }

        alwaysBlur.forEach(el => {
            applyOrRemoveBlur(el, 'blur', isBlurred);
        });

        if (click_event) {
            blurContactsBtn.classList.toggle('blurred', isBlurred);
            blurContactsBtn.innerHTML = `<img class='blur_icon' src=${isBlurred ? eye_visible : eye_hidden} alt='blur-info'>`;

            if (isBlurred) {
                trackButtonClick('blur_contacts');
            }
        }
    } catch (e) {
        console.error('Error :: toggle_blur :: ', e);
    }
}

function applyOrRemoveBlur(element, className, shouldApply) {
    try {
        if (!element)
            return;

        if (shouldApply) {
            element.classList.add(className);
        } else {
            element.classList.remove(className);
        }
    } catch (error) {
        console.log(error);
    }
}

function addAppBackdrop() {
    let app = getDocumentElement('app_div');
    if (app) {
        app.classList.add("edit_backdrop")
        app.addEventListener('click', handleAppClick, true);
    }
}

function handleAppClick(e) {
  e.stopImmediatePropagation(); 
  e.preventDefault();           
}

function removeAppBackdrop() {
    let app = getDocumentElement('app_div');
    if (app) {
        app.classList.remove("edit_backdrop")
        app.removeEventListener('click', handleAppClick, true);
    }
}

function download_unsaved_contacts() {
    const parentDiv = document.querySelector('#profile_header_buttons_div');
    if (!parentDiv) return;

    if(document.querySelector('#export_options')) {
        parentDiv.removeChild(document.querySelector('#export_options'));
        return;
    }

    let mainDiv = document.createElement("div")
    mainDiv.id = "export_options"
    mainDiv.innerHTML = `
    <div id="saved_contacts" class="export_option"><button class="contacts_btn"><img class="contacts_img" src="${download_icon}"></button> Download saved contacts</div>
    <div id="unsaved_contacts" class="export_option"><button class="contacts_btn"><img class="contacts_img" src="${download_icon}"></button> Download chat contacts</div>    
    `

    parentDiv.append(mainDiv)
    document.getElementById("saved_contacts").addEventListener("click",()=>{
        if (isAdvanceFeatureAvailable()) {
            window.dispatchEvent(new CustomEvent("ProSender::export-saved-contacts", { detail: { type: "Premium" } }));
            trackButtonClick("download_saved_contacts_premium");
        } else {
            window.dispatchEvent(new CustomEvent("ProSender::export-saved-contacts", { detail: { type: "Expired" } }));
        }
        chrome.storage.local.get(['premiumUsageObject'], (result) => {
            if (result.premiumUsageObject !== undefined) {
                let updatedPremiumUsageObject = {
                    ...result.premiumUsageObject,
                    downloadSavedContacts: true,
                };
                chrome.storage.local.set({ premiumUsageObject: updatedPremiumUsageObject });
            }
        });
        mainDiv.remove()
    })

    document.getElementById("unsaved_contacts").addEventListener("click",()=>{
        if (isAdvanceFeatureAvailable()) {
            window.dispatchEvent(new CustomEvent("ProSender::export-unsaved-contacts", { detail: { type: "Premium" } }));
            trackButtonClick("download_unsaved_contacts_premium");
        } else {
            window.dispatchEvent(new CustomEvent("ProSender::export-unsaved-contacts", { detail: { type: "Expired" } }));
        }
        chrome.storage.local.get(['premiumUsageObject'], (result) => {
            if (result.premiumUsageObject !== undefined) {
                let updatedPremiumUsageObject = {
                    ...result.premiumUsageObject,
                    downloadUnsavedContacts: true,
                };
                chrome.storage.local.set({ premiumUsageObject: updatedPremiumUsageObject });
            }
        });
        mainDiv.remove()
    })

    trackButtonClick("download_contacts");
}

function quick_reply_messages() {
    let reply_div = document.getElementById("quick_reply_div");
    if (reply_div) {
        reply_div.parentNode.removeChild(reply_div);
    }

    reply_div = document.createElement("div");
    reply_div.id = 'quick_reply_div';

    const messagesHTML = messages.map(message => {
        let text = typeof message === "object" && message !== null
            ? message.title || message.message
            : message;

        let displayText = text.length > 47 ? text.substring(0, 47) + '...' : text;
        let background = message.color || 'var(--outgoing-background)';

        return `
            <button class="reply_click message_btn CtaBtn" style="background:${background}" value="${text}">
                ${message.title ? `<img src="${attachment_icon}" class="attachment_reply"/>` : ""}
                ${displayText}
            </button>`;
    }).join("");

    const buttonsHTML = `
        <div id="quick_reply_buttons_container" class="quick_reply_container">
            <button class="CtaBtn menu_btn" id="expand_quick_reply_btn" isExpand="false" style="display: none;">
                <img src="${down_arrow_src}" />
            </button>
            <button class="CtaBtn menu_btn" id="edit_quick_reply_btn">Edit</button>
        </div>`;

    reply_div.innerHTML = `
        <div id="quick_reply_messages_container" class="quick_reply_container">
            ${messagesHTML}
        </div>
        ${buttonsHTML}`;

    reply_div.addEventListener('click', (event) => {
        let message = event.target.value;
        send_quick_reply_message(message);
    });


    let footer_div = getDocumentElement('footer_div');
    if (footer_div) {
        footer_div.style.paddingTop = '36px';
        footer_div.appendChild(reply_div);

        let conversation_panel = getDocumentElement('conversation_panel');
        if (conversation_panel) {
            conversation_panel.scrollBy(0, 33);
        }

        reload_quick_reply_div = false;
    } else {
        return;
    }  

    let edit_btn = document.getElementById("edit_quick_reply_btn");
    edit_btn.addEventListener('click', (e) => {
        e.stopPropagation();
        edit_quick_reply_popup();
        addAppBackdrop();

        trackButtonClick('smart_reply_edit');
    }); 

    let expand_quick_reply_btn = document.getElementById("expand_quick_reply_btn");
    expand_quick_reply_btn.addEventListener('click', (e) => {
        e.stopPropagation();

        let isExpand = e.target.getAttribute('isExpand') === "true";
        let footer_div = getDocumentElement('footer_div')
        let quick_reply_div = document.getElementById("quick_reply_div");
        let messages_container = document.getElementById("quick_reply_messages_container");
    
        if (footer_div && quick_reply_div && messages_container) {
            if (!isExpand) {
                messages_container.style.flexWrap = 'wrap';
                footer_div.style.paddingTop = `${quick_reply_div.offsetHeight}px`;
                expand_quick_reply_btn.style.rotate = '180deg';
                trackButtonClick('smart_reply_div_expanded');
            } else {
                messages_container.style.flexWrap = 'nowrap';
                footer_div.style.paddingTop = '36px';
                expand_quick_reply_btn.style.rotate = '0deg';
            }    

            e.target.setAttribute('isExpand', (!isExpand).toString());
            // TRACK GOOGLE ANALYTICS FOR THIS NEW BUTTON
        }
    });

    // Show / Not show expand quick reply button
    setTimeout(() => {
        let container = document.getElementById("quick_reply_messages_container");
        let expand_btn = document.getElementById("expand_quick_reply_btn");
    
        if (container && expand_btn) {
            expand_btn.style.display = isOverflowing(container) ? "block" : "none";
        }
    }, 100);


    // updating premium usage for quick replies
    let quickReplyButton= document.getElementsByClassName('reply_click')[0];
    if(quickReplyButton){
        quickReplyButton.addEventListener('click', function (){
            chrome.storage.local.get(['premiumUsageObject'], function(result){
                if(result.premiumUsageObject!==undefined){
                    let updatedPremiumUsageObject = {...result.premiumUsageObject, quickReplies: true};
                    chrome.storage.local.set({'premiumUsageObject': updatedPremiumUsageObject});
                }
            });
        })
    }
}

function isOverflowing(element) {
    return element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
}

async function send_quick_reply_message(message) {
    if (!message || message.trim().length == 0) return;

    let message_input_box = getDocumentElement('input_message_div');
    if (!message_input_box) return;

    trackButtonClick("smart_reply_sent");
    let result = messages.find(msg => typeof msg === "object" && msg.title === message);
    if (isPremiumFeatureAvailable()) {
        trackButtonClick("smart_reply_sent_premium");
        if (result) {
            let conv_header = getDocumentElement('conversation_header');
            if (!conv_header) return;

            let conv_msg_div = getDocumentElement('conversation_message_div');
            let curr_chat_id = conv_msg_div.dataset['id'];
            
            trackSystemEvent("smart_reply_sent_attachment");
            if (!conv_msg_div || !conv_msg_div.dataset['id'].includes('@g.us')) {
                let number_id = curr_chat_id.split('_')[1];
                window.dispatchEvent(new CustomEvent("ProSender::send-attachments", {
                    detail: {
                        number: number_id,
                        attachments: result.blob,
                        name: result.name,
                        caption: result.caption,
                        quick: true
                    }
                }));
            } else {
                let group_id = curr_chat_id.split('_')[1];
                window.dispatchEvent(new CustomEvent("ProSender::send-attachments-to-group", {
                    detail: {
                        groupId: group_id,
                        attachments: result.blob,
                        name: result.name,
                        caption: result.caption,
                        quick: true
                    }
                }));

            }
        } else {
            trackSystemEvent("smart_reply_sent_message");
            pasteMessage(message);
            await sendMessageToNumber();
        }
    } else {
        premium_reminder('smart_reply', 'Premium');
    }
}

function pasteMessage(text) {
    const dataTransfer = new DataTransfer();
    dataTransfer.setData("text", text);
    const event = new ClipboardEvent("paste", {
        clipboardData: dataTransfer,
        bubbles: true,
    });
    
    const inputMessageBox = getDocumentElement('input_message_div');
    inputMessageBox.dispatchEvent(event);
}

function filter_quick_reply_message(message) {
    return message
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();
}

function refresh_quick_replies() {
    let messages_list = document.getElementById('quick_reply_messages_list');
    if (messages_list) {
        messages_list.innerHTML = messages.map((message, index) => {
            let message_bg_color = message.color || (document.body.classList.contains('dark') ? '#005c4b' : '#d9fdd3');
            return `
                <div class="message_row drag_handle" draggable="true" index="${index}">
                    <img class="CtaBtn drag_handle" src="${drag_icon_src}" title="Reorder"/>
                    <div class="message_div drag_handle" title="Send" style="background-color: ${message_bg_color}">${message.title || message.message || message}</div>
                    <input type="color" class="color-picker" index=${index} id="color${index}" value="${message_bg_color}" title="Change Background"/>
                    <img class="CtaBtn edit_message_btn" index="${index}" src="${edit_icon_src}" title="Edit"/>
                    <img class="CtaBtn delete_message_btn" index="${index}" src="${delete_icon_src}" title="Delete"/>
                </div>
            `;
        }).join("");        
    }

    chrome.storage.local.set({ messages: messages });
    chrome.storage.local.set({ totalConvertedSize: totalConvertedSize });
    reload_quick_reply_div = true;

    // Handle Drag and Drop Listenre
    let dragged_index = null;
    document.querySelectorAll('.message_row').forEach((row) => {
        row.addEventListener('dragstart', (e) => {
            let target_element = e.target;
            let target_row = target_element.closest('.message_row');
            
            if (target_element.classList.contains('drag_handle')) {
                dragged_index = parseInt(target_row.getAttribute('index'));
                target_row.style.opacity = '0.5';
            } else {
                e.preventDefault();
            }
        });

        row.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.target.closest('.message_row').classList.add('dragged');
        });

        row.addEventListener('dragleave', (e) => {
            e.target.closest('.message_row').classList.remove('dragged');
        });

        row.addEventListener('drop', (e) => {
            e.preventDefault();
            let target_element = e.target;
            let target_row = target_element.closest('.message_row');
            let dropped_index = parseInt(target_row.getAttribute('index'));
            
            if (dragged_index !== dropped_index) {
                let moved_item = messages.splice(dragged_index, 1)[0];
                messages.splice(dropped_index, 0, moved_item);
                refresh_quick_replies();
                trackButtonClick('smart_reply_reordered');
            }
        });

        row.addEventListener('dragend', (e) => {
            e.target.closest('.message_row').classList.remove('dragged');
            e.target.closest('.message_row').style.opacity = '1';
        });
    });
}

function getFileDetails(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject(new Error("No file provided"));
            return;
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB limit per file
            resolve("More than 10MB file size is not allowed!");
            return;
        }

        const fr = new FileReader();
        fr.readAsDataURL(file);
        fr.onload = () => {
            const base64String = fr.result;
            totalConvertedSize += base64String.length; // Track encoded data size
            if (totalConvertedSize > 50 * 1024 * 1024) { // 50MB total limit
                resolve("Upload limit reached. You can only upload up to 50MB in total.");
                return;
            }
            resolve({ name: file.name, blob: JSON.stringify(base64String) });
        };
        fr.onerror = err => reject(err);
    });
}

    // Toggle UI elements based on image selection
function toggleUI(showImageOptions) {
    document.getElementById("add_quick_img_btn_container").style.display = showImageOptions ? "flex" : "none";
    document.getElementById("add_quick_reply_btn_container").style.display = showImageOptions ? "none" : "flex";
    document.getElementById("title_input").style.display = showImageOptions ? "block" : "none";
    document.getElementById("add_quick_img_btn").style.display = showImageOptions ? "none" : "block";

    const captionField = document.getElementById("add_quick_reply_textarea");
    captionField.placeholder = showImageOptions ? "Type your caption here ..." : "Type your quick reply here";
    captionField.classList.toggle("title_textarea", showImageOptions);
}

// Display selected image name
function displayImageName(imageName,classRed) {
    let existingPTag = document.getElementById("image_name");
    if (!existingPTag) {
        existingPTag = document.createElement("p");
        existingPTag.className = `image_name ${classRed}`;
        existingPTag.id = "image_name";
        document.getElementById("inputs_container").append(existingPTag);
    }
    existingPTag.innerText = imageName;
}

// Reset UI elements after saving
function resetUI() {
    toggleUI(false);
    document.getElementById("image_name")?.remove();
    document.getElementById("title_input").value = "";
    document.getElementById("add_quick_reply_textarea").value = "";
}

async function handleImageSelection(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Show and hide relevant UI elements
    toggleUI(true);

    try {
        imageData = await getFileDetails(file);
        if(typeof imageData !== 'string'){
            displayImageName(imageData.name,'');
        }else{
            resetUI()
            displayImageName(imageData,"error_class")
            setTimeout(() => {
                resetUI()
            }, 2000);
        }
    } catch (error) {
        resetUI()
        console.error(error.message);
    }
}

function edit_quick_reply_popup() {
    let edit_popup = document.getElementById('edit_quick_reply_popup');
    if (edit_popup) {
        document.body.removeChild(edit_popup);
    }

    edit_popup = document.createElement('div');
    edit_popup.id = 'edit_quick_reply_popup';
    edit_popup.className = 'edit_quick_reply_popup trial_popup';
    edit_popup.style.width = 'min(600px, 95%)';
    edit_popup.style.maxHeight = 'min(600px, 85%)';
    edit_popup.innerHTML = `
        <div class="edit_quick_reply_content trial_content">
            <span class="CtaCloseBtn popup-close-btn" id="close_edit_quick_reply_popup"><img src="${close_img_src}" /></span>

            <div class="trial_big_title">Edit / Add Quick Replies</div>
            <div id="quick_reply_messages_list" class="messages_list"></div>
            
            <div class="input_container">
                <div id="inputs_container">
                    <input type="text" id="title_input" placeholder="Name tag your quick reply here" class="title_input_container" style="display:none;" >
                    <textarea id="add_quick_reply_textarea" type="text" placeholder="Type your quick reply here"></textarea>
                    <img src="${attachment_icon}" alt="Add Attachment" id="add_quick_img_btn" class="attachment_icon tool-icon shimmer">
                </div>
                <div id="add_quick_reply_btn_container" class="btn_container">
                    <button id="add_quick_reply_btn" class="CtaBtn text_btn">Add Template</button>
                    <input type="file" id="select-image" hidden>
                </div>
                <div id="edit_quick_reply_btn_container" class="btn_container" style="display: none;">
                    <button id="save_quick_reply_btn" class="CtaBtn text_btn">Save</button>
                    <button id="cancel_quick_reply_btn" class="CtaBtn text_btn">Cancel</button>
                </div>
                <div id="add_quick_img_btn_container" class="btn_container" style="display: none;">
                    <button id="save_quick_img_btn" class="CtaBtn text_btn">Save</button>
                    <button id="cancel_quick_img_btn" class="CtaBtn text_btn">Cancel</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(edit_popup);
    refresh_quick_replies();

    // On close button click
    document.getElementById('close_edit_quick_reply_popup').addEventListener('click', () => {
        document.body.removeChild(edit_popup);
        removeAppBackdrop();
    })

    // Handle Delete, Edit, Save and Send functions
    document.getElementById('quick_reply_messages_list').addEventListener('click', (event) => {
        event.stopPropagation();

        let targetElement = event.target;
        let targetClass = event.target.classList;
        let targetIndex = parseInt(event.target.getAttribute('index'));
        
        if (targetClass.contains('delete_message_btn')) {
            // Delete quick reply message
            const [deletedItem] = messages.splice(targetIndex, 1); // Remove the file
            if (deletedItem && deletedItem.blob) {
                const byteSize = Math.ceil((deletedItem.blob.length * 3) / 4);
                totalConvertedSize -= byteSize; // Deduct from total size
            }
            refresh_quick_replies();

            trackButtonClick('smart_reply_deleted');
        } else if (targetClass.contains('edit_message_btn')) {
            // Add textarea to edit message
            if (!isNaN(targetIndex)) {
                refresh_quick_replies();
                document.querySelectorAll('.message_row')[targetIndex].classList.add('disabled');
                if(typeof messages[targetIndex] === 'object'){
                    toggleUI(true)
                    displayImageName(messages[targetIndex].name,'')
                    document.getElementById("title_input").value = messages[targetIndex].title;
                    document.getElementById("add_quick_reply_textarea").value = messages[targetIndex].caption;
                    document.getElementById('add_quick_img_btn_container').setAttribute('index', targetIndex);   
                } else {
                    document.getElementById('add_quick_reply_textarea').value = messages[targetIndex];
                    document.getElementById('add_quick_reply_btn_container').style.display = 'none';   
                    document.getElementById('edit_quick_reply_btn_container').style.display = 'flex';   
                    document.getElementById('edit_quick_reply_btn_container').setAttribute('index', targetIndex);   
                }

            }
        } else if (targetClass.contains('message_div')) {
            // Close popup and Send quick reply message
            document.body.removeChild(edit_popup);
            removeAppBackdrop();

            send_quick_reply_message(targetElement.innerText);
        }else if(targetClass.contains('color-picker')){

            targetElement.addEventListener("change", (e) => {
                let newColor = e.target.value;
                if(typeof messages[targetIndex] === 'object'){
                    messages[targetIndex].color = newColor;
                }else{
                    messages[targetIndex] = { message : messages[targetIndex], color : newColor }
                }
                refresh_quick_replies();
            }, { once: true });
            

        }
    })

    // Add quick reply message
    document.getElementById('add_quick_reply_btn').addEventListener('click', (event) => {
        event.stopPropagation();

        let new_message = document.getElementById('add_quick_reply_textarea').value;
        new_message = filter_quick_reply_message(new_message);

        if(new_message) {
            messages.push(new_message);
            refresh_quick_replies();

            document.getElementById('add_quick_reply_textarea').value = '';
            trackButtonClick('smart_reply_added');
        }
    })

    document.getElementById("add_quick_img_btn").addEventListener("click", (event) => {
        event.stopPropagation();
        
        const inputImage = document.getElementById("select-image");
        inputImage.click();
        inputImage.addEventListener("change", handleImageSelection, { once: true });
    });
    
    document.getElementById("save_quick_img_btn").addEventListener("click", () => {
        const inputContent = document.getElementById("title_input");
        const captionContent = document.getElementById("add_quick_reply_textarea");
        let target_index = document.getElementById('add_quick_img_btn_container').getAttribute('index'); 
    
        if (inputContent.value.trim()) {
            if(target_index){
                messages[target_index].title = filter_quick_reply_message(inputContent.value);
                messages[target_index].caption = filter_quick_reply_message(captionContent.value);
                document.getElementById('add_quick_img_btn_container').setAttribute('index', '');
            } else {
                imageData.title = filter_quick_reply_message(inputContent.value);
                imageData.caption = filter_quick_reply_message(captionContent.value);
                messages.push(imageData);
            }
    
            refresh_quick_replies();
            resetUI();
        } else {
            inputContent.focus();
        }
    });

    document.getElementById("cancel_quick_img_btn").addEventListener("click", () => {
        resetUI()
        let target_index = document.getElementById('add_quick_img_btn_container').getAttribute('index');
        if(target_index){
            document.querySelectorAll('.message_row')[target_index].classList.remove('disabled');
            document.getElementById('add_quick_img_btn_container').setAttribute('index', '');
        }

    });
        
    // Save edited quick reply message
    document.getElementById('save_quick_reply_btn').addEventListener('click', (event) => {
        event.stopPropagation();
        
        let new_message = document.getElementById('add_quick_reply_textarea').value.trim();
        let target_index = document.getElementById('edit_quick_reply_btn_container').getAttribute('index');   
        new_message = filter_quick_reply_message(new_message);

        if(new_message && target_index) {
            messages[target_index] = new_message;
            refresh_quick_replies();

            document.getElementById('add_quick_reply_textarea').value = '';
            document.getElementById('add_quick_reply_btn_container').style.display = 'flex';   
            document.getElementById('edit_quick_reply_btn_container').style.display = 'none';   
            document.getElementById('edit_quick_reply_btn_container').setAttribute('index', '');   
            trackButtonClick('smart_reply_edited');
        }
    });

    // Cancel edit quick reply message
    document.getElementById('cancel_quick_reply_btn').addEventListener('click', (event) => {
        event.stopPropagation();

        refresh_quick_replies();
        document.getElementById('add_quick_reply_textarea').value = '';
        document.getElementById('add_quick_reply_btn_container').style.display = 'flex';   
        document.getElementById('edit_quick_reply_btn_container').style.display = 'none';   
        document.getElementById('edit_quick_reply_btn_container').setAttribute('index', '');   
    });

    trackButtonView('edit_smart_reply_popup');
}

async function reload_my_number() {
    my_number = null;
    if (!my_number) {
        try {
            var last_wid = window.localStorage.getItem("last-wid");
            var last_wid_md = window.localStorage.getItem("last-wid-md");
            if (last_wid_md)
                my_number = window.localStorage.getItem("last-wid-md").split("@")[0].substring(1).split(":")[0];
            else if (last_wid)
                my_number = window.localStorage.getItem("last-wid").split("@")[0].substring(1);

            if (my_number) {
                console.log("my_number from local storage:", my_number);
                chrome.storage.local.set({ my_number: my_number });
            }
        } catch (e) {
            trackError('my_number_error', e);
            console.log(e);
        }
    }

    if (!my_number) {
        let result = await chrome.storage.local.get('my_number');
        my_number = result.my_number || null;
        console.log("my_number from chrome storage:", my_number);
    }

    if (!my_number) {
        trackSystemEvent('no_number', 'track');
        try {
            trackSystemEvent('no_number_local_storage', window.localStorage);
        } catch (e) {
            console.log(e)
        }
    } else {
        fetch_plan_details();
        trackSystemEvent('my_number', my_number);
    }
}

async function readFileAndSaveToLocalStorage(e, localStorageName) {
    let files = e.target.files;
    let renderedFiles = [];

    let fileReadPromises = Array.from(files).map((file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = function(event) {
                const base64Data = event.target.result;
                const fileData = {
                    name: file.name,
                    type: file.type,
                    data: base64Data
                };
                renderedFiles.push(fileData);
                resolve();
            };
            reader.readAsDataURL(file);
        });
    });
    await Promise.all(fileReadPromises);
    chrome.storage.local.set({ [localStorageName]: renderedFiles });
}

async function handleAddAttachment() {
    let inputElement = document.createElement('input');
    inputElement.type = "file";
    inputElement.id = "new_input_element";
    inputElement.multiple = true;
    document.body.appendChild(inputElement);
    inputElement.click();

    inputElement.addEventListener("change", async function(e) {
        let selectedFiles = inputElement.files;
        trackEvent('add_attachments', selectedFiles.length);
        await readFileAndSaveToLocalStorage(e, "linuxInputAttachments")
        inputElement.remove();
    });
}

function handleAddCSVInput(){
    let inputElement = document.createElement('input');
    inputElement.type = "file";
    inputElement.id = "new_csv_input_element";
    inputElement.accept = ".xls,.xlsx,.ods,.csv";
    document.body.appendChild(inputElement);
    inputElement.click();

    inputElement.addEventListener("change", async function(e){
        await readFileAndSaveToLocalStorage(e, "linuxCSVAttachment")
        inputElement.remove();
    });
}

// Google Analytics
function getTrackLabel() {
    try {
        return [my_number, plan_type, plan_duration].join(' ').trim();
    } catch {
        return '';
    }
}

function getTrackLocation() {
    return location_info.default ? {} : {
        city: location_info.city,
        region: location_info.region,
        country: location_info.country,
        dial_code: location_info.dial_code,
    }
}

function getTrackContext() {
    return {
        init_store_type: init_store_type,
        whatsapp_version: whatsapp_version,
        extension_version: extension_version,
    }
}

function trackEvent(event, track) {
    trackGenericEvent(event, { type: 'event', track, natural_interaction: true });
}

function trackButtonClick(event) {
    trackGenericEvent(event, { type: 'clicked', natural_interaction: true });
}

function trackCloseButtonClick(event) {
    trackGenericEvent(event, { type: 'clicked' });
}

function trackButtonView(event) {
    trackGenericEvent(event, { type: 'viewed' });
}

function trackSystemEvent(event, track = '') {
    trackGenericEvent(event, { type: 'event', track });
}

function trackSuccess(event) {
    trackGenericEvent(event, { type: 'success' });
}

function trackError(event, error = '') {
    trackGenericEvent(event, { type: 'error', error: String(error) })
}

function trackGenericEvent(event, data) {
    let label = getTrackLabel();
    let location = getTrackLocation();
    let context = getTrackContext();

    // Filters null and undefined values
    let combinedData = { ...location, ...context, ...data };
    let eventData = Object.fromEntries(
        Object.entries(combinedData).filter(([key, value]) => value != null || value != undefined) 
    );
    GoogleAnalytics.trackEvent(event, { label, ...eventData });
}

// ---- fetch plan details ---
function fetch_plan_details() {
    if (!my_number)
        return;

    if (my_name_fetched && my_email_fetched)
        my_name_email_pushed = true;

    fetch_data(my_number, my_email, my_name)
        .then(res => {
            handle_response(res);
        })
        .catch(err => {
            trackError("fetch_plan_api_error", err);
            console.error("Error fetching number data:", err);
        });
}

async function fetch_data(number, email = '', name = '') {
    var url = `${AWS_API.PRO_SENDER_PLAN_FETCH}?phone=${number}&email=${email}&name=${name}`;
    return new Promise(function (resolve, reject) {
        $.ajax({
            type: "GET",
            url: url,
            success: function (response) {
                resolve(response);
            },
            error: function (error) {
                reject(error);
            },
            dataType: "json",
        });
    });
}

function help(message) {
    chrome.storage.local.get(['currentLanguage', 'customer_care_number'], async (res) => {
        let help_message = message.replace(/ /gm, " ")
        let language = res.currentLanguage || 'default';
        // Default to WhatFlow CRM support number if not set in storage
        let supportNumber = res.customer_care_number || ((typeof WHATFLOW_CONFIG !== 'undefined') ? WHATFLOW_CONFIG.SUPPORT_PHONE_RAW : '923269580417');

        
        if(HELP_MESSAGE_LANGUAGE_CODES.includes(language)) {
            help_message = help_message.replace("WhatFlow CRM", "◉☰◐◉");
            help_message = await translate(help_message);
            help_message = help_message.replace("◉◐◐◉", "WhatFlow CRM").replace(/ /gm, " ");
        }

        try {
            await openNumber(supportNumber, help_message);
            await sendMessage();
        } catch (error) {
            console.log(error);
        }
    });
}

function handle_help() {
    if(isPremium()) {
        help(HELP_MESSAGES.REQUEST_CHAT_SUPPORT_ADVANCE);
    }
    else {
        help(HELP_MESSAGES.NEED_HELP_NON_PREMIUM);
    }
}

async function sendMessage(){
    return new Promise(resolve => {
        setTimeout(() => {
            let send_message_btn = getDocumentElement('send_message_btn');
            if(send_message_btn) {
                send_message_btn.click();
                resolve(["Yes", ""]);
            } else {
                resolve(["No", "Issue with the number"]);
            }
        }, 500);
    });
}

function handle_response(data) {
    if (data) {
        console.log("PLAN DATA:", data);
        let customer_name = data.name && data.name !== "" ? data.name : null;
        let customer_email = data.email && data.email !== "NULL" && data.email !== "" ? data.email : null;
        let customer_care_number = data.customer_care_number && data.customer_care_number != "" ? data.customer_care_number : ((typeof WHATFLOW_CONFIG !== 'undefined') ? WHATFLOW_CONFIG.SUPPORT_PHONE_RAW : '923269580417');
        console.log("CUSTOMER CARE NUMBER:", customer_care_number);
        
        chrome.storage.local.set({ 
            ...data,
            customer_name,
            customer_email,
            customer_care_number,
        });

        if (data.plan_type) {
            plan_type = data.plan_type;
            trackSystemEvent(`${plan_type.toLowerCase()}_user`);
        }
        if (data.last_plan_type) {
            last_plan_type = data.last_plan_type;
        }
        if (data.expiry_date) {
            expiry_date = data.expiry_date;
        }
        if (data.trial_days) {
            chrome.storage.local.get(['added_trial_days'], (res) => {
                let added_trial_days = res.added_trial_days;
                if (added_trial_days !== undefined && !added_trial_days) {
                    // add trial days to google analytics here
                    // trackSystemEvent('Extension Installation',data.trial_days);
                    chrome.storage.local.remove('added_trial_days');
                    chrome.runtime.sendMessage({
                        type: 'set_uninstall_url',
                        uninstall_url: RUNTIME_CONFIG.uninstallUrl,
                        trial_days: data.trial_days,
                        number: my_number + data.plan_type
                    });
                }
            });
        }
        setPlanDuration(data.subscribed_date, data.expiry_date);
        trackSystemEvent('plan_details_fetched', 'fetched');
    }
}

function getPlanDuration(days) {
    return days > 366 ? "Tri_Annually" : "Annually";
}

function setPlanDuration(subscribed_date_str, expiry_date_str) {
    if (subscribed_date_str && expiry_date_str) {
        let subscribed_date = new Date(subscribed_date_str);
        let expiry_date = new Date(expiry_date_str);
        let plan_days = Math.abs(dateDiff(expiry_date, subscribed_date));

        plan_duration = getPlanDuration(plan_days);
        chrome.storage.local.set({ plan_duration: plan_duration });
        trackSystemEvent(`${plan_duration.toLowerCase()}_${plan_type.toLowerCase()}_user`);
    }
}


function isExpired() {
    return (plan_type === 'Expired');
}

function isPremiumExpired() {
    return plan_type === 'Expired' && (last_plan_type === 'Basic' || last_plan_type === 'Advance' || last_plan_type === 'Premium');
}

function isFreeTrialExpired() {
    return plan_type === 'Expired' && last_plan_type === 'FreeTrial';
}

function isBasic() {
    return (plan_type === 'Basic' || plan_type === 'Premium');
}

function isAdvance() {
    return (plan_type === 'Advance' || plan_type === 'Basic' || plan_type === 'Premium');
}

function isPremium() {
    return (plan_type === 'Basic' || plan_type === 'Advance' || plan_type === 'Premium');
}

function isFreeTrial() {
    return (plan_type === 'FreeTrial'); 
}

function isTrial() {
    return (plan_type === 'FreeTrial');
}

function isBasicFeatureAvailable() {
    return (isBasic() || isTrial());
}

function isAdvanceFeatureAvailable() {
    return (isAdvance());
}

function isPremiumFeatureAvailable() {
    return (isPremium() || isTrial());
}

async function convertPriceToLocale(price) {
    const exchangeRateAPI = "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json";
    const res = await fetch(exchangeRateAPI);
    const jsonData = await res.json();

    let { currency } = location_info;

    let formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: 0
    });

    let exchangeRate = jsonData.usd[currency.toLowerCase()];
    let convertedPrice = formatter.format(Math.round(exchangeRate * 1.02 * parseFloat(price)));
    return convertedPrice;
}

// ---- show trial popups
function show_trial_popups(){
    chrome.storage.local.get(function (result) {
        // Initialize Values
        plan_type = result.plan_type || 'Expired';
        last_plan_type = result.last_plan_type || "FreeTrial";
        location_info = result.location_info || location_info;

        let today = new Date();
        let content_visits = result.content_visits || 0;
        let expiry_date = (result.expiry_date) ? new Date(result.expiry_date) : null;

        // Calculate Values
        let date_diff = (expiry_date) ? dateDiff(today, expiry_date) : 7;

        // Show Popups
        if (isFreeTrial()) {
            if(content_visits === 0) {
                display_popup('free_trial_start', date_diff);
            }
            else if(date_diff <= 7) {
                display_popup('free_trial_reminder', date_diff);
            }
        } else if(isExpired() && (date_diff <= 0) && my_number && (my_number != undefined)) {
            if(isPremiumExpired()) {
                display_popup('premium_expired', date_diff);
            } else if(isFreeTrialExpired()) {
                display_popup('free_trial_expired');
            } 
        } else if(isPremium() && date_diff <= 30 && date_diff >= 0){
            display_popup("annual_plan_reminder", date_diff);
        }
        
        // Set updated values
        chrome.storage.local.set({
            content_visits: content_visits+1,
        });
    });
}

// ---- display content popups
function getFreeTrialButtonHtml() {
    if (RUNTIME_CONFIG.useOldPricingLinks) {
        return `<a href="${RUNTIME_CONFIG.basePricingUrl}" target="_blank" class="popup-btn pricing-green-btn CtaBtn" style="font-weight:bold;">
                  Buy Premium
              </a>`;
    } else {
        return `<span class="popup-btn pricing-green-btn CtaBtn" id="show_pricing_popup" style="font-weight:bold;">
                  Buy Premium
              </span>`;
    }
}


async function getBasicPremiumExpiredButton(basicPrice, basicConvertedPrice, advancePrice, advanceConvertedPrice, pricing_link) {
    let country_name = getCountryNameWithSpecificPricing();
    let basic_link, advance_link;
    if (RUNTIME_CONFIG.useOldPricingLinks) {
        basic_link = pricing_link + "basic";
        advance_link = pricing_link + "advance";
    } else {
        basic_link = pricing_link + PRICING_PAGE_LINK[country_name][plan_duration.toLowerCase()];
        advance_link = pricing_link + PRICING_PAGE_LINK[country_name][plan_duration.toLowerCase()];
    }
    const basicButtonHtml = await basicButton(basic_link, basicPrice, basicConvertedPrice, false, !RUNTIME_CONFIG.useOldPricingLinks)
    const advanceButtonHtml = await advanceButton(advance_link, advancePrice, advanceConvertedPrice, "", false, !RUNTIME_CONFIG.useOldPricingLinks);

    return { basicButtonHtml, advanceButtonHtml };
}

async function getAdvancePremiumExpiredButton(advancePrice, advanceConvertedPrice, pricing_link) {
    // WhatFlow CRM: No Stripe links - use WhatFlow CRM payment flow
    const advanceButtonHtml = await advanceButton('', advancePrice, advanceConvertedPrice, "", false)
    return advanceButtonHtml
}

function getAnnualButtonHtml() {
    // WhatFlow CRM: Replaced Stripe link with show_plan_pricing_popup
    return `<span class="popup-btn pricing-green-btn CtaBtn show-advance-popup" style="font-weight:bold;">
          Buy Annual 
      </span>`;
}

function displayNotification(message, daysAfterInstall, planType, gapBetweenDays) {
    if (!RUNTIME_CONFIG.displayNotification) {
        return;
    }

    const prime_icon = document.getElementById("prime_profile");
    const side_panel = getDocumentElement('side_panel')
    const currentDate = Date.now();
    const htmlString = `
    <div class="notification-wrapper">
      <div class="notification">
        ${message}
      </div>
    </div>
  `;

    chrome.storage.local.get(["created_date", "lastNotification", "deliveryReports"], (res) => {
        const msInDay = 24 * 60 * 60 * 1000;
        const daysSinceInstallation = Math.floor((currentDate - new Date(res.created_date)) / msInDay);
        const lastNotification = res.lastNotification || 0;
        const daysSinceLastNotification = (currentDate - lastNotification) / msInDay;

        let lastDeliveryDate = 0;
        if (Array.isArray(res.deliveryReports) && res.deliveryReports.length > 0) {
            const lastReport = res.deliveryReports[res.deliveryReports.length - 1];
            lastDeliveryDate = lastReport.date || 0;
        }

        const daysSinceLastDelivery = (currentDate - lastDeliveryDate) / msInDay;
        const shouldShowNotification =
            prime_icon &&
            daysSinceInstallation >= daysAfterInstall &&
            plan_type === planType &&
            (lastNotification === 0 || daysSinceLastNotification >= gapBetweenDays) &&
            (lastDeliveryDate === 0 || daysSinceLastDelivery >= 3);

        if (shouldShowNotification) {
            side_panel.style.marginTop = "54px"
            side_panel.style.backgroundColor = "var(--chatlist-panel-background)";
            prime_icon.innerHTML += htmlString;
            chrome.storage.local.set({ lastNotification: currentDate });
        }


    });
}

function getPricingLink(countryName, duration) {
    // WhatFlow CRM: Stripe links removed - returns empty (pricing is now via Easypaisa/JazzCash)
    return '';
}

async function create_pricing_buttons_html(popup_name) {
    let pricing_data = PRICING_DATA[popup_name];
    if (!pricing_data) return '';
    if (popup_name === "advance_promo_expired") {
        pricing_data.lastPlan = "AdvancePromo"
    }
    let country_name = getCountryNameWithSpecificPricing();
    let advancePrice = pricing_data.advance_price[country_name];
    let advanceConvertedPrice = await convertPriceToLocale(advancePrice.substring(1));

    // WhatFlow CRM: No Stripe links - use WhatFlow CRM payment flow
    let advanceButtonHtml = await advanceButton('', advancePrice, advanceConvertedPrice, popup_name, false);
    let showAdvanceButton = false;

    if (last_plan_type == 'Premium' || last_plan_type == 'Advance' || last_plan_type == 'Basic') {
        showAdvanceButton = true;
    }

    let popup_button_html = '';

    if (popup_name == "free_trial_reminder" || popup_name == "free_trial_expired") {
        popup_button_html = getFreeTrialButtonHtml();
    }

    // if (popup_name == 'premium_expired' && last_plan_type == 'Basic') {
    //     let buttons = await getBasicPremiumExpiredButton(basicPrice, basicConvertedPrice, advancePrice, advanceConvertedPrice, pricing_link);
    //     basicButtonHtml = buttons.basicButtonHtml;
    //     advanceButtonHtml = buttons.advanceButtonHtml;
    //     showBasicButton = true;
    //     showAdvanceButton = true;
    // }

    if (popup_name == 'premium_expired' && (last_plan_type == 'Premium' || last_plan_type == 'Advance' || last_plan_type == 'Basic')) {
        advanceButtonHtml = await getAdvancePremiumExpiredButton(advancePrice, advanceConvertedPrice, pricing_link);
        showAdvanceButton = true;
    }

    if (popup_name == "buy_annual") {
        popup_button_html = getAnnualButtonHtml();
        showAdvanceButton = false;
    }

    // if (popup_name == "advance_promo_expired") {
    //     showAdvanceButton = true;
    //     basicButtonHtml = await basicButton(basic_link, basicPrice, basicConvertedPrice, false);
    //     advanceButtonHtml = await advanceButton(advance_link, advancePrice, advanceConvertedPrice, popup_name, false);
    // }

    if (popup_name == 'annual_plan_reminder') {
        showAdvanceButton = true;
        advanceButtonHtml = annualExpired(plan_type);
    }

    let pricing_buttons_html = `
  <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:20px;align-items:center;justify-content:center;">
      <div class="pricing-buttons-container ${popup_name === "annual_plan_reminder" && "annualExpiredBtns"}" style="margin-bottom:0px;"> 
          ${showAdvanceButton ? advanceButtonHtml : ""}
          ${popup_button_html}
      </div>
      <div style="width:100%;${popup_name == 'annual_plan_reminder' ? "display:none;" : "display:flex;"}justify-content:center;align-items:center;flex-direction:column;color:#fff;"></div>
  </div>
  `;
    return pricing_buttons_html;
}

function create_features_list_html(popup_name) {
    let features_html = '';
    let show_advance_bracket = true;
    if (popup_name.includes('advance_promo')) {
        show_advance_bracket = false;
    }

    $.each(PREMIUM_FEATURES, function (i, feature) {
        features_html += `
          <div class="trial_feature" style="font-weight: bold;color: #fff;">
              <span class="check_icon"></span>${feature}
              ${show_advance_bracket ? '<span style="color:#269c47;margin-left: 5px;"> (Premium) </span>' : ''}
          </div>`;
    });
    $.each(TRIAL_FEATURES, function (i, feature) {
        features_html += `<div class="trial_feature" style="color: #fff;"><span class="check_icon"></span>${feature}</div>`;
    });
    return features_html;
}

function create_footer_html() {
    let footer_html = `
      <div class="popup-footer">
          <div class="popup-footer-container">
              <div class="logo-div">
                  <img class="logo-icon" src="${window['logo_img']}" alt="Logo"/>
                  <span style="color:#fff; font-weight: bold; font-size: 20px;">WhatFlow CRM</span>
              </div>
          </div>
      </div>`;
    return footer_html;
}

async function create_popup_html(popup_name, date_diff) {
    const data = POPUP_DATA[popup_name];
    const common = POPUP_DATA.common;

    let title_text = (data.title) ? data.title.replace('{VAR_DATE_DIFF}', `<br /><span class="expire_date_number">${date_diff}</span>`).replace('{VAR_EXP_TEXT}', (date_diff > 0) ? `expires in ${date_diff} days` : 'have expired') : null;

    if (popup_name === "annual_plan_reminder" && date_diff <= 30 && date_diff > 15 && title_text) {
        title_text = title_text.replace(/<span class="expire_date_number">.*?<\/span>/, "a few");
    }

    const pricing_buttons_html = await create_pricing_buttons_html(popup_name);
    const features_html = create_features_list_html(popup_name);
    const footer_html = create_footer_html();

    const popup_html = `
      <div class="${popup_name}_content trial_content" style="background: ${data.background_color}">
          ${(data.close_button) ? `<span class="CtaCloseBtn popup-close-btn" style="padding:10px;" id="close_${popup_name}_popup"><img src=${close_img_src} /></span>` : ''}

          <div class="popup-header">
              ${data.heading ?
            `<div class="trial_big_title heading ${popup_name}_bold">
                      ${data.heading_icon ? `<img src=${window[data.heading_icon]} />` : ''}
                      <p>${await translate(data.heading)}<p>
                  </div>`
            : ''}
              <div class="trial_big_title">
                  ${data.icon ? `<img src=${window[data.icon]} />` : ''}
                  ${title_text ? `<p>${await translate(title_text)}</p>` : ''}
              </div>
              ${data.description ? `<div class="trial_title">${await translate(data.description)}</div>` : ''}
          </div>

          <div class="popup-center"> 
              <div class="trial_features">${features_html}</div>
              ${data.note ? `<div class="trial_desc">${await translate(data.note)}</div>` : ''}
              ${pricing_buttons_html}
              ${data.action_button ? `<div id="${data.action_button.id}" class="popup-btn CtaBtn ${data.action_button.class}">${data.action_button.text}</div>` : ''}
              ${data.recommend_price ? `<div class="popup-message popup-recommendation-message"><img src="${recommend_tick}"> ${await translate(common.recommend_text)}</div>` : ''}
              ${data.discount_text ? `<div class="popup-message popup-discount-message">*${await translate(common.discount_text)}</div>` : ''}
              ${data.purchase_note ? `<div class="popup-message popup-purchase-note">${await translate(common.purchase_note)}</div>` : ''}  
          </div>

          ${footer_html}
      </div>
  `;
    return popup_html;
}

async function show_plan_pricing_popup(activePlan = 'basic') {
    // WhatFlow CRM: Replaced Stripe-based pricing with Easypaisa/JazzCash payment
    const pricing_popup_trial_features = ['Export Group Contacts', "Translate Conversation", "Quick Replies", "Customizable Time Gap", "Random Time Gap", 'Chat Support', "Batching", "Caption", "Save Message Template", "Detailed Delivery report", "Stop Campaign", "Group Message"];
    const pricing_popup_premium_features = ["Schedule", 'Business Chat Link', 'Meet/Zoom Support', "Multiple Attachments", "Pause Campaign", "Download Unsaved Contacts"];
    removeAppBackdrop();
    closeAllPopups();

    var acctNum = (typeof WHATFLOW_CONFIG !== 'undefined') ? WHATFLOW_CONFIG.PAYMENT_ACCOUNT_NUMBER : '03269580417';
    var acctTitle = (typeof WHATFLOW_CONFIG !== 'undefined') ? WHATFLOW_CONFIG.PAYMENT_ACCOUNT_TITLE : 'Irfan Ilahee Munir';
    var supportLink = (typeof WHATFLOW_CONFIG !== 'undefined') ? WHATFLOW_CONFIG.SUPPORT_WHATSAPP_LINK : 'https://wa.me/923269580417';
    var supportDisplay = (typeof WHATFLOW_CONFIG !== 'undefined') ? WHATFLOW_CONFIG.SUPPORT_DISPLAY : '+92 3269580417';

    const popupHTML = `
        <div class="pricing-popup-header">
            <div class="pricing-popup-close">&times;</div>
            <div class='pricing-popup-logo'>
                <img src=${logo_img} style="width:100%" alt="logo" />
                <span style="color:#000; font-weight: bold; font-size: 25px;">WhatFlow CRM</span>
            </div>
            <h1> <b><span>Premium</span> Plan</b></h1>
        </div>
        <hr />
        <div class="pricing-popup-body multiple-accounts-popup-body">
            <div style="padding:16px;text-align:center;">
                <p style="color:#333;font-size:14px;font-weight:bold;margin-bottom:12px;">Choose Your Plan</p>
                <div style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap;">
                    <div style="flex:1;min-width:120px;border:2px solid #3B82F6;border-radius:10px;padding:12px;text-align:center;background:#fff;">
                        <strong style="color:#3B82F6;">Basic</strong><br><span style="color:#3B82F6;font-size:18px;font-weight:bold;">Rs. 500</span><br><span style="font-size:10px;color:#888;">/month</span>
                    </div>
                    <div style="flex:1;min-width:120px;border:2px solid #8B5CF6;border-radius:10px;padding:12px;text-align:center;background:#fff;">
                        <strong style="color:#8B5CF6;">Premium</strong><br><span style="color:#8B5CF6;font-size:18px;font-weight:bold;">Rs. 1,000</span><br><span style="font-size:10px;color:#888;">/month</span>
                    </div>
                    <div style="flex:1;min-width:120px;border:2px solid #10B981;border-radius:10px;padding:12px;text-align:center;background:#fff;">
                        <strong style="color:#10B981;">Premium+</strong><br><span style="color:#10B981;font-size:18px;font-weight:bold;">Rs. 2,000</span><br><span style="font-size:10px;color:#888;">/month</span>
                    </div>
                </div>
                <div style="background:#f0fdf4;border-radius:10px;padding:14px;text-align:left;border:1px solid #bbf7d0;">
                    <p style="color:#166534;font-size:12px;font-weight:bold;margin-bottom:8px;">&#128176; How to Pay:</p>
                    <ol style="padding-left:18px;margin:0;color:#15803d;font-size:11px;line-height:2;">
                        <li>Open <b>Easypaisa</b> or <b>JazzCash</b> App</li>
                        <li>Go to <b>Send Money</b></li>
                        <li>Send amount to: <b style="color:#000;font-size:13px;">${acctNum}</b></li>
                        <li>Account Title: <b style="color:#000;">${acctTitle}</b></li>
                        <li>Take a screenshot of the receipt</li>
                        <li>Open <b>WhatFlow CRM extension popup</b> &amp; upload proof</li>
                    </ol>
                </div>
            </div>
        </div>
        <div class="pricing-popup-bottom">
            <div class="pricing-popup-features">
                ${pricing_popup_premium_features.map((item, index) => `
                    <div class="feature-item" key="${index}">
                        <img class="${activePlan === 'basic' ? 'circle_cross' : 'check'}_icon" />
                        ${item}<span class="text-bold">&nbsp;(Premium)</span>
                    </div>
                `).join('')}
                ${pricing_popup_trial_features.map((item, index) => `
                    <div class="feature-item" key="${index}">
                        <img class="check_icon" />
                        ${item}
                    </div>
                `).join('')}
            </div>
            <div class="pricing-popup-footer">
                <a href="${supportLink}" target="_blank" style="color:#25D366;font-weight:bold;text-decoration:none;">&#128172; WhatsApp Support: ${supportDisplay}</a>
            </div>
        </div>
    `;

    const popup = $('<div>', {
        class: 'pricing-popup expired_popup pro_content_popup',
        id: 'plan-pricing-popup',
    });

    popup.html(popupHTML);
    addAppBackdrop();
    $('body').append(popup);
    if (last_plan_type === 'Expired') {
        $(".expired_popup").addClass("expiredBg");
    } else {
        $(".expired_popup").removeClass("expiredBg");
    }

    $('body').on('click', '.pricing-popup-close', function () {
        $('#plan-pricing-popup').remove();
        removeAppBackdrop();
    });
}


async function show_pricing_popup() {
    // WhatFlow CRM: Replaced Stripe-based pricing with Easypaisa/JazzCash payment
    removeAppBackdrop();
    closeAllPopups();

    var acctNum = (typeof WHATFLOW_CONFIG !== 'undefined') ? WHATFLOW_CONFIG.PAYMENT_ACCOUNT_NUMBER : '03269580417';
    var acctTitle = (typeof WHATFLOW_CONFIG !== 'undefined') ? WHATFLOW_CONFIG.PAYMENT_ACCOUNT_TITLE : 'Irfan Ilahee Munir';
    var supportLink = (typeof WHATFLOW_CONFIG !== 'undefined') ? WHATFLOW_CONFIG.SUPPORT_WHATSAPP_LINK : 'https://wa.me/923269580417';
    var supportDisplay = (typeof WHATFLOW_CONFIG !== 'undefined') ? WHATFLOW_CONFIG.SUPPORT_DISPLAY : '+92 3269580417';

    const basicFeatures = [
        'Unlimited Messaging', 'Send Attachments', 'Message Customization', 'Save Message Template', 'Detailed Delivery Report', 'Blur Conversations'
    ];
    const advanceFeatures = [
        'All Free Features', 'Batching', 'Quick Replies', 'Group Contacts Export', 'Stop Campaign', 'No minimum time gap', 'Multiple Attachments', 'Schedule',
        'Pause Campaign', 'Business Chat Link', 'Export Unsaved Contacts'
    ];

    const createPlanHTML = (planName, planKey, price) => {
        const features = planKey === 'freeTrial' ? basicFeatures : advanceFeatures;
        return `
          <div class="pricing-popup-${planKey}">
              <div class="pricing-popup-title">
                  <img src="${planKey === 'freeTrial' ? upgradePlanBasic : upgradePlan}" alt="Logo"/>
                  <span>${planName}</span>
              </div>
              <div class="pricing-popup-price">
                  <span class="new-price">${planKey === 'freeTrial' ? 'Free' : 'Rs. ' + price}</span>
                  ${planKey !== 'freeTrial' ? '<span class="user-month" style="font-size:10px;color:#000">/month</span>' : ''}
              </div>
              <div class="pricing-popup-features">
                  <ul>
                      ${features.map(f => `<li>${f}</li>`).join('')}
                  </ul>
              </div>
          </div>
      `;
    };

    const buildPopupHTML = () => {
        return `
      <div class="pricing_country_text">
          <p class="heading">Pricing curated just for you!</p>
      </div>
      <div class="header-wrapper">
          <div class="pricing-popup-header">
              <span>WhatFlow CRM Plans</span>
              <div class="pricing-popup-close">&times;</div>
          </div>
      </div>
      <div class="pricing-popup-body">
          ${createPlanHTML('Free Trial', 'freeTrial', 0)}
          ${createPlanHTML('Premium', 'premium', '1,000')}
      </div>
      <div style="padding:16px;margin:0 20px 16px;background:#f0fdf4;border-radius:10px;border:1px solid #bbf7d0;">
          <p style="color:#166534;font-size:12px;font-weight:bold;margin-bottom:8px;">&#128176; How to Pay:</p>
          <ol style="padding-left:18px;margin:0;color:#15803d;font-size:11px;line-height:2;">
              <li>Open <b>Easypaisa</b> or <b>JazzCash</b> App</li>
              <li>Go to <b>Send Money</b></li>
              <li>Send to: <b style="color:#000;">${acctNum}</b> (${acctTitle})</li>
              <li>Take a screenshot of receipt</li>
              <li>Open <b>WhatFlow CRM extension popup</b> &amp; upload proof</li>
          </ol>
          <a href="${supportLink}" target="_blank" style="color:#25D366;font-weight:bold;text-decoration:none;display:inline-block;margin-top:8px;">&#128172; WhatsApp Support: ${supportDisplay}</a>
      </div>
      <div class="footer-note">
          <span>By upgrading, you agree to our Terms and Service and Privacy Policy.</span>
      </div>
      `;
    };

    const pricing_popup = $('<div>', { class: 'pricing-popup pro_content_popup', id: 'pricing-popup' });
    pricing_popup.html(buildPopupHTML());
    $('body').append(pricing_popup);
    addAppBackdrop();

    // Close popup
    $('body').on('click', '.pricing-popup-close', function () {
        $('#pricing-popup').remove();
        removeAppBackdrop();
    });
}

function show_loader_and_close_popup(popup_name, delay, next_popup = false) {
    $(`#close_${popup_name}_popup`).addClass('loading').html('');
    setTimeout(() => {
        $(`#${popup_name}_popup`).remove();

        if (next_popup) {
            success_popup(next_popup);
        }
    }, delay)
}

// Common function to display all plan "start/reminder/expired" popups
async function display_popup(popup_name, date_diff) {
    closeAllPopups();

    // Remove old_popup if it's exists - no longer needed as closeAllPopups handles it
    // const old_popup = $(`#${popup_name}_popup`);
    // if (old_popup) {
    //     $(`#${popup_name}_popup`).remove();
    // }

    // Create new popup element
    const popup_html = await create_popup_html(popup_name, date_diff);
    const new_popup = $('<div>').html(popup_html).attr({ class: `${popup_name}_popup trial_popup pro_content_popup`, id: `${popup_name}_popup` });
    $('body').append(new_popup);
    addAppBackdrop()

    // On close button click
    $(`#close_${popup_name}_popup`).on('click', function (event) {
        if (popup_name === 'advance_promo_start') {
            show_loader_and_close_popup(popup_name, 1000, 'advance_promo_activated');
            return;
        }

        $(`#${popup_name}_popup`).remove();
        removeAppBackdrop()
        trackCloseButtonClick(`${popup_name}_popup_close`);
    });

    $('.popup-btn').on('click', function (event) {
        let buttonType = $(this).attr('buttonType');
        if (buttonType && buttonType.length > 0) {
            trackButtonClick(`${popup_name}_popup_${buttonType}_button`)
        }
    });

    // Track Popup view event
    trackButtonView(`${popup_name}_popup`);
}

async function success_popup(success_popup_name) {
    closeAllPopups();

    // Get data for success popup
    const data = SUCCESS_POPUP_DATA[success_popup_name];
    const description = data.description.replace('Advance Premium', '<strong>Advance Premium</strong>');

    // Create new success popup
    const popup_html = `
      <div class="${success_popup_name}_content success_content" style="background: ${data.background_color}">
          ${data.close_button ? `<span class="CtaCloseBtn popup-close-btn" id="close_${success_popup_name}_popup"><img src=${close_img_src} /></span>` : ''}
          <div class="popup-header">
              <img class="${data.icon}" src=${window[data.icon]} />
          </div>
          <div class="popup-center">
              <p class="trial_big_title heading">${data.title}</p>
              <p class="trial_title">${description}</p>
              ${data.action_button ? `<div id="${data.action_button.id}" class="popup-btn CtaBtn ${data.action_button.class}" buttonType="okay">${data.action_button.text}</div>` : ''}
          </div>
      </div>
  `;

    const new_popup = $('<div>').html(popup_html).attr({ class: `${success_popup_name}_popup success_popup pro_content_popup`, id: `${success_popup_name}_popup` }).css('width', 'min(400px, 95%)');
    $('body').append(new_popup);
    addAppBackdrop()

    // On close button click
    $(`#close_${success_popup_name}_popup`).on('click', function (event) {
        $(`#${success_popup_name}_popup`).remove();
        removeAppBackdrop()
        trackCloseButtonClick(`${success_popup_name}_popup_close`);
    });

    $('.popup-btn').on('click', function (event) {
        let buttonType = $(this).attr('buttonType');
        if (buttonType && buttonType.length > 0) {
            trackButtonClick(`${success_popup_name}_popup_${buttonType}_button`)
        }
    });

    // Track Popup view event
    trackButtonView(`${success_popup_name}_popup`);
}


async function multipleAccountButton() {
    let country_name = getCountryNameWithSpecificPricing();

    if (RUNTIME_CONFIG.useOldPricingLinks) {
        return `<a href="${RUNTIME_CONFIG.basePricingUrl}multiple-account" target="_blank" class="popup-btn pricing-purple-btn CtaBtn">
        <span style="white-space:nowrap;">Buy multiple users<br/></span>
        <span style="white-space:nowrap; color: #fff; font-size: 14px; line-height: 16px;font-weight:bold;display:flex;"><span style="margin-right:3px;">@</span>
            ${country_name === 'india' ? '<span class="rupee">₹</span>' : ''}
            <span class="price_class">${MULT25ACCOUNTPRICE[country_name]}</span>/month
        </span>
        ${(country_name === 'international' && location_info?.currency != 'USD') ?
                `<span style="white-space:nowrap; color: #fff; font-size: 12px; line-height: 16px;font-weight:bold;"> 
        (~<span class="price_class">${await convertPriceToLocale(MULT25ACCOUNTPRICE[country_name].substring(1))}</span>/month)
        </span>` : ''
            }
    </a>`;
    } else {
        return `<span class="show_multiple_users" style="white-space:nowrap;">Buy multiple users<br/></span>
        <span style="white-space:nowrap; color: #fff; font-size: 14px; line-height: 16px;font-weight:bold;display:flex;"><span style="margin-right:3px;">@</span>
            ${country_name === 'india' ? '<span class="rupee">₹</span>' : ''}
            <span class="price_class">${MULT25ACCOUNTPRICE[country_name]}</span>/month
        </span>
        ${(country_name === 'international' && location_info?.currency != 'USD') ?
                `<span style="white-space:nowrap; color: #fff; font-size: 12px; line-height: 16px;font-weight:bold;"> 
        (~<span class="price_class">${await convertPriceToLocale(MULT25ACCOUNTPRICE[country_name].substring(1))}</span>/month)
        </span>` : ''
            }`;
    }
}

// for basic button always take the user to the pricing page
async function basicButton(pricing_link, basicPrice, basicConvertedPrice, showPrice, convertToSpan) {
    // WhatFlow CRM: Always use span-based approach (no Stripe links)
    var acctNum = (typeof WHATFLOW_CONFIG !== 'undefined') ? WHATFLOW_CONFIG.PAYMENT_ACCOUNT_NUMBER : '03269580417';
    return `<span class="popup-btn pricing-white-btn CtaBtn show-basic-popup" style="font-weight:bold;">
        Buy Basic
        ${showPrice !== false ? `<br/><span style="white-space:nowrap; color: #269c47; font-size: 14px; line-height: 16px;font-weight:bold;display:flex;"><span style="margin-right:3px;">@</span><span class="price_class">${basicPrice || 'Rs. 500'}</span>/month</span>` : ''}
    </span>`;
}

// for advance button
// 1.) if it is a free trial popup then take the user to the pricing page
// 2.) else take the user to the pricing popup i.e. 
// for the premium_expired reminder popup and buy_premium_popop if the user is trying to use premium feature
function annualExpired(plan_type) {
    // WhatFlow CRM: Replaced Stripe link with payment instructions
    var acctNum = (typeof WHATFLOW_CONFIG !== 'undefined') ? WHATFLOW_CONFIG.PAYMENT_ACCOUNT_NUMBER : '03269580417';
    var supportLink = (typeof WHATFLOW_CONFIG !== 'undefined') ? WHATFLOW_CONFIG.SUPPORT_WHATSAPP_LINK : 'https://wa.me/923269580417';
    const renewButton = `
        <div class="popup-btn ${plan_type === "Basic" ? "pricing-white-btn" : "pricing-green-btn"} pricing-white-btn CtaBtn annualExpireBtn" style="font-weight:bold;text-align:center;padding:10px;cursor:pointer;">
            <div class="shortHeading">
                <img src="${renewPlan}" class="annualExpired ${plan_type !== "Basic" && "greenToWhite"}"/><span class="expireTitle">Renew via Easypaisa/JazzCash</span>
            </div>
            <p style="font-size:10px;color:#666;margin-top:4px;">Send to: ${acctNum}</p>
            <p style="font-size:10px;color:#666;">Then open extension popup to upload proof</p>
        </div>
    `;
    return renewButton;
}


async function advanceButton(pricing_link, advancePrice, advanceConvertedPrice, popup_name, showPrice, convertToSpan) {
    // WhatFlow CRM: Always use span-based approach (no Stripe links)
    if (popup_name == 'free_trial_start' || popup_name == 'free_trial_reminder' || popup_name == 'free_trial_expired' || popup_name == 'advance_promo_activated' || popup_name == 'advance_promo_reminder') {
        btn = getFreeTrialButtonHtml();
        return btn;
    }

    return `<span class="popup-btn pricing-green-btn CtaBtn show-advance-popup" style="font-weight:bold;">
        Buy Premium
        ${showPrice !== false ? `<br/><span style="white-space:nowrap; font-size: 14px; line-height: 16px;font-weight:bold;display:flex;"><span style="margin-right:3px;">@</span><span class="price_class">${advancePrice || 'Rs. 1000'}</span>/month</span>` : ''}
    </span>`;
}

async function showBuyPremiumButtons() {
    // WhatFlow CRM: Show upgrade options with proper payment info
    var acctNum = (typeof WHATFLOW_CONFIG !== 'undefined') ? WHATFLOW_CONFIG.PAYMENT_ACCOUNT_NUMBER : '03269580417';
    var acctTitle = (typeof WHATFLOW_CONFIG !== 'undefined') ? WHATFLOW_CONFIG.PAYMENT_ACCOUNT_TITLE : 'Irfan Ilahee Munir';
    var supportLink = (typeof WHATFLOW_CONFIG !== 'undefined') ? WHATFLOW_CONFIG.SUPPORT_WHATSAPP_LINK : 'https://wa.me/923269580417';
    var supportDisplay = (typeof WHATFLOW_CONFIG !== 'undefined') ? WHATFLOW_CONFIG.SUPPORT_DISPLAY : '+92 3269580417';

    return '<div style="width:100%;display:flex;justify-content:center;align-items:center;flex-direction:column;padding:10px;gap:8px;">' +
        '<p style="color:#333;font-size:14px;text-align:center;line-height:1.5;font-weight:bold;">Upgrade Your Plan</p>' +
        '<p style="color:#666;font-size:11px;text-align:center;">Open the WhatFlow CRM extension popup to upgrade with Easypaisa or JazzCash.</p>' +
        '<div style="display:flex;gap:8px;width:100%;justify-content:center;flex-wrap:wrap;">' +
        '<div style="flex:1;min-width:100px;padding:10px 8px;border:2px solid #3B82F6;border-radius:8px;background:#fff;text-align:center;">' +
        '<strong style="color:#3B82F6;font-size:13px;">Basic</strong><br><span style="font-size:10px;color:#666;">Rs. 500/mo</span></div>' +
        '<div style="flex:1;min-width:100px;padding:10px 8px;border:2px solid #8B5CF6;border-radius:8px;background:#fff;text-align:center;">' +
        '<strong style="color:#8B5CF6;font-size:13px;">Premium</strong><br><span style="font-size:10px;color:#666;">Rs. 1,000/mo</span></div>' +
        '<div style="flex:1;min-width:100px;padding:10px 8px;border:2px solid #10B981;border-radius:8px;background:#fff;text-align:center;">' +
        '<strong style="color:#10B981;font-size:13px;">Premium+</strong><br><span style="font-size:10px;color:#666;">Rs. 2,000/mo</span></div>' +
        '</div>' +
        '<div style="margin-top:8px;padding:10px;background:#f0fdf4;border-radius:8px;border:1px solid #bbf7d0;width:100%;">' +
        '<p style="color:#166534;font-size:11px;font-weight:bold;margin-bottom:6px;">&#128176; How to Pay:</p>' +
        '<ol style="padding-left:16px;margin:0;color:#15803d;font-size:10px;line-height:1.8;">' +
        '<li>Open <b>Easypaisa</b> or <b>JazzCash</b> App</li>' +
        '<li>Go to <b>Send Money</b></li>' +
        '<li>Send amount to: <b style="color:#000;">' + acctNum + '</b></li>' +
        '<li>Account Title: <b style="color:#000;">' + acctTitle + '</b></li>' +
        '<li>Take a screenshot of the receipt</li>' +
        '<li>Open <b>WhatFlow CRM extension popup</b> &amp; upload proof</li>' +
        '</ol></div>' +
        '<a href="' + supportLink + '" target="_blank" style="color:#25D366;font-size:12px;font-weight:bold;text-decoration:none;display:inline-flex;align-items:center;gap:4px;margin-top:6px;">&#128172; WhatsApp Support: ' + supportDisplay + '</a>' +
        '</div>';
}

function getPremiumReminderButton(req_plan_type) {
    var acctNum = (typeof WHATFLOW_CONFIG !== 'undefined') ? WHATFLOW_CONFIG.PAYMENT_ACCOUNT_NUMBER : '03269580417';
    var acctTitle = (typeof WHATFLOW_CONFIG !== 'undefined') ? WHATFLOW_CONFIG.PAYMENT_ACCOUNT_TITLE : 'Irfan Ilahee Munir';
    var supportLink = (typeof WHATFLOW_CONFIG !== 'undefined') ? WHATFLOW_CONFIG.SUPPORT_WHATSAPP_LINK : 'https://wa.me/923269580417';
    return '<div style="width:100%;text-align:center;">' +
        '<p style="color:#555;font-size:11px;margin-bottom:8px;">Open the <b>WhatFlow CRM extension popup</b> to upgrade your plan.</p>' +
        '<p style="color:#333;font-size:11px;margin-bottom:4px;">Send payment to:</p>' +
        '<p style="color:#166534;font-size:13px;font-weight:bold;">' + acctNum + ' (' + acctTitle + ')</p>' +
        '<p style="color:#666;font-size:10px;">via Easypaisa or JazzCash</p>' +
        '<a href="' + supportLink + '" target="_blank" class="popup-btn pricing-green-btn CtaBtn" style="display:inline-block;margin-top:10px;text-decoration:none;">&#128172; WhatsApp Support for Help</a>' +
        '</div>';
}

async function premium_reminder(feature, req_plan_type, title = '') {
    closeAllPopups();

    if (!feature) feature = 'default';

    let body = document.querySelector('body');
    let popup = document.createElement('div');
    let modal_content = document.createElement('div');

    let popup_button = getPremiumReminderButton(req_plan_type);
    let reminder_title = title ? title : PREMIUM_REMINDER[feature].title;
    let reminder_description = `Please buy <<${req_plan_type} Plan>> ${PREMIUM_REMINDER[feature].description}`;
    reminder_title = reminder_title.replace('Advance', 'Premium');
    reminder_description = reminder_description.replace('Advance', 'Premium');


    popup.className = 'premium_reminder_popup trial_popup pro_content_popup';

    modal_content.className = 'premium_reminder_content trial_content';
    modal_content.innerHTML = `
        <span id="close_premium_reminder_popup">
            <img class="CtaCloseBtn premiumFeatureCloseBtn" src="${close_img_src}" alt="x">
        </span>
        <div class="premium_reminder_popup_title">
            <span class="oops_icon"></span>Oops!
        </div>
        <div class="reminder_title">
            ${await translate(reminder_title)}
        </div>
        <div class="reminder_description">
            ${await translate(reminder_description)}
        </div>
        <div style="display:flex;justify-content:center;gap:20px;width:100%;margin-bottom:20px;">
            ${popup_button}
        </div> 
        `;
    popup.appendChild(modal_content);
    body.appendChild(popup);
    addAppBackdrop()

    let closePopupBtn = document.getElementById("close_premium_reminder_popup");
    closePopupBtn.addEventListener("click", function () {
        body.removeChild(popup);
        removeAppBackdrop()
        trackCloseButtonClick('premium_feature_buy_popup_close');
    });

    $('.popup-btn').on('click', function (event) {
        let buttonType = $(this).attr('buttonType');
        if (buttonType && buttonType.length > 0) {
            trackButtonClick(`premium_feature_buy_popup_${buttonType}_button`)
        }
    });

    trackButtonView('premium_feature_buy_popup');
}

async function review_popup() {
    if (document.querySelector('#review_popup')) {
        body.removeChild(document.querySelector('#review_popup'));
    }

    let review_desc = await translate("Just take a second to share your positive review :)");
    let modal_content_html = `
        <div class="rheader" alt="">
            <img class="smile_icon" src=`+ smile_icon + `></img>
            <h2 id="review_popup_title">Enjoying WhatFlow CRM?</h2>
        </div>
        <div class="rcenter">
            <div class="rtop" id="review_popup_desc">${review_desc}</div>
            <div class="rbottom">
                <div id="notNowBtn" class="popup-btn action-white-btn CtaBtn">Not Now</div>
                <div id="reviewBtn" class="popup-btn action-green-btn CtaBtn">
                    <a style="width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; font-weight: bold;" href="${RUNTIME_CONFIG.reviewUrl}" target="_blank">Rate us 5 <span style="font-size: 14px; line-height: 0; margin-left: 3px;">★</span></a>
                </div>
            </div>
        </div>
    `

    let modal_content = document.createElement('div');
    modal_content.className = 'review_popup_content trial_content';
    modal_content.style.background = LIGHT_GREY_COLOR;
    modal_content.innerHTML = modal_content_html;

    let popup = document.createElement('div');
    popup.className = 'review_popup';
    popup.appendChild(modal_content);

    var body = document.querySelector('body');
    body.appendChild(popup);

    document.querySelector("#notNowBtn").addEventListener("click", () => {
        body.removeChild(popup);
        trackButtonClick('review_popup_not_now_button');
    })
    document.querySelector("#reviewBtn").addEventListener("click", () => {
        body.removeChild(popup);
        localStorage.setItem("rvisited", 1);
        trackButtonClick('review_popup_review_button');
    })
    trackButtonView('review_popup');
}

async function chat_link() {
    closeAllPopups();

    var chat_link_div = document.getElementsByClassName("chat_link_popup")[0];
    if (!chat_link_div) {
        let chat_link_title = await translate('Generate WhatsApp chat link for your number');
        let chat_link_desc = await translate('Enter the pre-set message that you would receive when your customer clicks on the link');

        let modal_content_html = `
        <span id="close_chat_link_popup" style="position: absolute;top: 6px;right: 6px;font-size: 20px;width:14px"><img  class="CtaCloseBtn premiumFeatureCloseBtn" src="${close_img_src}" style="width: 100%;" alt="x"></span>
        <div class="chat_link_title">${chat_link_title}</div>
        <div class="chat_link_desc">${chat_link_desc} (Optional)</div>
        <textarea style="width: 460px;height: 64px;padding: 8px;" type="text" id="add_chat_message"></textarea>
        <div id="generate_chat_link" class="popup-btn action-green-btn pricing-green-btn CtaBtn">Generate</div>
        `

        let modal_content = document.createElement('div');
        modal_content.className = 'chat_link_content trial_content';
        modal_content.innerHTML = modal_content_html;

        let popup = document.createElement('div');
        popup.className = 'chat_link_popup trial_popup pro_content_popup';
        popup.style.width = 'min(550px, 95%)';
        popup.appendChild(modal_content);

        var body = document.querySelector('body');
        body.appendChild(popup);
        addAppBackdrop();
        document.getElementById("close_chat_link_popup").addEventListener("click", function (event) {
            document.getElementsByClassName("chat_link_popup")[0].style.display = 'none';
            removeAppBackdrop();
            trackCloseButtonClick('business_chat_link_popup_close');
        });
        document.getElementById("generate_chat_link").addEventListener("click", function (event) {
            removeAppBackdrop();
            if (isAdvanceFeatureAvailable()) {
                var message = document.getElementById("add_chat_message").value;
                var text = "https://wa.me/" + my_number;
                if (message !== '') {
                    message = encodeURIComponent(message);
                    text += "?text=" + message;
                }
                navigator.clipboard.writeText(text).then(function () {
                    alert("Chat link generated and copied: " + text);
                });
                document.getElementsByClassName("chat_link_popup")[0].style.display = 'none';
                trackButtonClick('generate_business_chat_link_premium');
            }
            else {
                document.getElementsByClassName("chat_link_popup")[0].style.display = 'none';
                premium_reminder('business_chat_link', 'Advance');
            }
            trackButtonClick('generate_business_chat_link');
        });
    }
    else
        chat_link_div.style.display = 'block';

    document.querySelector('.chat_link_title').innerText = await translate('Generate WhatsApp chat link for your number');
    document.querySelector('.chat_link_desc').innerText = await translate('Enter the pre-set message that you would receive when your customer clicks on the link (Optional)');
    trackButtonView('business_chat_link_popup');
}

// ---- Document events - click, keydown ---
// Close Reminder Popup if user clicks outside of it
document.addEventListener('click', (event) => {
    if (document.querySelector('.trial_popup')) {
        let popup = document.querySelectorAll('.trial_popup')[0];
        const isBuyAnnualPopup = popup.classList.contains('buy_annual_popup');
        if (!popup.contains(event.target)) {
            document.body.removeChild(popup);
            removeAppBackdrop()
            if (isBuyAnnualPopup) {
                chrome.storage.local.set({ 'lastShownAnnualPopup': formatToIsoDate(new Date()) });
            }
        }
    }
    if (document.querySelector("#export_options")) {
        let popup = document.querySelector("#export_options");
        let icon = document.querySelector(".download_unsaved_contacts_icon")
        if (!popup.contains(event.target) && event.target !== icon) {
            popup.remove()
        }
    }
    if (document.querySelector("#blur_dropdown")) {
        let popup = document.querySelector("#blur_dropdown");
        let icon = document.querySelector(".blur_contacts_icon")
        if (!popup.contains(event.target) && event.target !== icon) {
            popup.remove()
        }
    }
    if (document.querySelector("#prosender_profile_popup")) {
        let popup = document.querySelector("#prosender_profile_popup");
        let icon = document.querySelector(".prosender_profile_icon");
        if (!popup.contains(event.target) && event.target !== icon) {
            popup.remove()
        }
    }
    if (!document.querySelector("#edit_quick_reply_popup") 
        && !document.querySelector('.trial_popup') 
        && !document.querySelector("#pricing-popup") 
        && !document.querySelector("#multiple-accounts-popup") 
        && !document.querySelector("#multiple-account-popup") 
        && !document.querySelector("#plan-pricing-popup") 
        && !document.querySelector("#final-multiple-account-popup")
        && !document.querySelector("#pricing-popup")
        && !document.querySelector("#plan-pricing-popup")
    ) {
        removeAppBackdrop();
    }
    if (document.querySelector("#review_popup") && !document.querySelector("#review_popup").contains(event.target)) {
        addAppBackdrop();
    }
    if (document.querySelector(".show_multiple_users") && document.querySelector(".show_multiple_users").contains(event.target)) {
        show_pricing_for_multiple_accounts()
    }
    if (document.querySelector(".show-basic-popup") && document.querySelector(".show-basic-popup").contains(event.target)) {
        show_plan_pricing_popup("basic")
    }
    if (document.querySelector(".show-advance-popup") && document.querySelector(".show-advance-popup").contains(event.target)) {
        show_plan_pricing_popup("advance")
    }
    if (document.querySelector(".annualExpireBtn") && document.querySelector(".annualExpireBtn").contains(event.target)) {
        show_plan_pricing_popup("advance")
    }
    if (document.querySelector("#show_pricing_popup") && document.querySelector("#show_pricing_popup").contains(event.target)) {
        show_pricing_popup()
    }
});

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        if (document.querySelector("#edit_quick_reply_popup")) {
            document.body.removeChild(document.querySelector("#edit_quick_reply_popup"));
            removeAppBackdrop();
        }
    }
});

/*
 * Closes all open popups before showing a new one
 * returns True if popups were closed, false if no popups were open
 */
function closeAllPopups() {
    let closed = false;
    const popups = document.querySelectorAll('.pro_content_popup');
    if (popups.length > 0) {
        popups.forEach(popup => {
            if (popup.parentNode) {
                popup.parentNode.removeChild(popup);
                closed = true;
            }
            if (popup.classList.contains("edit_quick_reply_popup")) {
                removeAppBackdrop();
            }
        });
    }
    return closed;
}

function getCountryNameWithSpecificPricing() {
    let { name: country_name, name_code: country_code } = location_info;
    if (Object.keys(COUNTRY_WITH_SPECIFIC_PRICING).includes(country_code)) {
        country_name = COUNTRY_WITH_SPECIFIC_PRICING[country_code];
    } else {
        country_name = 'international';
    }
    return country_name;
}

// ---- config-data OR data.js related functions ---

function getDocumentElement(key, selectAll = false) {
    try {
        if (DOCUMENT_ELEMENT_SELECTORS[key]) {
            for (const className of DOCUMENT_ELEMENT_SELECTORS[key]) {
                const element = (selectAll) ? document.querySelectorAll(className) : document.querySelector(className);
                if (element) {
                    return element;
                }
            }
        } else {
            console.log("Selector not exists:", key);
        }
    } catch (err) {
        console.log("Error while finding document element", err);
    }
    return null;
}

async function fetchConfigData() {
    try {
        const url = `${AWS_API.GET_CONFIG_DATA}?operation=get-all-config-data`
        const response = await fetch(url);
        const jsonData = await response.json();
        const allConfigData = jsonData.data;

        if (allConfigData && Array.isArray(allConfigData)) {
            const configMap = createConfigMap(allConfigData);
            loadConfigData(configMap);
            console.log(`%cConfig Data Loaded`, 'color: lightGreen; font-weight: bold; font-size: 14px;');

            chrome.storage.local.set({ 
                CONFIG_DATA: configMap,
                RUNTIME_CONFIG: RUNTIME_CONFIG 
            });
        } else {
            console.log("Config data not found. Api response:", jsonData);
        }
    } catch (err) {
        chrome.storage.local.set({ 
            RUNTIME_CONFIG: RUNTIME_CONFIG 
        });
        trackError("get_config_data_api_error", err);
        console.log("Error while fetching config data:", err);
    }
};

function createConfigMap(configArray) {
    const configMap = {};
    configArray.forEach(item => {
        if (item.name && item.data !== null) {
            configMap[item.name] = item.data;
        }
    });
    return configMap;
}

// Load AWS Config Data from API to Local Data (for content js)
function loadConfigData(configMap) {
    // Constant Arrays
    if (configMap.TRIAL_FEATURES)
        TRIAL_FEATURES = [...configMap.TRIAL_FEATURES];
    if (configMap.PREMIUM_FEATURES)
        PREMIUM_FEATURES = [...configMap.PREMIUM_FEATURES];

    // Safe Merge Objects
    if (configMap.GA_CONFIG)
        GA_CONFIG = safeMergeObject(GA_CONFIG, configMap.GA_CONFIG);
    if (configMap.DOCUMENT_ELEMENT_SELECTORS)
        DOCUMENT_ELEMENT_SELECTORS = safeMergeObject(DOCUMENT_ELEMENT_SELECTORS, configMap.DOCUMENT_ELEMENT_SELECTORS);
    if (configMap.RUNTIME_CONFIG)
        RUNTIME_CONFIG = safeMergeObject(RUNTIME_CONFIG, configMap.RUNTIME_CONFIG);

    // WhatFlow CRM Config
    if (configMap.PRO_PRICING)
        PRICING = safeMergeObject(PRICING, configMap.PRO_PRICING);
    if (configMap.PRO_PRICING_DATA)
        PRICING_DATA = safeMergeObject(PRICING_DATA, configMap.PRO_PRICING_DATA);
    if (configMap.PRO_PRICING_PAGE_LINK)
        PRICING_PAGE_LINK = safeMergeObject(PRICING_PAGE_LINK, configMap.PRO_PRICING_PAGE_LINK);
    if (configMap.PRO_RUNTIME_CONFIG)
        RUNTIME_CONFIG = safeMergeObject(RUNTIME_CONFIG, configMap.PRO_RUNTIME_CONFIG);
}

function safeMergeObject(target = {}, source = {}) {
    Object.keys(source).forEach(key => {
        target[key] = source[key];
    });
    return target;
}

function handleRuntimeConfig() {
    if (RUNTIME_CONFIG.reloadInject) {
        chrome.storage.local.get(["location_info"],(result)=>{
            window.dispatchEvent(new CustomEvent("ProSender::init", {
                detail: { useOldMethod: RUNTIME_CONFIG.useOldInjectMethod, location_info : result.location_info }
            }));
        })
    }

    if (RUNTIME_CONFIG.uninstallUrl) {
        chrome.runtime.sendMessage({
            type: 'set_uninstall_url',
            uninstall_url: RUNTIME_CONFIG.uninstallUrl
        });
    }
}

var ban_text_detected = false;
function detectBanText() {
    if (ban_text_detected)
        return;

    let banMessages = [
        "verify your phone number",
        "you will need to verify your phone number",
        "You have been logged out. To log back in, you will need to verify your phone number.", // English
        "आप लॉग आउट हो गए हैं। फिर से लॉग इन करने के लिए, आपको अपना फ़ोन नंबर सत्यापित करना होगा।", // Hindi
        "Você foi desconectado. Para fazer login novamente, será necessário verificar seu número de telefone.", // Brazilian Portuguese
        "Has cerrado sesión. Para volver a iniciar sesión, deberás verificar tu número de teléfono." // Spanish    
    ]

    for (const message of banMessages) {
        if (document.body.innerText.includes(message) || document.body.innerText.toLowerCase().includes(message.toLocaleLowerCase())) {
            // trackSystemEvent('banned_text', banMessages);
            trackSystemEvent('banned_text');
            ban_text_detected = true;
        }
    }
}

function showTooltip({ elementParentClass, text, positionTop, positionBottom, positionLeft, positionRight }) {
    const parentElement = document.querySelector(elementParentClass);
    const tooltip = document.createElement("div");
    tooltip.className = "tooltip_main_container";
    if (positionTop)
        tooltip.style.top = positionTop;
    if (positionBottom)
        tooltip.style.bottom = positionBottom;
    if (positionLeft)
        tooltip.style.left = positionLeft;
    if (positionRight)
        tooltip.style.right = positionRight;
    tooltip.innerHTML = `
        <div>
            ${text}
        </div>
        <div class="tooltip_arrow"></div>
    `;
    parentElement.appendChild(tooltip);
}

function removeTooltip() {
    const tooltip = document.querySelector(".tooltip_main_container");
    if (tooltip) {
        tooltip.remove();
    }
}

function handleShowTooltip(element) {
    const parentElement = document.querySelector(element.query);
    if (parentElement) {
        parentElement.addEventListener("mouseover", () => {
            showTooltip({
                elementParentClass: element.query,
                text: element.text,
                positionTop: element.top,
                positionLeft: element.left,
                positionRight: element.right,
                positionBottom: element.bottom,
            });
        });
        parentElement.addEventListener("mouseout", () => {
            removeTooltip();
        });
    }
}