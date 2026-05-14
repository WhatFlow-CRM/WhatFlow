// ======= CORE INJECT JS CODE STARTS =======
const isWhatsappLoaded = () => (document.querySelector('#pane-side') ? true : false);

const isWebpackLoaded = () => ('function' === typeof webpackJsonp || window.webpackChunkwhatsapp_web_client || window.require);

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

// Custom console funtions
console.logSuccess = (message) => console.log(`%c${message}`, 'color: lightGreen; font-weight: bold; font-size: 14px;');
console.logError = (message) => console.log(`%c${message}`, 'color: red; font-weight: bold;');
console.logWarn = (message) => console.log(`%c${message}`, 'color: orange; font-weight: bold;');

// Init Store Object Function
const initStore = function (useOldMethod = true) {
    if (useOldMethod) {
        return initStoreOld();
    } else {
        return initStoreNew();
    }
}

const initStoreOld = function () {
    const inject = function () {
        return (
            (inject.mID = Math.random().toString(36).substring(7)),
            (inject.mObj = {}),
            (window.webpackChunkbuild || window.webpackChunkwhatsapp_web_client).push([
                [inject.mID],
                {},
                function (i) {
                    Object.keys(i.m).forEach(function (n) {
                        inject.mObj[n] = i(n);
                    });
                },
            ]),
            {
                modules: inject.mObj,
                constructors: inject.cArr,
                findModule: function (i) {
                    let obj = [];
                    return (
                        Object.keys(inject.mObj).forEach(function (a) {
                            let element = inject.mObj[a];
                            if (void 0 !== element)
                                if ("string" == typeof i) {
                                    if ("object" == typeof element.default)
                                        for (let e in element.default) e == i && obj.push(element);
                                    for (let e in element) e == i && obj.push(element);
                                } else {
                                    if ("function" != typeof i)
                                        throw new TypeError(
                                            "findModule can only find via string and function, " +
                                            typeof i +
                                            " was passed"
                                        );
                                    i(element) && obj.push(element);
                                }
                        }),
                        obj
                    );
                },
                get: function (i) {
                    return inject.mObj[i];
                },
            }
        );
    };

    return new Promise((resolve, reject) => {
        try {
            if (window.require && window.importDefault) {
                // Create store by importing whatsapp collection
                const e = (e) => {
                    try {
                        return window.require(e);
                    } catch (error) {
                        console.log("InjectJS :: initStoreOld :: Error :: " + error);
                        return {};
                    }
                }
                const i = (e) => window.importDefault(e);

                window.Store = {
                    Chat: e("WAWebChatCollection")?.ChatCollection,
                    Contact: e("WAWebContactCollection")?.ContactCollection,
                    Label: e("WAWebLabelCollection").LabelCollection,
                    Msg: e("WAWebMsgCollection")?.MsgCollection,
                    Channel: e("WAWebNewsletterCollection"),
                    MsgKey: e("WAWebMsgKey"),
                    BusinessProfile: e("WAWebBusinessProfileCollection")?.BusinessProfileCollection,
                    GroupMetadata: i("WAWebGroupMetadataCollection"),
                    TextMsgChatAction: e("WAWebSendTextMsgChatAction"),
                    MediaCollection: e("WAWebAttachMediaCollection"),
                    SendMsgChatAction: e("WAWebSendMsgChatAction"),
                    UserConstructor: i("WAWebWid"),
                    EnumTypes: e("WAWebWamEnumMediaPickerOriginType"),
                    MediaPrep: e("WAWebPrepRawMedia"),
                    MediaObject: e("WAWebMediaStorage"),
                    UserPrefs: e("WAWebUserPrefsMeUser"),
                    MediaTypes: e("WAWebMmsMediaTypes"),
                    OpaqueData: e("WAWebMediaOpaqueData"),
                    MsgType: e("WAWebMsgType")?.MSG_TYPE,
                    QueryExist: e("WAWebQueryExistsJob"),
                    ChatHelper: e("WAWebFindChatAction"),
                    BlobCache: e("WAWebMediaInMemoryBlobCache"),
                    CheckChatExistsOrCreate: e("WAWebCheckChatExistsOrCreate"),
                    EphemeralFields: e("WAWebGetEphemeralFieldsMsgActionsUtils"),
                    CreateChat: e("WAWebCreateChat"),
                    ApiChat: e("WAWebApiChat"),
                    ChatGetExistingBridge: e("WAWebChatGetExistingBridge"),
                };

                // Add newsletter support
                window.Store.SendChannelMessage = {
                    ...e("WAWebNewsletterUpdateMsgsRecordsJob"),
                    ...e("WAWebMsgDataFromModel"),
                    ...e("WAWebNewsletterSendMessageJob"),
                    ...e("WAWebNewsletterSendMsgAction")
                };

                window.Store.MediaUpload = {
                    ...e("WAWebMediaMmsV4Upload"),
                    ...e("WAWebStartMediaUploadQpl"),
                }

                if (window.Store) {
                    window.Store.InitType = "old_method_1";
                }
            } else {
                // Create store using inject function
                let mR = inject();
                window.Store = Object.assign({}, mR.findModule(e => e.default && e.default.Chat)[0]?.default || {});
                window.Store.MediaCollection = mR.findModule(e => e.default && e.default.prototype?.processAttachments)[0]?.default;
                window.Store.UserConstructor = mR.findModule(e => e.default && e.default.prototype?.isServer && e.default.prototype?.isUser)[0]?.default;
                window.Store.TextMsgChatAction = mR.findModule("sendTextMsgToChat")[0];
                window.Store.WidFactory = mR.findModule("createWid")[0];
                window.Store.Cmd = mR.findModule("Cmd")[0]?.Cmd;
                window.Store.ChatState = mR.findModule("sendChatStateComposing")[0];
                window.Store.ContactMethods = mR.findModule("getUserid")[0];
                window.Store.ChatHelper = mR.findModule("findOrCreateLatestChat")[0] || mR.findModule("findChat")[0];
                window.Store.EnumTypes = mR.findModule("MEDIA_PICKER_ORIGIN_TYPE")[0];
                window.Store.MenuClasses = mR.findModule(e => e?.default?.menu && e?.default?.item ? e.default : null)[0]?.default;

                if (window.Store) {
                    window.Store.InitType = "old_method_2";
                }
            }

            // Extend Store functionality
            if (window.Store?.Chat?.modelClass?.prototype) {
                window.Store.Chat.modelClass.prototype.sendMessage = function (e) {
                    window.Store.TextMsgChatAction.sendTextMsgToChat(this, ...arguments);
                };
            }

            if (window.Store?.Chat && !window.Store.Chat._find) {
                window.Store.Chat._findAndParse = window.Store.BusinessProfile?._findAndParse;
                window.Store.Chat._find = window.Store.BusinessProfile?._find;
            }

            resolve();
        } catch (error) {
            reject("InjectJS :: initStoreOld :: Error :: " + error);
        }
    });
}

