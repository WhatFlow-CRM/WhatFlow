const PRIME_ACCENT_COLOR = "#6C3CE1"
const LIGHT_ACCENT_COLOR = "#6C3CE1"
const LIGHT_GREY_COLOR = "#d3d3d3";

var logo_img = chrome.runtime.getURL("logo/logo-img.png");

function show_loader_and_close_popup(popup_name, delay, next_popup = false) {
    $(`#close_${popup_name}_popup`).addClass('loading').html('');
    setTimeout(() => {
        $(`#${popup_name}_popup`).remove();

        if (next_popup) {
            success_popup(next_popup);
        }
    }, delay)
}

function howToUsePopup() {
    const parentDiv = document.createElement("div");
    parentDiv.className = "how_to_use_popup";

    const popupHtml = `
        <div class="how_to_use_container">
            <div class="how_to_use_header">
                <div class="how_to_use_title">
                    <img class="how_to_use_logo_img" src="${logo_img}" style="width: 50px; margin-right:10px;" alt="" />
                    <p style="font-size:20px;font-weight:700;color:#6C3CE1;">Welcome to WhatFlow CRM! 🎉</p>
                </div>
                <div class="how_to_use_logo">
                    <img class="how_to_use_logo_img" src="${logo_img}"/>
                    <div class="how_to_use_logo_name">WhatFlow CRM</div>
                </div>
            </div>
            <div class="how_to_use_body" style="display:flex; flex-direction:column; gap:16px; padding:16px; max-height:400px; overflow-y:auto;">
                <p style="font-weight:600; font-size:15px; color:#333;">Here's how to get started:</p>
                <div style="display:flex; gap:10px; align-items:flex-start;">
                    <span style="font-size:18px;">1️⃣</span>
                    <div>
                        <p style="font-weight:600; font-size:14px; margin:0; color:#6C3CE1;">Activate Your Key</p>
                        <p style="font-size:13px; margin:4px 0 0 0; color:#555;">Click "Have an activation key?" and enter your WF-XXXX-XXXX-XXXX-XXXX key.</p>
                    </div>
                </div>
                <div style="display:flex; gap:10px; align-items:flex-start;">
                    <span style="font-size:18px;">2️⃣</span>
                    <div>
                        <p style="font-weight:600; font-size:14px; margin:0; color:#6C3CE1;">Add Numbers</p>
                        <p style="font-size:13px; margin:4px 0 0 0; color:#555;">Type numbers manually, import from Excel, or select a saved campaign.</p>
                    </div>
                </div>
                <div style="display:flex; gap:10px; align-items:flex-start;">
                    <span style="font-size:18px;">3️⃣</span>
                    <div>
                        <p style="font-weight:600; font-size:14px; margin:0; color:#6C3CE1;">Write Your Message</p>
                        <p style="font-size:13px; margin:4px 0 0 0; color:#555;">Type a message or load a template. Add attachments if needed.</p>
                    </div>
                </div>
                <div style="display:flex; gap:10px; align-items:flex-start;">
                    <span style="font-size:18px;">4️⃣</span>
                    <div>
                        <p style="font-weight:600; font-size:14px; margin:0; color:#6C3CE1;">Send or Schedule</p>
                        <p style="font-size:13px; margin:4px 0 0 0; color:#555;">Click Send for instant delivery, or Schedule for later. Use time gap to avoid restrictions.</p>
                    </div>
                </div>
                <div style="display:flex; gap:10px; align-items:flex-start;">
                    <span style="font-size:18px;">5️⃣</span>
                    <div>
                        <p style="font-weight:600; font-size:14px; margin:0; color:#6C3CE1;">Track Results</p>
                        <p style="font-size:13px; margin:4px 0 0 0; color:#555;">Check Delivery Reports to see sent, delivered, read, and failed statuses.</p>
                    </div>
                </div>
                <div style="margin-top:8px; padding-top:12px; border-top:1px solid #e0e0e0;">
                    <p style="font-size:13px; color:#777;">Need help? Click <strong>"Chat Support"</strong> to contact us on WhatsApp.</p>
                </div>
            </div>
            <div class="how_to_use_buttons">
                <div id="close_how_to_use_popup" class="how_to_use_button navigation_close_button CtaBtn" style="padding:13px 30px;">
                    Got it!
                </div>
            </div>
        </div>
    `;

    parentDiv.innerHTML = popupHtml;
    document.body.appendChild(parentDiv);

    const closeBtn = parentDiv.querySelector("#close_how_to_use_popup");
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            document.body.removeChild(parentDiv);
            chrome.storage.local.set({ 'showHowToUsePopup': false });
        });
    }

    trackButtonView('how_to_use_popup');
}

