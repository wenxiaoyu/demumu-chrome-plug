import fs from 'fs';

// 读取中文翻译文件作为模板
const zhData = JSON.parse(fs.readFileSync('src/_locales/zh_CN/messages.json', 'utf8'));

// 英文翻译映射
const translations = {
  // Extension info
  "extensionName": "Demumu",
  "extensionDescription": "Stay active by knocking wooden fish, accumulate merit",
  
  // Common
  "common_ok": "OK",
  "common_cancel": "Cancel",
  "common_save": "Save",
  "common_delete": "Delete",
  "common_edit": "Edit",
  "common_add": "Add",
  "common_loading": "Loading...",
  "common_saving": "Saving...",
  "common_error": "Error",
  "common_success": "Success",
  
  // Basic
  "loading": "Loading...",
  "today": "Today",
  "merit": "Merit",
  "total": "Total",
  "appName": "Are You Still Alive",
  "settings": "Settings",
  "woodenFish": "Wooden Fish",
  "tabStats": "Statistics",
  "tabContacts": "Emergency Contacts",
  "tabAccount": "Account",
  "tabSettings": "Settings",
  "tabHelp": "Help",
  
  "help": "Help",
  "help_title": "How to Play",
  "help_intro": "Welcome to 'Are You Still Alive'! Stay active by knocking the wooden fish daily, accumulate merit, and maintain your HP.",
  "help_knock_title": "How to Play",
  "help_knock_desc": "Click the wooden fish icon in the popup to knock. Each knock increases your merit. The first knock of each day earns bonus rewards.",
  "help_merit_title": "Merit System",
  "help_merit_desc": "Merit represents your cultivation progress, accumulated by knocking the wooden fish:",
  "help_merit_base": "Base Merit: +1 per knock",
  "help_merit_first": "First Knock Bonus: +5 for the first knock each day",
  "help_merit_combo": "Combo Bonus: Consecutive knocks earn extra merit",
  "help_merit_milestone": "Milestone Bonus: Reach specific counts for large merit rewards",
  "help_hp_title": "HP System",
  "help_hp_desc": "HP represents your activity status and must be maintained daily:",
  "help_hp_initial": "Initial HP: 100",
  "help_hp_reward": "Daily Reward: +10 HP for the first knock each day",
  "help_hp_penalty": "Inactivity Penalty: -10 HP for each day without knocking",
  "help_hp_death": "HP Depleted: Triggers death detection",
  "help_streak_title": "Consecutive Days",
  "help_streak_desc": "Knocking the wooden fish for consecutive days builds your streak. Longer streaks earn more rewards. Streaks reset if interrupted.",
  "help_tips_title": "Tips",
  "help_tip1": "Knock the wooden fish at least once daily to keep your HP from depleting",
  "help_tip2": "Maintain your streak for more rewards - try not to break it",
  "help_tip3": "Sign in to sync your data to the cloud and across multiple devices",
  
  // Death Detection Settings
  "deathDetectionSettings": "Death Detection Settings",
  "deathDetectionDescription": "Configure death detection rules. The server will automatically check your activity status based on your settings and notify your emergency contacts when conditions are met.",
  "enableDeathDetection": "Enable Death Detection",
  "enableDeathDetectionDesc": "The server will periodically check your activity status when enabled",
  "inactivityThreshold": "Inactivity Threshold",
  "inactivityThresholdDesc": "Trigger death detection after this many days without knocking",
  "hpThreshold": "HP Threshold",
  "hpThresholdDesc": "Trigger death detection when HP falls below this value",
  "checkInterval": "Check Interval",
  "checkIntervalDesc": "How often to check status",
  "currentStatus": "Current Status",
  "statusNormal": "Status Normal",
  "deathDetected": "Death Detected",
  "reason": "Reason",
  "inactiveDays": "Inactive Days",
  "lastActive": "Last Active",
  "detectionTime": "Detection Time",
  "notificationStatus": "Notification Status",
  "sent": "Sent",
  "pending": "Pending",
  "noDetectionRecord": "No detection record",
  "checkNow": "Check Now",
  "checking": "Checking...",
  "instructions": "Instructions",
  "instruction1": "Death detection judges status based on your activity and HP",
  "instruction2": "Your emergency contacts will be notified when death detection is triggered",
  "instruction3": "You can manage your contact list in the Emergency Contacts tab",
  "instruction4": "Set reasonable thresholds to avoid false alarms",
  
  // Intervals
  "interval30min": "30 minutes",
  "interval1hour": "1 hour",
  "interval2hours": "2 hours",
  "interval6hours": "6 hours",
  "interval12hours": "12 hours",
  "interval24hours": "24 hours",
  
  // Emergency Contacts
  "emergencyContacts": "Emergency Contacts",
  "contactsDescription": "These contacts will be notified when you've been inactive for an extended period",
  "addContact": "Add Contact",
  "noContactsYet": "No emergency contacts added yet",
  "addFirstContact": "Click the button above to add your first contact",
  "editContact": "Edit Contact",
  "name": "Name",
  "namePlaceholder": "Enter name",
  "email": "Email",
  "emailPlaceholder": "example@email.com",
  "relationship": "Relationship",
  "relationshipPlaceholder": "e.g., Father, Friend, Colleague",
  "relationshipHint": "Contacts will be grouped by relationship",
  "relationshipOther": "Other",
  "priority": "Priority",
  "priorityHighest": "Highest",
  "priorityMedium": "Medium",
  "priorityLowest": "Lowest",
  "nameRequired": "Please enter a name",
  "emailRequired": "Please enter an email",
  "emailInvalid": "Invalid email format",
  "relationshipRequired": "Please enter or select a relationship",
  "operationFailed": "Operation failed",
  "confirmDelete": "Confirm Delete",
  "cancel": "Cancel",
  "delete": "Delete",
  "edit": "Edit",
  "add": "Add",
  "save": "Save",
  "saving": "Saving...",
  
  // Email Preview
  "emailPreview": "Email Preview",
  "htmlView": "HTML View",
  "textView": "Text View",
  "sendTestEmail": "Send Test Email",
  "subject": "Subject",
  "previewNote": "💡 This is an email preview. Actual data will be used when sending.",
  "noContactsWarning": "⚠️ No emergency contacts added yet. Please add contacts in the Emergency Contacts tab before sending emails.",
  "addContactsFirst": "Please add emergency contacts first",
  "testEmailSuccess": "✅ Test email prepared\\n\\nPlease confirm sending in your email client.\\n\\n💡 Tip: If the email client didn't open, check if your browser blocked pop-ups.",
  "noContactsError": "❌ Send failed: No emergency contacts added\\n\\nPlease add at least one contact in the Emergency Contacts tab.",
  "unknownError": "Unknown error",
  "user": "User",
  
  // Notifications
  "notificationDeathWarningTitle": "⚠️ HP Depleted",
  "notificationHpWarningTitle": "⚠️ HP Warning",
  "notificationFirstKnockTitle": "Merit +1",
  
  // Options
  "options_stats": "Stats",
  "options_contacts": "Emergency Contacts",
  "options_settings": "Settings",
  
  // Stats
  "stats_calendar": "Activity Calendar",
  "stats_legend": "Legend",
  "stats_noActivity": "No Activity",
  "stats_lowActivity": "Low",
  "stats_mediumActivity": "Medium",
  "stats_highActivity": "High",
  "stats_knocks": "knocks",
  
  // Contacts
  "contacts_title": "Emergency Contacts",
  "contacts_description": "Add emergency contacts who will be notified when you're inactive for too long",
  "contacts_add": "Add Contact",
  "contacts_name": "Name",
  "contacts_email": "Email",
  "contacts_relationship": "Relationship",
  "contacts_priority": "Priority",
  "contacts_emptyState": "No emergency contacts yet",
  "contacts_emptyHint": "Click the button above to add your first contact",
  "contacts_deleteConfirm": "Are you sure you want to delete this contact?",
  "contacts_relationshipPlaceholder": "Contacts will be grouped by relationship",
  "contacts_relationshipFamily": "Family",
  "contacts_relationshipFriend": "Friend",
  "contacts_relationshipColleague": "Colleague",
  "contacts_relationshipOther": "Other",
  "contacts_errorNameRequired": "Please enter a name",
  "contacts_errorEmailRequired": "Please enter an email",
  "contacts_errorEmailInvalid": "Invalid email format",
  "contacts_errorRelationshipRequired": "Please enter or select a relationship",
  
  // Settings
  "settings_title": "Death Detection Settings",
  "settings_description": "Configure death detection rules. Your emergency contacts will be notified when conditions are met",
  "settings_enableDetection": "Enable Death Detection",
  "settings_enableDescription": "Periodically check your activity status when enabled",
  "settings_inactivityThreshold": "Inactivity Threshold",
  "settings_inactivityDescription": "Trigger detection after this many days without knocking",
  "settings_hpThreshold": "HP Threshold",
  "settings_hpDescription": "Trigger detection when HP falls below this value",
  "settings_checkInterval": "Check Interval",
  "settings_checkIntervalDescription": "How often to check status",
  "settings_currentStatus": "Current Status",
  "settings_statusNormal": "Status Normal",
  "settings_statusDead": "Death Detection Triggered",
  "settings_statusUnknown": "No detection records yet",
  "settings_reason": "Reason",
  "settings_inactiveDays": "Inactive Days",
  "settings_lastActive": "Last Active",
  "settings_detectedAt": "Detected At",
  "settings_notificationStatus": "Notification Status",
  "settings_notificationSent": "Sent",
  "settings_notificationPending": "Pending",
  "settings_checkNow": "Check Now",
  "settings_checking": "Checking...",
  "settings_info": "Information",
  "settings_info1": "Death detection is based on your activity and HP level",
  "settings_info2": "Your emergency contacts will be notified when detection is triggered",
  "settings_info3": "You can manage your contact list in the Emergency Contacts tab",
  "settings_info4": "Set reasonable thresholds to avoid false alarms",
  "settings_days": "days",
  "settings_interval30min": "30 minutes",
  "settings_interval1hour": "1 hour",
  "settings_interval2hours": "2 hours",
  "settings_interval6hours": "6 hours",
  "settings_interval12hours": "12 hours",
  "settings_interval24hours": "24 hours",
  
  // Email
  "email_previewTitle": "Email Preview",
  "email_viewHtml": "HTML View",
  "email_viewText": "Text View",
  "email_sendTest": "Send Test Email",
  "email_subject": "Subject",
  "email_previewNote": "This is a preview. Actual emails will use current real data",
  "email_noContacts": "No emergency contacts yet. Please add contacts in the Emergency Contacts tab before sending emails.",
  "email_sendSuccess": "Test email prepared\\n\\nPlease confirm sending in your email client.\\n\\nTip: If the email client didn't open, check if your browser blocked popups.",
  "email_sendFailedNoContacts": "Send failed: No emergency contacts\\n\\nPlease add at least one contact in the Emergency Contacts tab.",
  
  // Notification messages
  "notification_deathWarning": "You Have Passed Away",
  "notification_hpWarning": "HP Critical",
  "notification_firstKnock": "Merit +1",
  "notification_deathDetected": "Death Detection Triggered",
  
  // Popup
  "popup_knock": "Knock",
  "popup_today": "Today",
  "popup_merit": "Merit",
  "popup_total": "Total",
  "popup_appName": "Are You Still Alive",
  "popup_settings": "Settings",
  "popup_woodenFish": "Wooden Fish",
  "popup_dataLoadError": "Failed to load data",
  "popup_consecutiveDays": "Streak",
  "popup_status": "Status",
  "popup_alive": "Alive",
  "popup_dead": "Passed Away",
  
  "options_title": "Are You Alive",
  
  // Relationships
  "relationship_family": "Family",
  "relationship_friend": "Friend",
  "relationship_colleague": "Colleague",
  "relationship_other": "Other",
  
  // Stats detailed
  "stats_totalMerit": "Total Merit",
  "stats_consecutiveDays": "Streak",
  "stats_aliveDays": "Days Alive",
  "stats_totalKnocks": "Total Knocks",
  "stats_avgPerDay": "Avg/Day",
  "stats_maxStreak": "Max Streak",
  "stats_dataOverview": "Data Overview",
  "stats_knockCount": "Knocks",
  "stats_noKnocks": "No knocks",
  "stats_year": "Year",
  "stats_month": "Month",
  "stats_prevMonth": "Previous month",
  "stats_nextMonth": "Next month",
  "stats_sunday": "Sun",
  "stats_monday": "Mon",
  "stats_tuesday": "Tue",
  "stats_wednesday": "Wed",
  "stats_thursday": "Thu",
  "stats_friday": "Fri",
  "stats_saturday": "Sat",
  
  // HP
  "hp_alive": "Alive",
  "hp_dead": "Deceased",
  "hp_label": "HP",
  
  // Errors
  "dataLoadError": "Failed to load data",
  "loadFailed": "Load failed",
  
  // Language
  "language": "Language",
  "language_en": "English",
  "language_zh_CN": "简体中文",
  
  // Additional translations with placeholders
  "daysCount": "$COUNT$ days",
  "confirmDeleteContact": "Are you sure you want to delete contact $NAME$?",
  "contactsInfo": "✅ $COUNT$ emergency contact(s) added. Emails will be sent to highest priority contacts.",
  "sendFailedError": "❌ Send failed: $ERROR$",
  "emailSubject": "⚠️ Important Notice: Activity Status of $USER$",
  "deathWarning1Day": "You haven't knocked the wooden fish for 1 day, HP depleted",
  "deathWarningDays": "You haven't knocked the wooden fish for $DAYS$ days, HP depleted",
  "hpWarningCritical": "HP is only $HP$ remaining, knock the wooden fish soon!",
  "hpWarningLow": "HP dropped to $HP$, remember to knock the wooden fish daily",
  "hpIncreased": "HP +10, Current HP: $HP$",
  "consecutiveDays": "$DAYS$ day streak!",
  
  // Contact form
  "contacts_addButton": "Add Contact",
  "contacts_empty": "No emergency contacts added yet",
  "contactForm_title": "Add Contact",
  "contactForm_titleEdit": "Edit Contact",
  "contactForm_name": "Name",
  "contactForm_namePlaceholder": "Enter name",
  "contactForm_email": "Email",
  "contactForm_relationship": "Relationship",
  "contactForm_relationshipPlaceholder": "e.g., Father, Friend, Colleague",
  "contactForm_relationshipHint": "Contacts will be grouped by relationship",
  "contactForm_priority": "Priority",
  "contactForm_priorityHighest": "Highest",
  "contactForm_priorityMedium": "Medium",
  "contactForm_priorityLowest": "Lowest",
  "contactForm_nameRequired": "Please enter a name",
  "contactForm_emailRequired": "Please enter an email",
  "contactForm_emailInvalid": "Invalid email format",
  "contactForm_relationshipRequired": "Please enter or select a relationship",
  "contactForm_operationFailed": "Operation failed",
  
  // Contact card
  "contactCard_confirmDelete": "Confirm Delete",
  "contactCard_confirmDeleteMessage": "Are you sure you want to delete contact $NAME$?",
  
  // Settings detailed
  "settings_enable": "Enable Death Detection",
  "settings_enableDesc": "Periodically check your activity status when enabled",
  "settings_inactivityThresholdDesc": "Trigger death detection after this many days without knocking",
  "settings_hpThresholdDesc": "Trigger death detection when HP falls below this value",
  "settings_checkIntervalDesc": "How often to check status",
  "settings_detectionTime": "Detection Time",
  "settings_sent": "Sent",
  "settings_pending": "Pending",
  "settings_noRecord": "No detection record",
  "settings_instructions": "Instructions",
  "settings_instruction1": "Death detection judges status based on your activity and HP",
  "settings_instruction2": "Your emergency contacts will be notified when death detection is triggered",
  "settings_instruction3": "You can manage your contact list in the Emergency Contacts tab",
  "settings_instruction4": "Set reasonable thresholds to avoid false alarms",
  "settings_daysCount": "$COUNT$ days",
  
  // Email detailed
  "email_preview": "Email Preview",
  "email_htmlView": "HTML View",
  "email_textView": "Text View",
  "email_subject_label": "Subject",
  "email_noContactsWarning": "⚠️ No emergency contacts added yet. Please add contacts in the Emergency Contacts tab before sending emails.",
  "email_contactsInfo": "✅ $COUNT$ emergency contact(s) added. Emails will be sent to highest priority contacts.",
  "email_addContactsFirst": "Please add emergency contacts first",
  "email_testSuccess": "✅ Test email prepared\\n\\nPlease confirm sending in your email client.\\n\\n💡 Tip: If the email client didn't open, check if your browser blocked pop-ups.",
  "email_sendFailed": "❌ Send failed: $ERROR$",
  "email_noContactsError": "❌ Send failed: No emergency contacts\\n\\nPlease add at least one contact in the Emergency Contacts tab.",
  "email_unknownError": "Unknown error",
  
  // Notification detailed
  "notification_deathWarningTitle": "⚠️ HP Depleted",
  "notification_deathWarning1Day": "You haven't knocked the wooden fish for 1 day, HP depleted",
  "notification_deathWarningDays": "You haven't knocked the wooden fish for $DAYS$ days, HP depleted",
  "notification_hpWarningTitle": "⚠️ HP Warning",
  "notification_hpCritical": "HP is only $HP$ remaining, knock the wooden fish soon!",
  "notification_hpLow": "HP dropped to $HP$, remember to knock the wooden fish daily",
  "notification_firstKnockTitle": "Merit +1",
  "notification_hpIncreased": "HP +10, Current HP: $HP$",
  "notification_consecutiveDays": "$DAYS$ day streak!",
  
  // Stats with placeholders
  "stats_days": "$COUNT$ days",
  "stats_times": "$COUNT$ times",
  
  // HP with placeholders
  "hp_streak": "$DAYS$ days",
  
  // Death detection reasons
  "reason_detectionDisabled": "Detection disabled",
  "reason_hpBelowThreshold": "HP dropped to $HP$, below threshold $THRESHOLD$",
  "reason_inactivityExceeded": "Inactive for $DAYS$ days, exceeding threshold of $THRESHOLD$ days",
  
  // Auth
  "loginWithGoogle": "Sign in with Google",
  "loggingIn": "Signing in...",
  "loginFailed": "Sign in failed",
  "signOut": "Sign out",
  "confirmSignOut": "Are you sure you want to sign out?",
  "accountSettings": "Account Settings",
  "menu": "Menu",
  "notSynced": "Not synced",
  
  // Sync
  "sync_title": "Data Sync",
  "sync_status": "Status",
  "sync_lastSync": "Last Sync",
  "sync_syncNow": "Sync Now",
  "sync_syncing": "Syncing...",
  "sync_idle": "Idle",
  "sync_success": "Sync Successful",
  "sync_error": "Sync Failed",
  "sync_offline": "Offline",
  "sync_never": "Never synced",
  "sync_justNow": "Just now",
  "sync_minutesAgo": "$COUNT$ minutes ago",
  "sync_hoursAgo": "$COUNT$ hours ago",
  "sync_daysAgo": "$COUNT$ days ago",
  "sync_loginRequired": "Please sign in to enable data sync",
  "sync_info1": "💡 Data syncs automatically every 30 minutes",
  "sync_info2": "💡 Data syncs automatically after knocking and updating contacts",
  "sync_info3": "💡 Data syncs automatically when network is restored",
  
  // Account Settings
  "account_userInfo": "User Information",
  "account_displayName": "Display Name",
  "account_email": "Email",
  "account_userId": "User ID",
  "account_notSet": "Not set",
  "account_editName": "Edit name",
  "account_enterName": "Enter display name",
  "account_nameUpdated": "Display name updated",
  "account_nameUpdateFailed": "Failed to update display name",
  "save": "Save",
  "saving": "Saving...",
  "cancel": "Cancel",
  "account_dataSync": "Data Sync",
  "account_actions": "Account Actions",
  "account_deleteAccount": "Delete Account",
  "account_deleteWarning": "⚠️ Deleting your account will permanently delete all your data. This action cannot be undone",
  "account_confirmDelete": "Are you sure you want to delete your account?",
  "account_confirmDeleteWarning": "⚠️ Final confirmation: All your data will be permanently deleted and cannot be recovered. Continue?",
  "account_deleteNotImplemented": "Account deletion is not yet implemented. Please contact support to delete your account.",
  "account_syncSuccess": "✅ Sync successful!",
  "account_syncFailed": "❌ Sync failed: $ERROR$",
  "account_signOutFailed": "Sign out failed",
  "account_notSignedIn": "You are not signed in",
  "account_signInHint": "Sign in to backup your data to the cloud and sync across devices",
  
  // Login Prompt
  "loginPrompt_title": "Sign in required to send email notifications",
  "loginPrompt_message": "After adding emergency contacts, the system will notify them via email when you've been inactive for an extended period.",
  "loginPrompt_benefit1": "Send death notification emails to emergency contacts",
  "loginPrompt_benefit2": "Automatically backup data to the cloud",
  "loginPrompt_benefit3": "Sync data across multiple devices",
  "loginPrompt_skip": "Skip for now",
  "loginPrompt_note": "Click 'Skip for now' to continue adding contacts, but email notifications will not be available",
  
  // Gameplay Guide
  "gameplay_title": "How to Play",
  "gameplay_intro": "Welcome to 'Are You Still Alive'! Stay active by knocking the wooden fish daily, accumulate merit, and maintain your HP.",
  "gameplay_knock_title": "How to Play",
  "gameplay_knock_desc": "Click the wooden fish icon in the popup to knock. Each knock increases your merit. The first knock of each day earns bonus rewards.",
  "gameplay_merit_title": "Merit System",
  "gameplay_merit_desc": "Merit represents your cultivation progress, accumulated by knocking the wooden fish:",
  "gameplay_merit_base": "Base Merit: +1 per knock",
  "gameplay_merit_first": "First Knock Bonus: +5 for the first knock each day",
  "gameplay_merit_combo": "Combo Bonus: Consecutive knocks earn extra merit",
  "gameplay_merit_milestone": "Milestone Bonus: Reach specific counts for large merit rewards",
  "gameplay_hp_title": "HP System",
  "gameplay_hp_desc": "HP represents your activity status and must be maintained daily:",
  "gameplay_hp_initial": "Initial HP: 100",
  "gameplay_hp_reward": "Daily Reward: +10 HP for the first knock each day",
  "gameplay_hp_penalty": "Inactivity Penalty: -10 HP for each day without knocking",
  "gameplay_hp_death": "HP Depleted: Triggers death detection",
  "gameplay_streak_title": "Consecutive Days",
  "gameplay_streak_desc": "Knocking the wooden fish for consecutive days builds your streak. Longer streaks earn more rewards. Streaks reset if interrupted.",
  "gameplay_tips_title": "💡 Tips",
  "gameplay_tip1": "Knock the wooden fish at least once daily to keep your HP from depleting",
  "gameplay_tip2": "Maintain your streak for more rewards - try not to break it",
  "gameplay_tip3": "Sign in to sync your data to the cloud and across multiple devices",
};

// 创建英文翻译对象
const enData = {};

for (const key in zhData) {
  const zhEntry = zhData[key];
  enData[key] = {
    message: translations[key] || zhEntry.message, // 如果没有翻译，保留中文
    description: zhEntry.description
  };
  
  // 保留 placeholders
  if (zhEntry.placeholders) {
    enData[key].placeholders = zhEntry.placeholders;
  }
}

// 写入文件
fs.writeFileSync(
  'src/_locales/en/messages.json',
  JSON.stringify(enData, null, 2),
  'utf8'
);

console.log('✅ English translation file generated successfully!');
console.log('Total keys:', Object.keys(enData).length);