const initStoreNew = function () {
    let neededObjects = [
        { id: "MediaCollection", module: "WAWebAttachMediaCollection", conditions: (module) => (module.default && module.default.prototype && (module.default.prototype.processFiles !== undefined || module.default.prototype.processAttachments !== undefined)) ? module.default : null },
        { id: "Archive", module: "WAWebSetArchiveChatAction", conditions: (module) => (module.setArchive) ? module : null },
        { id: "Block", module: "WAWebBlockContactUtils", conditions: (module) => (module.blockContact && module.unblockContact) ? module : null },
        { id: "ChatUtil", module: "WAWebSendClearChatAction", conditions: (module) => (module.sendClear) ? module : null },
        { id: "GroupInvite", module: "WAWebGroupInviteJob", conditions: (module) => (module.queryGroupInviteCode) ? module : null },
        { id: "BusinessProfile", module: "WAWebBusinessProfileCollection", conditions: (module) => (module.BusinessProfileCollection) ? module.BusinessProfileCollection : null },
        { id: "ChatHelper", module: "WAWebFindChatAction", conditions: (module) => module ? module : null },
        { id: "QueryExist", module: "WAWebQueryExistsJob", conditions: (module) => module ? module : null },
        { id: "Wap", module: "WAWebCreateGroupAction", conditions: (module) => (module.createGroup) ? module : null },
        { id: "State", module: "WAWebSocketModel", conditions: (module) => (module.STATE && module.STREAM) ? module : null },
        { id: "_Presence", module: "WAWebContactPresenceBridge", conditions: (module) => (module.setPresenceAvailable && module.setPresenceUnavailable) ? module : null },
        { id: "WapDelete", module: "WAWebChatDeleteBridge", conditions: (module) => (module.sendConversationDelete && module.sendConversationDelete.length == 2) ? module : null },
        { id: "WapQuery", module: "WAWebQueryExistsJob", conditions: (module) => (module.queryExist) ? module : ((module.default && module.default.queryExist) ? module.default : null) },
        { id: "UserConstructor", module: "WAWebWid", conditions: (module) => (module.default && module.default.prototype && module.default.prototype.isServer && module.default.prototype.isUser) ? module.default : null },
        { id: "SendTextMsgToChat", module: "WAWebSendTextMsgChatAction", resolver: (module) => module.sendTextMsgToChat },
        { id: "ReadSeen", module: "WAWebUpdateUnreadChatAction", conditions: (module) => (module.sendSeen) ? module : null },
        { id: "sendDelete", module: "WAWebDeleteChatAction", conditions: (module) => (module.sendDelete) ? module.sendDelete : null },
        { id: "addAndSendMsgToChat", module: "WAWebSendMsgChatAction", conditions: (module) => (module.addAndSendMsgToChat) ? module.addAndSendMsgToChat : null },
        { id: "Catalog", module: "WAWebCatalogCollection", conditions: (module) => (module.Catalog) ? module.Catalog : null },
        { id: "MsgKey", module: "WAWebMsgKey", conditions: (module) => (module.default && module.default.toString && module.default.toString().includes('MsgKey error: obj is null/undefined')) ? module.default : null },
        { id: "Parser", module: "WAWebE2EProtoUtils", conditions: (module) => (module.convertToTextWithoutSpecialEmojis) ? module.default : null },
        { id: "Builders", module: "WAWebProtobufsE2E.pb", conditions: (module) => (module.TemplateMessage && module.HydratedFourRowTemplate) ? module : null },
        { id: "Me", module: "WAWebUserPrefsMeUser", conditions: (module) => (module.PLATFORMS && module.Conn) ? module.default : null },
        { id: "MyStatus", module: "WAWebContactStatusBridge", conditions: (module) => (module.getStatus && module.setMyStatus) ? module : null },
        { id: "ChatStates", module: "WAWebChatStateBridge", conditions: (module) => (module.sendChatStatePaused && module.sendChatStateRecording && module.sendChatStateComposing) ? module : null },
        { id: "GroupActions", module: "WAWebExitGroupAction", conditions: (module) => (module.sendExitGroup && module.localExitGroup) ? module : null },
        { id: "Participants", module: "WAWebGroupsParticipantsApi", conditions: (module) => (module.addParticipants && module.removeParticipants && module.promoteParticipants && module.demoteParticipants) ? module : null },
        { id: "WidFactory", module: "WAWebWidFactory", conditions: (module) => (module.isWidlike && module.createWid && module.createWidFromWidLike) ? module : null },
        { id: "Sticker", module: "WAWebStickerPackCollection", resolver: m => m.StickerPackCollection, conditions: (module) => (module.default && module.default.Sticker) ? module.default.Sticker : null },
        { id: "UploadUtils", module: "WAWebUploadManager", conditions: (module) => (module.default && module.default.encryptAndUpload) ? module.default : null }
    ];

    return new Promise((resolve, reject) => {
        try {
            const e = (m) => require("__debug").modulesMap[m] || false;

            const shouldRequire = m => {
                const a = e(m);
                if (!a) return false;
                return a.dependencies != null && a.depPosition >= a.dependencies.length
            };

            neededObjects.map((needObj) => {
                const m = needObj.module;
                if (!m) return;
                if (!e(m)) return;
                if (shouldRequire(m)) {
                    let neededModule = require(m)
                    needObj.foundedModule = neededModule;
                }
            });

            window.Store = {
                ...{ ...require("WAWebCollections") },
                ...(window.Store || {})
            }

            neededObjects.forEach((needObj) => {
                if (needObj.foundedModule) {
                    window.Store[needObj.id] = needObj.resolver ? needObj.resolver(needObj.foundedModule) : needObj.foundedModule;
                }
            });

            if (window.Store.Chat) {
                window.Store.Chat.modelClass.prototype.sendMessage = function (e) {
                    window.Store.SendTextMsgToChat(this, ...arguments);
                }
                // Do not attempt to polyfill Chat.findImpl; rely on _find paths only
            }

            if (window.Store) {
                window.Store.InitType = "new_method";
            }

            resolve();
        } catch (error) {
            reject("InjectJS :: initStoreNew :: Error :: " + error);
        }
    });
}

