"use client";

import { useMemo, useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StatCard, type StatCardDelta } from "@/components/admin/StatCard";
import { RevenueChart } from "@/components/admin/RevenueChart";
import {
  Plus, Edit2, Trash2, Download, LogOut, Loader2, Inbox, Upload,
  LayoutDashboard, Wallet, Mail, Users, CalendarCheck, Target, CalendarDays,
  Receipt, TrendingUp, Calculator, ArrowRight,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";

type CampaignStatus = "active" | "completed" | "paused";
type EventStatus = "upcoming" | "ongoing" | "completed";

const NAV_ITEMS = [
  { value: "overview", label: "Overview", icon: LayoutDashboard },
  { value: "donations", label: "Donations", icon: Wallet },
  { value: "contacts", label: "Contacts", icon: Mail },
  { value: "volunteers", label: "Volunteers", icon: Users },
  { value: "registrations", label: "Registrations", icon: CalendarCheck },
  { value: "campaigns", label: "Campaigns", icon: Target },
  { value: "events", label: "Events", icon: CalendarDays },
] as const;

const emptyCampaignForm = {
  title: "",
  description: "",
  imageUrl: "",
  targetAmount: "",
  status: "active" as CampaignStatus,
};

const emptyEventForm = {
  title: "",
  description: "",
  imageUrl: "",
  date: "",
  location: "",
  status: "upcoming" as EventStatus,
  webinarLink: "",
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1] ?? "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function ImageUploadField({ imageUrl, onChange }: { imageUrl: string; onChange: (url: string) => void }) {
  const [isUploading, setIsUploading] = useState(false);
  const uploadImageMutation = trpc.admin.uploadImage.useMutation();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.error("Image must be 3MB or smaller");
      return;
    }

    setIsUploading(true);
    try {
      const dataBase64 = await fileToBase64(file);
      const result = await uploadImageMutation.mutateAsync({ fileName: file.name, contentType: file.type, dataBase64 });
      onChange(result.url);
    } catch (error: any) {
      toast.error(error?.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {imageUrl && (
        <div className="relative">
          <img src={imageUrl} alt="" className="h-32 w-full rounded-md object-cover border border-border" />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={() => onChange("")}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )}
      <label className="flex items-center justify-center gap-2 border border-dashed border-border rounded-md py-3 text-sm text-muted-foreground cursor-pointer hover:bg-brand-cream-deep transition-colors">
        {isUploading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" /> {imageUrl ? "Replace image" : "Upload image"}
          </>
        )}
        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={isUploading} />
      </label>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
      <Inbox className="w-8 h-8" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString();
}

function formatAmount(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "₦0";
  const num = Number(value);
  return Number.isNaN(num) ? String(value) : `₦${num.toLocaleString()}`;
}

// Status → Badge variant mapping, per the dataviz skill's fixed status
// palette (good/warning/critical/neutral) — never a generic color, always
// tied to what the state actually means.
function campaignStatusVariant(status: string): "success" | "warning" | "neutral" {
  if (status === "active") return "success";
  if (status === "paused") return "warning";
  return "neutral"; // completed
}

function eventStatusVariant(status: string): "success" | "neutral" {
  if (status === "ongoing") return "success";
  return "neutral"; // upcoming / completed
}

function donationStatusVariant(status: string): "success" | "warning" | "critical" | "neutral" {
  if (status === "completed") return "success";
  if (status === "pending") return "warning";
  if (status === "failed") return "critical";
  return "neutral";
}

