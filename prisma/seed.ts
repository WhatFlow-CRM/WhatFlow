import { db } from '../src/lib/db';

const DEFAULT_PLANS = [
  { planType: 'Basic', displayName: 'Basic', monthlyPrice: 500, annualPrice: 5000, dailyMessageLimit: 2000, isActive: true },
  { planType: 'Advance', displayName: 'Advance', monthlyPrice: 1000, annualPrice: 10000, dailyMessageLimit: 5000, isActive: true },
];

const DEFAULT_FEATURES = [
  { featureKey: 'broadcasting', displayName: 'Broadcasting', description: 'Send messages to multiple contacts at once' },
  { featureKey: 'attachments', displayName: 'File Attachments', description: 'Attach and send images, documents, videos' },
  { featureKey: 'customization', displayName: 'Message Customization', description: 'Customize messages with customer name, email, etc.' },
  { featureKey: 'quickReplies', displayName: 'Quick Replies', description: 'Pre-saved responses for quick replies' },
  { featureKey: 'translation', displayName: 'Translate Conversation', description: 'Translate messages to any language' },
  { featureKey: 'timeGapControl', displayName: 'Time Gap Control', description: 'Customize time gap between messages' },
  { featureKey: 'randomGap', displayName: 'Random Time Gap', description: 'Randomize time gap between messages' },
  { featureKey: 'batching', displayName: 'Batching', description: 'Send messages in batches with intervals' },
  { featureKey: 'caption', displayName: 'Add Caption', description: 'Add captions to attachments' },
  { featureKey: 'templates', displayName: 'Save Templates', description: 'Save and reuse message templates' },
  { featureKey: 'deliveryReport', displayName: 'Delivery Report', description: 'Get detailed campaign delivery reports' },
  { featureKey: 'blur', displayName: 'Blur Conversations', description: 'Blur conversations for privacy' },
  { featureKey: 'schedule', displayName: 'Schedule Messages', description: 'Schedule messages for automatic sending' },
  { featureKey: 'businessChatLink', displayName: 'Business Chat Link', description: 'Generate chat link for customers' },
  { featureKey: 'exportContacts', displayName: 'Export Contacts', description: 'Download unsaved contacts from groups' },
  { featureKey: 'multipleAttachments', displayName: 'Multiple Attachments', description: 'Send multiple files at once' },
  { featureKey: 'stopCampaign', displayName: 'Stop Campaign', description: 'Stop messaging mid-campaign' },
  { featureKey: 'groupExport', displayName: 'Group Export', description: 'Export group members contacts' },
  { featureKey: 'prioritySupport', displayName: 'Priority Support', description: 'Priority customer support access' },
  { featureKey: 'verifyNumbers', displayName: 'Verify Numbers', description: 'Verify WhatsApp numbers before sending' },
  { featureKey: 'chatSupport', displayName: 'Chat Support', description: 'Direct chat support from extension' },
];

// Basic plan gets first 12 features, Advance gets all
const BASIC_FEATURES = [
  'broadcasting', 'attachments', 'customization', 'quickReplies', 'translation',
  'timeGapControl', 'randomGap', 'batching', 'caption', 'templates',
  'deliveryReport', 'blur'
];

const ADVANCE_FEATURES = [
  ...BASIC_FEATURES,
  'schedule', 'businessChatLink', 'exportContacts', 'multipleAttachments',
  'stopCampaign', 'groupExport', 'prioritySupport', 'verifyNumbers', 'chatSupport'
];

async function seed() {
  console.log('Seeding database...');

  // Create plans
  for (const plan of DEFAULT_PLANS) {
    await db.plan.upsert({
      where: { planType: plan.planType },
      update: { ...plan },
      create: { ...plan },
    });
    console.log(`  Plan: ${plan.planType}`);
  }

  // Create features
  for (const feature of DEFAULT_FEATURES) {
    await db.feature.upsert({
      where: { featureKey: feature.featureKey },
      update: { ...feature },
      create: { ...feature },
    });
    console.log(`  Feature: ${feature.featureKey}`);
  }

  // Create plan-feature access
  for (const fk of BASIC_FEATURES) {
    await db.planFeatureAccess.upsert({
      where: { planType_featureKey: { planType: 'Basic', featureKey: fk } },
      update: { isEnabled: true },
      create: { planType: 'Basic', featureKey: fk, isEnabled: true },
    });
  }

  for (const fk of ADVANCE_FEATURES) {
    await db.planFeatureAccess.upsert({
      where: { planType_featureKey: { planType: 'Advance', featureKey: fk } },
      update: { isEnabled: true },
      create: { planType: 'Advance', featureKey: fk, isEnabled: true },
    });
  }

  // Create sample activation keys
  const sampleKeys = [
    { key: 'WF-TEST-BASIC-0001', planType: 'Basic', durationDays: 30, status: 'unused', createdBy: 'system' },
    { key: 'WF-TEST-BASIC-0002', planType: 'Basic', durationDays: 30, status: 'unused', createdBy: 'system' },
    { key: 'WF-TEST-ADVAN-0001', planType: 'Advance', durationDays: 30, status: 'unused', createdBy: 'system' },
    { key: 'WF-TEST-ADVAN-0002', planType: 'Advance', durationDays: 30, status: 'unused', createdBy: 'system' },
    { key: 'WF-DEMO-KEY4-YOU1', planType: 'Advance', durationDays: 90, status: 'unused', createdBy: 'system' },
  ];

  for (const ak of sampleKeys) {
    const exists = await db.activationKey.findUnique({ where: { key: ak.key } });
    if (!exists) {
      await db.activationKey.create({ data: ak });
      console.log(`  ActivationKey: ${ak.key} (${ak.planType}, ${ak.durationDays} days)`);
    }
  }

  // System config
  const configs = [
    { key: 'payment_account_number', value: '03269580417' },
    { key: 'payment_account_title', value: 'Irfan Ilahee Munir' },
    { key: 'support_phone', value: '923269580417' },
    { key: 'support_whatsapp_link', value: 'https://wa.me/923269580417' },
  ];

  for (const config of configs) {
    await db.systemConfig.upsert({
      where: { key: config.key },
      update: { value: config.value },
      create: { key: config.key, value: config.value },
    });
  }

  console.log('Seed complete!');
}

seed().catch(console.error);