// Init ProSender Object function
const initProSender = function () {
    // Initalize ProSender object
    window.ProSender = { lastRead: {} };

    window.ProSender._normalizeId = function (id) {
        if (!id) return id;
        if (typeof id === "object" && id._serialized) return id._serialized;
        if (typeof id === "string") {
            if (id.indexOf("@") !== -1) return id;
            const onlyDigits = id.replace(/[^0-9]/g, "");
            return onlyDigits + "@c.us";
        }
        return id;
    };

    window.ProSender._getWid = function (id) {
        let wid = null;
        try {
            if (window.Store.WidFactory && typeof window.Store.WidFactory.createWid === 'function') {
                wid = window.Store.WidFactory.createWid(id);
            }
        } catch (e) { }
        return wid;
    }

    window.ProSender._getChat = async function (chatId, wid) {
        let chat = null;
        const userInstance = wid || new window.Store.UserConstructor(chatId, { intentionallyUsePrivateConstructor: true });
        if (typeof window.Store.Chat.get === 'function') {
            chat = window.Store.Chat.get(userInstance) || window.Store.Chat.get(chatId) || null;
        }
        if (!chat && typeof window.Store.Chat._find === 'function') {
            try { chat = await window.Store.Chat._find(userInstance); } catch (e) { }
        }
        if (!chat && window.Store.BusinessProfile && typeof window.Store.BusinessProfile._find === 'function') {
            try { chat = await window.Store.BusinessProfile._find(userInstance); } catch (e) { }
        }
        if (!chat && window.Store.ChatHelper) {
            try {
                if (!chat && typeof window.Store.ChatHelper.findOrCreateLatestChat === 'function') {
                    chat = await window.Store.ChatHelper.findOrCreateLatestChat(userInstance);
                }
            } catch (e) { }
            try {
                if (!chat && typeof window.Store.ChatHelper.findChat === 'function') {
                    chat = await window.Store.ChatHelper.findChat(userInstance);
                }
            } catch (e) { }
        }
        if (!chat && typeof window.Store.Chat.find === 'function' && typeof window.Store.Chat.findImpl === 'function') {
            try { chat = await window.Store.Chat.find(userInstance); } catch (e) { }
        }
        if (!chat) {
            let canonical = chatId;
            try {
                const digits = chatId.split('@')[0];
                let qres = null;
                if (window.Store.QueryExist) {
                    if (typeof window.Store.QueryExist.queryPhoneExists === 'function') {
                        qres = await window.Store.QueryExist.queryPhoneExists(digits);
                    } else if (typeof window.Store.QueryExist.queryWidExists === 'function') {
                        qres = await window.Store.QueryExist.queryWidExists(userInstance);
                    } else if (typeof window.Store.QueryExist.queryExist === 'function') {
                        qres = await window.Store.QueryExist.queryExist(userInstance);
                    }
                } else if (window.Store.WapQuery && typeof window.Store.WapQuery.queryExist === 'function') {
                    qres = await window.Store.WapQuery.queryExist(userInstance);
                }
                const maybeWid = qres && (qres.wid || qres.jid || qres.id);
                if (maybeWid) {
                    if (typeof maybeWid === 'string') {
                        canonical = maybeWid;
                    } else if (typeof maybeWid.toString === 'function') {
                        canonical = maybeWid.toString();
                    }
                }
            } catch (e) { }
            let canonicalWid = userInstance;
            if (canonical && canonical !== chatId) {
                try {
                    if (window.Store.WidFactory && typeof window.Store.WidFactory.createWid === 'function') {
                        canonicalWid = window.Store.WidFactory.createWid(canonical);
                    } else {
                        canonicalWid = new window.Store.UserConstructor(canonical, { intentionallyUsePrivateConstructor: true });
                    }
                } catch (e) { }
            }
            if (!chat && typeof window.Store.Chat.get === 'function') {
                chat = window.Store.Chat.get(canonicalWid) || window.Store.Chat.get(canonical) || null;
            }
            if (!chat && typeof window.Store.Chat._find === 'function') {
                try { chat = await window.Store.Chat._find(canonicalWid); } catch (e) { }
            }
            if (!chat && window.Store.BusinessProfile && typeof window.Store.BusinessProfile._find === 'function') {
                try { chat = await window.Store.BusinessProfile._find(canonicalWid); } catch (e) { }
            }
            try {
                if (!chat && window.Store.CreateChat && typeof window.Store.CreateChat.createChat === 'function') {
                    await window.Store.CreateChat.createChat(canonicalWid);
                }
                if (!chat && window.Store.ChatGetExistingBridge && typeof window.Store.ChatGetExistingBridge.getExisting === 'function') {
                    chat = await window.Store.ChatGetExistingBridge.getExisting(canonicalWid);
                }
            } catch (e) { }
            if (!chat && typeof window.Store.Chat.get === 'function') {
                chat = window.Store.Chat.get(canonicalWid) || window.Store.Chat.get(canonical) || null;
            }
        }

        if (chat && typeof chat.sendMessage !== 'function') {
            if (chat.chat && (typeof chat.chat.sendMessage === 'function' || chat.chat.id)) {
                chat = chat.chat;
            } else if (chat.result && chat.result.chat && (typeof chat.result.chat.sendMessage === 'function' || chat.result.chat.id)) {
                chat = chat.result.chat;
            } else if (chat.existingChat && (typeof chat.existingChat.sendMessage === 'function' || chat.existingChat.id)) {
                chat = chat.existingChat;
            }
        }

        if (chat && typeof chat.sendMessage !== 'function') {
            const self = chat;
            chat.sendMessage = function () {
                const text = arguments[0];
                if (typeof window.Store?.SendTextMsgToChat === 'function') {
                    return window.Store.SendTextMsgToChat(self, text);
                }
                if (typeof window.Store?.TextMsgChatAction?.sendTextMsgToChat === 'function') {
                    return window.Store.TextMsgChatAction.sendTextMsgToChat(self, text);
                }
                throw new Error('SendTextMsgToChat API not available');
            };
        }

        return chat;
    }

    window.ProSender.getChatForSending = function (id) {
        return new Promise(async (resolve, reject) => {
            try {
                let chatId = window.ProSender._normalizeId(id);
                let wid = window.ProSender._getWid(chatId);
                let chat = await window.ProSender._getChat(chatId, wid);

                if (!chat) {
                    throw new Error(`Chat object could not be found or created for id: ${id}`);
                }

                resolve(chat);
            } catch (err) {
                reject(err);
            }
        });
    };

    window.ProSender.sendAttachment = function (mediaBlob, chatId, caption, waitTillSend) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!mediaBlob) throw new Error('mediaBlob is required');
                const id = window.ProSender._normalizeId(chatId);
                const chat = await window.ProSender.getChatForSending(id);
                if (!chat) throw new Error(`Chat not found for id: ${chatId}`);

                const sendOpts = {};
                if (/\S/.test(caption)) {
                    sendOpts.caption = caption;
                    sendOpts.isCaptionByUser = true;
                }

                // Prefer MediaCollection flow (more stable across WA versions)
                const tryMediaCollection = async () => {
                    const MC = window.Store?.MediaCollection;
                    if (!MC) throw new Error('MediaCollection not available');

                    let mc = null;
                    try { mc = new MC(chat); } catch (e) { }
                    if (!mc) mc = new MC();

                    if (typeof mc.processFiles === 'function') {
                        await mc.processFiles([mediaBlob], chat, 1);
                    } else if (typeof mc.processAttachments === 'function') {
                        const att = { file: mediaBlob, fileName: mediaBlob.name, type: mediaBlob.type };
                        await mc.processAttachments([att], chat, 1);
                    } else {
                        throw new Error('No processFiles/processAttachments on MediaCollection');
                    }

                    const model = mc.models?.[0] || mc._models?.[0];
                    if (!model || typeof model.sendToChat !== 'function') {
                        throw new Error('Prepared media model not found');
                    }
                    await model.sendToChat(chat, sendOpts);
                };

                const tryMediaPrep = async () => {
                    if (!window.Store.OpaqueData || !window.Store.MediaPrep || !window.Store.MediaObject || !window.Store.MediaTypes || !window.Store.MediaUpload) {
                        throw new Error("Required modules for new media prep not found");
                    }

                    const opaqueData = await window.Store.OpaqueData.createFromData(mediaBlob, mediaBlob.type);

                    const typeStr = (mediaBlob.type || '').toLowerCase();
                    let asDocument = false;
                    let isPtt = false;
                    let asGif = false;

                    if (!typeStr.startsWith('image/') && !typeStr.startsWith('video/') && !typeStr.startsWith('audio/')) {
                        asDocument = true;
                    }
                    if (typeStr.startsWith('audio/') && typeStr.includes('ogg')) {
                        isPtt = true;
                    }

                    const prepOpts = { asDocument, asGif, isPtt, asSticker: false };
                    const p = window.Store.MediaPrep.prepRawMedia(opaqueData, prepOpts);

                    const h = await p.waitForPrep();

                    if (!h || !h.filehash) {
                        console.error("[MediaPrep] Missing h or h.filehash", h);
                        throw new Error("media-fault: h or h.filehash is undefined after waitForPrep");
                    }

                    const f = window.Store.MediaObject.getOrCreateMediaObject(h.filehash);

                    const m = window.Store.MediaTypes.msgToMediaType({
                        type: h.type,
                        isGif: h.isGif,
                        isNewsletter: false
                    });

                    if (!(h.mediaBlob instanceof window.Store.OpaqueData)) {
                        h.mediaBlob = await window.Store.OpaqueData.createFromData(h.mediaBlob, h.mediaBlob.type);
                    }
                    h.renderableUrl = h.mediaBlob.url();
                    f.consolidate(h.toJSON ? h.toJSON() : h);

                    try {
                        let BlobCache = window.Store.BlobCache?.InMemoryMediaBlobCache;
                        if (BlobCache && typeof BlobCache.put === 'function') {
                            const eData = h.mediaBlob.formData();
                            BlobCache.put(f.filehash, eData);
                            h.mediaBlob.autorelease();
                        }
                    } catch (e) {
                        console.error("[MediaPrep] Cache error:", e);
                    }

                    const g = {
                        mimetype: h.mimetype,
                        mediaObject: f,
                        mediaType: m
                    };

                    const uploadRes = await window.Store.MediaUpload.uploadMedia(g);
                    const y = uploadRes.mediaEntry;
                    if (!y) throw new Error("upload failed: media entry was not created");

                    h.set({
                        clientUrl: y.mmsUrl,
                        deprecatedMms3Url: y.deprecatedMms3Url,
                        directPath: y.directPath,
                        mediaKey: y.mediaKey,
                        mediaKeyTimestamp: y.mediaKeyTimestamp,
                        filehash: f.filehash,
                        encFilehash: y.encFilehash,
                        uploadhash: y.uploadHash,
                        size: f.size,
                        streamingSidecar: y.sidecar,
                        firstFrameSidecar: y.firstFrameSidecar,
                        mediaHandle: null
                    });

                    if (typeof h.sendToChat === 'function') {
                        return await h.sendToChat(chat, sendOpts);
                    }

                    const UserModule = window.Store.User || window.Store.UserPrefs?.default || window.Store.UserPrefs;
                    let meLid = null;
                    let mePn = null;

                    if (UserModule) {
                        meLid = typeof UserModule.getMaybeMeLidUser === 'function' ? UserModule.getMaybeMeLidUser() : null;
                        mePn = typeof UserModule.getMaybeMePnUser === 'function' ? UserModule.getMaybeMePnUser() : null;
                    }
                    if (!mePn && window.Store.Contact && window.Store.Conn) {
                        mePn = window.Store.Contact.get(window.Store.Conn.me);
                        if (!mePn && window.Store.WidFactory) mePn = window.Store.WidFactory.createWid(window.Store.Conn.me);
                    }

                    const newId = await (window.Store.MsgKey.newId || window.Store.MsgKey.newId)();

                    const isLid = chat.id && chat.id.isLid && chat.id.isLid();
                    let b = isLid && meLid ? meLid : mePn;
                    if (!b && window.Store.Conn) b = window.Store.Conn.me;
                    if (typeof b === 'string' && window.Store.WidFactory) {
                        try { b = window.Store.WidFactory.createWid(b); } catch (e) { }
                    }

                    let v;
                    if (chat.id && typeof chat.id.isGroup === 'function' && chat.id.isGroup()) {
                        let authLid = chat.groupMetadata && chat.groupMetadata.isLidAddressingMode ? meLid : mePn;
                        if (!authLid) authLid = window.Store.Conn?.me;
                        if (window.Store.WidFactory && window.Store.WidFactory.asUserWidOrThrow) {
                            try { v = window.Store.WidFactory.asUserWidOrThrow(authLid); } catch (e) { }
                        }
                    } else if (chat.id && typeof chat.id.isStatus === 'function' && chat.id.isStatus()) {
                        let authLid = b;
                        if (window.Store.WidFactory && window.Store.WidFactory.asUserWidOrThrow) {
                            try { v = window.Store.WidFactory.asUserWidOrThrow(authLid); } catch (e) { }
                        }
                    }

                    let MsgKeyCtor = window.Store.MsgKey.default || window.Store.MsgKey;
                    if (typeof MsgKeyCtor !== 'function' && window.require) {
                        let module = window.require("WAWebMsgKey");
                        if (module) MsgKeyCtor = module.default || module;
                    }

                    const msgKey = new MsgKeyCtor({
                        from: b,
                        to: chat.id,
                        id: newId,
                        participant: v,
                        selfDir: "out"
                    });
                    console.log("[MediaPrep] MsgKey created:", msgKey);

                    let ephemeralFields = {};
                    if (window.Store.EphemeralFields && window.Store.EphemeralFields.getEphemeralFields) {
                        ephemeralFields = window.Store.EphemeralFields.getEphemeralFields(chat) || {};
                    }

                    h.caption = sendOpts.caption || undefined;
                    if (sendOpts.isViewOnce !== undefined) {
                        h.isViewOnce = sendOpts.isViewOnce;
                    }

                    const hJSON = h.toJSON ? h.toJSON() : h;
                    const previewStr = hJSON.preview || h.preview || "";

                    const MsgOptions = {
                        ...sendOpts,
                        id: msgKey,
                        ack: 0,
                        body: previewStr,
                        from: b,
                        to: chat.id,
                        local: true,
                        self: "out",
                        t: parseInt(new Date().getTime() / 1e3),
                        isNewMsg: true,
                        type: h.type || "chat",
                        ...ephemeralFields,
                        ...(h.attributes || {}),
                        ...h,
                        ...hJSON,
                        caption: h.caption || "",
                        author: v || undefined,

                        // Critical explicitly enforced Media Sync Properties
                        clientUrl: y.mmsUrl,
                        deprecatedMms3Url: y.deprecatedMms3Url,
                        directPath: y.directPath,
                        mediaKey: y.mediaKey,
                        mediaKeyTimestamp: y.mediaKeyTimestamp,
                        filehash: f.filehash,
                        encFilehash: y.encFilehash,
                        uploadhash: y.uploadHash,
                        size: f.size,
                        streamingSidecar: y.sidecar,
                        firstFrameSidecar: y.firstFrameSidecar,
                        mediaHandle: null
                    };

                    try {
                        console.log("[MediaPrep] MsgOptions prepared details:", JSON.parse(JSON.stringify(MsgOptions)));
                    } catch (e) {
                        console.log("[MediaPrep] MsgOptions prepared details:", MsgOptions);
                    }

                    let sendAction = window.Store.SendMsgChatAction?.addAndSendMsgToChat || window.Store.SendMsgChatAction || window.Store.addAndSendMsgToChat;
                    if (!sendAction && window.require) {
                        const mSendMessage = window.require("WAWebSendMsgChatAction") || window.require("WAWebSendMessage");
                        if (mSendMessage && mSendMessage.addAndSendMsgToChat) {
                            sendAction = mSendMessage.addAndSendMsgToChat;
                        }
                    }

                    if (typeof sendAction === 'function') {
                        console.log("[MediaPrep] Sending via sendAction function...");
                        const res = sendAction(chat, MsgOptions);
                        if (Array.isArray(res)) return await res[0];
                        return await res;
                    } else if (window.Store.SendMsgChatAction && typeof window.Store.SendMsgChatAction.sendMsg === 'function') {
                        console.log("[MediaPrep] Sending via SendMsgChatAction.sendMsg...");
                        return await window.Store.SendMsgChatAction.sendMsg(chat, MsgOptions);
                    }
                    console.error("[MediaPrep] addAndSendMsgToChat not found or not a function");
                    throw new Error("addAndSendMsgToChat not found or not a function");
                };

                // Track errors from both methods
                let mediaCollectionError = null;
                let mediaPrepError = null;
                let attachmentSent = false;

                // Try MediaCollection first
                try {
                    await tryMediaCollection();
                    attachmentSent = true;
                    console.logSuccess('Attachment sent successfully via MediaCollection');
                } catch (e1) {
                    mediaCollectionError = e1;
                    console.logWarn(`MediaCollection failed: ${e1.message || e1}`);

                    // Try MediaPrep as fallback
                    try {
                        await tryMediaPrep();
                        attachmentSent = true;
                        console.logSuccess('Attachment sent successfully via MediaPrep');
                    } catch (e2) {
                        mediaPrepError = e2;
                        console.logError(`MediaPrep failed: ${e2.message || e2}`);
                    }
                }

                // If both methods failed, throw a comprehensive error
                if (!attachmentSent) {
                    const errorDetails = {
                        mediaCollectionError: mediaCollectionError?.message || String(mediaCollectionError),
                        mediaPrepError: mediaPrepError?.message || String(mediaPrepError)
                    };

                    const errorMessage = `NO ATTACHMENT SENT - Both methods failed:\n` +
                        `• MediaCollection: ${errorDetails.mediaCollectionError}\n` +
                        `• MediaPrep: ${errorDetails.mediaPrepError}`;

                    console.logError(errorMessage);
                    throw new Error(errorMessage);
                }

                if (waitTillSend) {
                    const start = Date.now();
                    (function check() {
                        const sent = document.querySelectorAll('.message-out');
                        const last = sent[sent.length - 1];
                        if (last) return resolve();
                        if (Date.now() - start > 3000) return resolve();
                        setTimeout(check, 250);
                    })();
                } else {
                    resolve();
                }
            } catch (err) {
                reject(err);
            }
        });
    };

    window.ProSender._isContact = function (obj, isSaved, checkBusiness = true) {
        if (obj) {
            return obj.id?.server === 'c.us'
                && (!checkBusiness || obj.isBusiness !== true)
                && obj.isAddressBookContact === isSaved;
        }
        return false;
    };

    window.ProSender._serializeContact = function (obj) {
        if (obj) {
            return {
                id: obj.id || obj._x_id,
                server: obj.id?.server,
                number: obj.id?.user,
                name: obj.name || obj.pushname || obj.formattedTitle || 'Unkown',
                pushname: obj.pushname || null
            }
        }
        return {};
    }

    // Get unsaved contacts
    window.ProSender.getMyUnsavedContacts = function () {
        return window.Store.Contact
            .filter(contact => window.ProSender._isContact(contact, 0))
            .map(contact => window.ProSender._serializeContact(contact));
    }

    // Get all contacts
    window.ProSender.getAllContacts = function () {
        return window.Store.Contact
            .filter(contact => window.ProSender._isContact(contact, 1))
            .map(contact => window.ProSender._serializeContact(contact));
    }

    window.ProSender.getFavoriteContacts = function () {
        return window.Store.Contact.filter(contact => window.ProSender._isContact(contact, 1) && contact.isFavorite).map(contact => window.ProSender._serializeContact(contact));
    }

    // Get all saved contacts including business
    window.ProSender.getAllSavedContacts = function () {
        return window.Store.Contact
            .filter(contact => window.ProSender._isContact(contact, 1, false))
            .map(contact => window.ProSender._serializeContact(contact));
    }

    window.ProSender._isNumberExist = async function (number) {
        if (window.Store.QueryExist && !useOldMethod) {
            let numberObj = await window.Store.QueryExist.queryPhoneExists(number)
            return numberObj ? true : false
        } else {
            return true;
        }
    }

    // to get the recent chats based on contact or group
    window.ProSender.getRecentChats = function () {
        return window.Store.Chat
            .filter(chat => chat && window.ProSender._isContact(chat.contact, 1))
            .map(chat => window.ProSender._serializeContact(chat.contact));
    }

    window.ProSender._isGroup = function (obj) {
        if (obj) {
            return (obj.id?.server === "g.us");
        }
        return false;
    }

    window.ProSender._serializeGroup = function (obj) {
        if (obj) {
            return {
                id: obj.id,
                name: obj.name || obj.formattedTitle || 'Unkown',
                attributes: obj.attributes,
                groupMetadata: obj.groupMetadata
            }
        }
        return {};
    }

    // Get all groups
    window.ProSender.getAllGroups = function () {
        return window.Store.Chat
            .filter(chat => window.ProSender._isGroup(chat))
            .map(chat => window.ProSender._serializeGroup(chat));
    };

    window.ProSender.getFavoriteGroups = function () {
        return window.Store.Chat.filter(chat => window.ProSender._isGroup(chat) && chat.isFavorite).map(chat => window.ProSender._serializeGroup(chat));
    }

    // Get group by id
    window.ProSender.getGroupById = function (group_id) {
        return window.ProSender.getAllGroups().find(group => group.id._serialized === group_id);
    }

    // Get group contacts
    window.ProSender.getGroupContacts = function (group_id, callback) {
        const group = window.ProSender.getGroupById(group_id);
        if (!group || !group.groupMetadata) return { participants: [], pastParticipants: [] };

        const { participants = [], pastParticipants = [], groupType } = group.groupMetadata;
        const _isGroup = groupType === "DEFAULT" || groupType === "LINKED_SUBGROUP";

        if (_isGroup) {
            return {
                participants: participants.map(p => window.ProSender._serializeGroupContact(p.contact)),
                pastParticipants: pastParticipants.map(p => window.ProSender._serializeGroupContact(p.contact))
            };
        }

        return {
            participants: participants.map(p => window.ProSender._serializeGroupContact(p.contact)),
            pastParticipants: pastParticipants.map(p => window.ProSender._serializeGroupContact(p.contact))
        };
    };

    window.ProSender._isLabel = function (obj) {
        if (obj) {
            return obj.__x_id && obj.__x_name && obj.labelItemCollection?._models;
        }
        return false;
    };

    window.ProSender._isChannel = function (obj) {
        if (obj) {
            return obj.canSend && obj.newsletterMetadata?.isSubscribedOrOwned;
        }
        return false;
    };

    window.ProSender._serializeLabel = function (obj) {
        if (obj) {
            let contacts = [];
            if (obj.labelItemCollection._models) {
                contacts = obj.labelItemCollection._models
                    .filter(item => item.__x_parentType === "Chat")
                    .map(item => item.__x_parentId)
            }

            return {
                id: obj.__x_id,
                name: obj.__x_name,
                color: obj.color || "Unknown",
                contacts: contacts
            };
        }
        return {};
    };

    window.ProSender._serializeChannel = function (obj) {
        if (obj) {
            return {
                id: obj.__x_id,
                name: obj.__x_name || obj.__x_formattedTitle || obj.name || obj.formattedTitle || "Unknown",
            };
        }
        return {};
    };

    window.ProSender.getAllLabels = function () {
        let storeLabel = window.Store?.Label;
        let models = storeLabel?.models || storeLabel?._models;

        if (!models || !models.length) return [];

        return models
            .filter(label => window.ProSender._isLabel(label))
            .map(label => window.ProSender._serializeLabel(label));
    };

    window.ProSender.getAllChannels = function () {
        let storeChannel = window.Store?.Channel;
        let models = storeChannel?.models || storeChannel?._models;

        if (!models || !models.length) return [];

        return models.filter(channel => window.ProSender._isChannel(channel)).map(channel => window.ProSender._serializeChannel(channel));
    };

    // Helper for group contact serialization
    window.ProSender._serializeGroupContact = function (contact = {}) {
        const number = contact.__x_phoneNumber?.user || contact.phoneNumber?.user || (contact.__x_id.server === "c.us" && contact.__x_id.user) || "Unavailable";
        const name = contact.name || contact.__x_pushname || "Unknown";
        return { name, number };
    }

    // Get group name
    window.ProSender.getGroupName = function (group_id) {
        let group = window.ProSender.getGroupById(group_id);
        return group ? group.name : 'Group';
    }

    // Get chat (group or contact) by id
    window.ProSender.getChat = async function (id, done) {
        try {
            const normalized = window.ProSender._normalizeId(id);
            const found = await window.ProSender.getChatForSending(normalized);

            if (!found) throw new Error("Chat not found");

            // Ensure a safe text send fallback if prototype wasn't patched
            if (!found.sendMessage) {
                found.sendMessage = function () {
                    const text = arguments[0];
                    if (typeof window.Store?.SendTextMsgToChat === 'function') {
                        return window.Store.SendTextMsgToChat(found, text);
                    }
                    if (typeof window.Store?.TextMsgChatAction?.sendTextMsgToChat === 'function') {
                        return window.Store.TextMsgChatAction.sendTextMsgToChat(found, text);
                    }
                    throw new Error('SendTextMsgToChat API not available');
                };
            }

            if (done !== undefined) done(found);

            return found;

        } catch (err) {
            console.error("ProSender.getChat failed:", err);
            return null;
        }
    };

    // Send a message
    window.ProSender.sendMessage = function (id, message) {
        return new Promise(async (resolve, reject) => {
            try {
                const chat = await window.ProSender.getChatForSending(id);

                if (!chat) {
                    return reject("chat or group not found or failed to load");
                }

                chat.sendMessage(message);
                resolve();

            } catch (err) {
                reject(err);
            }
        });
    };

    window.ProSender.verifyWhatsappNumber = function (number) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!window.Store.QueryExist.queryPhoneExists) {
                    return reject("Store.QueryExist.queryPhoneExists not found");
                }
                const chat = await window.Store.QueryExist.queryPhoneExists(number);
                resolve(chat);
            } catch (err) {
                reject(err);
            }
        });
    };

    // Convert base64 string data to File
    window.ProSender.base64toFile = function (data, fileName) {
        let arr = data.split(",");
        let mime = arr[0].match(/:(.*?);/)[1];
        let bstr = atob(arr[1]);
        let n = bstr.length;
        let u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], fileName, { type: mime });
    }

    window.ProSender.sendMessageToNewsletter = async function (newsletterId, message) {
        try {
            // ============================================================
            // STEP 1: Fix Missing Identity (Store.Me)
            // ============================================================
            if (!window.Store.Me) {
                // 1. Get the ID string you found: '"919173627548:4@c.us"'
                let myWidStr = localStorage.getItem('last-wid-md');

                if (!myWidStr) {
                    throw new Error("Critical: Could not find 'last-wid-md' in LocalStorage.");
                }

                // 2. Remove the extra quotes (becomes '919173627548:4@c.us')
                myWidStr = myWidStr.replace(/"/g, '').split(":")[0] + "@c.us";

                // 3. Create the Wid Object using the constructor from your inject.js
                const UserConstructor = window.Store.UserConstructor;

                if (!UserConstructor) {
                    throw new Error("UserConstructor not found in Store. Cannot recreate identity.");
                }

                // 4. Rebuild Store.Me
                window.Store.Me = {
                    wid: new UserConstructor(myWidStr, { intentionallyUsePrivateConstructor: true })
                };

                console.log("Identity fixed. User: " + myWidStr);
            }

            // ============================================================
            // STEP 2: Find the Newsletter Chat
            // ============================================================
            const jid = newsletterId.includes('@newsletter') ? newsletterId : `${newsletterId}@newsletter`;

            // Newsletters live in Store.Channel, not Store.Chat
            let chat = window.Store.Channel ? window.Store.Channel.get(jid) : null;

            // Fallback to Chat Store just in case
            if (!chat) chat = window.Store.Chat.get(jid);

            if (!chat) {
                throw new Error(`Newsletter '${jid}' not found. Make sure you are Subscribed or an Admin.`);
            }

            // ============================================================
            // STEP 3: Prepare the Send Job
            // ============================================================
            const SendChannelMessage = window.Store.SendChannelMessage;

            if (!SendChannelMessage || !SendChannelMessage.sendNewsletterMessageJob) {
                throw new Error("Newsletter internal API (SendChannelMessage) not found.");
            }

            // ============================================================
            // STEP 4: Create a Valid Message Key
            // ============================================================
            const tempId = await window.Store.MsgKey.newId();

            // CRITICAL: The key must have 'remote' set to the newsletter JID
            const msgKey = new window.Store.MsgKey({
                fromMe: true,
                remote: chat.id,
                id: tempId.id || tempId
            });

            // ============================================================
            // STEP 5: Build and Send
            // ============================================================
            const msgData = {
                id: msgKey,
                type: "chat",
                body: message,
                from: window.Store.Me.wid, // Now valid because of Step 1
                to: chat.id,
                self: "out",
                t: Math.floor(Date.now() / 1000),
                isNewMsg: true,
                local: true,
                ack: 0,
            };

            const msgModel = new window.Store.Msg.modelClass(msgData);

            // Add to UI immediately
            if (chat.msgs) chat.msgs.add(msgModel);

            // Send via WhatsApp's internal Newsletter Job
            const result = await SendChannelMessage.sendNewsletterMessageJob({
                msg: msgModel,
                type: "text",
                newsletterJid: chat.id.toJid ? chat.id.toJid() : chat.id._serialized
            });

            if (result && result.success) {
                // Update the message status to 'Sent' (one checkmark)
                msgModel.t = result.ack.t;
                msgModel.updateAck(1, true);

                // Sync with internal records
                if (SendChannelMessage.updateNewsletterMsgRecord) {
                    await SendChannelMessage.updateNewsletterMsgRecord(msgModel);
                }

                return result;
            } else {
                throw new Error("WhatsApp Server rejected the newsletter message.");
            }

        } catch (error) {
            console.error("Newsletter Send Error:", error);
            throw error;
        }
    };
}

