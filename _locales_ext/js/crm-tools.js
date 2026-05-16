/**
 * WhatFlow CRM - CRM Tools Panel
 * Handles Leads, AI Replies, Reminders, Blacklist, and Analytics
 * Completely isolated from existing extension functionality
 */
(function($) {
    'use strict';

    var CRM = {
        API_BASE: (typeof WHATFLOW_CONFIG !== 'undefined' && WHATFLOW_CONFIG.API) ? WHATFLOW_CONFIG.API : 'https://what-flow.vercel.app/api',
        STATUS_LABELS: {
            new: 'New Lead', interested: 'Interested', followup: 'Follow-up',
            converted: 'Converted', not_interested: 'Not Interested',
            complaint: 'Complaint', pending_payment: 'Pending Payment',
            pending: 'Pending', completed: 'Completed', overdue: 'Overdue'
        },
        REASON_LABELS: {
            opted_out: 'Opted Out', wrong_number: 'Wrong Number',
            complaint: 'Complaint', manual_block: 'Manual Block', other: 'Other'
        },
        userNumber: '',

        init: function() {
            this.userNumber = localStorage.getItem('my_number') || '';
            this.bindTabSwitching();
            this.bindSubTabs();
            this.bindLeadActions();
            this.bindAIActions();
            this.bindReminderActions();
            this.bindBlacklistActions();
            // Load data when CRM tab is first opened
        },

        bindTabSwitching: function() {
            var self = this;
            // CRM tab click - show CRM panel, hide functionality and premium
            $(document).on('click', '#select_crm_tools', function() {
                $('.header-tab').removeClass('active');
                $('#select_crm_tools_container').addClass('active');
                $('.premium_features_parent_div').hide();
                $('#popup_functionality').hide();
                $('#crm_tools_panel').show();
                // Load data
                self.fetchLeads();
                self.fetchReminders();
                self.fetchBlacklist();
                self.fetchAnalytics();
            });

            // Functionality tab click - restore normal view
            $(document).on('click', '#select_functionality', function() {
                $('.header-tab').removeClass('active');
                $('#select_functionality_container').addClass('active');
                $('#crm_tools_panel').hide();
                $('#popup_functionality').show();
            });

            // Premium tab click
            $(document).on('click', '#select_premium_features', function() {
                $('.header-tab').removeClass('active');
                $('#select_premium_container').addClass('active');
                $('#crm_tools_panel').hide();
                $('.premium_features_parent_div').show();
            });
        },

        bindSubTabs: function() {
            var self = this;
            $(document).on('click', '.crm-subtab', function() {
                var panel = $(this).data('panel');
                $('.crm-subtab').removeClass('active');
                $(this).addClass('active');
                $('.crm-panel').hide();
                $('#' + panel).show();
                // Refresh data on tab switch
                if (panel === 'crm-leads') self.fetchLeads();
                if (panel === 'crm-reminders') self.fetchReminders();
                if (panel === 'crm-blacklist') self.fetchBlacklist();
                if (panel === 'crm-analytics') self.fetchAnalytics();
            });
        },

        // ═══════════════════════════════════════════════════════
        // LEADS
        // ═══════════════════════════════════════════════════════
        bindLeadActions: function() {
            var self = this;
            $('#crm-add-lead-btn').on('click', function() {
                $('#crm-add-lead-form').slideToggle();
            });
            $('#crm-cancel-lead').on('click', function() {
                $('#crm-add-lead-form').slideUp();
                $('#crm-lead-phone, #crm-lead-name, #crm-lead-notes').val('');
                $('#crm-lead-status').val('new');
            });
            $('#crm-save-lead').on('click', function() {
                var phone = $('#crm-lead-phone').val().trim().replace(/[^0-9]/g, '');
                if (!phone || phone.length < 7) {
                    alert('Please enter a valid phone number');
                    return;
                }
                var leadData = {
                    phoneNumber: phone,
                    name: $('#crm-lead-name').val().trim() || undefined,
                    status: $('#crm-lead-status').val(),
                    notes: $('#crm-lead-notes').val().trim() || undefined,
                    source: 'manual'
                };
                self.apiCall('POST', '/admin/leads', leadData, function(data) {
                    if (data.success) {
                        $('#crm-add-lead-form').slideUp();
                        $('#crm-lead-phone, #crm-lead-name, #crm-lead-notes').val('');
                        self.fetchLeads();
                    } else {
                        alert(data.error || 'Failed to save lead');
                    }
                });
            });
        },

        fetchLeads: function() {
            var self = this;
            $('#crm-leads-list').html('<div class="crm-empty">Loading...</div>');
            self.apiCall('GET', '/admin/leads?limit=50', null, function(data) {
                if (data.success && data.leads && data.leads.length > 0) {
                    var html = '';
                    $.each(data.leads, function(i, lead) {
                        var statusClass = 'crm-status-' + lead.status;
                        html += '<div class="crm-list-item">' +
                            '<div style="flex:1;min-width:0;">' +
                                '<div style="font-weight:600;font-size:11px;">' + self.formatPhone(lead.phoneNumber) + '</div>' +
                                (lead.name ? '<div style="font-size:10px;color:#6b7280;">' + lead.name + '</div>' : '') +
                            '</div>' +
                            '<span class="crm-status-badge ' + statusClass + '">' + (self.STATUS_LABELS[lead.status] || lead.status) + '</span>' +
                        '</div>';
                    });
                    $('#crm-leads-list').html(html);
                } else {
                    $('#crm-leads-list').html('<div class="crm-empty">No leads yet. Click + Add to create one.</div>');
                }
            });
        },

        // ═══════════════════════════════════════════════════════
        // AI REPLIES
        // ═══════════════════════════════════════════════════════
        bindAIActions: function() {
            var self = this;
            $('#crm-ai-generate').on('click', function() {
                var mode = $('#crm-ai-mode').val();
                var input = $('#crm-ai-input').val().trim();
                var tone = $('#crm-ai-tone').val();

                if (!input) {
                    alert('Please enter a message');
                    return;
                }
                if (input.length > 2000) {
                    alert('Message too long (max 2000 characters)');
                    return;
                }

                var body = { mode: mode, tone: tone };
                if (mode === 'suggest') {
                    body.customerMessage = input;
                } else {
                    body.message = input;
                }

                $('#crm-ai-loading').show();
                $('#crm-ai-results').html('');
                $('#crm-ai-generate').prop('disabled', true);

                self.apiCall('POST', '/admin/ai-reply', body, function(data) {
                    $('#crm-ai-loading').hide();
                    $('#crm-ai-generate').prop('disabled', false);
                    if (data.success) {
                        var html = '';
                        if (mode === 'suggest' && data.suggestions) {
                            $.each(data.suggestions, function(i, suggestion) {
                                html += '<div class="crm-ai-result" data-text="' + self.escapeAttr(suggestion) + '">' +
                                    '<div class="crm-ai-copy" title="Copy">📋 Copy</div>' +
                                    '<div style="font-size:11px;">' + (i + 1) + '. ' + self.escapeHtml(suggestion) + '</div>' +
                                '</div>';
                            });
                        } else if (mode === 'rewrite' && data.rewritten) {
                            html += '<div class="crm-ai-result" data-text="' + self.escapeAttr(data.rewritten) + '">' +
                                '<div class="crm-ai-copy" title="Copy">📋 Copy</div>' +
                                '<div style="font-size:11px;">' + self.escapeHtml(data.rewritten) + '</div>' +
                            '</div>';
                        } else {
                            html = '<div class="crm-empty">No suggestions generated.</div>';
                        }
                        $('#crm-ai-results').html(html);
                    } else {
                        $('#crm-ai-results').html('<div class="crm-empty" style="color:#ef4444;">' + (data.error || 'Failed to generate reply') + '</div>');
                    }
                }, function() {
                    $('#crm-ai-loading').hide();
                    $('#crm-ai-generate').prop('disabled', false);
                    $('#crm-ai-results').html('<div class="crm-empty" style="color:#ef4444;">Network error. Please try again.</div>');
                });
            });

            // Copy on click
            $(document).on('click', '.crm-ai-copy', function(e) {
                e.stopPropagation();
                var text = $(this).parent().data('text');
                if (text) {
                    var $el = $(this);
                    if (navigator.clipboard) {
                        navigator.clipboard.writeText(text).then(function() {
                            $el.text('✅ Copied!');
                            setTimeout(function() { $el.text('📋 Copy'); }, 2000);
                        });
                    }
                }
            });
        },

        // ═══════════════════════════════════════════════════════
        // REMINDERS
        // ═══════════════════════════════════════════════════════
        bindReminderActions: function() {
            var self = this;
            $('#crm-add-reminder-btn').on('click', function() {
                $('#crm-add-reminder-form').slideToggle();
                // Set default date to tomorrow
                var tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                $('#crm-reminder-date').val(tomorrow.toISOString().split('T')[0]);
                $('#crm-reminder-time').val('10:00');
            });
            $('#crm-cancel-reminder').on('click', function() {
                $('#crm-add-reminder-form').slideUp();
            });
            $('#crm-save-reminder').on('click', function() {
                var phone = $('#crm-reminder-phone').val().trim().replace(/[^0-9]/g, '');
                var date = $('#crm-reminder-date').val();
                var time = $('#crm-reminder-time').val() || '10:00';
                if (!phone || !date) {
                    alert('Phone number and date are required');
                    return;
                }
                var reminderData = {
                    phoneNumber: phone,
                    userId: self.userNumber || 'manual',
                    reminderDate: date + 'T00:00:00.000Z',
                    reminderTime: time,
                    note: $('#crm-reminder-note').val().trim() || undefined
                };
                self.apiCall('POST', '/admin/reminders', reminderData, function(data) {
                    if (data.success) {
                        $('#crm-add-reminder-form').slideUp();
                        $('#crm-reminder-phone, #crm-reminder-note').val('');
                        self.fetchReminders();
                    } else {
                        alert(data.error || 'Failed to save reminder');
                    }
                });
            });
            // Complete reminder
            $(document).on('click', '.crm-complete-reminder', function() {
                var id = $(this).data('id');
                self.apiCall('PUT', '/admin/reminders', { id: id, status: 'completed' }, function(data) {
                    if (data.success) self.fetchReminders();
                });
            });
        },

        fetchReminders: function() {
            var self = this;
            $('#crm-reminders-list').html('<div class="crm-empty">Loading...</div>');
            self.apiCall('GET', '/admin/reminders?limit=50', null, function(data) {
                if (data.success && data.reminders && data.reminders.length > 0) {
                    var html = '';
                    $.each(data.reminders, function(i, rem) {
                        var statusClass = 'crm-status-' + rem.status;
                        var dateStr = rem.reminderDate ? new Date(rem.reminderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
                        var timeStr = rem.reminderTime || '';
                        html += '<div class="crm-list-item">' +
                            '<div style="flex:1;min-width:0;">' +
                                '<div style="font-weight:600;font-size:11px;">' + self.formatPhone(rem.phoneNumber) + '</div>' +
                                '<div style="font-size:10px;color:#6b7280;">' + dateStr + (timeStr ? ' ' + timeStr : '') + (rem.note ? ' - ' + rem.note.substring(0, 40) : '') + '</div>' +
                            '</div>' +
                            '<div style="display:flex;align-items:center;gap:4px;">' +
                                (rem.status === 'pending' ? '<button class="crm-btn crm-btn-sm crm-btn-primary crm-complete-reminder" data-id="' + rem.id + '">✓</button>' : '') +
                                '<span class="crm-status-badge ' + statusClass + '">' + (self.STATUS_LABELS[rem.status] || rem.status) + '</span>' +
                            '</div>' +
                        '</div>';
                    });
                    $('#crm-reminders-list').html(html);
                } else {
                    $('#crm-reminders-list').html('<div class="crm-empty">No reminders yet.</div>');
                }
            });
        },

        // ═══════════════════════════════════════════════════════
        // BLACKLIST
        // ═══════════════════════════════════════════════════════
        bindBlacklistActions: function() {
            var self = this;
            $('#crm-add-blacklist-btn').on('click', function() {
                $('#crm-add-blacklist-form').slideToggle();
            });
            $('#crm-cancel-blacklist').on('click', function() {
                $('#crm-add-blacklist-form').slideUp();
            });
            $('#crm-save-blacklist').on('click', function() {
                var phone = $('#crm-blacklist-phone').val().trim().replace(/[^0-9]/g, '');
                if (!phone || phone.length < 7) {
                    alert('Please enter a valid phone number');
                    return;
                }
                self.apiCall('POST', '/admin/blacklist', {
                    phoneNumber: phone,
                    reason: $('#crm-blacklist-reason').val(),
                    addedBy: self.userNumber || 'manual',
                    notes: $('#crm-blacklist-notes').val().trim() || undefined
                }, function(data) {
                    if (data.success) {
                        $('#crm-add-blacklist-form').slideUp();
                        $('#crm-blacklist-phone, #crm-blacklist-notes').val('');
                        self.fetchBlacklist();
                    } else {
                        alert(data.error || 'Failed to add to blacklist');
                    }
                });
            });
            // Remove from blacklist
            $(document).on('click', '.crm-remove-blacklist', function() {
                var id = $(this).data('id');
                if (confirm('Remove this number from blacklist?')) {
                    self.apiCall('DELETE', '/admin/blacklist', { id: id }, function(data) {
                        if (data.success) self.fetchBlacklist();
                    });
                }
            });
        },

        fetchBlacklist: function() {
            var self = this;
            $('#crm-blacklist-list').html('<div class="crm-empty">Loading...</div>');
            self.apiCall('GET', '/admin/blacklist?limit=50', null, function(data) {
                if (data.success && data.numbers && data.numbers.length > 0) {
                    var html = '';
                    $.each(data.numbers, function(i, num) {
                        html += '<div class="crm-list-item">' +
                            '<div style="flex:1;min-width:0;">' +
                                '<div style="font-weight:600;font-size:11px;">' + self.formatPhone(num.phoneNumber) + '</div>' +
                                '<div style="font-size:10px;color:#6b7280;">' + (self.REASON_LABELS[num.reason] || num.reason) + (num.notes ? ' - ' + num.notes.substring(0, 30) : '') + '</div>' +
                            '</div>' +
                            '<button class="crm-btn crm-btn-sm crm-btn-danger crm-remove-blacklist" data-id="' + num.id + '">✕</button>' +
                        '</div>';
                    });
                    $('#crm-blacklist-list').html(html);
                } else {
                    $('#crm-blacklist-list').html('<div class="crm-empty">No blacklisted numbers.</div>');
                }
            });
        },

        // ═══════════════════════════════════════════════════════
        // ANALYTICS
        // ═══════════════════════════════════════════════════════
        fetchAnalytics: function() {
            var self = this;
            $('#crm-analytics-loading').show();
            $('#crm-analytics-content').hide();
            self.apiCall('GET', '/admin/campaigns?analytics=true&limit=20', null, function(data) {
                $('#crm-analytics-loading').hide();
                $('#crm-analytics-content').show();
                if (data.success && data.analytics) {
                    var a = data.analytics;
                    var statsHtml = '' +
                        self.statCard('Total Campaigns', a.totalCampaigns || 0, '#269c47') +
                        self.statCard('Completed', a.completedCampaigns || 0, '#059669') +
                        self.statCard('Total Sent', a.totalSent || 0, '#2563eb') +
                        self.statCard('Total Failed', a.totalFailed || 0, '#dc2626') +
                        self.statCard('Delivery Rate', (a.avgDeliveryRate || 0) + '%', '#7c3aed') +
                        self.statCard('Blacklisted', a.totalBlacklisted || 0, '#ea580c');
                    $('#crm-stats-grid').html(statsHtml);

                    // Recent campaigns
                    if (data.campaigns && data.campaigns.length > 0) {
                        var listHtml = '';
                        $.each(data.campaigns, function(i, c) {
                            listHtml += '<div class="crm-list-item">' +
                                '<div style="flex:1;min-width:0;">' +
                                    '<div style="font-weight:600;font-size:11px;">' + (c.name || 'Unnamed') + '</div>' +
                                    '<div style="font-size:10px;color:#6b7280;">Sent: ' + (c.sentCount || 0) + ' | Failed: ' + (c.failedCount || 0) + ' | Blacklisted: ' + (c.blacklistedNumbers || 0) + '</div>' +
                                '</div>' +
                                '<span class="crm-status-badge crm-status-' + (c.status === 'completed' ? 'converted' : c.status === 'running' ? 'interested' : c.status === 'failed' ? 'not_interested' : 'pending') + '">' + c.status + '</span>' +
                            '</div>';
                        });
                        $('#crm-campaigns-list').html(listHtml);
                    } else {
                        $('#crm-campaigns-list').html('<div class="crm-empty">No campaigns yet.</div>');
                    }
                } else {
                    $('#crm-stats-grid').html(self.statCard('Total Campaigns', 0, '#269c47') + self.statCard('Total Sent', 0, '#2563eb'));
                    $('#crm-campaigns-list').html('<div class="crm-empty">No campaign data available.</div>');
                }
            });
        },

        statCard: function(label, value, color) {
            return '<div class="crm-stat-card">' +
                '<div class="crm-stat-value" style="color:' + color + ';">' + value + '</div>' +
                '<div class="crm-stat-label">' + label + '</div>' +
            '</div>';
        },

        // ═══════════════════════════════════════════════════════
        // UTILITIES
        // ═══════════════════════════════════════════════════════
        apiCall: function(method, path, data, successCb, errorCb) {
            var opts = {
                url: this.API_BASE + path,
                method: method,
                dataType: 'json',
                success: function(resp) { if (successCb) successCb(resp); },
                error: function() { if (errorCb) errorCb(); else if (successCb) successCb({ success: false, error: 'Network error' }); }
            };
            if (data && method !== 'GET') {
                opts.data = JSON.stringify(data);
                opts.contentType = 'application/json';
            }
            $.ajax(opts);
        },

        formatPhone: function(num) {
            if (!num) return '—';
            if (num.startsWith('+')) return num;
            if (num.length >= 10) return '+' + num;
            return num;
        },

        escapeHtml: function(str) {
            return $('<span>').text(str).html();
        },

        escapeAttr: function(str) {
            return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }
    };

    // Initialize when DOM is ready
    $(document).ready(function() {
        CRM.init();
    });

    window.WhatFlowCRM = window.WhatFlowCRM || {};
    window.WhatFlowCRM.CRM = CRM;

})(jQuery);
