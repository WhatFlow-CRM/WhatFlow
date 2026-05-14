// ===== Blog Data Object =====
const BLOG_DATA = [
    {
        title: "How to Use Pro Sender",
        summary: "Learn the basics of sending broadcast messages to multiple WhatsApp numbers in just a few clicks.",
        icon: "logo/broadcast.png",
        category: "getting-started",
        tags: "send numbers message basics",
        steps: [
            {
                title: "Enter Recipient Numbers",
                description: 'Open the Pro Sender popup from the Chrome toolbar. In the <strong>numbers box</strong>, enter the phone numbers of recipients separated by commas, or paste them one per line. You can also select a country code from the dropdown for your region.'
            },
            {
                title: "Compose Your Message",
                description: 'Write your message in the <strong>message box</strong>. You can use WhatsApp formatting shortcuts: <strong>Ctrl+B</strong> for bold, <strong>Ctrl+I</strong> for italic, and <strong>Ctrl+Shift+X</strong> for strikethrough.'
            },
            {
                title: "Hit Send",
                description: 'Click the <strong>Send</strong> button. Pro Sender will automatically open each chat and deliver your message one by one. You can sit back while it handles the rest.'
            }
        ],
        tip: "Make sure WhatsApp Web is open and logged in before sending. Pro Sender will open it automatically if it isn't."
    },
    {
        title: "How to Send Attachments",
        summary: "Send photos, documents, and files along with your broadcast messages to multiple recipients.",
        icon: "logo/prime_attach_symbol.png",
        category: "messaging",
        tags: "attachments files photos documents media caption",
        steps: [
            {
                title: "Enter Numbers & Message",
                description: "Enter the recipient numbers and compose your message as you normally would."
            },
            {
                title: "Add Attachments",
                description: 'Click the <strong>attachment icon</strong> (paperclip) next to the message box. A file explorer will open where you can select files. You can send up to <strong>7 files at a time</strong>, with a maximum of <strong>20 MB per file</strong> and <strong>100 MB total</strong>.'
            },
            {
                title: "Add Captions (Optional)",
                description: 'Check the <strong>"Add Caption"</strong> checkbox to add individual captions for each attachment. If you have multiple files, use the radio buttons to switch between files and write a caption for each one.'
            },
            {
                title: "Send",
                description: 'Click <strong>Send</strong> to dispatch your message with attachments. You can also check <strong>"Send attachment first"</strong> if you want attachments delivered before the text message.'
            }
        ],
        tip: "Premium plan users can send multiple attachments at once."
    },
    {
        title: "How to Send Messages to Groups",
        summary: "Broadcast your message to multiple WhatsApp groups and channels at the same time.",
        icon: "logo/chat (1).png",
        category: "messaging",
        tags: "groups channels broadcast group message whatsapp",
        steps: [
            {
                title: "Switch to Group Mode",
                description: 'At the top of the popup, select the <strong>"Groups"</strong> radio button. The number input will switch to a group selector dropdown.'
            },
            {
                title: "Select Groups",
                description: 'Click the <strong>search bar</strong> to open the dropdown. Search and click to select the groups or channels you want to message. You can use <strong>"Select All"</strong> to select everything, or pick specific ones. Selected groups appear as tags above the dropdown.'
            },
            {
                title: "Compose & Send",
                description: 'Write your message and click <strong>Send</strong>. The extension will deliver the message to each selected group automatically.'
            }
        ],
        tip: "You can also export group contacts as an Excel file using the export button (Premium plan feature)."
    },
    {
        title: "How to Send Messages to Contacts",
        summary: "Send messages directly to your saved WhatsApp contacts without typing numbers manually.",
        icon: "logo/message.png",
        category: "messaging",
        tags: "contacts saved contact individual message",
        steps: [
            {
                title: "Switch to Contacts Mode",
                description: 'Select the <strong>"Contacts"</strong> radio button at the top of the popup. Your WhatsApp contacts will load in a searchable dropdown.'
            },
            {
                title: "Pick Contacts",
                description: 'Click the search bar and type a contact name to filter. Click on contacts to select them. Use <strong>"Select All"</strong> for bulk selection. To remove a contact, click the <strong>X</strong> on its tag.'
            },
            {
                title: "Send Your Message",
                description: 'Compose your message and hit <strong>Send</strong>. Each selected contact will receive the message individually.'
            }
        ]
    },
    {
        title: "How to Send Customized Messages",
        summary: "Personalize each message with names, details, or any custom data from an Excel or CSV file.",
        icon: "logo/excel-2.png",
        category: "premium",
        tags: "customization excel csv personalized template columns upload spreadsheet google sheets",
        steps: [
            {
                title: "Prepare Your Excel / CSV",
                description: 'Create a spreadsheet with the <strong>first column as phone numbers</strong> and additional columns for custom data (e.g., Name, Order ID, Amount). You can download a sample template from the popup. Google Sheets URLs are also supported.'
            },
            {
                title: "Upload the File",
                description: 'Click the <strong>Upload Excel</strong> button in the numbers section. Choose to import from your device or paste a Google Sheets URL. The extension will parse numbers and show them as tags. Invalid rows are flagged for review.'
            },
            {
                title: "Use Customization Tags",
                description: 'After uploading, a <strong>Customizations</strong> bar appears below the message box. Click any column header (e.g., "Name") to insert <code>{{Name}}</code> into your message. Each recipient gets a personalized message with their data.'
            },
            {
                title: "Send",
                description: 'Click <strong>Send</strong>. The extension replaces <code>{{Name}}</code>, <code>{{Order ID}}</code>, etc., with the actual values from each row before sending.'
            }
        ],
        tip: 'Customization also works in captions! Upload your Excel, add an attachment with a caption, and use the same <code>{{column}}</code> tags in the caption text.'
    },
    {
        title: "How to Export Unsaved Chat Contacts",
        summary: "Download a list of phone numbers from your WhatsApp chats, even if they aren't saved in your contacts.",
        icon: "logo/export-contact.png",
        category: "premium",
        tags: "export unsaved contacts download excel",
        steps: [
            {
                title: "Open the Feature",
                description: 'In the Pro Sender popup, scroll to the bottom section and click <strong>"How to export unsaved chat contacts?"</strong>. This will trigger the export flow on WhatsApp Web.'
            },
            {
                title: "Download the File",
                description: 'The extension will scan your WhatsApp chats and compile a list of contact numbers. An Excel file with all detected numbers will be downloaded automatically.'
            }
        ],
        tip: "This is useful for building contact lists from group chats or individual conversations where numbers aren't saved."
    },
    {
        title: "How to Schedule Campaigns",
        summary: "Set up your campaign now and let Pro Sender send it automatically at your chosen date and time.",
        icon: "logo/schedule.png",
        category: "premium",
        tags: "schedule campaign timer auto send later plan time date",
        steps: [
            {
                title: "Prepare Your Campaign",
                description: "Enter numbers (or select groups/contacts), compose your message, and add any attachments as usual."
            },
            {
                title: "Enable Scheduling",
                description: 'Check the <strong>"Schedule your campaign"</strong> checkbox. Date and time pickers will appear. Select when you want the campaign to be sent.'
            },
            {
                title: "Schedule It",
                description: 'Click the <strong>Schedule</strong> button (replaces the Send button). You can schedule up to <strong>50 campaigns</strong>. A minimum <strong>2-minute gap</strong> between campaigns is required.'
            },
            {
                title: "Manage Scheduled Campaigns",
                description: 'Click <strong>"View upcoming campaigns"</strong> to see all scheduled campaigns. You can <strong>edit</strong> or <strong>delete</strong> them. Editing is allowed up to 1 minute before the schedule time.'
            }
        ],
        tip: "Keep WhatsApp Web open in a browser tab. The campaign will send automatically when the scheduled time arrives. This is a Premium plan feature."
    },
    {
        title: "Time Gap & Batch Settings",
        summary: "Control the speed and flow of your campaigns with time delays and batch processing.",
        icon: "logo/prime_stopwatch.png",
        category: "premium",
        tags: "time gap delay batch batching speed random premium",
        steps: [
            {
                title: "Enable Time Gap",
                description: 'Check <strong>"Time gap between messages"</strong> in the advance options section. Choose between a <strong>fixed delay</strong> (in seconds, using slider or input) or <strong>random delay</strong> (3-10 seconds) for a more natural sending pattern.'
            },
            {
                title: "Enable Batching",
                description: 'Check <strong>"Batch messages"</strong> to send in batches. Configure <strong>batch size</strong> (how many messages per batch) and <strong>batch gap</strong> (pause in minutes between batches). This helps avoid sending limits.'
            }
        ],
        tip: "Using time gap and batching together gives the most natural sending behavior and reduces the chance of being flagged by WhatsApp. Premium feature."
    },
    {
        title: "Saving Templates & Campaigns",
        summary: "Save frequently used messages and recipient lists so you can reuse them instantly.",
        icon: "logo/save-templates.png",
        category: "getting-started",
        tags: "template save message reuse campaign audience quick",
        steps: [
            {
                title: "Save a Message Template",
                description: 'Type a message and a <strong>save icon</strong> appears next to the message box. Click it, give your template a name, and click <strong>Save</strong>. Next time, click the <strong>template selector</strong> dropdown to instantly load any saved message.'
            },
            {
                title: "Save a Number Campaign",
                description: 'After entering numbers, a <strong>save icon</strong> appears next to the numbers box. Click it, name your campaign, and save. You can load saved campaigns from the <strong>campaign selector</strong> dropdown. Works for numbers, groups, contacts, and labels.'
            },
            {
                title: "Edit or Delete",
                description: 'Open the template or campaign dropdown and use the <strong>edit</strong> or <strong>delete</strong> icons next to any saved item.'
            }
        ]
    },
    {
        title: "Translate the Interface",
        summary: "Use Pro Sender in your preferred language with the built-in translation feature.",
        icon: "logo/prime_language-translate.png",
        category: "getting-started",
        tags: "translate language multilingual popup interface",
        steps: [
            {
                title: "Select Language",
                description: 'At the bottom of the popup, find the <strong>language dropdown</strong> next to the translate icon. Your browser languages appear at the top, followed by all supported languages.'
            },
            {
                title: "Automatic Translation",
                description: 'Select any language and the entire popup interface translates instantly. Your choice is remembered for future sessions. Select <strong>"English (Default)"</strong> to switch back.'
            }
        ]
    },
    {
        title: "How to Verify WhatsApp Numbers",
        summary: "Check if your recipient numbers are registered on WhatsApp before sending, so you never waste messages on invalid numbers.",
        icon: "logo/verified_icon.png",
        category: "premium",
        tags: "verify numbers check validate whatsapp registered invalid remove",
        steps: [
            {
                title: "Enter Your Numbers",
                description: 'Add recipient numbers in the <strong>numbers box</strong> as usual — type them manually, paste a list, or upload from Excel. Each number appears as a tag in the input area.'
            },
            {
                title: "Click the Verify Icon",
                description: 'You will see the <img src="logo/verified_icon.png" alt="verify" style="width:16px;height:16px;vertical-align:middle;"> icon next to the numbers box. Click it to start verification. The extension will check each number against WhatsApp to see if it is registered.'
            },
            {
                title: "Review the Results",
                description: 'If all numbers are valid, a <strong>VERIFIED</strong> badge is shown. If some numbers are not registered on WhatsApp, they are highlighted as invalid and a popup appears letting you <strong>remove unregistered numbers</strong> from the list or <strong>download</strong> them as an Excel file.'
            },
            {
                title: "Send with Confidence",
                description: 'After removing invalid numbers, your list contains only verified WhatsApp users. Hit <strong>Send</strong> knowing every message will be delivered.'
            }
        ],
        tip: "This is a premium feature. Verifying numbers before a large campaign saves time and avoids failed deliveries."
    }
];