// InitMain :: Load Store and ProSender
var initStoreInterval = null;
var initStoreRetryCount = 0;
var useOldMethod = true;

const initMain = function () {
    initStoreRetryCount = 0;
    let initStoreInterval = setInterval(() => {
        if (isWhatsappLoaded() && isWebpackLoaded()) {

            initStore(useOldMethod)
                .then(() => {
                    initProSender();

                    // Check store and ProSender loaded or not
                    if (window.Store && window.ProSender) {
                        clearInterval(initStoreInterval);
                        handleInitMainSuccess();
                    } else {
                        initStoreRetryCount++;
                        handleInitMainError();
                    }
                })
                .catch((e) => {
                    initStoreRetryCount++;
                    handleInitMainError();
                })

        } else {
            handleInitMainError();
        }

        if (!useOldMethod && initStoreRetryCount == 5) {
            reloadInitMain(true);
        }
    }, 1000);
}

const reloadInitMain = function (method) {
    clearInterval(initStoreInterval);
    sessionStorage.removeItem('inject_pro_session');

    setTimeout(() => {
        console.logWarn(`InjectJS :: reloadInitMain :: useOldMethod = ${method}`);
        useOldMethod = method;
        initMain();
    }, 2000)
}

const handleInitMainSuccess = function () {
    const isInjectExecuted = sessionStorage.getItem('inject_pro_session');
    if (isInjectExecuted) {
        console.logSuccess("InjectJS :: initMain - Already executed in this session. Skipping...");
        return;
    } else {
        sessionStorage.setItem('inject_pro_session', 'executed');
    }

    if (isWhatsappLoaded() && window.Store && window.ProSender) {
        console.logSuccess(`InjectJS :: initMain - Success :: useOldMethod = ${useOldMethod}`);
        console.logSuccess(`InjectJS :: Init Store Type  :: ${getInitStoreType()}`);
        console.logSuccess(`InjectJS :: Whatsapp Version :: ${getWhatsappVersion()}`);

        getAllLists();
        getAllGroups();
        getAllContacts();
        getAllLabels();
        getAllChannels();
    }
}

