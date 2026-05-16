'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  KeyRound,
  Users,
  CreditCard,
  Settings2,
  Activity,
  Search,
  Copy,
  Check,
  RefreshCw,
  Eye,
  Ban,
  Plus,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  Shield,
  MessageSquare,
  Sparkles,
  Phone,
  TrendingUp,
  UserCheck,
  DollarSign,
  Zap,
  Clock,
  MoreHorizontal,
  X,
  Globe,
  Contact,
  Bell,
  BarChart3,
  Bot,
  Trash2,
  Calendar,
  Send,
  Lock,
  FileText,
  AlertTriangle,
  ShieldCheck,
  ChevronDown,
  Pencil,
  Info,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Stats {
  totalUsers: number;
  activeUsers: number;
  totalKeys: number;
  activeKeys: number;
  unusedKeys: number;
  pendingPayments: number;
  revenue: number;
  newUsersThisMonth: number;
  keysActivatedThisMonth: number;
}

interface ActivationKey {
  id: string;
  key: string;
  planType: string;
  durationDays: number;
  status: string;
  linkedNumber: string | null;
  activatedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

interface User {
  id: string;
  whatsappNumber: string;
  name: string | null;
  email: string | null;
  planType: string;
  isActive: boolean;
  currentKeyId: string | null;
  activatedAt: string | null;
  expiresAt: string | null;
  lastPlanType: string | null;
  createdAt: string;
}

interface Plan {
  id: string;
  planType: string;
  displayName: string;
  monthlyPrice: number;
  annualPrice: number;
  dailyMessageLimit: number;
  isActive: boolean;
  features?: { featureKey: string; featureName: string; isEnabled: boolean }[];
  _count?: { users: number };
}

interface Feature {
  id: string;
  featureKey: string;
  displayName: string;
  description: string | null;
  isActive: boolean;
  plans: Record<string, boolean>;
}

interface ActivityLog {
  id: string;
  userId: string | null;
  action: string;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
}

interface Lead {
  id: string;
  phoneNumber: string;
  name: string | null;
  email: string | null;
  status: string;
  statusDisplayName?: string;
  assignedUserId: string | null;
  assignedUserName?: string;
  lastMessageAt: string | null;
  source: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Reminder {
  id: string;
  userId: string | null;
  phoneNumber: string;
  leadId: string | null;
  leadName?: string;
  reminderDate: string;
  reminderTime: string;
  note: string | null;
  status: string;
  completedAt: string | null;
  createdAt: string;
}

interface BlacklistedNumber {
  id: string;
  phoneNumber: string;
  reason: string;
  reasonDisplayName?: string;
  addedBy: string | null;
  notes: string | null;
  createdAt: string;
}

interface Campaign {
  id: string;
  name: string;
  userId: string;
  userPhone?: string;
  status: string;
  totalNumbers: number;
  validNumbers: number;
  invalidNumbers: number;
  duplicateNumbers: number;
  blacklistedNumbers: number;
  sentCount: number;
  failedCount: number;
  pendingCount: number;
  responseRate: number | null;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
}

interface CampaignMessage {
  id: string;
  phoneNumber: string;
  messageStatus: string;
  sentAt: string | null;
  failedReason: string | null;
  responseReceived: boolean;
  createdAt: string;
}

interface CampaignAnalytics {
  totalCampaigns: number;
  completedCampaigns: number;
  pausedCampaigns: number;
  runningCampaigns: number;
  totalSent: number;
  totalFailed: number;
  avgDeliveryRate: number;
  avgResponseRate: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const DURATION_OPTIONS = [
  { label: '1 Month', days: 30 },
  { label: '3 Months', days: 90 },
  { label: '6 Months', days: 180 },
  { label: '1 Year', days: 365 },
];

const PLAN_OPTIONS = ['Basic', 'Advance'];

const FEATURE_LIST = [
  'broadcasting',
  'attachments',
  'customization',
  'quickReplies',
  'translation',
  'timeGapControl',
  'randomGap',
  'batching',
  'caption',
  'templates',
  'deliveryReport',
  'blur',
  'schedule',
  'businessChatLink',
  'exportContacts',
  'multipleAttachments',
  'stopCampaign',
  'groupExport',
  'prioritySupport',
  'verifyNumbers',
  'chatSupport',
];

const FEATURE_DISPLAY_NAMES: Record<string, string> = {
  broadcasting: 'Broadcasting',
  attachments: 'Attachments',
  customization: 'Customization',
  quickReplies: 'Quick Replies',
  translation: 'Translation',
  timeGapControl: 'Time Gap Control',
  randomGap: 'Random Gap',
  batching: 'Batching',
  caption: 'Caption',
  templates: 'Templates',
  deliveryReport: 'Delivery Report',
  blur: 'Blur',
  schedule: 'Schedule',
  businessChatLink: 'Business Chat Link',
  exportContacts: 'Export Contacts',
  multipleAttachments: 'Multiple Attachments',
  stopCampaign: 'Stop Campaign',
  groupExport: 'Group Export',
  prioritySupport: 'Priority Support',
  verifyNumbers: 'Verify Numbers',
  chatSupport: 'Chat Support',
};

const LEAD_STATUS_OPTIONS = [
  { value: 'new', label: 'New Lead', color: 'bg-zinc-100 text-zinc-700 border-zinc-300' },
  { value: 'interested', label: 'Interested', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { value: 'followup', label: 'Follow-up Required', color: 'bg-amber-100 text-amber-700 border-amber-300' },
  { value: 'converted', label: 'Converted', color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  { value: 'not_interested', label: 'Not Interested', color: 'bg-red-100 text-red-700 border-red-300' },
  { value: 'complaint', label: 'Complaint', color: 'bg-orange-100 text-orange-700 border-orange-300' },
  { value: 'pending_payment', label: 'Pending Payment', color: 'bg-purple-100 text-purple-700 border-purple-300' },
];

const LEAD_SOURCE_OPTIONS = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'cold_call', label: 'Cold Call' },
  { value: 'other', label: 'Other' },
];

const LEAD_STATUS_COLOR_MAP: Record<string, string> = Object.fromEntries(LEAD_STATUS_OPTIONS.map((o) => [o.value, o.color]));

const REMINDER_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-blue-100 text-blue-700 border-blue-300',
  completed: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  overdue: 'bg-red-100 text-red-700 border-red-300',
};

const BLACKLIST_REASON_OPTIONS = [
  { value: 'opted_out', label: 'Opted Out', color: 'bg-zinc-100 text-zinc-700 border-zinc-300' },
  { value: 'wrong_number', label: 'Wrong Number', color: 'bg-amber-100 text-amber-700 border-amber-300' },
  { value: 'complaint', label: 'Complaint', color: 'bg-red-100 text-red-700 border-red-300' },
  { value: 'manual_block', label: 'Manual Block', color: 'bg-orange-100 text-orange-700 border-orange-300' },
  { value: 'other', label: 'Other', color: 'bg-sky-100 text-sky-700 border-sky-300' },
];

const BLACKLIST_REASON_COLOR_MAP: Record<string, string> = Object.fromEntries(BLACKLIST_REASON_OPTIONS.map((o) => [o.value, o.color]));

const AI_TONE_OPTIONS = [
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'short', label: 'Short' },
  { value: 'detailed', label: 'Detailed' },
  { value: 'urdu', label: 'Urdu' },
  { value: 'english', label: 'English' },
  { value: 'roman_urdu', label: 'Roman Urdu' },
];

const CAMPAIGN_STATUS_COLORS: Record<string, string> = {
  running: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  completed: 'bg-blue-100 text-blue-700 border-blue-300',
  paused: 'bg-amber-100 text-amber-700 border-amber-300',
  failed: 'bg-red-100 text-red-700 border-red-300',
  draft: 'bg-zinc-100 text-zinc-700 border-zinc-300',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCurrency(amount: number, currency?: string): string {
  const curr = currency || 'PKR';
  if (curr === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatPhoneNumber(num: string | null): string {
  if (!num) return '—';
  // If already has + prefix, keep it
  if (num.startsWith('+')) return num;
  // Format as +{country code} {number}
  if (num.length >= 10) {
    return '+' + num;
  }
  return num;
}

function truncateKey(key: string): string {
  if (key.length <= 15) return key;
  return key.substring(0, 10) + '...' + key.substring(key.length - 6);
}

function getStatusBadge(status: string) {
  const colorMap: Record<string, string> = {
    unused: 'bg-zinc-100 text-zinc-700 border-zinc-300',
    active: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    expired: 'bg-amber-100 text-amber-700 border-amber-300',
    deactivated: 'bg-red-100 text-red-700 border-red-300',
  };
  return colorMap[status] || 'bg-zinc-100 text-zinc-700 border-zinc-300';
}

function getPlanBadgeColor(planType: string): string {
  switch (planType) {
    case 'Advance':
      return 'bg-emerald-100 text-emerald-700 border-emerald-300';
    case 'Basic':
      return 'bg-sky-100 text-sky-700 border-sky-300';
    default:
      return 'bg-zinc-100 text-zinc-700 border-zinc-300';
  }
}

function prettifyAction(action: string): string {
  return action
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  // Overview state
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Keys state
  const [keys, setKeys] = useState<ActivationKey[]>([]);
  const [keysTotal, setKeysTotal] = useState(0);
  const [keysLoading, setKeysLoading] = useState(false);
  const [keysFilter, setKeysFilter] = useState('all');
  const [keysSearch, setKeysSearch] = useState('');
  const [keysPage, setKeysPage] = useState(1);
  const keysPerPage = 10;

  // Generate keys state
  const [genPlan, setGenPlan] = useState('Basic');
  const [genDuration, setGenDuration] = useState('30');
  const [genCount, setGenCount] = useState('1');
  const [genWhatsapp, setGenWhatsapp] = useState('');
  const [genLoading, setGenLoading] = useState(false);
  const [generatedKeys, setGeneratedKeys] = useState<ActivationKey[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersSearch, setUsersSearch] = useState('');
  const [usersPlanFilter, setUsersPlanFilter] = useState('all');
  const [usersStatusFilter, setUsersStatusFilter] = useState('all');
  const [usersPage, setUsersPage] = useState(1);
  const usersPerPage = 10;

  // User detail dialog
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDetailOpen, setUserDetailOpen] = useState(false);
  const [userEditPlan, setUserEditPlan] = useState('');
  const [userEditExpiry, setUserEditExpiry] = useState('');
  const [userEditLoading, setUserEditLoading] = useState(false);

  // Plans state
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [editPlans, setEditPlans] = useState<Record<string, Partial<Plan>>>({});
  const [savingPlan, setSavingPlan] = useState<string | null>(null);

  // Features state
  const [features, setFeatures] = useState<Feature[]>([]);
  const [featurePlans, setFeaturePlans] = useState<{ planType: string; displayName: string }[]>([]);
  const [featuresLoading, setFeaturesLoading] = useState(false);
  const [featureToggleLoading, setFeatureToggleLoading] = useState<string | null>(null);
  const [addFeatureDialog, setAddFeatureDialog] = useState(false);
  const [newFeatureKey, setNewFeatureKey] = useState('');
  const [newFeatureName, setNewFeatureName] = useState('');
  const [addFeatureLoading, setAddFeatureLoading] = useState(false);

  // Activity state
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [activityTotal, setActivityTotal] = useState(0);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityFilter, setActivityFilter] = useState('all');
  const [activityPage, setActivityPage] = useState(1);
  const activityPerPage = 20;

  // Settings state
  const [currency, setCurrency] = useState('PKR');
  const [currencyLoading, setCurrencyLoading] = useState(false);
  const [systemConfig, setSystemConfig] = useState<Record<string, string>>({});
  const [configLoading, setConfigLoading] = useState(false);
  const [editPaymentAccount, setEditPaymentAccount] = useState('');
  const [editPaymentTitle, setEditPaymentTitle] = useState('');
  const [editSupportPhone, setEditSupportPhone] = useState('');
  const [configSaving, setConfigSaving] = useState<string | null>(null);

  // Key detail dialog
  const [selectedKey, setSelectedKey] = useState<ActivationKey | null>(null);
  const [keyDetailOpen, setKeyDetailOpen] = useState(false);

  // Leads state
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsTotal, setLeadsTotal] = useState(0);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadsSearch, setLeadsSearch] = useState('');
  const [leadsStatusFilter, setLeadsStatusFilter] = useState('all');
  const [leadsSourceFilter, setLeadsSourceFilter] = useState('all');
  const [leadsPage, setLeadsPage] = useState(1);
  const leadsPerPage = 20;
  const [leadDialogOpen, setLeadDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [leadForm, setLeadForm] = useState({ phoneNumber: '', name: '', email: '', status: 'new', source: 'whatsapp', notes: '' });
  const [leadSaving, setLeadSaving] = useState(false);
  const [deleteLeadDialog, setDeleteLeadDialog] = useState<string | null>(null);

  // Reminders state
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [remindersTotal, setRemindersTotal] = useState(0);
  const [remindersLoading, setRemindersLoading] = useState(false);
  const [remindersStatusFilter, setRemindersStatusFilter] = useState('all');
  const [remindersPage, setRemindersPage] = useState(1);
  const remindersPerPage = 20;
  const [reminderSummary, setReminderSummary] = useState({ pending: 0, overdue: 0, completedToday: 0 });
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [reminderForm, setReminderForm] = useState({ phoneNumber: '', reminderDate: '', reminderTime: '', note: '' });
  const [reminderSaving, setReminderSaving] = useState(false);
  const [deleteReminderDialog, setDeleteReminderDialog] = useState<string | null>(null);

  // Blacklist state
  const [blacklist, setBlacklist] = useState<BlacklistedNumber[]>([]);
  const [blacklistTotal, setBlacklistTotal] = useState(0);
  const [blacklistLoading, setBlacklistLoading] = useState(false);
  const [blacklistSearch, setBlacklistSearch] = useState('');
  const [blacklistReasonFilter, setBlacklistReasonFilter] = useState('all');
  const [blacklistPage, setBlacklistPage] = useState(1);
  const blacklistPerPage = 20;
  const [blacklistDialogOpen, setBlacklistDialogOpen] = useState(false);
  const [bulkBlacklistDialogOpen, setBulkBlacklistDialogOpen] = useState(false);
  const [blacklistForm, setBlacklistForm] = useState({ phoneNumber: '', reason: 'opted_out', notes: '' });
  const [bulkBlacklistForm, setBulkBlacklistForm] = useState({ numbers: '', reason: 'opted_out' });
  const [blacklistSaving, setBlacklistSaving] = useState(false);
  const [deleteBlacklistDialog, setDeleteBlacklistDialog] = useState<string | null>(null);

  // Campaigns state
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignsTotal, setCampaignsTotal] = useState(0);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [campaignsStatusFilter, setCampaignsStatusFilter] = useState('all');
  const [campaignsSearch, setCampaignsSearch] = useState('');
  const [campaignsPage, setCampaignsPage] = useState(1);
  const campaignsPerPage = 20;
  const [campaignAnalytics, setCampaignAnalytics] = useState<CampaignAnalytics | null>(null);
  const [campaignDetailOpen, setCampaignDetailOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [campaignMessages, setCampaignMessages] = useState<CampaignMessage[]>([]);
  const [campaignMessagesLoading, setCampaignMessagesLoading] = useState(false);
  const [campaignMessagesPage, setCampaignMessagesPage] = useState(1);
  const campaignMessagesPerPage = 20;
  const [deleteCampaignDialog, setDeleteCampaignDialog] = useState<string | null>(null);

  // AI Replies state
  const [aiMode, setAiMode] = useState<'suggest' | 'rewrite'>('suggest');
  const [aiInput, setAiInput] = useState('');
  const [aiTone, setAiTone] = useState('professional');
  const [aiContext, setAiContext] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResults, setAiResults] = useState<string[]>([]);
  const [aiCopiedIdx, setAiCopiedIdx] = useState<number | null>(null);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiEnabledSaving, setAiEnabledSaving] = useState(false);

  // ─── Data Fetchers ─────────────────────────────────────────────────────────

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch('/api/admin/stats');
      if (!res.ok) throw new Error('Failed to fetch stats');
      const data = await res.json();
      setStats(data);
    } catch {
      toast.error('Failed to load dashboard stats');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchKeys = useCallback(async () => {
    setKeysLoading(true);
    try {
      const params = new URLSearchParams();
      if (keysFilter !== 'all') params.set('status', keysFilter);
      if (keysSearch) params.set('search', keysSearch);
      const res = await fetch(`/api/admin/keys?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch keys');
      const data = await res.json();
      setKeys(data.keys);
      setKeysTotal(data.total);
    } catch {
      toast.error('Failed to load activation keys');
    } finally {
      setKeysLoading(false);
    }
  }, [keysFilter, keysSearch]);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const params = new URLSearchParams();
      if (usersSearch) params.set('search', usersSearch);
      if (usersPlanFilter !== 'all') params.set('planType', usersPlanFilter);
      if (usersStatusFilter !== 'all') params.set('status', usersStatusFilter);
      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data.users);
      setUsersTotal(data.total);
    } catch {
      toast.error('Failed to load customers');
    } finally {
      setUsersLoading(false);
    }
  }, [usersSearch, usersPlanFilter, usersStatusFilter]);

  const fetchPlans = useCallback(async () => {
    setPlansLoading(true);
    try {
      const res = await fetch('/api/admin/plans');
      if (!res.ok) throw new Error('Failed to fetch plans');
      const data = await res.json();
      setPlans(data.plans);
      const editMap: Record<string, Partial<Plan>> = {};
      data.plans.forEach((p: Plan) => {
        editMap[p.planType] = { ...p };
      });
      setEditPlans(editMap);
    } catch {
      toast.error('Failed to load plans');
    } finally {
      setPlansLoading(false);
    }
  }, []);

  const fetchFeatures = useCallback(async () => {
    setFeaturesLoading(true);
    try {
      const res = await fetch('/api/admin/features');
      if (!res.ok) throw new Error('Failed to fetch features');
      const data = await res.json();
      setFeatures(data.features);
      setFeaturePlans(data.plans);
    } catch {
      toast.error('Failed to load features');
    } finally {
      setFeaturesLoading(false);
    }
  }, []);

  const fetchActivity = useCallback(async () => {
    setActivityLoading(true);
    try {
      const params = new URLSearchParams();
      if (activityFilter !== 'all') params.set('action', activityFilter);
      params.set('limit', String(activityPerPage));
      params.set('offset', String((activityPage - 1) * activityPerPage));
      const res = await fetch(`/api/admin/activity?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch activity');
      const data = await res.json();
      setActivityLogs(data.logs);
      setActivityTotal(data.total);
    } catch {
      toast.error('Failed to load activity logs');
    } finally {
      setActivityLoading(false);
    }
  }, [activityFilter, activityPage]);

  const fetchConfig = useCallback(async () => {
    setConfigLoading(true);
    try {
      const res = await fetch('/api/admin/config');
      if (!res.ok) throw new Error('Failed to fetch config');
      const data = await res.json();
      const configMap: Record<string, string> = {};
      if (Array.isArray(data)) {
        data.forEach((item: { key: string; value: string }) => {
          configMap[item.key] = item.value;
        });
      } else if (data && typeof data === 'object') {
        Object.entries(data).forEach(([k, v]) => {
          configMap[k] = String(v);
        });
      }
      setSystemConfig(configMap);
      if (configMap.currency === 'USD' || configMap.currency === 'PKR') {
        setCurrency(configMap.currency);
      }
      setEditPaymentAccount(configMap.payment_account_number || '');
      setEditPaymentTitle(configMap.payment_account_title || '');
      setEditSupportPhone(configMap.support_phone || '');
    } catch {
      toast.error('Failed to load system config');
    } finally {
      setConfigLoading(false);
    }
  }, []);

  const handleSaveConfig = useCallback(async (key: string, value: string) => {
    setConfigSaving(key);
    try {
      const res = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });
      if (!res.ok) throw new Error('Failed to save config');
      toast.success('Config saved successfully');
      fetchConfig();
    } catch {
      toast.error('Failed to save config');
    } finally {
      setConfigSaving(null);
    }
  }, [fetchConfig]);

  // Leads fetchers
  const fetchLeads = useCallback(async () => {
    setLeadsLoading(true);
    try {
      const params = new URLSearchParams();
      if (leadsSearch) params.set('search', leadsSearch);
      if (leadsStatusFilter !== 'all') params.set('status', leadsStatusFilter);
      if (leadsSourceFilter !== 'all') params.set('source', leadsSourceFilter);
      params.set('page', String(leadsPage));
      params.set('limit', String(leadsPerPage));
      const res = await fetch(`/api/admin/leads?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch leads');
      const data = await res.json();
      setLeads(data.leads || []);
      setLeadsTotal(data.total || 0);
    } catch {
      toast.error('Failed to load leads');
    } finally {
      setLeadsLoading(false);
    }
  }, [leadsSearch, leadsStatusFilter, leadsSourceFilter, leadsPage]);

  // Reminders fetchers
  const fetchReminders = useCallback(async () => {
    setRemindersLoading(true);
    try {
      const params = new URLSearchParams();
      if (remindersStatusFilter !== 'all') params.set('status', remindersStatusFilter);
      params.set('page', String(remindersPage));
      params.set('limit', String(remindersPerPage));
      const res = await fetch(`/api/admin/reminders?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch reminders');
      const data = await res.json();
      setReminders(data.reminders || []);
      setRemindersTotal(data.total || 0);
      setReminderSummary({
        pending: data.pendingCount || 0,
        overdue: data.overdueCount || 0,
        completedToday: data.completedTodayCount || 0,
      });
    } catch {
      toast.error('Failed to load reminders');
    } finally {
      setRemindersLoading(false);
    }
  }, [remindersStatusFilter, remindersPage]);

  // Blacklist fetchers
  const fetchBlacklist = useCallback(async () => {
    setBlacklistLoading(true);
    try {
      const params = new URLSearchParams();
      if (blacklistSearch) params.set('search', blacklistSearch);
      if (blacklistReasonFilter !== 'all') params.set('reason', blacklistReasonFilter);
      params.set('page', String(blacklistPage));
      params.set('limit', String(blacklistPerPage));
      const res = await fetch(`/api/admin/blacklist?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch blacklist');
      const data = await res.json();
      setBlacklist(data.blacklist || []);
      setBlacklistTotal(data.total || 0);
    } catch {
      toast.error('Failed to load blacklist');
    } finally {
      setBlacklistLoading(false);
    }
  }, [blacklistSearch, blacklistReasonFilter, blacklistPage]);

  // Campaigns fetchers
  const fetchCampaigns = useCallback(async () => {
    setCampaignsLoading(true);
    try {
      const params = new URLSearchParams();
      if (campaignsStatusFilter !== 'all') params.set('status', campaignsStatusFilter);
      if (campaignsSearch) params.set('search', campaignsSearch);
      params.set('page', String(campaignsPage));
      params.set('limit', String(campaignsPerPage));
      const res = await fetch(`/api/admin/campaigns?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch campaigns');
      const data = await res.json();
      setCampaigns(data.campaigns || []);
      setCampaignsTotal(data.total || 0);
    } catch {
      toast.error('Failed to load campaigns');
    } finally {
      setCampaignsLoading(false);
    }
  }, [campaignsStatusFilter, campaignsSearch, campaignsPage]);

  const fetchCampaignAnalytics = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/campaigns?analytics=true');
      if (!res.ok) throw new Error('Failed to fetch analytics');
      const data = await res.json();
      setCampaignAnalytics(data);
    } catch {
      // silent fail for analytics
    }
  }, []);

  const fetchCampaignMessages = useCallback(async (campaignId: string) => {
    setCampaignMessagesLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(campaignMessagesPage));
      params.set('limit', String(campaignMessagesPerPage));
      const res = await fetch(`/api/admin/campaigns/${campaignId}?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch campaign detail');
      const data = await res.json();
      setCampaignMessages(data.messages || []);
    } catch {
      toast.error('Failed to load campaign messages');
    } finally {
      setCampaignMessagesLoading(false);
    }
  }, [campaignMessagesPage]);

  // AI enabled toggle fetcher
  const fetchAiEnabled = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/config');
      if (!res.ok) return;
      const data = await res.json();
      const configMap: Record<string, string> = {};
      if (Array.isArray(data)) {
        data.forEach((item: { key: string; value: string }) => { configMap[item.key] = item.value; });
      } else if (data && typeof data === 'object') {
        Object.entries(data).forEach(([k, v]) => { configMap[k] = String(v); });
      }
      setAiEnabled(configMap.ai_replies_enabled === 'true');
    } catch {
      // silent
    }
  }, []);

  // ─── Effects ───────────────────────────────────────────────────────────────

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (activeTab === 'keys') fetchKeys();
  }, [activeTab, fetchKeys]);

  useEffect(() => {
    if (activeTab === 'customers') fetchUsers();
  }, [activeTab, fetchUsers]);

  useEffect(() => {
    if (activeTab === 'plans') fetchPlans();
  }, [activeTab, fetchPlans]);

  useEffect(() => {
    if (activeTab === 'features') fetchFeatures();
  }, [activeTab, fetchFeatures]);

  useEffect(() => {
    if (activeTab === 'activity') fetchActivity();
  }, [activeTab, fetchActivity]);

  useEffect(() => {
    if (activeTab === 'settings') fetchConfig();
  }, [activeTab, fetchConfig]);

  useEffect(() => {
    if (activeTab === 'leads') fetchLeads();
  }, [activeTab, fetchLeads]);

  useEffect(() => {
    if (activeTab === 'reminders') { fetchReminders(); }
  }, [activeTab, fetchReminders]);

  useEffect(() => {
    if (activeTab === 'blacklist') fetchBlacklist();
  }, [activeTab, fetchBlacklist]);

  useEffect(() => {
    if (activeTab === 'campaigns') { fetchCampaigns(); fetchCampaignAnalytics(); }
  }, [activeTab, fetchCampaigns, fetchCampaignAnalytics]);

  useEffect(() => {
    if (activeTab === 'ai-replies') fetchAiEnabled();
  }, [activeTab, fetchAiEnabled]);

  // Reset page when filters change
  useEffect(() => { setKeysPage(1); }, [keysFilter, keysSearch]);
  useEffect(() => { setUsersPage(1); }, [usersSearch, usersPlanFilter, usersStatusFilter]);
  useEffect(() => { setActivityPage(1); }, [activityFilter]);
  useEffect(() => { setLeadsPage(1); }, [leadsSearch, leadsStatusFilter, leadsSourceFilter]);
  useEffect(() => { setRemindersPage(1); }, [remindersStatusFilter]);
  useEffect(() => { setBlacklistPage(1); }, [blacklistSearch, blacklistReasonFilter]);
  useEffect(() => { setCampaignsPage(1); }, [campaignsStatusFilter, campaignsSearch]);

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleGenerateKeys = async () => {
    setGenLoading(true);
    try {
      const body: Record<string, unknown> = {
        planType: genPlan,
        durationDays: parseInt(genDuration),
        count: parseInt(genCount) || 1,
      };
      if (genWhatsapp.trim()) body.whatsappNumber = genWhatsapp.trim();
      const res = await fetch('/api/admin/keys/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to generate keys');
      }
      const data = await res.json();
      setGeneratedKeys(data.keys);
      toast.success(data.message || `${data.count} key(s) generated successfully!`);
      fetchKeys();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate keys');
    } finally {
      setGenLoading(false);
    }
  };

  const handleCopyKey = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedKey(key);
      toast.success('Key copied to clipboard');
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      toast.error('Failed to copy key');
    }
  };

  const handleCopyAllKeys = async () => {
    if (generatedKeys.length === 0) return;
    try {
      const allKeys = generatedKeys.map((k) => k.key).join('\n');
      await navigator.clipboard.writeText(allKeys);
      toast.success('All keys copied to clipboard');
    } catch {
      toast.error('Failed to copy keys');
    }
  };

  const handleDeactivateKey = async (keyId: string) => {
    try {
      const res = await fetch(`/api/admin/keys/${keyId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deactivate' }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to deactivate key');
      }
      toast.success('Key deactivated successfully');
      fetchKeys();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to deactivate key');
    }
  };

  const handleViewKeyDetail = (key: ActivationKey) => {
    setSelectedKey(key);
    setKeyDetailOpen(true);
  };

  const handleViewUserDetail = (user: User) => {
    setSelectedUser(user);
    setUserEditPlan(user.planType);
    setUserEditExpiry(user.expiresAt ? new Date(user.expiresAt).toISOString().split('T')[0] : '');
    setUserDetailOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    setUserEditLoading(true);
    try {
      const body: Record<string, unknown> = {};
      if (userEditPlan !== selectedUser.planType) body.planType = userEditPlan;
      if (userEditExpiry) body.expiresAt = new Date(userEditExpiry).toISOString();
      if (Object.keys(body).length === 0) {
        toast.info('No changes to save');
        setUserEditLoading(false);
        return;
      }
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update user');
      }
      toast.success('User updated successfully');
      setUserDetailOpen(false);
      fetchUsers();
      fetchStats();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setUserEditLoading(false);
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: false }),
      });
      if (!res.ok) throw new Error('Failed to deactivate user');
      toast.success('User deactivated successfully');
      fetchUsers();
      fetchStats();
    } catch {
      toast.error('Failed to deactivate user');
    }
  };

  const handleSavePlan = async (planType: string) => {
    const edit = editPlans[planType];
    if (!edit) return;
    setSavingPlan(planType);
    try {
      const res = await fetch('/api/admin/plans', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType,
          displayName: edit.displayName,
          monthlyPrice: edit.monthlyPrice,
          annualPrice: edit.annualPrice,
          dailyMessageLimit: edit.dailyMessageLimit,
          isActive: edit.isActive,
        }),
      });
      if (!res.ok) throw new Error('Failed to save plan');
      toast.success(`${edit.displayName || planType} plan saved`);
      fetchPlans();
    } catch {
      toast.error('Failed to save plan');
    } finally {
      setSavingPlan(null);
    }
  };

  const handleToggleFeatureActive = async (featureKey: string, isActive: boolean) => {
    setFeatureToggleLoading(featureKey);
    try {
      const res = await fetch('/api/admin/features', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featureKey, isActive }),
      });
      if (!res.ok) throw new Error('Failed to toggle feature');
      toast.success(`Feature ${isActive ? 'enabled' : 'disabled'} globally`);
      fetchFeatures();
    } catch {
      toast.error('Failed to toggle feature');
    } finally {
      setFeatureToggleLoading(null);
    }
  };

  const handleToggleFeatureAccess = async (planType: string, featureKey: string, isEnabled: boolean) => {
    setFeatureToggleLoading(`${planType}-${featureKey}`);
    try {
      const res = await fetch('/api/admin/features/access', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType, featureKey, isEnabled }),
      });
      if (!res.ok) throw new Error('Failed to update feature access');
      toast.success(`Feature access updated for ${planType}`);
      fetchFeatures();
    } catch {
      toast.error('Failed to update feature access');
    } finally {
      setFeatureToggleLoading(null);
    }
  };

  const handleAddFeature = async () => {
    if (!newFeatureKey.trim() || !newFeatureName.trim()) {
      toast.error('Feature key and name are required');
      return;
    }
    setAddFeatureLoading(true);
    try {
      const res = await fetch('/api/admin/features', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featureKey: newFeatureKey.trim(), displayName: newFeatureName.trim(), isActive: true }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to add feature');
      }
      toast.success('Feature added successfully');
      setAddFeatureDialog(false);
      setNewFeatureKey('');
      setNewFeatureName('');
      fetchFeatures();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add feature');
    } finally {
      setAddFeatureLoading(false);
    }
  };

  // ─── Leads Handlers ─────────────────────────────────────────────────────
  const handleSaveLead = async () => {
    if (!leadForm.phoneNumber.trim()) {
      toast.error('Phone number is required');
      return;
    }
    setLeadSaving(true);
    try {
      const isEdit = !!editingLead;
      const url = isEdit ? '/api/admin/leads' : '/api/admin/leads';
      const method = isEdit ? 'PUT' : 'POST';
      const body: Record<string, unknown> = { phoneNumber: leadForm.phoneNumber.trim() };
      if (leadForm.name.trim()) body.name = leadForm.name.trim();
      if (leadForm.email.trim()) body.email = leadForm.email.trim();
      if (leadForm.status) body.status = leadForm.status;
      if (leadForm.source) body.source = leadForm.source;
      if (leadForm.notes.trim()) body.notes = leadForm.notes.trim();
      if (isEdit && editingLead) body.id = editingLead.id;
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to save lead');
      toast.success(isEdit ? 'Lead updated' : 'Lead added');
      setLeadDialogOpen(false);
      setEditingLead(null);
      setLeadForm({ phoneNumber: '', name: '', email: '', status: 'new', source: 'whatsapp', notes: '' });
      fetchLeads();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save lead');
    } finally {
      setLeadSaving(false);
    }
  };

  const handleDeleteLead = async (id: string) => {
    try {
      const res = await fetch('/api/admin/leads', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to delete lead');
      toast.success('Lead deleted');
      setDeleteLeadDialog(null);
      fetchLeads();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete lead');
    }
  };

  const handleQuickStatusChange = async (lead: Lead, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/leads', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: lead.id, status: newStatus }) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to update status');
      toast.success('Status updated');
      fetchLeads();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  // ─── Reminders Handlers ─────────────────────────────────────────────────
  const handleSaveReminder = async () => {
    if (!reminderForm.phoneNumber.trim() || !reminderForm.reminderDate || !reminderForm.reminderTime) {
      toast.error('Phone number, date, and time are required');
      return;
    }
    setReminderSaving(true);
    try {
      const isEdit = !!editingReminder;
      const method = isEdit ? 'PUT' : 'POST';
      const body: Record<string, unknown> = {
        phoneNumber: reminderForm.phoneNumber.trim(),
        reminderDate: reminderForm.reminderDate,
        reminderTime: reminderForm.reminderTime,
        note: reminderForm.note.trim() || null,
      };
      if (isEdit && editingReminder) body.id = editingReminder.id;
      const res = await fetch('/api/admin/reminders', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to save reminder');
      toast.success(isEdit ? 'Reminder updated' : 'Reminder added');
      setReminderDialogOpen(false);
      setEditingReminder(null);
      setReminderForm({ phoneNumber: '', reminderDate: '', reminderTime: '', note: '' });
      fetchReminders();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save reminder');
    } finally {
      setReminderSaving(false);
    }
  };

  const handleMarkReminderComplete = async (id: string) => {
    try {
      const res = await fetch('/api/admin/reminders', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status: 'completed' }) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to complete reminder');
      toast.success('Reminder marked complete');
      fetchReminders();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to complete reminder');
    }
  };

  const handleDeleteReminder = async (id: string) => {
    try {
      const res = await fetch('/api/admin/reminders', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to delete reminder');
      toast.success('Reminder deleted');
      setDeleteReminderDialog(null);
      fetchReminders();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete reminder');
    }
  };

  // ─── Blacklist Handlers ─────────────────────────────────────────────────
  const handleAddBlacklist = async () => {
    if (!blacklistForm.phoneNumber.trim()) {
      toast.error('Phone number is required');
      return;
    }
    setBlacklistSaving(true);
    try {
      const res = await fetch('/api/admin/blacklist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(blacklistForm) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to add to blacklist');
      toast.success('Number added to blacklist');
      setBlacklistDialogOpen(false);
      setBlacklistForm({ phoneNumber: '', reason: 'opted_out', notes: '' });
      fetchBlacklist();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add to blacklist');
    } finally {
      setBlacklistSaving(false);
    }
  };

  const handleBulkBlacklist = async () => {
    if (!bulkBlacklistForm.numbers.trim()) {
      toast.error('Phone numbers are required');
      return;
    }
    setBlacklistSaving(true);
    try {
      const numbers = bulkBlacklistForm.numbers.split('\n').map((n) => n.trim()).filter(Boolean);
      const res = await fetch('/api/admin/blacklist/bulk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ numbers, reason: bulkBlacklistForm.reason }) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to add to blacklist');
      toast.success(`${data.addedCount || 0} numbers added, ${data.skippedCount || 0} skipped`);
      setBulkBlacklistDialogOpen(false);
      setBulkBlacklistForm({ numbers: '', reason: 'opted_out' });
      fetchBlacklist();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add to blacklist');
    } finally {
      setBlacklistSaving(false);
    }
  };

  const handleRemoveBlacklist = async (id: string) => {
    try {
      const res = await fetch('/api/admin/blacklist', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to remove from blacklist');
      toast.success('Number removed from blacklist');
      setDeleteBlacklistDialog(null);
      fetchBlacklist();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove from blacklist');
    }
  };

  // ─── Campaign Handlers ─────────────────────────────────────────────────
  const handleViewCampaignDetail = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setCampaignDetailOpen(true);
    setCampaignMessagesPage(1);
    fetchCampaignMessages(campaign.id);
  };

  const handleDeleteCampaign = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/campaigns/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to delete campaign');
      toast.success('Campaign deleted');
      setDeleteCampaignDialog(null);
      fetchCampaigns();
      fetchCampaignAnalytics();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete campaign');
    }
  };

  // ─── AI Reply Handlers ─────────────────────────────────────────────────
  const handleGenerateAiReply = async () => {
    if (!aiInput.trim()) {
      toast.error(aiMode === 'suggest' ? 'Customer message is required' : 'Draft message is required');
      return;
    }
    setAiLoading(true);
    setAiResults([]);
    try {
      const body: Record<string, unknown> = { mode: aiMode, tone: aiTone };
      if (aiMode === 'suggest') {
        body.customerMessage = aiInput.trim();
        if (aiContext.trim()) body.context = aiContext.trim();
      } else {
        body.message = aiInput.trim();
      }
      const res = await fetch('/api/admin/ai-reply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to generate reply');
      if (data.suggestions && Array.isArray(data.suggestions)) {
        setAiResults(data.suggestions);
      } else if (data.rewrittenMessage) {
        setAiResults([data.rewrittenMessage]);
      } else {
        toast.error('No results returned');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'AI service temporarily unavailable');
    } finally {
      setAiLoading(false);
    }
  };

  const handleCopyAiResult = async (text: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setAiCopiedIdx(idx);
      toast.success('Copied to clipboard');
      setTimeout(() => setAiCopiedIdx(null), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleToggleAiEnabled = async (enabled: boolean) => {
    setAiEnabledSaving(true);
    try {
      await handleSaveConfig('ai_replies_enabled', String(enabled));
      setAiEnabled(enabled);
    } catch {
      // error shown by handleSaveConfig
    } finally {
      setAiEnabledSaving(false);
    }
  };

  // ─── Pagination Helpers ────────────────────────────────────────────────────

  const paginatedKeys = keys.slice((keysPage - 1) * keysPerPage, keysPage * keysPerPage);
  const paginatedUsers = users.slice((usersPage - 1) * usersPerPage, usersPage * usersPerPage);

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col bg-zinc-50">
        {/* ─── Header ───────────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-50 bg-zinc-900 text-white shadow-lg">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#25D366] flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold tracking-tight">WhatFlow CRM</h1>
                  <p className="text-[11px] text-zinc-400 -mt-0.5 hidden sm:block">Admin Dashboard</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-zinc-300 hover:text-white hover:bg-zinc-800"
                  onClick={() => {
                    fetchStats();
                    if (activeTab === 'keys') fetchKeys();
                    if (activeTab === 'customers') fetchUsers();
                    if (activeTab === 'plans') fetchPlans();
                    if (activeTab === 'features') fetchFeatures();
                    if (activeTab === 'activity') fetchActivity();
                    if (activeTab === 'settings') fetchConfig();
                    if (activeTab === 'leads') fetchLeads();
                    if (activeTab === 'reminders') fetchReminders();
                    if (activeTab === 'blacklist') fetchBlacklist();
                    if (activeTab === 'campaigns') { fetchCampaigns(); fetchCampaignAnalytics(); }
                    if (activeTab === 'ai-replies') fetchAiEnabled();
                    toast.success('Data refreshed');
                  }}
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <div className="w-8 h-8 rounded-full bg-[#25D366]/20 border border-[#25D366]/40 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-[#25D366]" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ─── Main Content ──────────────────────────────────────────────────── */}
        <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full flex bg-white border shadow-sm rounded-xl mb-6 p-1 h-auto gap-0.5 overflow-x-auto">
              {[
                { value: 'overview', label: 'Overview', icon: LayoutDashboard },
                { value: 'keys', label: 'Keys', icon: KeyRound },
                { value: 'customers', label: 'Customers', icon: Users },
                { value: 'plans', label: 'Plans', icon: CreditCard },
                { value: 'features', label: 'Features', icon: Settings2 },
                { value: 'activity', label: 'Activity', icon: Activity },
                { value: 'leads', label: 'Leads', icon: Contact },
                { value: 'reminders', label: 'Reminders', icon: Bell },
                { value: 'blacklist', label: 'Blacklist', icon: Ban },
                { value: 'campaigns', label: 'Campaigns', icon: BarChart3 },
                { value: 'ai-replies', label: 'AI Replies', icon: Bot },
                { value: 'settings', label: 'Settings', icon: Globe },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex-1 min-w-0 flex items-center justify-center gap-1.5 py-2.5 px-2 text-xs sm:text-sm rounded-lg data-[state=active]:bg-[#25D366] data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
                >
                  <tab.icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* ═══════════════════ OVERVIEW TAB ═══════════════════════════════ */}
            <TabsContent value="overview" className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    title: 'Total Users',
                    value: stats?.totalUsers ?? '—',
                    sub: `+${stats?.newUsersThisMonth ?? 0} this month`,
                    icon: Users,
                    color: 'from-emerald-500 to-emerald-600',
                    lightBg: 'bg-emerald-50',
                    textColor: 'text-emerald-600',
                  },
                  {
                    title: 'Active Subscriptions',
                    value: stats?.activeUsers ?? '—',
                    sub: `${stats?.totalUsers ? Math.round(((stats.activeUsers ?? 0) / stats.totalUsers) * 100) : 0}% of total`,
                    icon: UserCheck,
                    color: 'from-[#25D366] to-[#128C7E]',
                    lightBg: 'bg-[#25D366]/10',
                    textColor: 'text-[#25D366]',
                  },
                  {
                    title: 'Active Keys',
                    value: stats?.activeKeys ?? '—',
                    sub: `${stats?.unusedKeys ?? 0} unused`,
                    icon: KeyRound,
                    color: 'from-amber-500 to-orange-500',
                    lightBg: 'bg-amber-50',
                    textColor: 'text-amber-600',
                  },
                  {
                    title: 'Revenue',
                    value: stats ? formatCurrency(stats.revenue, currency) : '—',
                    sub: `${stats?.pendingPayments ?? 0} pending payments`,
                    icon: DollarSign,
                    color: 'from-rose-500 to-pink-500',
                    lightBg: 'bg-rose-50',
                    textColor: 'text-rose-600',
                  },
                ].map((stat) => (
                  <Card key={stat.title} className="relative overflow-hidden border-0 shadow-sm">
                    <CardContent className="p-5">
                      {statsLoading ? (
                        <div className="space-y-3">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-8 w-16" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              {stat.title}
                            </span>
                            <div className={`w-9 h-9 rounded-lg ${stat.lightBg} flex items-center justify-center`}>
                              <stat.icon className={`w-4 h-4 ${stat.textColor}`} />
                            </div>
                          </div>
                          <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
                          <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
                        </>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Quick Actions */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => setActiveTab('keys')}
                    className="bg-[#25D366] hover:bg-[#1da851] text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Generate Keys
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab('customers')}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    View Users
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab('plans')}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Manage Plans
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab('activity')}
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    View Activity
                  </Button>
                </CardContent>
              </Card>

              {/* Additional Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                      <TrendingUp className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                      {statsLoading ? (
                        <Skeleton className="h-6 w-12 mb-1" />
                      ) : (
                        <div className="text-xl font-bold">{stats?.keysActivatedThisMonth ?? 0}</div>
                      )}
                      <p className="text-xs text-muted-foreground">Keys activated this month</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center shrink-0">
                      <Zap className="w-5 h-5 text-sky-600" />
                    </div>
                    <div>
                      {statsLoading ? (
                        <Skeleton className="h-6 w-12 mb-1" />
                      ) : (
                        <div className="text-xl font-bold">{stats?.totalKeys ?? 0}</div>
                      )}
                      <p className="text-xs text-muted-foreground">Total keys generated</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      {statsLoading ? (
                        <Skeleton className="h-6 w-12 mb-1" />
                      ) : (
                        <div className="text-xl font-bold">{stats?.pendingPayments ?? 0}</div>
                      )}
                      <p className="text-xs text-muted-foreground">Pending payments</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ═══════════════════ KEYS TAB ═══════════════════════════════════ */}
            <TabsContent value="keys" className="space-y-6">
              {/* Generate Keys Panel */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#25D366]/10 flex items-center justify-center">
                      <Plus className="w-4 h-4 text-[#25D366]" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold">Generate Activation Keys</CardTitle>
                      <CardDescription>Create new activation keys for customers</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground">Plan</Label>
                      <Select value={genPlan} onValueChange={setGenPlan}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PLAN_OPTIONS.map((p) => (
                            <SelectItem key={p} value={p}>{p}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground">Duration</Label>
                      <Select value={genDuration} onValueChange={setGenDuration}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DURATION_OPTIONS.map((d) => (
                            <SelectItem key={d.days} value={String(d.days)}>
                              {d.label} ({d.days} days)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground">Count (1–100)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        value={genCount}
                        onChange={(e) => setGenCount(e.target.value)}
                        placeholder="1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground">
                        WhatsApp Number <span className="text-muted-foreground">(optional)</span>
                      </Label>
                      <Input
                        type="tel"
                        value={genWhatsapp}
                        onChange={(e) => setGenWhatsapp(e.target.value)}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleGenerateKeys}
                    disabled={genLoading}
                    className="bg-[#25D366] hover:bg-[#1da851] text-white"
                  >
                    {genLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    <KeyRound className="w-4 h-4 mr-2" />
                    Generate Keys
                  </Button>

                  {/* Generated Keys Display */}
                  {generatedKeys.length > 0 && (
                    <div className="mt-5 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span className="text-sm font-medium text-emerald-800">
                            {generatedKeys.length} key(s) generated
                          </span>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleCopyAllKeys}>
                          <Download className="w-3 h-3 mr-1" />
                          Copy All
                        </Button>
                      </div>
                      <ScrollArea className="max-h-40">
                        <div className="space-y-1.5">
                          {generatedKeys.map((k) => (
                            <div
                              key={k.id}
                              className="flex items-center justify-between gap-2 bg-white rounded-md px-3 py-2 border border-emerald-100"
                            >
                              <code className="text-xs font-mono text-emerald-900">{k.key}</code>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100"
                                onClick={() => handleCopyKey(k.key)}
                              >
                                {copiedKey === k.key ? (
                                  <Check className="w-3 h-3" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Keys Table */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <CardTitle className="text-base font-semibold">Activation Keys</CardTitle>
                    <div className="flex flex-wrap gap-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Search keys or numbers..."
                          value={keysSearch}
                          onChange={(e) => setKeysSearch(e.target.value)}
                          className="pl-9 w-[200px] h-9"
                        />
                      </div>
                      <Select value={keysFilter} onValueChange={setKeysFilter}>
                        <SelectTrigger className="w-[130px] h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="unused">Unused</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="expired">Expired</SelectItem>
                          <SelectItem value="deactivated">Deactivated</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {keysLoading ? (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : keys.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <KeyRound className="w-10 h-10 mx-auto mb-3 opacity-40" />
                      <p className="text-sm">No activation keys found</p>
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto rounded-lg border">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-zinc-50">
                              <TableHead className="text-xs font-semibold">Key</TableHead>
                              <TableHead className="text-xs font-semibold">Plan</TableHead>
                              <TableHead className="text-xs font-semibold">Duration</TableHead>
                              <TableHead className="text-xs font-semibold">Status</TableHead>
                              <TableHead className="text-xs font-semibold">Linked Number</TableHead>
                              <TableHead className="text-xs font-semibold hidden md:table-cell">Created</TableHead>
                              <TableHead className="text-xs font-semibold hidden lg:table-cell">Expires</TableHead>
                              <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {paginatedKeys.map((k) => (
                              <TableRow key={k.id} className="hover:bg-zinc-50/50">
                                <TableCell>
                                  <div className="flex items-center gap-1.5">
                                    <code className="text-xs font-mono">{truncateKey(k.key)}</code>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                                      onClick={() => handleCopyKey(k.key)}
                                    >
                                      {copiedKey === k.key ? (
                                        <Check className="w-3 h-3 text-[#25D366]" />
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                    </Button>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className={getPlanBadgeColor(k.planType)}>
                                    {k.planType}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                  {k.durationDays}d
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className={getStatusBadge(k.status)}>
                                    {k.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-xs">
                                  {k.linkedNumber ? (
                                    <span className="flex items-center gap-1">
                                      <Phone className="w-3 h-3 text-muted-foreground" />
                                      {formatPhoneNumber(k.linkedNumber)}
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground">—</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground hidden md:table-cell">
                                  {formatDate(k.createdAt)}
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">
                                  {formatDate(k.expiresAt)}
                                </TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <MoreHorizontal className="w-4 h-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleViewKeyDetail(k)}>
                                        <Eye className="w-4 h-4 mr-2" />
                                        View Details
                                      </DropdownMenuItem>
                                      {k.status === 'active' && (
                                        <DropdownMenuItem
                                          className="text-red-600 focus:text-red-600"
                                          onClick={() => handleDeactivateKey(k.id)}
                                        >
                                          <Ban className="w-4 h-4 mr-2" />
                                          Deactivate
                                        </DropdownMenuItem>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Pagination */}
                      {keysTotal > keysPerPage && (
                        <div className="flex items-center justify-between mt-4">
                          <p className="text-xs text-muted-foreground">
                            Showing {((keysPage - 1) * keysPerPage) + 1}–{Math.min(keysPage * keysPerPage, keys.length)} of {keysTotal}
                          </p>
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={keysPage <= 1}
                              onClick={() => setKeysPage((p) => p - 1)}
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </Button>
                            {Array.from({ length: Math.min(Math.ceil(keys.length / keysPerPage), 5) }, (_, i) => (
                              <Button
                                key={i + 1}
                                variant={keysPage === i + 1 ? 'default' : 'outline'}
                                size="sm"
                                className="w-8 h-8 p-0"
                                onClick={() => setKeysPage(i + 1)}
                              >
                                {i + 1}
                              </Button>
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={keysPage >= Math.ceil(keys.length / keysPerPage)}
                              onClick={() => setKeysPage((p) => p + 1)}
                            >
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Key Detail Dialog */}
              <Dialog open={keyDetailOpen} onOpenChange={setKeyDetailOpen}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Activation Key Details</DialogTitle>
                    <DialogDescription>Full details for this activation key</DialogDescription>
                  </DialogHeader>
                  {selectedKey && (
                    <div className="space-y-4">
                      <div className="space-y-3">
                        {[
                          { label: 'Key', value: selectedKey.key, mono: true },
                          { label: 'Plan', value: selectedKey.planType },
                          { label: 'Duration', value: `${selectedKey.durationDays} days` },
                          { label: 'Status', value: selectedKey.status, badge: true },
                          { label: 'Linked Number', value: formatPhoneNumber(selectedKey.linkedNumber) },
                          { label: 'Created', value: formatDateTime(selectedKey.createdAt) },
                          { label: 'Activated At', value: formatDateTime(selectedKey.activatedAt) },
                          { label: 'Expires At', value: formatDateTime(selectedKey.expiresAt) },
                        ].map((item) => (
                          <div key={item.label} className="flex justify-between items-start gap-4">
                            <span className="text-sm text-muted-foreground shrink-0">{item.label}</span>
                            <div className="text-right">
                              {item.badge ? (
                                <Badge variant="outline" className={getStatusBadge(item.value)}>
                                  {item.value}
                                </Badge>
                              ) : item.mono ? (
                                <code className="text-xs font-mono bg-zinc-100 px-2 py-1 rounded">{item.value}</code>
                              ) : (
                                <span className="text-sm font-medium">{item.value}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <Separator />
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleCopyKey(selectedKey.key)}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Key
                        </Button>
                        {selectedKey.status === 'active' && (
                          <Button
                            variant="destructive"
                            className="flex-1"
                            onClick={() => {
                              handleDeactivateKey(selectedKey.id);
                              setKeyDetailOpen(false);
                            }}
                          >
                            <Ban className="w-4 h-4 mr-2" />
                            Deactivate
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </TabsContent>

            {/* ═══════════════════ CUSTOMERS TAB ═════════════════════════════ */}
            <TabsContent value="customers" className="space-y-6">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <CardTitle className="text-base font-semibold">Customers</CardTitle>
                    <div className="flex flex-wrap gap-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Search by name or number..."
                          value={usersSearch}
                          onChange={(e) => setUsersSearch(e.target.value)}
                          className="pl-9 w-[220px] h-9"
                        />
                      </div>
                      <Select value={usersPlanFilter} onValueChange={setUsersPlanFilter}>
                        <SelectTrigger className="w-[120px] h-9">
                          <SelectValue placeholder="Plan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Plans</SelectItem>
                          <SelectItem value="Basic">Basic</SelectItem>
                          <SelectItem value="Advance">Advance</SelectItem>
                          <SelectItem value="Premium">Premium</SelectItem>
                          <SelectItem value="FreeTrial">Free Trial</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={usersStatusFilter} onValueChange={setUsersStatusFilter}>
                        <SelectTrigger className="w-[120px] h-9">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {usersLoading ? (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : users.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
                      <p className="text-sm">No customers found</p>
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto rounded-lg border">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-zinc-50">
                              <TableHead className="text-xs font-semibold">Name</TableHead>
                              <TableHead className="text-xs font-semibold">WhatsApp Number</TableHead>
                              <TableHead className="text-xs font-semibold">Plan</TableHead>
                              <TableHead className="text-xs font-semibold">Status</TableHead>
                              <TableHead className="text-xs font-semibold hidden md:table-cell">Activated</TableHead>
                              <TableHead className="text-xs font-semibold hidden lg:table-cell">Expires</TableHead>
                              <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {paginatedUsers.map((u) => (
                              <TableRow key={u.id} className="hover:bg-zinc-50/50">
                                <TableCell className="font-medium text-sm">
                                  {u.name || '—'}
                                </TableCell>
                                <TableCell className="text-xs">
                                  <span className="flex items-center gap-1">
                                    <Phone className="w-3 h-3 text-muted-foreground" />
                                    {formatPhoneNumber(u.whatsappNumber)}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className={getPlanBadgeColor(u.planType)}>
                                    {u.planType}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className={
                                      u.isActive
                                        ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                                        : 'bg-zinc-100 text-zinc-600 border-zinc-300'
                                    }
                                  >
                                    {u.isActive ? 'Active' : 'Inactive'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground hidden md:table-cell">
                                  {formatDate(u.activatedAt)}
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">
                                  {formatDate(u.expiresAt)}
                                </TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <MoreHorizontal className="w-4 h-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleViewUserDetail(u)}>
                                        <Eye className="w-4 h-4 mr-2" />
                                        View Details
                                      </DropdownMenuItem>
                                      {u.isActive && (
                                        <DropdownMenuItem
                                          className="text-red-600 focus:text-red-600"
                                          onClick={() => handleDeactivateUser(u.id)}
                                        >
                                          <Ban className="w-4 h-4 mr-2" />
                                          Deactivate
                                        </DropdownMenuItem>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Pagination */}
                      {usersTotal > usersPerPage && (
                        <div className="flex items-center justify-between mt-4">
                          <p className="text-xs text-muted-foreground">
                            Showing {((usersPage - 1) * usersPerPage) + 1}–{Math.min(usersPage * usersPerPage, users.length)} of {usersTotal}
                          </p>
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={usersPage <= 1}
                              onClick={() => setUsersPage((p) => p - 1)}
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </Button>
                            {Array.from({ length: Math.min(Math.ceil(users.length / usersPerPage), 5) }, (_, i) => (
                              <Button
                                key={i + 1}
                                variant={usersPage === i + 1 ? 'default' : 'outline'}
                                size="sm"
                                className="w-8 h-8 p-0"
                                onClick={() => setUsersPage(i + 1)}
                              >
                                {i + 1}
                              </Button>
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={usersPage >= Math.ceil(users.length / usersPerPage)}
                              onClick={() => setUsersPage((p) => p + 1)}
                            >
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* User Detail Dialog */}
              <Dialog open={userDetailOpen} onOpenChange={setUserDetailOpen}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Customer Details</DialogTitle>
                    <DialogDescription>View and edit customer information</DialogDescription>
                  </DialogHeader>
                  {selectedUser && (
                    <div className="space-y-5">
                      {/* Current Info */}
                      <div className="bg-zinc-50 rounded-lg p-4 space-y-2.5">
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">Name</span>
                          <span className="text-sm font-medium">{selectedUser.name || '—'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">WhatsApp</span>
                          <span className="text-sm font-medium">{formatPhoneNumber(selectedUser.whatsappNumber)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">Email</span>
                          <span className="text-sm font-medium">{selectedUser.email || '—'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Current Plan</span>
                          <Badge variant="outline" className={getPlanBadgeColor(selectedUser.planType)}>
                            {selectedUser.planType}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">Status</span>
                          <Badge
                            variant="outline"
                            className={
                              selectedUser.isActive
                                ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                                : 'bg-zinc-100 text-zinc-600 border-zinc-300'
                            }
                          >
                            {selectedUser.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">Activated</span>
                          <span className="text-sm">{formatDateTime(selectedUser.activatedAt)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">Expires</span>
                          <span className="text-sm">{formatDateTime(selectedUser.expiresAt)}</span>
                        </div>
                      </div>

                      <Separator />

                      {/* Edit Fields */}
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium">Change Plan</Label>
                          <Select value={userEditPlan} onValueChange={setUserEditPlan}>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="FreeTrial">Free Trial</SelectItem>
                              <SelectItem value="Basic">Basic</SelectItem>
                              <SelectItem value="Advance">Advance</SelectItem>
                              <SelectItem value="Premium">Premium</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium">Custom Expiry Date</Label>
                          <Input
                            type="date"
                            value={userEditExpiry}
                            onChange={(e) => setUserEditExpiry(e.target.value)}
                          />
                        </div>
                      </div>

                      <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setUserDetailOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          onClick={handleUpdateUser}
                          disabled={userEditLoading}
                          className="bg-[#25D366] hover:bg-[#1da851] text-white"
                        >
                          {userEditLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                          Save Changes
                        </Button>
                      </DialogFooter>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </TabsContent>

            {/* ═══════════════════ PLANS TAB ══════════════════════════════════ */}
            <TabsContent value="plans" className="space-y-6">
              {plansLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(2)].map((_, i) => (
                    <Skeleton key={i} className="h-[400px] rounded-xl" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {editPlans &&
                    Object.entries(editPlans).map(([planType, plan]) => (
                      <Card
                        key={planType}
                        className={`relative overflow-hidden border-0 shadow-sm ${
                          planType === 'Advance' ? 'ring-2 ring-[#25D366]/30' : ''
                        }`}
                      >
                        {planType === 'Advance' && (
                          <div className="absolute top-0 right-0">
                            <Badge className="bg-[#25D366] text-white rounded-none rounded-bl-lg">
                              Popular
                            </Badge>
                          </div>
                        )}
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-bold">{plan.displayName || planType}</CardTitle>
                            <div className="flex items-center gap-2">
                              <Label htmlFor={`active-${planType}`} className="text-xs text-muted-foreground">
                                Active
                              </Label>
                              <Switch
                                id={`active-${planType}`}
                                checked={plan.isActive ?? true}
                                onCheckedChange={(checked) =>
                                  setEditPlans((prev) => ({
                                    ...prev,
                                    [planType]: { ...prev[planType], isActive: checked },
                                  }))
                                }
                              />
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Pricing */}
                          <div className="space-y-2">
                            <div className="space-y-1.5">
                              <Label className="text-xs font-medium text-muted-foreground">Monthly Price (₹)</Label>
                              <Input
                                type="number"
                                value={plan.monthlyPrice ?? ''}
                                onChange={(e) =>
                                  setEditPlans((prev) => ({
                                    ...prev,
                                    [planType]: {
                                      ...prev[planType],
                                      monthlyPrice: parseFloat(e.target.value) || 0,
                                    },
                                  }))
                                }
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs font-medium text-muted-foreground">Annual Price (₹)</Label>
                              <Input
                                type="number"
                                value={plan.annualPrice ?? ''}
                                onChange={(e) =>
                                  setEditPlans((prev) => ({
                                    ...prev,
                                    [planType]: {
                                      ...prev[planType],
                                      annualPrice: parseFloat(e.target.value) || 0,
                                    },
                                  }))
                                }
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs font-medium text-muted-foreground">Daily Message Limit</Label>
                              <Input
                                type="number"
                                value={plan.dailyMessageLimit ?? ''}
                                onChange={(e) =>
                                  setEditPlans((prev) => ({
                                    ...prev,
                                    [planType]: {
                                      ...prev[planType],
                                      dailyMessageLimit: parseInt(e.target.value) || 0,
                                    },
                                  }))
                                }
                              />
                            </div>
                          </div>

                          {/* Display Name */}
                          <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-muted-foreground">Display Name</Label>
                            <Input
                              value={plan.displayName ?? ''}
                              onChange={(e) =>
                                setEditPlans((prev) => ({
                                  ...prev,
                                  [planType]: { ...prev[planType], displayName: e.target.value },
                                }))
                              }
                            />
                          </div>

                          {/* Price Summary */}
                          <div className="bg-zinc-50 rounded-lg p-3 space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Monthly</span>
                              <span className="font-semibold">{formatCurrency(plan.monthlyPrice ?? 0)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Annual</span>
                              <span className="font-semibold">{formatCurrency(plan.annualPrice ?? 0)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Daily Limit</span>
                              <span className="font-semibold">{plan.dailyMessageLimit ?? 0} msgs/day</span>
                            </div>
                          </div>

                          <Button
                            className="w-full bg-[#25D366] hover:bg-[#1da851] text-white"
                            onClick={() => handleSavePlan(planType)}
                            disabled={savingPlan === planType}
                          >
                            {savingPlan === planType && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Save Plan
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </TabsContent>

            {/* ═══════════════════ FEATURES TAB ══════════════════════════════ */}
            <TabsContent value="features" className="space-y-6">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold">Feature Matrix</CardTitle>
                      <CardDescription>Toggle features per plan and globally</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAddFeatureDialog(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Feature
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {featuresLoading ? (
                    <div className="space-y-3">
                      {[...Array(8)].map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-lg border">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-zinc-50">
                            <TableHead className="text-xs font-semibold min-w-[180px]">Feature</TableHead>
                            {featurePlans.map((p) => (
                              <TableHead key={p.planType} className="text-xs font-semibold text-center">
                                {p.displayName || p.planType}
                              </TableHead>
                            ))}
                            <TableHead className="text-xs font-semibold text-center">Global Active</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {features.map((feature) => (
                            <TableRow key={feature.id} className="hover:bg-zinc-50/50">
                              <TableCell>
                                <div>
                                  <span className="text-sm font-medium">{feature.displayName}</span>
                                  <p className="text-xs text-muted-foreground">{feature.featureKey}</p>
                                </div>
                              </TableCell>
                              {featurePlans.map((plan) => {
                                const isLoading = featureToggleLoading === `${plan.planType}-${feature.featureKey}`;
                                const isEnabled = feature.plans[plan.planType] ?? false;
                                return (
                                  <TableCell key={plan.planType} className="text-center">
                                    {isLoading ? (
                                      <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                    ) : (
                                      <Switch
                                        checked={isEnabled}
                                        onCheckedChange={(checked) =>
                                          handleToggleFeatureAccess(plan.planType, feature.featureKey, checked)
                                        }
                                      />
                                    )}
                                  </TableCell>
                                );
                              })}
                              <TableCell className="text-center">
                                {featureToggleLoading === feature.featureKey ? (
                                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                ) : (
                                  <Switch
                                    checked={feature.isActive}
                                    onCheckedChange={(checked) =>
                                      handleToggleFeatureActive(feature.featureKey, checked)
                                    }
                                  />
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Add Feature Dialog */}
              <Dialog open={addFeatureDialog} onOpenChange={setAddFeatureDialog}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Feature</DialogTitle>
                    <DialogDescription>Add a new feature to the system</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label>Feature Key</Label>
                      <Input
                        placeholder="e.g., newFeature"
                        value={newFeatureKey}
                        onChange={(e) => setNewFeatureKey(e.target.value.replace(/\s+/g, '').replace(/^[A-Z]/, (c) => c.toLowerCase()))}
                      />
                      <p className="text-xs text-muted-foreground">Use camelCase, e.g. quickReplies</p>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Display Name</Label>
                      <Input
                        placeholder="e.g., Quick Replies"
                        value={newFeatureName}
                        onChange={(e) => setNewFeatureName(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => setAddFeatureDialog(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddFeature}
                      disabled={addFeatureLoading}
                      className="bg-[#25D366] hover:bg-[#1da851] text-white"
                    >
                      {addFeatureLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Add Feature
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>

            {/* ═══════════════════ ACTIVITY TAB ══════════════════════════════ */}
            <TabsContent value="activity" className="space-y-6">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <CardTitle className="text-base font-semibold">Activity Log</CardTitle>
                    <Select value={activityFilter} onValueChange={setActivityFilter}>
                      <SelectTrigger className="w-[180px] h-9">
                        <SelectValue placeholder="All Actions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Actions</SelectItem>
                        <SelectItem value="key_deactivated">Key Deactivated</SelectItem>
                        <SelectItem value="user_updated">User Updated</SelectItem>
                        <SelectItem value="payment_approved">Payment Approved</SelectItem>
                        <SelectItem value="payment_submitted">Payment Submitted</SelectItem>
                        <SelectItem value="key_activated">Key Activated</SelectItem>
                        <SelectItem value="feature_override">Feature Override</SelectItem>
                        <SelectItem value="user_registered">User Registered</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  {activityLoading ? (
                    <div className="space-y-3">
                      {[...Array(8)].map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : activityLogs.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Activity className="w-10 h-10 mx-auto mb-3 opacity-40" />
                      <p className="text-sm">No activity logs found</p>
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto rounded-lg border">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-zinc-50">
                              <TableHead className="text-xs font-semibold">Timestamp</TableHead>
                              <TableHead className="text-xs font-semibold">Action</TableHead>
                              <TableHead className="text-xs font-semibold hidden md:table-cell">Details</TableHead>
                              <TableHead className="text-xs font-semibold hidden lg:table-cell">IP Address</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {activityLogs.map((log) => {
                              let detailsStr = log.details || '—';
                              try {
                                const parsed = JSON.parse(detailsStr);
                                detailsStr = Object.entries(parsed)
                                  .map(([k, v]) => `${k}: ${String(v).substring(0, 50)}`)
                                  .join(' | ');
                              } catch {
                                // keep original string
                              }
                              return (
                                <TableRow key={log.id} className="hover:bg-zinc-50/50">
                                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                    {formatDateTime(log.createdAt)}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="bg-zinc-100 text-zinc-700 border-zinc-200">
                                      {prettifyAction(log.action)}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-xs text-muted-foreground max-w-[300px] truncate hidden md:table-cell">
                                    {detailsStr}
                                  </TableCell>
                                  <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">
                                    {log.ipAddress || '—'}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Pagination */}
                      {activityTotal > activityPerPage && (
                        <div className="flex items-center justify-between mt-4">
                          <p className="text-xs text-muted-foreground">
                            Showing {((activityPage - 1) * activityPerPage) + 1}–{Math.min(activityPage * activityPerPage, activityTotal)} of {activityTotal}
                          </p>
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={activityPage <= 1}
                              onClick={() => setActivityPage((p) => p - 1)}
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </Button>
                            {Array.from(
                              { length: Math.min(Math.ceil(activityTotal / activityPerPage), 5) },
                              (_, i) => (
                                <Button
                                  key={i + 1}
                                  variant={activityPage === i + 1 ? 'default' : 'outline'}
                                  size="sm"
                                  className="w-8 h-8 p-0"
                                  onClick={() => setActivityPage(i + 1)}
                                >
                                  {i + 1}
                                </Button>
                              )
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={activityPage >= Math.ceil(activityTotal / activityPerPage)}
                              onClick={() => setActivityPage((p) => p + 1)}
                            >
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ═══════════════════ SETTINGS TAB ══════════════════════════════ */}
            <TabsContent value="settings" className="space-y-6">
              {configLoading ? (
                <div className="space-y-6">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-[300px] rounded-xl" />
                  ))}
                </div>
              ) : (
                <>
                  {/* Currency Settings Card */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                          <DollarSign className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <CardTitle className="text-base font-semibold">Currency Settings</CardTitle>
                          <CardDescription>Choose the display currency for prices</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-medium text-muted-foreground">Display Currency</Label>
                          <Select
                            value={currency}
                            onValueChange={async (val) => {
                              setCurrency(val);
                              setCurrencyLoading(true);
                              await handleSaveConfig('currency', val);
                              setCurrencyLoading(false);
                            }}
                          >
                            <SelectTrigger className="w-full">
                              {currencyLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <SelectValue />
                              )}
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PKR">PKR (Rs.)</SelectItem>
                              <SelectItem value="USD">USD ($)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-medium text-muted-foreground">Current Selection</Label>
                          <div className="flex items-center gap-2 h-10 px-3 rounded-md border bg-zinc-50">
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                              {currency === 'PKR' ? '🇵🇰 PKR (Rs.)' : '🇺🇸 USD ($)'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Globe className="w-3 h-3" />
                        Changes affect how prices are displayed in the extension
                      </p>
                    </CardContent>
                  </Card>

                  {/* Payment Info Card */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                          <CreditCard className="w-4 h-4 text-amber-600" />
                        </div>
                        <div>
                          <CardTitle className="text-base font-semibold">Payment Information</CardTitle>
                          <CardDescription>Payment details shown to customers</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Payment Account Number */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">Payment Account Number</Label>
                        <div className="flex gap-2">
                          <Input
                            value={editPaymentAccount}
                            onChange={(e) => setEditPaymentAccount(e.target.value)}
                            placeholder="e.g., 1234-5678-9012"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleSaveConfig('payment_account_number', editPaymentAccount)}
                            disabled={configSaving === 'payment_account_number'}
                            className="bg-[#25D366] hover:bg-[#1da851] text-white shrink-0"
                          >
                            {configSaving === 'payment_account_number' ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              'Save'
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Payment Account Title */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">Payment Account Title</Label>
                        <div className="flex gap-2">
                          <Input
                            value={editPaymentTitle}
                            onChange={(e) => setEditPaymentTitle(e.target.value)}
                            placeholder="e.g., WhatFlow CRM"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleSaveConfig('payment_account_title', editPaymentTitle)}
                            disabled={configSaving === 'payment_account_title'}
                            className="bg-[#25D366] hover:bg-[#1da851] text-white shrink-0"
                          >
                            {configSaving === 'payment_account_title' ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              'Save'
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Support Phone */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">Support Phone</Label>
                        <div className="flex gap-2">
                          <Input
                            value={editSupportPhone}
                            onChange={(e) => setEditSupportPhone(e.target.value)}
                            placeholder="e.g., +92 300 1234567"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleSaveConfig('support_phone', editSupportPhone)}
                            disabled={configSaving === 'support_phone'}
                            className="bg-[#25D366] hover:bg-[#1da851] text-white shrink-0"
                          >
                            {configSaving === 'support_phone' ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              'Save'
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Admin API Config Card */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center">
                          <Zap className="w-4 h-4 text-sky-600" />
                        </div>
                        <div>
                          <CardTitle className="text-base font-semibold">Admin API Configuration</CardTitle>
                          <CardDescription>Server configuration settings</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">ADMIN_SERVER_URL</Label>
                        <div className="flex items-center gap-2 h-10 px-3 rounded-md border bg-zinc-50">
                          <code className="text-sm font-mono text-zinc-700 truncate">
                            {systemConfig.ADMIN_SERVER_URL || process.env.NEXT_PUBLIC_ADMIN_SERVER_URL || 'Not configured'}
                          </code>
                        </div>
                        <p className="text-xs text-muted-foreground">Read-only — configured via environment variables</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Privacy & Data Usage Card */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
                          <Lock className="w-4 h-4 text-rose-600" />
                        </div>
                        <div>
                          <CardTitle className="text-base font-semibold">Privacy & Data Usage</CardTitle>
                          <CardDescription>Data handling practices and compliance information</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Data Collection</span>
                        </div>
                        <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1 ml-6">
                          <li>Phone numbers stored for CRM messaging purposes</li>
                          <li>Campaign data including send status and delivery reports</li>
                          <li>Lead information (name, email, status, source, notes)</li>
                          <li>Activation key usage and subscription data</li>
                        </ul>
                      </div>
                      <Separator />
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Info className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Data Usage</span>
                        </div>
                        <p className="text-xs text-muted-foreground">All collected data is used exclusively for CRM functionality — managing customer communications, tracking campaigns, and providing the WhatFlow CRM service. Data is never sold or shared with third parties.</p>
                      </div>
                      <Separator />
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                          <span className="text-sm font-medium">Consent Reminder</span>
                        </div>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                          <p className="text-xs text-amber-800 font-medium">Users should only message customers who have provided explicit consent to receive communications. Always obtain permission before adding numbers to campaigns.</p>
                        </div>
                      </div>
                      <Separator />
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Ban className="w-4 h-4 text-red-500" />
                          <span className="text-sm font-medium">Opt-Out Handling</span>
                        </div>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-xs text-red-800 font-medium">When a customer asks to stop receiving messages, add their number to the Blacklist (Do Not Message list) immediately. This ensures compliance and respects customer preferences.</p>
                        </div>
                      </div>
                      <Separator />
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-500" />
                          <span className="text-sm font-medium">Data Security</span>
                        </div>
                        <p className="text-xs text-muted-foreground">All data is encrypted at rest and in transit. Only authorized admins can access customer data. Regular security audits are performed to ensure data protection compliance.</p>
                      </div>
                      <Separator />
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Data Retention</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Customer data is retained for the duration of the active subscription and for 90 days after subscription ends. Campaign data is retained for 1 year. Users can request data deletion at any time by contacting support.</p>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            {/* ═══════════════════ LEADS TAB ══════════════════════════════════ */}
            <TabsContent value="leads" className="space-y-6">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#25D366]/10 flex items-center justify-center">
                        <Contact className="w-4 h-4 text-[#25D366]" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold">Lead Management</CardTitle>
                        <CardDescription>Track and manage customer leads</CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        className="bg-[#25D366] hover:bg-[#1da851] text-white"
                        onClick={() => { setEditingLead(null); setLeadForm({ phoneNumber: '', name: '', email: '', status: 'new', source: 'whatsapp', notes: '' }); setLeadDialogOpen(true); }}
                      >
                        <Plus className="w-4 h-4 mr-1.5" />
                        Add Lead
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input placeholder="Search phone, name, email..." value={leadsSearch} onChange={(e) => setLeadsSearch(e.target.value)} className="pl-9 w-[200px] h-9" />
                    </div>
                    <Select value={leadsStatusFilter} onValueChange={setLeadsStatusFilter}>
                      <SelectTrigger className="w-[160px] h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        {LEAD_STATUS_OPTIONS.map((s) => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}
                      </SelectContent>
                    </Select>
                    <Select value={leadsSourceFilter} onValueChange={setLeadsSourceFilter}>
                      <SelectTrigger className="w-[140px] h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sources</SelectItem>
                        {LEAD_SOURCE_OPTIONS.map((s) => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  {leadsLoading ? (
                    <div className="space-y-3">{[...Array(5)].map((_, i) => (<Skeleton key={i} className="h-12 w-full" />))}</div>
                  ) : leads.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Contact className="w-10 h-10 mx-auto mb-3 opacity-40" />
                      <p className="text-sm">No leads found</p>
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto rounded-lg border">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-zinc-50">
                              <TableHead className="text-xs font-semibold">Phone</TableHead>
                              <TableHead className="text-xs font-semibold">Name</TableHead>
                              <TableHead className="text-xs font-semibold">Status</TableHead>
                              <TableHead className="text-xs font-semibold hidden md:table-cell">Source</TableHead>
                              <TableHead className="text-xs font-semibold hidden lg:table-cell">Last Message</TableHead>
                              <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {leads.map((l) => (
                              <TableRow key={l.id} className="hover:bg-zinc-50/50">
                                <TableCell className="text-xs"><span className="flex items-center gap-1"><Phone className="w-3 h-3 text-muted-foreground" />{formatPhoneNumber(l.phoneNumber)}</span></TableCell>
                                <TableCell className="text-sm font-medium">{l.name || '—'}</TableCell>
                                <TableCell>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Badge variant="outline" className={`cursor-pointer ${LEAD_STATUS_COLOR_MAP[l.status] || 'bg-zinc-100 text-zinc-700 border-zinc-300'}`}>
                                        {l.statusDisplayName || l.status} <ChevronDown className="w-3 h-3 ml-1" />
                                      </Badge>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                      {LEAD_STATUS_OPTIONS.map((s) => (
                                        <DropdownMenuItem key={s.value} onClick={() => handleQuickStatusChange(l, s.value)}>{s.label}</DropdownMenuItem>
                                      ))}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground hidden md:table-cell capitalize">{l.source || '—'}</TableCell>
                                <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">{formatDateTime(l.lastMessageAt)}</TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreHorizontal className="w-4 h-4" /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => { setEditingLead(l); setLeadForm({ phoneNumber: l.phoneNumber, name: l.name || '', email: l.email || '', status: l.status, source: l.source || 'whatsapp', notes: l.notes || '' }); setLeadDialogOpen(true); }}>
                                        <Pencil className="w-4 h-4 mr-2" />Edit Lead
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => setDeleteLeadDialog(l.id)}>
                                        <Trash2 className="w-4 h-4 mr-2" />Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      {leadsTotal > leadsPerPage && (
                        <div className="flex items-center justify-between mt-4">
                          <p className="text-xs text-muted-foreground">Showing {((leadsPage - 1) * leadsPerPage) + 1}–{Math.min(leadsPage * leadsPerPage, leadsTotal)} of {leadsTotal}</p>
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm" disabled={leadsPage <= 1} onClick={() => setLeadsPage((p) => p - 1)}><ChevronLeft className="w-4 h-4" /></Button>
                            <Button variant="outline" size="sm" disabled={leadsPage >= Math.ceil(leadsTotal / leadsPerPage)} onClick={() => setLeadsPage((p) => p + 1)}><ChevronRight className="w-4 h-4" /></Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
              {/* Lead Dialog */}
              <Dialog open={leadDialogOpen} onOpenChange={setLeadDialogOpen}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>{editingLead ? 'Edit Lead' : 'Add Lead'}</DialogTitle>
                    <DialogDescription>{editingLead ? 'Update lead information' : 'Add a new lead to the system'}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Phone Number *</Label>
                      <Input value={leadForm.phoneNumber} onChange={(e) => setLeadForm({ ...leadForm, phoneNumber: e.target.value })} placeholder="+92 300 1234567" disabled={!!editingLead} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Name</Label>
                      <Input value={leadForm.name} onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })} placeholder="Customer name" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Email</Label>
                      <Input type="email" value={leadForm.email} onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })} placeholder="email@example.com" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Status</Label>
                        <Select value={leadForm.status} onValueChange={(v) => setLeadForm({ ...leadForm, status: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{LEAD_STATUS_OPTIONS.map((s) => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}</SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Source</Label>
                        <Select value={leadForm.source} onValueChange={(v) => setLeadForm({ ...leadForm, source: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{LEAD_SOURCE_OPTIONS.map((s) => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}</SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Notes</Label>
                      <Textarea value={leadForm.notes} onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })} placeholder="Additional notes..." rows={3} />
                    </div>
                  </div>
                  <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => setLeadDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveLead} disabled={leadSaving} className="bg-[#25D366] hover:bg-[#1da851] text-white">
                      {leadSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{editingLead ? 'Update' : 'Add'} Lead
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              {/* Delete Lead Confirm */}
              <Dialog open={!!deleteLeadDialog} onOpenChange={() => setDeleteLeadDialog(null)}>
                <DialogContent className="sm:max-w-sm">
                  <DialogHeader><DialogTitle>Delete Lead</DialogTitle><DialogDescription>Are you sure you want to delete this lead? This action cannot be undone.</DialogDescription></DialogHeader>
                  <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => setDeleteLeadDialog(null)}>Cancel</Button>
                    <Button variant="destructive" onClick={() => deleteLeadDialog && handleDeleteLead(deleteLeadDialog)}>Delete</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>

            {/* ═══════════════════ REMINDERS TAB ══════════════════════════════ */}
            <TabsContent value="reminders" className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { title: 'Pending', value: reminderSummary.pending, icon: Clock, color: 'bg-blue-50', textColor: 'text-blue-600', badge: 'bg-blue-100 text-blue-700' },
                  { title: 'Overdue', value: reminderSummary.overdue, icon: AlertTriangle, color: 'bg-red-50', textColor: 'text-red-600', badge: 'bg-red-100 text-red-700' },
                  { title: 'Completed Today', value: reminderSummary.completedToday, icon: Check, color: 'bg-emerald-50', textColor: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700' },
                ].map((s) => (
                  <Card key={s.title} className="border-0 shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center shrink-0`}>
                        <s.icon className={`w-5 h-5 ${s.textColor}`} />
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{s.value}</div>
                        <p className="text-xs text-muted-foreground">{s.title}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Bell className="w-4 h-4 text-blue-600" />
                      </div>
                      <CardTitle className="text-base font-semibold">Follow-up Reminders</CardTitle>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Select value={remindersStatusFilter} onValueChange={setRemindersStatusFilter}>
                        <SelectTrigger className="w-[140px] h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="overdue">Overdue</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button size="sm" className="bg-[#25D366] hover:bg-[#1da851] text-white" onClick={() => { setEditingReminder(null); setReminderForm({ phoneNumber: '', reminderDate: '', reminderTime: '', note: '' }); setReminderDialogOpen(true); }}>
                        <Plus className="w-4 h-4 mr-1.5" />Add Reminder
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {remindersLoading ? (
                    <div className="space-y-3">{[...Array(5)].map((_, i) => (<Skeleton key={i} className="h-12 w-full" />))}</div>
                  ) : reminders.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Bell className="w-10 h-10 mx-auto mb-3 opacity-40" />
                      <p className="text-sm">No reminders found</p>
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto rounded-lg border">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-zinc-50">
                              <TableHead className="text-xs font-semibold">Phone</TableHead>
                              <TableHead className="text-xs font-semibold">Lead Name</TableHead>
                              <TableHead className="text-xs font-semibold">Date/Time</TableHead>
                              <TableHead className="text-xs font-semibold hidden md:table-cell">Note</TableHead>
                              <TableHead className="text-xs font-semibold">Status</TableHead>
                              <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {reminders.map((r) => (
                              <TableRow key={r.id} className="hover:bg-zinc-50/50">
                                <TableCell className="text-xs"><span className="flex items-center gap-1"><Phone className="w-3 h-3 text-muted-foreground" />{formatPhoneNumber(r.phoneNumber)}</span></TableCell>
                                <TableCell className="text-sm font-medium">{r.leadName || '—'}</TableCell>
                                <TableCell className="text-xs">
                                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-muted-foreground" />{r.reminderDate} {r.reminderTime}</span>
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground hidden md:table-cell max-w-[200px] truncate">{r.note || '—'}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className={REMINDER_STATUS_COLORS[r.status] || 'bg-zinc-100 text-zinc-700 border-zinc-300'}>{r.status}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreHorizontal className="w-4 h-4" /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      {r.status !== 'completed' && (
                                        <DropdownMenuItem onClick={() => handleMarkReminderComplete(r.id)}><Check className="w-4 h-4 mr-2" />Mark Complete</DropdownMenuItem>
                                      )}
                                      <DropdownMenuItem onClick={() => { setEditingReminder(r); setReminderForm({ phoneNumber: r.phoneNumber, reminderDate: r.reminderDate, reminderTime: r.reminderTime, note: r.note || '' }); setReminderDialogOpen(true); }}><Pencil className="w-4 h-4 mr-2" />Reschedule</DropdownMenuItem>
                                      <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => setDeleteReminderDialog(r.id)}><Trash2 className="w-4 h-4 mr-2" />Delete</DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      {remindersTotal > remindersPerPage && (
                        <div className="flex items-center justify-between mt-4">
                          <p className="text-xs text-muted-foreground">Showing {((remindersPage - 1) * remindersPerPage) + 1}–{Math.min(remindersPage * remindersPerPage, remindersTotal)} of {remindersTotal}</p>
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm" disabled={remindersPage <= 1} onClick={() => setRemindersPage((p) => p - 1)}><ChevronLeft className="w-4 h-4" /></Button>
                            <Button variant="outline" size="sm" disabled={remindersPage >= Math.ceil(remindersTotal / remindersPerPage)} onClick={() => setRemindersPage((p) => p + 1)}><ChevronRight className="w-4 h-4" /></Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
              {/* Reminder Dialog */}
              <Dialog open={reminderDialogOpen} onOpenChange={setReminderDialogOpen}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>{editingReminder ? 'Reschedule Reminder' : 'Add Reminder'}</DialogTitle>
                    <DialogDescription>{editingReminder ? 'Update reminder date/time' : 'Create a new follow-up reminder'}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Phone Number *</Label>
                      <Input value={reminderForm.phoneNumber} onChange={(e) => setReminderForm({ ...reminderForm, phoneNumber: e.target.value })} placeholder="+92 300 1234567" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Date *</Label>
                        <Input type="date" value={reminderForm.reminderDate} onChange={(e) => setReminderForm({ ...reminderForm, reminderDate: e.target.value })} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Time *</Label>
                        <Input type="time" value={reminderForm.reminderTime} onChange={(e) => setReminderForm({ ...reminderForm, reminderTime: e.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Note</Label>
                      <Textarea value={reminderForm.note} onChange={(e) => setReminderForm({ ...reminderForm, note: e.target.value })} placeholder="Reminder note..." rows={3} />
                    </div>
                  </div>
                  <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => setReminderDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveReminder} disabled={reminderSaving} className="bg-[#25D366] hover:bg-[#1da851] text-white">
                      {reminderSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{editingReminder ? 'Update' : 'Add'} Reminder
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              {/* Delete Reminder Confirm */}
              <Dialog open={!!deleteReminderDialog} onOpenChange={() => setDeleteReminderDialog(null)}>
                <DialogContent className="sm:max-w-sm">
                  <DialogHeader><DialogTitle>Delete Reminder</DialogTitle><DialogDescription>Are you sure? This action cannot be undone.</DialogDescription></DialogHeader>
                  <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => setDeleteReminderDialog(null)}>Cancel</Button>
                    <Button variant="destructive" onClick={() => deleteReminderDialog && handleDeleteReminder(deleteReminderDialog)}>Delete</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>

            {/* ═══════════════════ BLACKLIST TAB ══════════════════════════════ */}
            <TabsContent value="blacklist" className="space-y-6">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                        <Ban className="w-4 h-4 text-red-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold">Blacklisted Numbers</CardTitle>
                        <CardDescription>Do Not Message list — numbers that opted out or were blocked</CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" className="bg-[#25D366] hover:bg-[#1da851] text-white" onClick={() => { setBlacklistForm({ phoneNumber: '', reason: 'opted_out', notes: '' }); setBlacklistDialogOpen(true); }}>
                        <Plus className="w-4 h-4 mr-1.5" />Add Number
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { setBulkBlacklistForm({ numbers: '', reason: 'opted_out' }); setBulkBlacklistDialogOpen(true); }}>
                        <Plus className="w-4 h-4 mr-1.5" />Bulk Add
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input placeholder="Search phone or notes..." value={blacklistSearch} onChange={(e) => setBlacklistSearch(e.target.value)} className="pl-9 w-[200px] h-9" />
                    </div>
                    <Select value={blacklistReasonFilter} onValueChange={setBlacklistReasonFilter}>
                      <SelectTrigger className="w-[150px] h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Reasons</SelectItem>
                        {BLACKLIST_REASON_OPTIONS.map((r) => (<SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  {blacklistLoading ? (
                    <div className="space-y-3">{[...Array(5)].map((_, i) => (<Skeleton key={i} className="h-12 w-full" />))}</div>
                  ) : blacklist.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Ban className="w-10 h-10 mx-auto mb-3 opacity-40" />
                      <p className="text-sm">No blacklisted numbers</p>
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto rounded-lg border">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-zinc-50">
                              <TableHead className="text-xs font-semibold">Phone Number</TableHead>
                              <TableHead className="text-xs font-semibold">Reason</TableHead>
                              <TableHead className="text-xs font-semibold hidden md:table-cell">Added By</TableHead>
                              <TableHead className="text-xs font-semibold hidden lg:table-cell">Notes</TableHead>
                              <TableHead className="text-xs font-semibold hidden lg:table-cell">Date Added</TableHead>
                              <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {blacklist.map((b) => (
                              <TableRow key={b.id} className="hover:bg-zinc-50/50">
                                <TableCell className="text-xs"><span className="flex items-center gap-1"><Phone className="w-3 h-3 text-muted-foreground" />{formatPhoneNumber(b.phoneNumber)}</span></TableCell>
                                <TableCell>
                                  <Badge variant="outline" className={BLACKLIST_REASON_COLOR_MAP[b.reason] || 'bg-zinc-100 text-zinc-700 border-zinc-300'}>{b.reasonDisplayName || b.reason}</Badge>
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground hidden md:table-cell">{b.addedBy || '—'}</TableCell>
                                <TableCell className="text-xs text-muted-foreground hidden lg:table-cell max-w-[200px] truncate">{b.notes || '—'}</TableCell>
                                <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">{formatDateTime(b.createdAt)}</TableCell>
                                <TableCell className="text-right">
                                  <Button variant="ghost" size="sm" className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => setDeleteBlacklistDialog(b.id)}>
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      {blacklistTotal > blacklistPerPage && (
                        <div className="flex items-center justify-between mt-4">
                          <p className="text-xs text-muted-foreground">Showing {((blacklistPage - 1) * blacklistPerPage) + 1}–{Math.min(blacklistPage * blacklistPerPage, blacklistTotal)} of {blacklistTotal}</p>
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm" disabled={blacklistPage <= 1} onClick={() => setBlacklistPage((p) => p - 1)}><ChevronLeft className="w-4 h-4" /></Button>
                            <Button variant="outline" size="sm" disabled={blacklistPage >= Math.ceil(blacklistTotal / blacklistPerPage)} onClick={() => setBlacklistPage((p) => p + 1)}><ChevronRight className="w-4 h-4" /></Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
              {/* Add Blacklist Dialog */}
              <Dialog open={blacklistDialogOpen} onOpenChange={setBlacklistDialogOpen}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader><DialogTitle>Add to Blacklist</DialogTitle><DialogDescription>Add a number to the Do Not Message list</DialogDescription></DialogHeader>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Phone Number *</Label>
                      <Input value={blacklistForm.phoneNumber} onChange={(e) => setBlacklistForm({ ...blacklistForm, phoneNumber: e.target.value })} placeholder="+92 300 1234567" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Reason</Label>
                      <Select value={blacklistForm.reason} onValueChange={(v) => setBlacklistForm({ ...blacklistForm, reason: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{BLACKLIST_REASON_OPTIONS.map((r) => (<SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>))}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Notes</Label>
                      <Textarea value={blacklistForm.notes} onChange={(e) => setBlacklistForm({ ...blacklistForm, notes: e.target.value })} placeholder="Optional notes..." rows={2} />
                    </div>
                  </div>
                  <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => setBlacklistDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddBlacklist} disabled={blacklistSaving} className="bg-[#25D366] hover:bg-[#1da851] text-white">
                      {blacklistSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Add to Blacklist
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              {/* Bulk Blacklist Dialog */}
              <Dialog open={bulkBlacklistDialogOpen} onOpenChange={setBulkBlacklistDialogOpen}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader><DialogTitle>Bulk Add to Blacklist</DialogTitle><DialogDescription>Add multiple numbers at once (one per line)</DialogDescription></DialogHeader>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Phone Numbers * <span className="text-muted-foreground">(one per line)</span></Label>
                      <Textarea value={bulkBlacklistForm.numbers} onChange={(e) => setBulkBlacklistForm({ ...bulkBlacklistForm, numbers: e.target.value })} placeholder={"+92 300 1234567\n+92 301 7654321\n+91 98765 43210"} rows={6} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Reason</Label>
                      <Select value={bulkBlacklistForm.reason} onValueChange={(v) => setBulkBlacklistForm({ ...bulkBlacklistForm, reason: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{BLACKLIST_REASON_OPTIONS.map((r) => (<SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>))}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => setBulkBlacklistDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleBulkBlacklist} disabled={blacklistSaving} className="bg-[#25D366] hover:bg-[#1da851] text-white">
                      {blacklistSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Bulk Add
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              {/* Remove Blacklist Confirm */}
              <Dialog open={!!deleteBlacklistDialog} onOpenChange={() => setDeleteBlacklistDialog(null)}>
                <DialogContent className="sm:max-w-sm">
                  <DialogHeader><DialogTitle>Remove from Blacklist</DialogTitle><DialogDescription>Are you sure? This number will be able to receive messages again.</DialogDescription></DialogHeader>
                  <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => setDeleteBlacklistDialog(null)}>Cancel</Button>
                    <Button variant="destructive" onClick={() => deleteBlacklistDialog && handleRemoveBlacklist(deleteBlacklistDialog)}>Remove</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>

            {/* ═══════════════════ CAMPAIGNS TAB ══════════════════════════════ */}
            <TabsContent value="campaigns" className="space-y-6">
              {/* Analytics Summary */}
              {campaignAnalytics && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { title: 'Total Campaigns', value: campaignAnalytics.totalCampaigns, color: 'bg-zinc-50 text-zinc-700' },
                    { title: 'Running', value: campaignAnalytics.runningCampaigns, color: 'bg-emerald-50 text-emerald-700' },
                    { title: 'Completed', value: campaignAnalytics.completedCampaigns, color: 'bg-blue-50 text-blue-700' },
                    { title: 'Paused', value: campaignAnalytics.pausedCampaigns, color: 'bg-amber-50 text-amber-700' },
                    { title: 'Total Sent', value: campaignAnalytics.totalSent, color: 'bg-sky-50 text-sky-700' },
                    { title: 'Total Failed', value: campaignAnalytics.totalFailed, color: 'bg-red-50 text-red-700' },
                    { title: 'Avg Delivery Rate', value: `${(campaignAnalytics.avgDeliveryRate * 100).toFixed(1)}%`, color: 'bg-violet-50 text-violet-700' },
                    { title: 'Avg Response Rate', value: `${(campaignAnalytics.avgResponseRate * 100).toFixed(1)}%`, color: 'bg-pink-50 text-pink-700' },
                  ].map((s) => (
                    <Card key={s.title} className="border-0 shadow-sm">
                      <CardContent className={`p-4 rounded-lg ${s.color}`}>
                        <div className="text-lg font-bold">{s.value}</div>
                        <p className="text-xs opacity-70">{s.title}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                        <BarChart3 className="w-4 h-4 text-violet-600" />
                      </div>
                      <CardTitle className="text-base font-semibold">Campaigns</CardTitle>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input placeholder="Search campaigns..." value={campaignsSearch} onChange={(e) => setCampaignsSearch(e.target.value)} className="pl-9 w-[180px] h-9" />
                      </div>
                      <Select value={campaignsStatusFilter} onValueChange={setCampaignsStatusFilter}>
                        <SelectTrigger className="w-[130px] h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="running">Running</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="paused">Paused</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {campaignsLoading ? (
                    <div className="space-y-3">{[...Array(5)].map((_, i) => (<Skeleton key={i} className="h-12 w-full" />))}</div>
                  ) : campaigns.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-40" />
                      <p className="text-sm">No campaigns found</p>
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto rounded-lg border">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-zinc-50">
                              <TableHead className="text-xs font-semibold">Name</TableHead>
                              <TableHead className="text-xs font-semibold">User</TableHead>
                              <TableHead className="text-xs font-semibold">Status</TableHead>
                              <TableHead className="text-xs font-semibold hidden md:table-cell">Numbers</TableHead>
                              <TableHead className="text-xs font-semibold hidden md:table-cell">Sent/Failed</TableHead>
                              <TableHead className="text-xs font-semibold hidden lg:table-cell">Response</TableHead>
                              <TableHead className="text-xs font-semibold hidden lg:table-cell">Created</TableHead>
                              <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {campaigns.map((c) => (
                              <TableRow key={c.id} className="hover:bg-zinc-50/50">
                                <TableCell className="text-sm font-medium">{c.name}</TableCell>
                                <TableCell className="text-xs">{c.userPhone ? formatPhoneNumber(c.userPhone) : '—'}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className={CAMPAIGN_STATUS_COLORS[c.status] || 'bg-zinc-100 text-zinc-700 border-zinc-300'}>{c.status}</Badge>
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground hidden md:table-cell">
                                  <div className="flex gap-1">
                                    <span title="Total">{c.totalNumbers}</span>
                                    <span className="text-emerald-600" title="Valid">✓{c.validNumbers}</span>
                                    <span className="text-red-500" title="Invalid">✗{c.invalidNumbers}</span>
                                    <span className="text-amber-600" title="Blacklisted">⊘{c.blacklistedNumbers}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-xs hidden md:table-cell">
                                  <span className="text-emerald-600">{c.sentCount}</span> / <span className="text-red-500">{c.failedCount}</span>
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">{c.responseRate !== null ? `${(c.responseRate * 100).toFixed(1)}%` : '—'}</TableCell>
                                <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">{formatDate(c.createdAt)}</TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreHorizontal className="w-4 h-4" /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleViewCampaignDetail(c)}><Eye className="w-4 h-4 mr-2" />View Detail</DropdownMenuItem>
                                      <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => setDeleteCampaignDialog(c.id)}><Trash2 className="w-4 h-4 mr-2" />Delete</DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      {campaignsTotal > campaignsPerPage && (
                        <div className="flex items-center justify-between mt-4">
                          <p className="text-xs text-muted-foreground">Showing {((campaignsPage - 1) * campaignsPerPage) + 1}–{Math.min(campaignsPage * campaignsPerPage, campaignsTotal)} of {campaignsTotal}</p>
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm" disabled={campaignsPage <= 1} onClick={() => setCampaignsPage((p) => p - 1)}><ChevronLeft className="w-4 h-4" /></Button>
                            <Button variant="outline" size="sm" disabled={campaignsPage >= Math.ceil(campaignsTotal / campaignsPerPage)} onClick={() => setCampaignsPage((p) => p + 1)}><ChevronRight className="w-4 h-4" /></Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
              {/* Campaign Detail Dialog */}
              <Dialog open={campaignDetailOpen} onOpenChange={setCampaignDetailOpen}>
                <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Campaign Detail</DialogTitle>
                    <DialogDescription>Message-by-message status for this campaign</DialogDescription>
                  </DialogHeader>
                  {selectedCampaign && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { label: 'Total', value: selectedCampaign.totalNumbers, color: 'text-zinc-700' },
                          { label: 'Sent', value: selectedCampaign.sentCount, color: 'text-emerald-600' },
                          { label: 'Failed', value: selectedCampaign.failedCount, color: 'text-red-600' },
                          { label: 'Pending', value: selectedCampaign.pendingCount, color: 'text-amber-600' },
                        ].map((s) => (
                          <div key={s.label} className="bg-zinc-50 rounded-lg p-3 text-center">
                            <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                            <p className="text-xs text-muted-foreground">{s.label}</p>
                          </div>
                        ))}
                      </div>
                      {campaignMessagesLoading ? (
                        <div className="space-y-2">{[...Array(5)].map((_, i) => (<Skeleton key={i} className="h-10 w-full" />))}</div>
                      ) : (
                        <div className="overflow-x-auto rounded-lg border">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-zinc-50">
                                <TableHead className="text-xs">Phone</TableHead>
                                <TableHead className="text-xs">Status</TableHead>
                                <TableHead className="text-xs hidden sm:table-cell">Response</TableHead>
                                <TableHead className="text-xs hidden sm:table-cell">Failed Reason</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {campaignMessages.map((m) => (
                                <TableRow key={m.id} className="hover:bg-zinc-50/50">
                                  <TableCell className="text-xs">{formatPhoneNumber(m.phoneNumber)}</TableCell>
                                  <TableCell><Badge variant="outline" className={m.messageStatus === 'sent' ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : m.messageStatus === 'failed' ? 'bg-red-100 text-red-700 border-red-300' : 'bg-amber-100 text-amber-700 border-amber-300'}>{m.messageStatus}</Badge></TableCell>
                                  <TableCell className="text-xs hidden sm:table-cell">{m.responseReceived ? <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">Yes</Badge> : '—'}</TableCell>
                                  <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">{m.failedReason || '—'}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                  )}
                </DialogContent>
              </Dialog>
              {/* Delete Campaign Confirm */}
              <Dialog open={!!deleteCampaignDialog} onOpenChange={() => setDeleteCampaignDialog(null)}>
                <DialogContent className="sm:max-w-sm">
                  <DialogHeader><DialogTitle>Delete Campaign</DialogTitle><DialogDescription>Are you sure? This will delete the campaign and all its message records.</DialogDescription></DialogHeader>
                  <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => setDeleteCampaignDialog(null)}>Cancel</Button>
                    <Button variant="destructive" onClick={() => deleteCampaignDialog && handleDeleteCampaign(deleteCampaignDialog)}>Delete</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>

            {/* ═══════════════════ AI REPLIES TAB ════════════════════════════ */}
            <TabsContent value="ai-replies" className="space-y-6">
              {/* Admin Toggle */}
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">AI Replies for Users</p>
                      <p className="text-xs text-muted-foreground">Enable AI-powered reply suggestions for all users</p>
                    </div>
                  </div>
                  <Switch checked={aiEnabled} onCheckedChange={handleToggleAiEnabled} disabled={aiEnabledSaving} />
                </CardContent>
              </Card>

              {/* AI Panel */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#25D366]/10 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-[#25D366]" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold">AI Reply Testing</CardTitle>
                      <CardDescription>Test AI reply generation with different tones</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Mode Toggle */}
                  <div className="flex gap-2">
                    <Button variant={aiMode === 'suggest' ? 'default' : 'outline'} size="sm" onClick={() => { setAiMode('suggest'); setAiResults([]); setAiInput(''); }} className={aiMode === 'suggest' ? 'bg-[#25D366] hover:bg-[#1da851] text-white' : ''}>
                      <MessageSquare className="w-4 h-4 mr-1.5" />Suggest Replies
                    </Button>
                    <Button variant={aiMode === 'rewrite' ? 'default' : 'outline'} size="sm" onClick={() => { setAiMode('rewrite'); setAiResults([]); setAiInput(''); }} className={aiMode === 'rewrite' ? 'bg-[#25D366] hover:bg-[#1da851] text-white' : ''}>
                      <Pencil className="w-4 h-4 mr-1.5" />Rewrite Message
                    </Button>
                  </div>

                  {/* Input Area */}
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">{aiMode === 'suggest' ? 'Customer Message' : 'Draft Message'} *</Label>
                      <Textarea
                        value={aiInput}
                        onChange={(e) => setAiInput(e.target.value)}
                        placeholder={aiMode === 'suggest' ? "Paste the customer's message here..." : "Paste your draft message here..."}
                        rows={4}
                        className="resize-none"
                      />
                    </div>
                    {aiMode === 'suggest' && (
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Context <span className="text-muted-foreground">(optional)</span></Label>
                        <Input value={aiContext} onChange={(e) => setAiContext(e.target.value)} placeholder="e.g., Customer is asking about pricing for Basic plan" />
                      </div>
                    )}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Tone</Label>
                      <Select value={aiTone} onValueChange={setAiTone}>
                        <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                        <SelectContent>{AI_TONE_OPTIONS.map((t) => (<SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>))}</SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button onClick={handleGenerateAiReply} disabled={aiLoading || !aiInput.trim()} className="bg-[#25D366] hover:bg-[#1da851] text-white">
                    {aiLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                    {aiLoading ? 'Generating...' : 'Generate'}
                  </Button>

                  {/* Results */}
                  {aiResults.length > 0 && (
                    <div className="space-y-3">
                      <Separator />
                      <p className="text-sm font-medium">{aiMode === 'suggest' ? 'Suggested Replies' : 'Rewritten Message'}</p>
                      <div className="space-y-2">
                        {aiResults.map((result, idx) => (
                          <div key={idx} className="relative group bg-zinc-50 border rounded-lg p-4">
                            <p className="text-sm whitespace-pre-wrap pr-16">{result}</p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8"
                              onClick={() => handleCopyAiResult(result, idx)}
                            >
                              {aiCopiedIdx === idx ? <Check className="w-3 h-3 text-[#25D366]" /> : <Copy className="w-3 h-3" />}
                              {aiCopiedIdx === idx ? 'Copied' : 'Copy'}
                            </Button>
                            {aiMode === 'suggest' && (
                              <Badge variant="outline" className="absolute bottom-2 right-2 bg-white text-xs">Option {idx + 1}</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>

        {/* ─── Footer ───────────────────────────────────────────────────────── */}
        <footer className="mt-auto border-t bg-white">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">
                &copy; {new Date().getFullYear()} WhatFlow CRM. Admin Dashboard.
              </p>
              <p className="text-xs text-muted-foreground">
                Powered by{' '}
                <span className="text-[#25D366] font-medium">WhatsApp</span>{' '}
                Business API
              </p>
            </div>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}