// ===== Category config =====
const CATEGORIES = [
    { key: "all", label: "All Guides" },
    { key: "getting-started", label: "Getting Started" },
    { key: "messaging", label: "Messaging" },
    { key: "premium", label: "Premium" }
];

const CATEGORY_LABELS = {
    "getting-started": "Getting Started",
    "messaging": "Messaging",
    "premium": "Premium"
};

// ===== Render helpers =====
function buildStepsHtml(steps) {
    return steps.map((step, i) => `
        <div class="step">
            <span class="step-number">${i + 1}</span>
            <div>
                <h3>${step.title}</h3>
                <p>${step.description}</p>
            </div>
        </div>
    `).join('');
}

function buildTipHtml(tip) {
    if (!tip) return '';
    return `<div class="tip-box"><strong>Tip:</strong> ${tip}</div>`;
}

function buildCardHtml(blog, index) {
    const cat = blog.category;
    const label = CATEGORY_LABELS[cat] || cat;

    return `
        <article class="blog-card" data-index="${index}" data-category="${cat}" data-tags="${blog.tags}">
            <div class="card-icon-wrapper ${cat}">
                <img src="${blog.icon}" alt="${blog.title}">
            </div>
            <div class="card-body">
                <span class="card-badge ${cat}">${label}</span>
                <h2>${blog.title}</h2>
                <p class="card-summary">${blog.summary}</p>
                <div class="card-content" hidden>
                    ${buildStepsHtml(blog.steps)}
                    ${buildTipHtml(blog.tip)}
                </div>
                <button class="read-more-btn">Read Guide</button>
            </div>
        </article>
    `;
}