function showHowToUsePopup() {
    chrome.storage.local.get(['showHowToUsePopup', 'no_of_visit'], (res) => {
        let visit_count = res.no_of_visit || 0;
        if (res.showHowToUsePopup == false) {
            return;
        }
        if (visit_count == 0) {
            chrome.storage.local.set({ "showHowToUsePopup": true })
        }
        howToUsePopup();
    })
}

// call this function if you want to show a popup only if there are no other popup on the screen
function callIfNoOtherPopups(fun) {
    const getPopupInterval = setInterval(() => {
        const trialPopup = document.querySelector('.trial_popup');
        const successPopup = document.querySelector('.success_popup');
        const sidebar = document.getElementById("side");
        const buyAnnualPopup = document.querySelector("#buy_annual_popup");
        if (!trialPopup && !successPopup && !buyAnnualPopup && sidebar) {
            clearInterval(getPopupInterval);
            fun();
        }
    }, 500);
}


// ------- ASYNC FUNCTIONS ------

async function suggestion_popup() {
    if (!document.getElementsByClassName("modal")[0]) {
        var popup = document.createElement('div');
        popup.className = 'modal';
        var modal_content = document.createElement('div');
        modal_content.className = 'modal-content';
        modal_content.style.position = 'relative';
        modal_content.style.width = '600px';
        modal_content.style.maxHeight = '560px';
        modal_content.style.overflow = 'auto';
        popup.appendChild(modal_content);
        var body = document.querySelector('body');
        body.appendChild(popup);
        modal_content.appendChild($($.parseHTML('<div style="font-weight: bold;font-size: 20px;text-align: center;margin-bottom: 24px;color: #000;">Edit/Add quick replies</div>'))[0]);
        var inner_div = document.createElement('div');
        inner_div.id = 'sugg_message_list';
        inner_div.style.height = '210px';
        inner_div.style.overflowY = 'auto';
        inner_div.style.margin = '16px 0px';
        modal_content.appendChild(inner_div);
        referesh_messages();
        modal_content.appendChild($($.parseHTML('<span id="close_edit" class="CtaCloseBtn" style="position: absolute;top: 6px;right: 6px;font-size: 20px;width:14px"><img  class="CtaCloseBtn" src="' + close_img_src + '" style="width: 100%;" alt="x"></span>'))[0]);
        modal_content.appendChild($($.parseHTML('<textarea style="width: 400px;height: 100px;padding: 8px;" type="text" id="add_message" placeholder="Type your quick reply here"></textarea>'))[0]);
        modal_content.appendChild($($.parseHTML(`<button class="CtaBtn" style="background: ${LIGHT_ACCENT_COLOR};border-radius: 2px;padding: 8px 12px;float: right;color: #fff;" id="add_message_btn">Add Template</button>`))[0]);

        document.getElementById("close_edit").addEventListener("click", function (event) {
            document.getElementsByClassName("modal")[0].style.display = 'none';
        });
        popup.addEventListener("click",(e)=>{
            if(e.target.className === "modal"){
                document.getElementsByClassName("modal")[0].style.display = 'none';
            }
        })
        document.getElementById("sugg_message_list").addEventListener("click", async function (event) {
            var nmessage = event.target.value;
            if (event.target.localName != 'div') {
                var index = messages.indexOf(nmessage);
                messages.splice(index, 1);
                referesh_messages();
                trackButtonClick('smart_reply_deleted');
            } else if ((event.target.localName == 'div') && (event.target.className == 'popup_list_message')) {
                document.getElementsByClassName("modal")[0].style.display = 'none';
                var message = event.target.innerText;
                if (message != undefined) {
                    sendSuggestionMessage(message);
                }
                trackButtonClick("smart_reply_sent");
            }
        });
        document.getElementById("add_message_btn").addEventListener("click", function (event) {
            var nmessage = document.getElementById("add_message").value;
            if (nmessage !== '') {
                nmessage = nmessage
                    .replace(/&nbsp;/g, ' ')
                    .replace(/&amp;/g, '&')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&quot;/g, '"')
                    .replace(/&#39;/g, "'");

                messages.push(nmessage);
                referesh_messages();
                document.getElementById("add_message").value = '';
                trackButtonClick('smart_reply_added');

            }
        });
    }
    else {
        document.getElementsByClassName("modal")[0].style.display = 'block';
    }

    document.getElementById('add_message').placeholder = await translate('Type your quick reply here')
    document.getElementById('add_message_btn').innerText = await translate('Add Template');
}
