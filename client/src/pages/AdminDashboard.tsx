import { useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit2, Trash2, Download, LogOut, Loader2, Inbox, Upload } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Link } from "wouter";
import { Logo } from "@/components/Logo";
import jsPDF from "jspdf";

type CampaignStatus = "active" | "completed" | "paused";
type EventStatus = "upcoming" | "ongoing" | "completed";

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

export default function AdminDashboard() {
  const { admin, logout, loading: authLoading, isAuthenticated } = useAdminAuth();
  const [activeTab, setActiveTab] = useState("contacts");
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
    <div className="min-h-screen bg-gradient-to-br from-brand-cream/60 to-brand-cream-deep/40">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur shadow-sm border-b border-brand-cream-deep">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Logo className="h-9 w-9" title={false} />
            <h1 className="text-xl font-serif font-bold text-foreground">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-sm text-muted-foreground">{admin?.email}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await logout();
                window.location.href = "/admin-login";
              }}
              className="border-accent text-accent hover:bg-brand-cream-deep"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-auto bg-white border border-border p-1">
            <TabsTrigger value="contacts" className="data-[state=active]:bg-brand-cream-deep data-[state=active]:text-accent">
              Contacts ({contacts.length})
            </TabsTrigger>
            <TabsTrigger value="donations" className="data-[state=active]:bg-brand-cream-deep data-[state=active]:text-accent">
              Donations ({donations.length})
            </TabsTrigger>
            <TabsTrigger value="volunteers" className="data-[state=active]:bg-brand-cream-deep data-[state=active]:text-accent">
              Volunteers ({volunteers.length})
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="data-[state=active]:bg-brand-cream-deep data-[state=active]:text-accent">
              Campaigns ({campaigns.length})
            </TabsTrigger>
            <TabsTrigger value="events" className="data-[state=active]:bg-brand-cream-deep data-[state=active]:text-accent">
              Events ({events.length})
            </TabsTrigger>
          </TabsList>

          {/* Contacts Tab */}
          <TabsContent value="contacts" className="space-y-4 mt-6">
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
          <TabsContent value="donations" className="space-y-4 mt-6">
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
                          <TableHead>Message</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {donations.map((donation) => (
                          <TableRow key={donation.id}>
                            <TableCell className="font-medium">{donation.donorName}</TableCell>
                            <TableCell>{donation.donorEmail}</TableCell>
                            <TableCell className="font-semibold text-accent">{donation.amount}</TableCell>
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
          <TabsContent value="volunteers" className="space-y-4 mt-6">
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

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-4 mt-6">
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
                    {campaigns.map((campaign) => (
                      <Card key={campaign.id} className="border border-border">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <CardTitle className="text-lg">{campaign.title}</CardTitle>
                              <span className="inline-block mt-2 px-2 py-1 text-xs rounded-full bg-brand-cream-deep text-accent">
                                {campaign.status}
                              </span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <p className="text-sm text-muted-foreground line-clamp-2">{campaign.description}</p>
                          <p className="text-sm font-semibold text-accent">
                            {formatAmount(campaign.raisedAmount)} raised of {formatAmount(campaign.targetAmount)}
                          </p>
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
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-4 mt-6">
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
                              <span className="inline-block mt-2 px-2 py-1 text-xs rounded-full bg-brand-gold/20 text-brand-green-dark">
                                {event.status}
                              </span>
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
      </div>
    </div>
  );
}