export default function AdminDashboard() {
  const { admin, logout, loading: authLoading, isAuthenticated } = useAdminAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [isCampaignDialogOpen, setIsCampaignDialogOpen] = useState(false);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const [campaignForm, setCampaignForm] = useState(emptyCampaignForm);
  const [eventForm, setEventForm] = useState(emptyEventForm);

  const utils = trpc.useUtils();

  const { data: contacts = [], isLoading: contactsLoading } = trpc.admin.getContacts.useQuery(undefined, { enabled: isAuthenticated });
  const { data: donations = [], isLoading: donationsLoading } = trpc.admin.getDonations.useQuery(undefined, { enabled: isAuthenticated });
  const { data: volunteers = [], isLoading: volunteersLoading } = trpc.admin.getVolunteers.useQuery(undefined, { enabled: isAuthenticated });
  const { data: campaigns = [], isLoading: campaignsLoading } = trpc.admin.getCampaigns.useQuery(undefined, { enabled: isAuthenticated });
  const { data: events = [], isLoading: eventsLoading } = trpc.admin.getEvents.useQuery(undefined, { enabled: isAuthenticated });
  const { data: registrations = [], isLoading: registrationsLoading } = trpc.admin.getEventRegistrations.useQuery(undefined, { enabled: isAuthenticated });

  // --- Revenue/overview stats, computed client-side from the already-fetched
  // donations list (no new server endpoint needed). ---
  const totalRevenue = useMemo(
    () => donations.reduce((sum, d) => sum + (Number(d.amount) || 0), 0),
    [donations]
  );

  const { thisMonthRevenue, lastMonthRevenue } = useMemo(() => {
    const now = new Date();
    const thisMonthKey = `${now.getFullYear()}-${now.getMonth()}`;
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthKey = `${lastMonthDate.getFullYear()}-${lastMonthDate.getMonth()}`;
    let thisMonth = 0;
    let lastMonth = 0;
    for (const d of donations) {
      const date = new Date(d.createdAt);
      if (Number.isNaN(date.getTime())) continue;
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const amount = Number(d.amount) || 0;
      if (key === thisMonthKey) thisMonth += amount;
      else if (key === lastMonthKey) lastMonth += amount;
    }
    return { thisMonthRevenue: thisMonth, lastMonthRevenue: lastMonth };
  }, [donations]);

  const revenueDelta = useMemo((): StatCardDelta | undefined => {
    if (lastMonthRevenue === 0) {
      if (thisMonthRevenue === 0) return undefined;
      return { label: "New this month", trend: "up" };
    }
    const pct = ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
    if (Math.abs(pct) < 1) return { label: "Flat vs last month", trend: "neutral" };
    return {
      label: `${pct > 0 ? "+" : ""}${pct.toFixed(0)}% vs last month`,
      trend: pct > 0 ? "up" : "down",
    };
  }, [thisMonthRevenue, lastMonthRevenue]);

  const averageDonation = donations.length > 0 ? Math.round(totalRevenue / donations.length) : 0;
  const activeCampaignsCount = campaigns.filter((c) => c.status === "active").length;
  const recentDonations = useMemo(() => donations.slice(0, 5), [donations]);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/admin-login";
  };

  const createCampaignMutation = trpc.admin.createCampaign.useMutation({
    onSuccess: () => {
      toast.success("Campaign created successfully!");
      setCampaignForm(emptyCampaignForm);
      setIsCampaignDialogOpen(false);
      utils.admin.getCampaigns.invalidate();
      utils.content.getCampaigns.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateCampaignMutation = trpc.admin.updateCampaign.useMutation({
    onSuccess: () => {
      toast.success("Campaign updated successfully!");
      setEditingCampaignId(null);
      setIsCampaignDialogOpen(false);
      utils.admin.getCampaigns.invalidate();
      utils.content.getCampaigns.invalidate();
    },
    onError: (error) => toast.error(error.message || "Error updating campaign"),
  });

  const deleteCampaignMutation = trpc.admin.deleteCampaign.useMutation({
    onSuccess: () => {
      toast.success("Campaign deleted successfully!");
      utils.admin.getCampaigns.invalidate();
      utils.content.getCampaigns.invalidate();
    },
    onError: (error) => toast.error(error.message || "Error deleting campaign"),
  });

  const createEventMutation = trpc.admin.createEvent.useMutation({
    onSuccess: () => {
      toast.success("Event created successfully!");
      setEventForm(emptyEventForm);
      setIsEventDialogOpen(false);
      utils.admin.getEvents.invalidate();
      utils.content.getEvents.invalidate();
    },
    onError: (error) => toast.error(error.message || "Error creating event"),
  });

  const updateEventMutation = trpc.admin.updateEvent.useMutation({
    onSuccess: () => {
      toast.success("Event updated successfully!");
      setEditingEventId(null);
      setIsEventDialogOpen(false);
      utils.admin.getEvents.invalidate();
      utils.content.getEvents.invalidate();
    },
    onError: (error) => toast.error(error.message || "Error updating event"),
  });

  const deleteEventMutation = trpc.admin.deleteEvent.useMutation({
    onSuccess: () => {
      toast.success("Event deleted successfully!");
      utils.admin.getEvents.invalidate();
      utils.content.getEvents.invalidate();
    },
    onError: (error) => toast.error(error.message || "Error deleting event"),
  });

  const exportDonationsPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Donations Report", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 25);

    let y = 35;
    doc.setFont("helvetica", "bold");
    doc.text("Donor Name", 14, y);
    doc.text("Email", 60, y);
    doc.text("Amount", 110, y);
    doc.text("Date", 160, y);

    doc.setFont("helvetica", "normal");
    donations.forEach((donation) => {
      y += 10;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(donation.donorName, 14, y);
      doc.text(donation.donorEmail, 60, y);
      doc.text(String(donation.amount), 110, y);
      doc.text(formatDate(donation.createdAt), 160, y);
    });

    doc.save("donations-report.pdf");
    toast.success("Donations report downloaded!");
  };

  const exportVolunteersPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Volunteers Report", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 25);

    let y = 35;
    doc.setFont("helvetica", "bold");
    doc.text("Name", 14, y);
    doc.text("Email", 60, y);
    doc.text("Skills", 110, y);
    doc.text("Date", 160, y);

    doc.setFont("helvetica", "normal");
    volunteers.forEach((volunteer) => {
      y += 10;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(volunteer.name, 14, y);
      doc.text(volunteer.email, 60, y);
      doc.text(volunteer.skills || "N/A", 110, y);
      doc.text(formatDate(volunteer.createdAt), 160, y);
    });

    doc.save("volunteers-report.pdf");
    toast.success("Volunteers report downloaded!");
  };

  const exportRegistrationsPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Event Registrations Report", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 25);

    let y = 35;
    doc.setFont("helvetica", "bold");
    doc.text("Name", 14, y);
    doc.text("Email", 55, y);
    doc.text("Event", 105, y);
    doc.text("Date", 160, y);

    doc.setFont("helvetica", "normal");
    registrations.forEach((registration) => {
      y += 10;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(registration.name, 14, y);
      doc.text(registration.email, 55, y);
      doc.text(registration.eventTitle, 105, y);
      doc.text(formatDate(registration.createdAt), 160, y);
    });

    doc.save("event-registrations-report.pdf");
    toast.success("Event registrations report downloaded!");
  };

  const handleCampaignSubmit = () => {
    if (!campaignForm.title.trim()) {
      toast.error("Campaign title is required");
      return;
    }
    if (editingCampaignId) {
      updateCampaignMutation.mutate({ id: editingCampaignId, ...campaignForm });
    } else {
      createCampaignMutation.mutate(campaignForm);
    }
  };

  const handleEventSubmit = () => {
    if (!eventForm.title.trim() || !eventForm.date) {
      toast.error("Event title and date are required");
      return;
    }
    if (editingEventId) {
      updateEventMutation.mutate({ id: editingEventId, ...eventForm });
    } else {
      createEventMutation.mutate(eventForm);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-cream to-brand-cream-deep">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-cream to-brand-cream-deep px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You need to sign in to access this page.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Link href="/admin-login">
              <Button className="w-full bg-accent hover:bg-brand-orange-dark">Go to Admin Login</Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full">Return to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:z-40 border-r border-border bg-white">
        <div className="flex items-center gap-2.5 px-6 py-5 border-b border-border">
          <Logo className="h-8 w-8" title={false} />
          <div className="leading-tight">
            <p className="font-serif font-bold text-foreground">CHAFHEIN</p>
            <p className="text-xs text-muted-foreground">Admin Dashboard</p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setActiveTab(item.value)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                activeTab === item.value
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-brand-cream-deep hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="border-t border-border p-4">
          <p className="mb-2 truncate text-xs text-muted-foreground">{admin?.email}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="w-full border-accent text-accent hover:bg-brand-cream-deep"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      <div className="flex-1 lg:pl-64">
        {/* Mobile header + horizontal nav */}
        <div className="sticky top-0 z-30 border-b border-border bg-white/95 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <Logo className="h-7 w-7" title={false} />
              <span className="font-serif font-bold text-foreground">CHAFHEIN</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-accent text-accent hover:bg-brand-cream-deep"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-1.5 overflow-x-auto px-4 pb-3">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setActiveTab(item.value)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                  activeTab === item.value
                    ? "bg-accent text-accent-foreground"
                    : "bg-brand-cream-deep text-muted-foreground"
                )}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div>
                <h1 className="font-serif text-2xl font-bold text-foreground">Overview</h1>
                <p className="text-sm text-muted-foreground">A snapshot of donations, revenue, and activity across the site.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Total Revenue" value={formatAmount(totalRevenue)} icon={Wallet} emphasize delta={revenueDelta} />
                <StatCard label="This Month" value={formatAmount(thisMonthRevenue)} icon={TrendingUp} />
                <StatCard label="Total Donations" value={donations.length.toLocaleString()} icon={Receipt} />
                <StatCard label="Average Donation" value={formatAmount(averageDonation)} icon={Calculator} />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue, last 6 months</CardTitle>
                  <CardDescription>Total donation amount received per month</CardDescription>
                </CardHeader>
                <CardContent>
                  {donationsLoading ? (
                    <div className="flex h-[280px] items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>
                  ) : (
                    <RevenueChart donations={donations} />
                  )}
                </CardContent>
              </Card>

              <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Activity</CardTitle>
                    <CardDescription>Submissions across the site</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <StatCard label="Contacts" value={contacts.length.toLocaleString()} icon={Mail} />
                    <StatCard label="Volunteers" value={volunteers.length.toLocaleString()} icon={Users} />
                    <StatCard label="Registrations" value={registrations.length.toLocaleString()} icon={CalendarCheck} />
                    <StatCard label="Active Campaigns" value={activeCampaignsCount.toLocaleString()} icon={Target} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Donations</CardTitle>
                    <CardDescription>The latest donations received</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {donationsLoading ? (
                      <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>
                    ) : recentDonations.length === 0 ? (
                      <EmptyState label="No donations yet" />
                    ) : (
                      <div className="space-y-3">
                        {recentDonations.map((donation) => (
                          <div key={donation.id} className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-foreground">{donation.donorName}</p>
                              <p className="truncate text-xs text-muted-foreground">{formatDate(donation.createdAt)}</p>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              <span className="text-sm font-semibold text-accent">{formatAmount(donation.amount)}</span>
                              <Badge variant={donationStatusVariant(donation.status)}>{donation.status}</Badge>
                            </div>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 w-full border-accent text-accent hover:bg-brand-cream-deep"
                          onClick={() => setActiveTab("donations")}
                        >
                          View all donations
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Contacts Tab */}
            <TabsContent value="contacts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Messages</CardTitle>
                  <CardDescription>All messages received from the contact form</CardDescription>
                </CardHeader>
                <CardContent>
                  {contactsLoading ? (
                    <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>
                  ) : contacts.length === 0 ? (
                    <EmptyState label="No contact messages yet" />
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-brand-cream-deep">
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Message</TableHead>
                            <TableHead>Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {contacts.map((contact) => (
                            <TableRow key={contact.id}>
                              <TableCell className="font-medium">{contact.name}</TableCell>
                              <TableCell>{contact.email}</TableCell>
                              <TableCell className="max-w-xs truncate">{contact.message}</TableCell>
                              <TableCell>{formatDate(contact.createdAt)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Donations Tab */}
            <TabsContent value="donations" className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={exportDonationsPDF} disabled={donations.length === 0} className="bg-accent hover:bg-brand-orange-dark">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Donations</CardTitle>
                  <CardDescription>All donation records</CardDescription>
                </CardHeader>
                <CardContent>
                  {donationsLoading ? (
                    <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>
                  ) : donations.length === 0 ? (
                    <EmptyState label="No donations yet" />
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-brand-cream-deep">
                            <TableHead>Donor Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Message</TableHead>
                            <TableHead>Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {donations.map((donation) => (
                            <TableRow key={donation.id}>
                              <TableCell className="font-medium">{donation.donorName}</TableCell>
                              <TableCell>{donation.donorEmail}</TableCell>
                              <TableCell className="font-semibold text-accent">{formatAmount(donation.amount)}</TableCell>
                              <TableCell><Badge variant={donationStatusVariant(donation.status)}>{donation.status}</Badge></TableCell>
                              <TableCell className="max-w-xs truncate">{donation.message || "N/A"}</TableCell>
                              <TableCell>{formatDate(donation.createdAt)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Volunteers Tab */}
            <TabsContent value="volunteers" className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={exportVolunteersPDF} disabled={volunteers.length === 0} className="bg-accent hover:bg-brand-orange-dark">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Volunteers</CardTitle>
                  <CardDescription>All volunteer applications</CardDescription>
                </CardHeader>
                <CardContent>
                  {volunteersLoading ? (
                    <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>
                  ) : volunteers.length === 0 ? (
                    <EmptyState label="No volunteer applications yet" />
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-brand-cream-deep">
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Skills</TableHead>
                            <TableHead>Message</TableHead>
                            <TableHead>Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {volunteers.map((volunteer) => (
                            <TableRow key={volunteer.id}>
                              <TableCell className="font-medium">{volunteer.name}</TableCell>
                              <TableCell>{volunteer.email}</TableCell>
                              <TableCell>{volunteer.skills || "N/A"}</TableCell>
                              <TableCell className="max-w-xs truncate">{volunteer.message || "N/A"}</TableCell>
                              <TableCell>{formatDate(volunteer.createdAt)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Event Registrations Tab */}
            <TabsContent value="registrations" className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={exportRegistrationsPDF} disabled={registrations.length === 0} className="bg-accent hover:bg-brand-orange-dark">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Event Registrations</CardTitle>
                  <CardDescription>Everyone who has registered to attend an event</CardDescription>
                </CardHeader>
                <CardContent>
                  {registrationsLoading ? (
                    <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>
                  ) : registrations.length === 0 ? (
                    <EmptyState label="No event registrations yet" />
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-brand-cream-deep">
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Event</TableHead>
                            <TableHead>Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {registrations.map((registration) => (
                            <TableRow key={registration.id}>
                              <TableCell className="font-medium">{registration.name}</TableCell>
                              <TableCell>{registration.email}</TableCell>
                              <TableCell>{registration.phone || "N/A"}</TableCell>
                              <TableCell>{registration.eventTitle}</TableCell>
                              <TableCell>{formatDate(registration.createdAt)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Campaigns Tab */}
            <TabsContent value="campaigns" className="space-y-4">
              <div className="flex justify-end">
                <Dialog open={isCampaignDialogOpen} onOpenChange={setIsCampaignDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className="bg-accent hover:bg-brand-orange-dark"
                      onClick={() => {
                        setEditingCampaignId(null);
                        setCampaignForm(emptyCampaignForm);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      New Campaign
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>{editingCampaignId ? "Edit Campaign" : "Create Campaign"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="Campaign Title"
                        value={campaignForm.title}
                        onChange={(e) => setCampaignForm({ ...campaignForm, title: e.target.value })}
                      />
                      <Textarea
                        placeholder="Description"
                        value={campaignForm.description}
                        onChange={(e) => setCampaignForm({ ...campaignForm, description: e.target.value })}
                      />
                      <ImageUploadField
                        imageUrl={campaignForm.imageUrl}
                        onChange={(url) => setCampaignForm({ ...campaignForm, imageUrl: url })}
                      />
                      <Input
                        placeholder="Target Amount"
                        type="number"
                        value={campaignForm.targetAmount}
                        onChange={(e) => setCampaignForm({ ...campaignForm, targetAmount: e.target.value })}
                      />
                      <Select value={campaignForm.status} onValueChange={(value: CampaignStatus) => setCampaignForm({ ...campaignForm, status: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="paused">Paused</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={handleCampaignSubmit}
                        className="w-full bg-accent hover:bg-brand-orange-dark"
                        disabled={createCampaignMutation.isPending || updateCampaignMutation.isPending}
                      >
                        {editingCampaignId ? "Update" : "Create"} Campaign
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Campaigns</CardTitle>
                  <CardDescription>Manage fundraising campaigns shown on the homepage</CardDescription>
                </CardHeader>
                <CardContent>
                  {campaignsLoading ? (
                    <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>
                  ) : campaigns.length === 0 ? (
                    <EmptyState label="No campaigns yet — create one to show it on the homepage" />
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {campaigns.map((campaign) => {
                        const target = Number(campaign.targetAmount) || 0;
                        const raised = Number(campaign.raisedAmount) || 0;
                        const pct = target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0;
                        return (
                          <Card key={campaign.id} className="border border-border">
                            <CardHeader className="pb-3">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <CardTitle className="text-lg">{campaign.title}</CardTitle>
                                  <Badge variant={campaignStatusVariant(campaign.status)} className="mt-2">
                                    {campaign.status}
                                  </Badge>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <p className="text-sm text-muted-foreground line-clamp-2">{campaign.description}</p>
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="font-semibold text-accent">{formatAmount(campaign.raisedAmount)} raised</span>
                                  <span className="text-muted-foreground">of {formatAmount(campaign.targetAmount)}</span>
                                </div>
                                <Progress value={pct} />
                              </div>
                              <div className="flex gap-2 pt-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingCampaignId(campaign.id);
                                    setCampaignForm({
                                      title: campaign.title,
                                      description: campaign.description || "",
                                      imageUrl: campaign.imageUrl || "",
                                      targetAmount: campaign.targetAmount != null ? String(campaign.targetAmount) : "",
                                      status: campaign.status as CampaignStatus,
                                    });
                                    setIsCampaignDialogOpen(true);
                                  }}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => deleteCampaignMutation.mutate({ id: campaign.id })}
                                  disabled={deleteCampaignMutation.isPending}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Events Tab */}
            <TabsContent value="events" className="space-y-4">
              <div className="flex justify-end">
                <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className="bg-accent hover:bg-brand-orange-dark"
                      onClick={() => {
                        setEditingEventId(null);
                        setEventForm(emptyEventForm);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      New Event
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>{editingEventId ? "Edit Event" : "Create Event"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="Event Title"
                        value={eventForm.title}
                        onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                      />
                      <Textarea
                        placeholder="Description"
                        value={eventForm.description}
                        onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                      />
                      <ImageUploadField
                        imageUrl={eventForm.imageUrl}
                        onChange={(url) => setEventForm({ ...eventForm, imageUrl: url })}
                      />
                      <Input
                        type="date"
                        value={eventForm.date}
                        onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                      />
                      <Input
                        placeholder="Location"
                        value={eventForm.location}
                        onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                      />
                      <div className="space-y-1.5">
                        <Input
                          type="url"
                          placeholder="Webinar Link (optional)"
                          value={eventForm.webinarLink}
                          onChange={(e) => setEventForm({ ...eventForm, webinarLink: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">
                          If set, this event is treated as a webinar — registrants automatically receive this link by email.
                        </p>
                      </div>
                      <Select value={eventForm.status} onValueChange={(value: EventStatus) => setEventForm({ ...eventForm, status: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="upcoming">Upcoming</SelectItem>
                          <SelectItem value="ongoing">Ongoing</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={handleEventSubmit}
                        className="w-full bg-accent hover:bg-brand-orange-dark"
                        disabled={createEventMutation.isPending || updateEventMutation.isPending}
                      >
                        {editingEventId ? "Update" : "Create"} Event
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Events</CardTitle>
                  <CardDescription>Manage upcoming and past events shown on the homepage</CardDescription>
                </CardHeader>
                <CardContent>
                  {eventsLoading ? (
                    <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>
                  ) : events.length === 0 ? (
                    <EmptyState label="No events yet — create one to show it on the homepage" />
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {events.map((event) => (
                        <Card key={event.id} className="border border-border">
                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <CardTitle className="text-lg">{event.title}</CardTitle>
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  <Badge variant={eventStatusVariant(event.status)}>{event.status}</Badge>
                                  {event.webinarLink && <Badge variant="default">Webinar</Badge>}
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                            <p className="text-sm font-semibold text-accent">{formatDate(event.eventDate)}</p>
                            <p className="text-sm text-muted-foreground">{event.location || "N/A"}</p>
                            <div className="flex gap-2 pt-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingEventId(event.id);
                                  setEventForm({
                                    title: event.title,
                                    description: event.description || "",
                                    imageUrl: event.imageUrl || "",
                                    date: event.eventDate ? event.eventDate.slice(0, 10) : "",
                                    location: event.location || "",
                                    status: event.status as EventStatus,
                                    webinarLink: event.webinarLink || "",
                                  });
                                  setIsEventDialogOpen(true);
                                }}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteEventMutation.mutate({ id: event.id })}
                                disabled={deleteEventMutation.isPending}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