const handleInitMainError = function (error = null) {
    let objName = null;
    if (!isWhatsappLoaded())
        objName = 'Whatsapp';
    else if (!isWebpackLoaded())
        objName = 'Webpack';
    else if (!window.Store)
        objName = 'Store';
    else if (!window.ProSender)
        objName = 'ProSender';

    if (error) {
        console.logError(`InjectJS :: initMain - Error :: useOldMethod = ${useOldMethod}`);
        console.error(error);
    } else if (objName) {
        console.logError(`InjectJS :: initMain - Error :: ${objName} is not loaded! :: useOldMethod = ${useOldMethod}`);
    } else {
        console.logError(`InjectJS :: initMain - Unkown Error :: useOldMethod = ${useOldMethod}`);
    }
}

// ======= CORE INJECT JS CODE ENDS HERE =======

//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\

// ======= Pro SENDER CODE STARTS =====

function resolveChatId(number) {
    const fallbackChatId = number + '@c.us';

    try {
        const activeChat = window.Store?.Chat?.getActive?.();
        if (activeChat?.id?.server === "c.us") {
            return activeChat.id._serialized;
        }
    } catch (err) {
        console.warn('ChatId resolution failed, using fallback', err);
    }

    return fallbackChatId;
}

function withTimeout(promise, ms = 5000) {
    return Promise.race([
        promise,
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error("TIMEOUT_ERROR")), ms)
        )
    ]);
}

