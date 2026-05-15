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
  'quick_replies',
  'translation',
  'time_gap_control',
  'random_gap',
  'batching',
  'caption',
  'templates',
  'delivery_report',
  'blur',
  'schedule',
  'business_chat_link',
  'export_contacts',
  'multiple_attachments',
  'stop_campaign',
  'group_export',
  'priority_support',
  'verify_numbers',
  'chat_support',
];

const FEATURE_DISPLAY_NAMES: Record<string, string> = {
  broadcasting: 'Broadcasting',
  attachments: 'Attachments',
  customization: 'Customization',
  quick_replies: 'Quick Replies',
  translation: 'Translation',
  time_gap_control: 'Time Gap Control',
  random_gap: 'Random Gap',
  batching: 'Batching',
  caption: 'Caption',
  templates: 'Templates',
  delivery_report: 'Delivery Report',
  blur: 'Blur',
  schedule: 'Schedule',
  business_chat_link: 'Business Chat Link',
  export_contacts: 'Export Contacts',
  multiple_attachments: 'Multiple Attachments',
  stop_campaign: 'Stop Campaign',
  group_export: 'Group Export',
  priority_support: 'Priority Support',
  verify_numbers: 'Verify Numbers',
  chat_support: 'Chat Support',
};

const STATUS_COLORS: Record<string, string> = {
  unused: 'bg-zinc-100 text-zinc-700 border-zinc-200',
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  expired: 'bg-amber-50 text-amber-700 border-amber-200',
  deactivated: 'bg-red-50 text-red-700 border-red-200',
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

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
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
    case 'Premium':
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

  // Key detail dialog
  const [selectedKey, setSelectedKey] = useState<ActivationKey | null>(null);
  const [keyDetailOpen, setKeyDetailOpen] = useState(false);

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

  // Reset page when filters change
  useEffect(() => { setKeysPage(1); }, [keysFilter, keysSearch]);
  useEffect(() => { setUsersPage(1); }, [usersSearch, usersPlanFilter, usersStatusFilter]);
  useEffect(() => { setActivityPage(1); }, [activityFilter]);

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
        body: JSON.stringify({ featureKey: newFeatureKey.trim(), isActive: true }),
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
                    value: stats ? formatCurrency(stats.revenue) : '—',
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
                                      {k.linkedNumber}
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
                          { label: 'Linked Number', value: selectedKey.linkedNumber || '—' },
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
                                    {u.whatsappNumber}
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
                          <span className="text-sm font-medium">{selectedUser.whatsappNumber}</span>
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
                        placeholder="e.g., new_feature"
                        value={newFeatureKey}
                        onChange={(e) => setNewFeatureKey(e.target.value.replace(/\s/g, '_').toLowerCase())}
                      />
                      <p className="text-xs text-muted-foreground">Use snake_case, e.g. quick_replies</p>
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
