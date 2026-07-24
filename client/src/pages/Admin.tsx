import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Admin() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("contacts");

  // Redirect if not admin
  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      setLocation('/');
      toast.error("Admin access required");
    }
  }, [user, loading, setLocation]);

  const { data: contacts, isLoading: contactsLoading } = trpc.admin.getContacts.useQuery(undefined, {
    enabled: user?.role === 'admin',
  });

  const { data: donations, isLoading: donationsLoading } = trpc.admin.getDonations.useQuery(undefined, {
    enabled: user?.role === 'admin',
  });

  const { data: volunteers, isLoading: volunteersLoading } = trpc.admin.getVolunteers.useQuery(undefined, {
    enabled: user?.role === 'admin',
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">You do not have permission to access this page.</p>
            <Button onClick={() => setLocation('/')}>Return to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.name}</span>
            <Button variant="outline" size="sm" onClick={() => setLocation('/')}>
              Back to Site
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="contacts">
              Contacts ({contacts?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="donations">
              Donations ({donations?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="volunteers">
              Volunteers ({volunteers?.length || 0})
            </TabsTrigger>
          </TabsList>

          {/* Contacts Tab */}
          <TabsContent value="contacts">
            <Card>
              <CardHeader>
                <CardTitle>Contact Messages</CardTitle>
                <CardDescription>
                  All messages received from the contact form
                </CardDescription>
              </CardHeader>
              <CardContent>
                {contactsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
                  </div>
                ) : contacts && contacts.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
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
                            <TableCell className="text-sm text-gray-600">
                              {new Date(contact.createdAt).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No contact messages yet
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Donations Tab */}
          <TabsContent value="donations">
            <Card>
              <CardHeader>
                <CardTitle>Donations</CardTitle>
                <CardDescription>
                  All donation records received
                </CardDescription>
              </CardHeader>
              <CardContent>
                {donationsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
                  </div>
                ) : donations && donations.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
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
                            <TableCell className="font-semibold text-amber-600">
                              {donation.amount}
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {donation.message || "-"}
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {new Date(donation.createdAt).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No donations yet
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Volunteers Tab */}
          <TabsContent value="volunteers">
            <Card>
              <CardHeader>
                <CardTitle>Volunteer Applications</CardTitle>
                <CardDescription>
                  All volunteer sign-ups and applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                {volunteersLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
                  </div>
                ) : volunteers && volunteers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
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
                            <TableCell className="max-w-xs truncate">
                              {volunteer.skills || "-"}
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {volunteer.message || "-"}
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {new Date(volunteer.createdAt).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No volunteer applications yet
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Contacts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{contacts?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Donations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{donations?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Volunteers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{volunteers?.length || 0}</div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
