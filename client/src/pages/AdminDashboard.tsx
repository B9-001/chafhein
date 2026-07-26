import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit2, Trash2, Download, LogOut } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Link } from "wouter";
import jsPDF from "jspdf";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("contacts");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form states
  const [campaignForm, setCampaignForm] = useState({
    title: "",
    description: "",
    imageUrl: "",
    targetAmount: "",
    status: "active" as const,
  });

  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    imageUrl: "",
    date: "",
    location: "",
    status: "upcoming" as const,
  });

  // Queries
  const { data: contacts = [] } = trpc.admin.getContacts.useQuery();
  const { data: donations = [] } = trpc.admin.getDonations.useQuery();
  const { data: volunteers = [] } = trpc.admin.getVolunteers.useQuery();
  const { data: campaigns = [] } = trpc.admin.getCampaigns.useQuery();
  const { data: events = [] } = trpc.admin.getEvents.useQuery();

  // Mutations
  const createCampaignMutation = trpc.admin.createCampaign.useMutation({
    onSuccess: () => {
      toast.success("Campaign created successfully!");
      setCampaignForm({ title: "", description: "", imageUrl: "", targetAmount: "", status: "active" });
      setIsDialogOpen(false);
    },
    onError: (error) => toast.error(error.message),
  });

  const updateCampaignMutation = trpc.admin.updateCampaign.useMutation({
    onSuccess: () => {
      toast.success("Campaign updated successfully!");
      setEditingId(null);
      setIsDialogOpen(false);
    },
    onError: (error) => toast.error(error.message || "Error updating campaign"),
  });

  const deleteCampaignMutation = trpc.admin.deleteCampaign.useMutation({
    onSuccess: () => {
      toast.success("Campaign deleted successfully!");
    },
    onError: (error) => toast.error(error.message || "Error deleting campaign"),
  });

  const createEventMutation = trpc.admin.createEvent.useMutation({
    onSuccess: () => {
      toast.success("Event created successfully!");
      setEventForm({ title: "", description: "", imageUrl: "", date: "", location: "", status: "upcoming" });
      setIsDialogOpen(false);
    },
    onError: (error) => toast.error(error.message || "Error creating event"),
  });

  const updateEventMutation = trpc.admin.updateEvent.useMutation({
    onSuccess: () => {
      toast.success("Event updated successfully!");
      setEditingId(null);
      setIsDialogOpen(false);
    },
    onError: (error) => toast.error(error.message || "Error updating event"),
  });

  const deleteEventMutation = trpc.admin.deleteEvent.useMutation({
    onSuccess: () => {
      toast.success("Event deleted successfully!");
    },
    onError: (error) => toast.error(error.message || "Error deleting event"),
  });

  // PDF Export Functions
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
      doc.text(donation.amount, 110, y);
      doc.text(new Date(donation.createdAt).toLocaleDateString(), 160, y);
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
      doc.text(new Date(volunteer.createdAt).toLocaleDateString(), 160, y);
    });

    doc.save("volunteers-report.pdf");
    toast.success("Volunteers report downloaded!");
  };

  // Handle campaign form submission
  const handleCampaignSubmit = () => {
    if (editingId) {
      updateCampaignMutation.mutate({ id: editingId, ...campaignForm });
    } else {
      createCampaignMutation.mutate(campaignForm);
    }
  };

  // Handle event form submission
  const handleEventSubmit = () => {
    if (editingId) {
      updateEventMutation.mutate({ id: editingId, ...eventForm });
    } else {
      createEventMutation.mutate(eventForm);
    }
  };

  // Check if user is admin
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-yellow-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You do not have permission to access this page.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button className="w-full bg-purple-600 hover:bg-purple-700">Return to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-yellow-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white shadow-sm border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-purple-700">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {user.name}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                logout();
                window.location.href = "/";
              }}
              className="border-purple-600 text-purple-600 hover:bg-purple-50"
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
          <TabsList className="grid w-full grid-cols-5 bg-white border border-purple-200">
            <TabsTrigger value="contacts" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
              Contacts ({contacts.length})
            </TabsTrigger>
            <TabsTrigger value="donations" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
              Donations ({donations.length})
            </TabsTrigger>
            <TabsTrigger value="volunteers" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
              Volunteers ({volunteers.length})
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
              Campaigns ({campaigns.length})
            </TabsTrigger>
            <TabsTrigger value="events" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
              Events ({events.length})
            </TabsTrigger>
          </TabsList>

          {/* Contacts Tab */}
          <TabsContent value="contacts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Contact Messages</CardTitle>
                <CardDescription>All messages received from the contact form</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-purple-50">
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
                          <TableCell>{new Date(contact.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Donations Tab */}
          <TabsContent value="donations" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={exportDonationsPDF} className="bg-purple-600 hover:bg-purple-700">
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
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-purple-50">
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
                          <TableCell className="font-semibold text-purple-600">{donation.amount}</TableCell>
                          <TableCell className="max-w-xs truncate">{donation.message || "N/A"}</TableCell>
                          <TableCell>{new Date(donation.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Volunteers Tab */}
          <TabsContent value="volunteers" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={exportVolunteersPDF} className="bg-purple-600 hover:bg-purple-700">
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
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-purple-50">
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
                          <TableCell>{new Date(volunteer.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={() => {
                      setEditingId(null);
                      setCampaignForm({ title: "", description: "", imageUrl: "", targetAmount: "", status: "active" });
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Campaign
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{editingId ? "Edit Campaign" : "Create Campaign"}</DialogTitle>
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
                    <Input
                      placeholder="Image URL"
                      value={campaignForm.imageUrl}
                      onChange={(e) => setCampaignForm({ ...campaignForm, imageUrl: e.target.value })}
                    />
                    <Input
                      placeholder="Target Amount"
                      value={campaignForm.targetAmount}
                      onChange={(e) => setCampaignForm({ ...campaignForm, targetAmount: e.target.value })}
                    />
                    <Select value={campaignForm.status} onValueChange={(value: any) => setCampaignForm({ ...campaignForm, status: value })}>
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
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      disabled={createCampaignMutation.isPending || updateCampaignMutation.isPending}
                    >
                      {editingId ? "Update" : "Create"} Campaign
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Campaigns</CardTitle>
                <CardDescription>Manage fundraising campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {campaigns.map((campaign) => (
                    <Card key={campaign.id} className="border border-purple-200">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{campaign.title}</CardTitle>
                            <span className="inline-block mt-2 px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700">
                              {campaign.status}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-sm text-gray-600">{campaign.description}</p>
                        <p className="text-sm font-semibold text-purple-600">Target: {campaign.targetAmount}</p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingId(campaign.id);
                              setCampaignForm({
                                title: campaign.title,
                                description: campaign.description || "",
                                imageUrl: campaign.imageUrl || "",
                                targetAmount: campaign.targetAmount || "",
                                status: campaign.status as any,
                              });
                              setIsDialogOpen(true);
                            }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteCampaignMutation.mutate({ id: campaign.id })}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={() => {
                      setEditingId(null);
                      setEventForm({ title: "", description: "", imageUrl: "", date: "", location: "", status: "upcoming" });
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{editingId ? "Edit Event" : "Create Event"}</DialogTitle>
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
                    <Input
                      placeholder="Image URL"
                      value={eventForm.imageUrl}
                      onChange={(e) => setEventForm({ ...eventForm, imageUrl: e.target.value })}
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
                    <Select value={eventForm.status} onValueChange={(value: any) => setEventForm({ ...eventForm, status: value })}>
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
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      disabled={createEventMutation.isPending || updateEventMutation.isPending}
                    >
                      {editingId ? "Update" : "Create"} Event
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Events</CardTitle>
                <CardDescription>Manage upcoming and past events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {events.map((event) => (
                    <Card key={event.id} className="border border-purple-200">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{event.title}</CardTitle>
                            <span className="inline-block mt-2 px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
                              {event.status}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-sm text-gray-600">{event.description}</p>
                        <p className="text-sm font-semibold text-purple-600">📅 {event.date}</p>
                        <p className="text-sm text-gray-600">📍 {event.location || "N/A"}</p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingId(event.id);
                              setEventForm({
                                title: event.title,
                                description: event.description || "",
                                imageUrl: event.imageUrl || "",
                                date: event.date,
                                location: event.location || "",
                                status: event.status as any,
                              });
                              setIsDialogOpen(true);
                            }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteEventMutation.mutate({ id: event.id })}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
