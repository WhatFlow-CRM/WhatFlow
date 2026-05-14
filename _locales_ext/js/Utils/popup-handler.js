const PRIME_ACCENT_COLOR = "#6C3CE1"
const LIGHT_ACCENT_COLOR = "#6C3CE1"
const LIGHT_GREY_COLOR = "#d3d3d3";

var how_to_use1 = chrome.runtime.getURL("logo/ProSender-GIF-1.gif");
var how_to_use2 = chrome.runtime.getURL("logo/ProSender-GIF-2.gif");
var how_to_use3 = chrome.runtime.getURL("logo/ProSender-GIF-3.gif");
var merged_logo = chrome.runtime.getURL("logo/ProSender-merged.gif");
var logo_img = chrome.runtime.getURL("logo/logo-img.png");

let HOW_TO_USE = [
    {
        image: how_to_use1,
        content: "Click on the ‘Extensions’ icons at the top right of the chrome window",
        index: 1,
        hasPrev: false,
        hasNext: true,
    },
    {
        image: how_to_use2,
        content: "Pin the WhatFlow CRM extension icon by clicking on the pin button ",
        index: 2,
        hasPrev: true,
        hasNext: true,
    },
    {
        image: how_to_use3,
        content: "Start using the extension by clicking on the WhatFlow CRM extension icon",
        index: 3,
        hasPrev: true,
        hasNext: true,
    },
];

function show_loader_and_close_popup(popup_name, delay, next_popup = false) {
    $(`#close_${popup_name}_popup`).addClass('loading').html('');
    setTimeout(() => {
        $(`#${popup_name}_popup`).remove();

        if (next_popup) {
            success_popup(next_popup);
        }
    }, delay)
}

const howToUseData= [
    {
        image: how_to_use1,
        content: "Click on the ‘Extensions’ icons at the top right of the chrome window",
        index: 1,
        hasPrev: false,
        hasNext: true,
    },
    {
        image: how_to_use2,
        content: "Pin the WhatFlow CRM extension icon by clicking on the pin button ",
        index: 2,
        hasPrev: true,
        hasNext: true,
    }, {
        image: how_to_use3,
        content: "Start using the extension by clicking on the WhatFlow CRM extension icon",
        index: 3,
        hasPrev: true,
        hasNext: true,
    }
]

function changeNavigationColor(index){
    if(index==0){
        if(document.querySelector(".nav_line_1").classList.contains("active_line_class")){
            document.querySelector(".nav_line_1").classList.remove("active_line_class");
        }
        if(document.querySelector(".nav_num_2").classList.contains("active_num_class")){
            document.querySelector(".nav_num_2").classList.remove("active_num_class");
        }
        if(document.querySelector(".nav_line_2").classList.contains("active_line_class")){
            document.querySelector(".nav_line_2").classList.remove("active_line_class");
        }
        if(document.querySelector(".nav_num_3").classList.contains("active_num_class")){
            document.querySelector(".nav_num_3").classList.remove("active_num_class");
        }
    }
    if(index==1){
        if(!document.querySelector(".nav_line_1").classList.contains("active_line_class")){
            document.querySelector(".nav_line_1").classList.add("active_line_class");
        }
        if(!document.querySelector(".nav_num_2").classList.contains("active_num_class")){
            document.querySelector(".nav_num_2").classList.add("active_num_class");
        }
        if(document.querySelector(".nav_line_2").classList.contains("active_line_class")){
            document.querySelector(".nav_line_2").classList.remove("active_line_class");
        }
        if(document.querySelector(".nav_num_3").classList.contains("active_num_class")){
            document.querySelector(".nav_num_3").classList.remove("active_num_class");
        }
    }
    if(index==2){
        if(!document.querySelector(".nav_line_2").classList.contains("active_line_class")){
            document.querySelector(".nav_line_2").classList.add("active_line_class");
        }
        if(!document.querySelector(".nav_num_3").classList.contains("active_num_class")){
            document.querySelector(".nav_num_3").classList.add("active_num_class");
        }
    }
}

function howToUsePopup() {
    const parentDiv = document.createElement("div");
    parentDiv.className = "how_to_use_popup";

    const pointsHtml = howToUseData.map((d) => `
        <div class="how_to_use_text">
            <p class="ins_number">${d.index}</p>
            <p class="ins_text">${d.content}</p>
        </div>
    `).join("");

    const popupHtml = `
        <div class="how_to_use_container">
            <div class="how_to_use_header">
                <div class="how_to_use_title">
                    <img style="width: 50px; margin-right:10px;" src=${bulb_icon} alt="" />
                    <p>How to use</p>
                </div>
                <div class="how_to_use_logo">
                    <img class="how_to_use_logo_img" src="${logo_img}"/>
                    <div class="how_to_use_logo_name">WhatFlow CRM</div>
                </div>
            </div>
            <div class="how_to_use_body">
                <div class="how_to_use_points" style="flex:1; display:flex; flex-direction:column; gap:20px;">
                    ${pointsHtml}
                </div>
                <div class="how_to_use_image" style="flex:1;">
                    <img src="${merged_logo}" alt="how to use" />
                </div>
            </div>
            <div class="how_to_use_buttons">
                <div id="close_how_to_use_popup" class="how_to_use_button navigation_close_button CtaBtn" style="padding:13px 30px;">
                    Close
                </div>
            </div>
        </div>
    `;

    parentDiv.innerHTML = popupHtml;
    document.body.appendChild(parentDiv);

    // ✅ Search inside parentDiv only
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