// Event Listeners and Pro Sender Functions
window.addEventListener('ProSender::init', function (e) {
    reloadInitMain(e.detail.useOldMethod);
});

window.addEventListener('ProSender::send-attachments', async function (e) {
    const {
        attachments,
        caption = [],
        number,
        waitTillSend = false,
        name: fileName,
        quick = false
    } = e.detail || {};

    const chatId = resolveChatId(number);

    try {
        if (quick) {
            const fileData = JSON.parse(attachments);
            const fileBlob = await window.ProSender.base64toFile(fileData, fileName);
            await window.ProSender.sendAttachment(
                fileBlob,
                chatId,
                caption,
                false
            );
        } else {
            const sendPromises = (attachments || []).map(async (file, index) => {
                try {
                    const fileData = JSON.parse(file.data);
                    const fileBlob = await window.ProSender.base64toFile(
                        fileData,
                        file.name
                    );
                    await window.ProSender.sendAttachment(
                        fileBlob,
                        chatId,
                        caption[index] ?? '',
                        waitTillSend
                    );
                } catch (err) {
                    console.warn(`Attachment ${index} failed`, err);
                }
            });

            await Promise.allSettled(sendPromises);

            window.postMessage({
                type: "send_attachments_to_number",
                payload: {
                    chat_id: chatId,
                    is_attachments_sent: "YES",
                    comments: ""
                }
            }, "*");
        }
    } catch (error) {
        console.error(error);
        window.postMessage({
            type: "send_attachments_to_number_error",
            payload: {
                chat_id: chatId,
                error,
                is_attachments_sent: "NO",
                comments: "Error while sending the attachments to number"
            }
        }, "*");
    }
});