function renderFilterTabs(container) {
    container.innerHTML = CATEGORIES.map(cat =>
        `<button class="filter-tab${cat.key === 'all' ? ' active' : ''}" data-filter="${cat.key}">${cat.label}</button>`
    ).join('');
}

function renderCards(container) {
    container.innerHTML = BLOG_DATA.map((blog, i) => buildCardHtml(blog, i)).join('');
}

// ===== Main =====
document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('blog-search');
    const filterTabsEl = document.getElementById('filter-tabs');
    const blogGrid = document.getElementById('blog-grid');
    const emptyState = document.getElementById('empty-state');
    const clearSearchBtn = document.getElementById('clear-search');

    let activeFilter = 'all';

    // --- Initial render ---
    renderFilterTabs(filterTabsEl);
    renderCards(blogGrid);

    // --- Read More / Collapse (delegated) ---
    blogGrid.addEventListener('click', function (e) {
        const btn = e.target.closest('.read-more-btn');
        if (!btn) return;

        const card = btn.closest('.blog-card');
        const content = card.querySelector('.card-content');

        if (!content.hidden) {
            content.hidden = true;
            card.classList.remove('expanded');
            btn.textContent = 'Read Guide';
        } else {
            content.hidden = false;
            card.classList.add('expanded');
            btn.textContent = 'Close Guide';
            content.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    });

    // --- Filter Tabs (delegated) ---
    filterTabsEl.addEventListener('click', function (e) {
        const tab = e.target.closest('.filter-tab');
        if (!tab) return;

        filterTabsEl.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeFilter = tab.getAttribute('data-filter');
        applyFilters();
    });

    // --- Search ---
    searchInput.addEventListener('input', applyFilters);

    // --- Clear Search ---
    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        applyFilters();
    });

    function applyFilters() {
        const query = searchInput.value.toLowerCase().trim();
        const cards = blogGrid.querySelectorAll('.blog-card');
        let visibleCount = 0;

        cards.forEach(card => {
            const category = card.getAttribute('data-category');
            const tags = card.getAttribute('data-tags') || '';
            const title = card.querySelector('h2')?.textContent.toLowerCase() || '';
            const summary = card.querySelector('.card-summary')?.textContent.toLowerCase() || '';

            const matchesFilter = (activeFilter === 'all' || category === activeFilter);
            const matchesSearch = !query || title.includes(query) || summary.includes(query) || tags.includes(query);

            if (matchesFilter && matchesSearch) {
                card.classList.remove('card-hidden');
                visibleCount++;
            } else {
                card.classList.add('card-hidden');
                // collapse hidden cards
                const content = card.querySelector('.card-content');
                const btn = card.querySelector('.read-more-btn');
                if (content && !content.hidden) {
                    content.hidden = true;
                    card.classList.remove('expanded');
                    if (btn) btn.textContent = 'Read Guide';
                }
            }
        });

        blogGrid.style.display = visibleCount === 0 ? 'none' : 'grid';
        emptyState.classList.toggle('hide', visibleCount > 0);
    }
});