window.addEventListener("ProSender::send-message", async function (e) {
    const number = e.detail.number;
    const message = e.detail.message;
    const chatId = resolveChatId(number);

    try {
        await window.ProSender.sendMessage(chatId, message);
        window.postMessage({
            type: "send_message_to_number",
            payload: {
                chat_id: chatId,
                is_message_sent: "YES",
                comments: ""
            }
        }, "*");
    } catch (error) {
        console.error(error);
        window.postMessage({
            type: "send_message_to_number_new_error",
            payload: {
                chat_id: chatId,
                error: error,
                is_message_sent: "NO",
                comments: "Error while sending the message to number"
            }
        }, "*");
    }
});

window.addEventListener('ProSender::send-message-to-group', async function (e) {
    const groupId = e.detail.group_id;
    const message = e.detail.message;
    const groupIdObj = { "_serialized": groupId };

    try {
        await withTimeout(
            window.ProSender.sendMessage(groupIdObj, message),
            5000
        );

        window.postMessage({
            type: "send_message_to_group",
            payload: {
                group_id: groupId,
                is_message_sent: "YES",
                comments: ""
            }
        }, "*");

    } catch (error) {
        const isTimeout = error.message === "TIMEOUT_ERROR";

        window.postMessage({
            type: "send_message_to_group_error",
            payload: {
                group_id: groupId,
                is_message_sent: "NO",
                error_type: isTimeout ? "TIMEOUT" : "SEND_ERROR",
                comments: isTimeout
                    ? "Message sending timed out after 5 seconds"
                    : "Error while sending the message to group"
            }
        }, "*");
    }
});

window.addEventListener('ProSender::send-message-to-newsletter', async function (e) {
    const newsletterId = e.detail.newsletter_id;
    const message = e.detail.message;

    try {
        const result = await withTimeout(
            window.ProSender.sendMessageToNewsletter(newsletterId, message),
            5000
        );

        if (result?.success) {
            window.postMessage({
                type: "send_message_to_newsletter",
                payload: {
                    newsletter_id: newsletterId,
                    is_message_sent: "YES",
                    comments: ""
                }
            }, "*");
        }

    } catch (error) {
        const isTimeout = error.message === "TIMEOUT_ERROR";

        window.postMessage({
            type: "send_message_to_newsletter_error",
            payload: {
                newsletter_id: newsletterId,
                is_message_sent: "NO",
                error_type: isTimeout ? "TIMEOUT" : "SEND_ERROR",
                comments: isTimeout
                    ? "Message sending timed out after 5 seconds"
                    : "Error while sending the message to newsletter"
            }
        }, "*");
    }
});

window.addEventListener('ProSender::send-attachments-to-group', async function (e) {
    const attachments = e.detail.attachments;
    const caption = e.detail.caption;
    const groupId = e.detail.groupId;
    const waitTillSend = e.detail.waitTillSend;
    const fileName = e.detail.name;
    const quick = e.detail.quick;

    try {
        if (quick) {
            const fileData = await JSON.parse(attachments);
            const fileBlob = await window.ProSender.base64toFile(fileData, fileName);
            await window.ProSender.sendAttachment(fileBlob, groupId, caption, false);
        } else {
            const sendPromises = attachments.map(async (file, index) => {
                const fileData = await JSON.parse(file.data);
                const fileBlob = await window.ProSender.base64toFile(fileData, file.name);
                await window.ProSender.sendAttachment(fileBlob, groupId, caption[index], waitTillSend);
            });

            await Promise.all(sendPromises);
            window.postMessage({
                type: "send_attachments_to_group",
                payload: {
                    group_id: groupId,
                    is_attachments_sent: "YES",
                    comments: ""
                }
            }, "*");
        }
    } catch (error) {
        console.error(error);
        window.postMessage({
            type: "send_attachments_to_group_error",
            payload: {
                group_id: groupId,
                error: error,
                is_attachments_sent: "NO",
                comments: "Error while sending the attachments to group"
            }
        }, "*");
    }
});

window.addEventListener('ProSender::export-group', function (e) {
    const groupIds = e.detail.groupIds || [];

    try {
        let rows = [], singleGroup = "";

        for (let i = 0; i < groupIds.length; i++) {
            let groupName = ProSender.getGroupName(groupIds[i]);
            let contacts = ProSender.getGroupContacts(groupIds[i]);


            if (groupIds.length > 1) {
                rows.push([""])
                rows.push([groupName])
                rows.push([""])
            } else {
                singleGroup = groupName
            }

            rows.push(['Number', 'Name'])
            contacts.participants.forEach(contact => {
                rows.push([contact.number, contact.name]);
            })

            rows.push([""]);
            if (groupIds.length === 1) {
                rows.push(["Past Participants"]);

                contacts.pastParticipants.forEach(contact =>
                    rows.push([contact.number, contact.name])
                )
            }
        }

        // rows.sort();

        let csvContent = "data:text/csv;charset=utf-8," + rows.map(row => row.join(",")).join("\n");
        let data = encodeURI(csvContent);
        let link = document.createElement("a");

        link.setAttribute("href", data);
        link.setAttribute("download", groupIds.length > 1 ? "Multiple_group_contacts.csv" : `${singleGroup}.csv`);
        document.body.appendChild(link);
        link.click()
        document.body.removeChild(link);
    } catch (error) {
        window.postMessage({ type: "export_group_error", payload: { group_id: groupIds, error: error } }, "*");
    }
});

window.addEventListener('ProSender::export-unsaved-contacts', function (e) {
    let type = e.detail.type;

    try {
        let rows = [];
        let contacts = ProSender.getMyUnsavedContacts();

        let numContacts = (type == 'Premium') ? contacts.length : 10;
        for (let i = 0; i < numContacts; i++) {
            if (contacts[i].number) {
                let correctNumber = "+" + contacts[i].number;
                let whatsappName = contacts[i].name;
                rows.push([correctNumber, whatsappName]);
            }
        }

        rows.unshift(['Numbers', 'Name']);
        if (type == 'FreeTrial') {
            for (let i = 0; i < 3; i++)
                rows.push([]);
            rows.push(["", 'To download all unsaved contacts please buy Premium']);
        }

        let csvContent = rows.map(row => row.join(",")).join("\n");
        let blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

        let link = document.createElement("a");
        link.setAttribute("href", URL.createObjectURL(blob));
        link.setAttribute("download", "Premium_All_Unsaved_Chats_Export.csv");

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        window.postMessage({ type: "export_unsaved_contacts_error", payload: { type: type, error: error } }, "*");
    }
});

window.addEventListener('ProSender::export-saved-contacts', function (e) {
    let type = e.detail.type;

    try {
        let rows = [];
        let contacts = ProSender.getAllSavedContacts();

        let numContacts = (type == 'Premium') ? contacts.length : 10;
        for (let i = 0; i < numContacts; i++) {
            if (contacts[i].number) {
                let correctNumber = "+" + contacts[i].number;
                let whatsappName = contacts[i].name;
                rows.push([correctNumber, whatsappName]);
            }
        }

        rows.unshift(['Numbers', 'Name']);
        if (type == 'FreeTrial') {
            for (let i = 0; i < 3; i++)
                rows.push([]);
            rows.push(["", 'To download all saved contacts please buy Premium']);
        }

        let csvContent = rows.map(row => row.join(",")).join("\n");
        let blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

        let link = document.createElement("a");
        link.setAttribute("href", URL.createObjectURL(blob));
        link.setAttribute("download", "Premium_All_Saved_Chats_Export.csv");

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        window.postMessage({ type: "export_saved_contacts_error", payload: { type: type, error: error } }, "*");
    }
});

window.addEventListener('ProSender::verify-whatsapp-number', async function (event) {
    try {

        if (!window.ProSender) {
            window.postMessage({ type: "verify_whatsapp_number_error", payload: { error: "ProSender not fully loaded" } }, "*");
            return null;
        }

        let numbers = event.detail.numbers

        if (!numbers || !numbers.length) {
            window.postMessage({ type: "verify_whatsapp_number_error", payload: { error: "Invalid numbers" } }, "*");
            return null;
        }

        let results = [], all_verified = true;

        for (let i = 0; i < numbers.length; i++) {
            numbers[i] = window.ProSender._normalizeId(numbers[i]);
            let result = await window.ProSender.verifyWhatsappNumber(numbers[i]);

            results.push({
                number: numbers[i].split("@")[0],
                verified: result ? true : false
            });

            if (!result) {
                all_verified = false;
            }
        }

        window.postMessage({ type: "verify_whatsapp_number", payload: { results, all_verified } }, "*");
        return results;
    } catch (error) {
        window.postMessage({ type: "verify_whatsapp_number_error", payload: { error: error } }, "*");
        return null;
    }
});

const getAllGroups = function () {
    try {
        if (!window.ProSender) {
            console.warn("ProSender not fully loaded");
        }

        let groups = window.ProSender.getAllGroups();

        let allGroups = groups.map(group => ({
            id: group.id,
            name: group.name,
        }));

        window.postMessage({ type: "get_all_groups", payload: allGroups }, "*");
        return allGroups;
    } catch (error) {
        window.postMessage({ type: "get_all_groups_error", payload: { error: error } }, "*");
        return [];
    }
}

window.addEventListener('ProSender::get-all-groups', getAllGroups);

const getAllContacts = function () {
    try {
        if (!window.ProSender) {
            console.warn("ProSender not fully loaded");
        }

        let recentContacts = window.ProSender.getRecentChats();
        let contacts = window.ProSender.getAllContacts();

        const recentContactIds = new Set(recentContacts.map(contact => contact.id._serialized));
        const remainingContacts = contacts.filter(contact => !recentContactIds.has(contact.id._serialized));
        remainingContacts.sort((a, b) => {
            const nameA = a.name || "";
            const nameB = b.name || "";
            return nameA.localeCompare(nameB);
        });

        const uniqueContactIds = new Set();
        const combinedContacts = [...recentContacts, ...remainingContacts].filter(contact => {
            if (uniqueContactIds.has(contact.id._serialized)) {
                return false;
            }
            uniqueContactIds.add(contact.id._serialized);
            return true;
        });

        window.postMessage({ type: "get_all_contacts", payload: combinedContacts }, "*");
        return combinedContacts;
    } catch (error) {
        window.postMessage({ type: "get_all_contacts_error", payload: { error: error } }, "*");
        return [];
    }
}

window.addEventListener('ProSender::get-all-contacts', getAllContacts);

const getAllLabels = function () {
    try {
        if (!window.ProSender) {
            console.warn("ProSender not fully loaded");
        }

        let allLabels = window.ProSender.getAllLabels();

        window.postMessage({ type: "get_all_labels", payload: allLabels }, "*");
        return allLabels;
    } catch (error) {
        window.postMessage({ type: "get_all_labels_error", payload: { error: error } }, "*");
        return [];
    }
};

window.addEventListener('ProSender::get-all-labels', getAllLabels);

const getAllChannels = function () {
    try {
        if (!window.ProSender) {
            console.warn("ProSender not fully loaded");
        }

        let allChannels = window.ProSender.getAllChannels();

        window.postMessage({ type: "get_all_channels", payload: allChannels }, "*");
        return allChannels;
    } catch (error) {
        window.postMessage({ type: "get_all_channels_error", payload: { error: error } }, "*");
        return [];
    }
};

window.addEventListener('ProSender::get-all-channels', getAllChannels);

const getAllLists = function () {
    try {
        if (!window.ProSender) {
            console.warn("ProSender not fully loaded");
        }

        const favoriteContacts = window.ProSender.getFavoriteContacts();

        const favoriteGroups = window.ProSender.getFavoriteGroups().map(group => ({
            id: group.id,
            name: group.name,
        }));

        const allLists = [...favoriteContacts, ...favoriteGroups];

        try {
            const serializableLists = JSON.parse(JSON.stringify(allLists));
            window.postMessage({ type: "get_all_lists", payload: serializableLists }, "*");
        } catch (postMessageError) {
            console.error("Failed to postMessage:", postMessageError);
            window.postMessage({
                type: "get_all_lists_error",
                payload: { error: postMessageError.message }
            }, "*");
        }

        return allLists;

    } catch (error) {
        window.postMessage({ type: "get_all_lists_error", payload: { error: error.message } }, "*");
        return [];
    }
};

window.addEventListener('ProSender::get-all-lists', getAllLists);

const getInitStoreType = function () {
    let InitType = window?.Store?.InitType;
    window.postMessage({ type: "get_init_store_type", payload: InitType }, "*");
    return InitType;
}

const getWhatsappVersion = function () {
    let whatsappVersion = (window?.Debug?.VERSION ? window.Debug.VERSION : 'Not Found');
    window.postMessage({ type: "get_whatsapp_version", payload: whatsappVersion }, "*");
    return whatsappVersion;
}

// Start Init Main
reloadInitMain(true);