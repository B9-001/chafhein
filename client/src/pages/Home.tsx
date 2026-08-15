import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Logo } from "@/components/Logo";
import {
  Heart, Users, Handshake, Mail, Phone, MapPin, Instagram, Twitter,
  ArrowRight, Calendar, Menu, X, Sparkles, Target, ShieldCheck, Loader2,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { PaystackButton } from "react-paystack";

const NAV_LINKS = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#services", label: "Services" },
  { href: "#campaigns", label: "Campaigns" },
  { href: "#events", label: "Events" },
  { href: "#contact", label: "Contact" },
];

const SERVICES = [
  { icon: "🏥", title: "SRHR Services", desc: "Sexual and Reproductive Health and Rights education and services" },
  { icon: "❤️", title: "Healthcare & Nutrition", desc: "Accessible healthcare and nutrition programs for all" },
  { icon: "📋", title: "Policy Influence", desc: "Advocating for policy changes that benefit communities" },
  { icon: "📚", title: "Girl Child Education", desc: "Empowering girls through quality education" },
  { icon: "🎓", title: "Mentorship", desc: "Capacity building and mentorship programs" },
  { icon: "🌍", title: "Community Health", desc: "Community-led health initiatives and awareness" },
];

const HERO_STATS = [
  { value: "300+", label: "People Reached" },
  { value: "6", label: "Core Programs" },
  { value: "100%", label: "Youth-Led" },
];

function formatDate(value: string | null | undefined) {
  if (!value) return "Date TBA";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

function formatCurrency(value: string | number | null | undefined) {
  const num = Number(value ?? 0);
  if (Number.isNaN(num)) return "₦0";
  return `₦${num.toLocaleString()}`;
}

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeForm, setActiveForm] = useState<"contact" | "donation" | "volunteer" | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    amount: "",
    skills: "",
  });

  const { data: campaigns = [], isLoading: campaignsLoading } = trpc.content.getCampaigns.useQuery();
  const { data: events = [], isLoading: eventsLoading } = trpc.content.getEvents.useQuery();

  const submitContact = trpc.forms.submitContact.useMutation({
    onSuccess: () => {
      toast.success("Thank you for reaching out! We'll be in touch soon.");
      setFormData({ name: "", email: "", message: "", amount: "", skills: "" });
      setActiveForm(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit. Please try again.");
    },
  });

  const submitDonation = trpc.forms.submitDonation.useMutation({
    onSuccess: () => {
      toast.success("Thank you for your generous donation!");
      setFormData({ name: "", email: "", message: "", amount: "", skills: "" });
      setActiveForm(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to record your donation. Please contact us.");
    },
  });

  const submitVolunteer = trpc.forms.submitVolunteer.useMutation({
    onSuccess: () => {
      toast.success("Thank you for volunteering! We'll contact you soon.");
      setFormData({ name: "", email: "", message: "", amount: "", skills: "" });
      setActiveForm(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit. Please try again.");
    },
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitContact.mutate({
      name: formData.name,
      email: formData.email,
      message: formData.message,
    });
  };

  const paystackPublicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string | undefined;
  const donationAmountValid = Number(formData.amount) > 0;
  const donationFormValid = Boolean(formData.name && formData.email && donationAmountValid);

  const paystackConfig = {
    reference: `CHAFHEI-${Date.now()}`,
    email: formData.email || "donor@chafhein.ng",
    amount: Math.round((Number(formData.amount) || 0) * 100),
    publicKey: paystackPublicKey || "",
  };

  const handlePaystackSuccess = (reference: any) => {
    submitDonation.mutate({
      amount: formData.amount,
      donorName: formData.name,
      donorEmail: formData.email,
      message: formData.message,
      paymentReference: reference?.reference,
    });
    toast.success(`Payment successful! Reference: ${reference.reference}`);
  };

  const handlePaystackClose = () => {
    toast.error("Payment window closed");
  };

  const handleVolunteerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitVolunteer.mutate({
      name: formData.name,
      email: formData.email,
      skills: formData.skills,
      message: formData.message,
    });
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
        .animate-slide-in-left { animation: slideInLeft 0.6s ease-out forwards; }
        .animate-slide-in-right { animation: slideInRight 0.6s ease-out forwards; }
        .animate-scale-in { animation: scaleIn 0.5s ease-out forwards; opacity: 0; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-600 { animation-delay: 0.6s; }
        button:active { transform: scale(0.97); transition: transform 0.1s ease; }
        .card-hover { transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1); }
        .card-hover:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(124, 58, 237, 0.14); }
      `}</style>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex justify-between items-center">
          <a href="#home" className="flex items-center">
            <Logo className="h-10 w-10" />
          </a>

          <div className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="text-sm font-medium text-gray-700 hover:text-purple-700 transition duration-200">
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:block">
            <Button onClick={() => setActiveForm("donation")} className="bg-purple-600 hover:bg-purple-700 text-white">
              Donate Now
            </Button>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-purple-100 rounded-lg transition duration-300"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-purple-700" /> : <Menu className="w-6 h-6 text-purple-700" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-purple-100 animate-fade-in-up">
            <div className="px-4 py-4 space-y-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-gray-700 hover:text-purple-700 hover:bg-purple-50 px-4 py-2.5 rounded-lg transition duration-300"
                >
                  {link.label}
                </a>
              ))}
              <Button
                onClick={() => { setActiveForm("donation"); setMobileMenuOpen(false); }}
                className="w-full mt-2 bg-purple-600 hover:bg-purple-700"
              >
                Donate Now
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 via-white to-yellow-50 overflow-hidden">
        <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 bg-yellow-200/40 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 bg-purple-200/40 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto grid md:grid-cols-2 gap-10 md:gap-14 items-center">
          <div className="space-y-5 sm:space-y-6 animate-slide-in-left">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 bg-purple-100 px-3 py-1.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5" /> Youth-led · Nigeria
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight">
              Let's Build a <span className="bg-gradient-to-r from-purple-700 to-yellow-600 bg-clip-text text-transparent">Better World</span> Together
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
              Connected Hands for Family Health and Empowerment Initiative (CHAFHEIN) is a youth-led, non-profit organization dedicated to creating sustainable change through healthcare, education, and community empowerment.
            </p>
            <div className="flex flex-wrap gap-3 sm:gap-4 pt-2">
              <Button onClick={() => setActiveForm("donation")} className="bg-purple-600 hover:bg-purple-700 text-white px-6 sm:px-8 py-5 text-base shadow-lg shadow-purple-200">
                Donate Now
              </Button>
              <Button onClick={() => setActiveForm("volunteer")} variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50 px-6 sm:px-8 py-5 text-base">
                Volunteer
              </Button>
              <Button onClick={() => setActiveForm("contact")} variant="outline" className="border-yellow-600 text-yellow-700 hover:bg-yellow-50 px-6 sm:px-8 py-5 text-base">
                Partner With Us
              </Button>
            </div>
          </div>

          <div className="relative animate-slide-in-right">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-200 to-yellow-200 rounded-3xl blur-3xl opacity-30 animate-float" />
            <div className="relative bg-white/80 backdrop-blur border border-purple-100 rounded-3xl p-8 sm:p-10 shadow-xl shadow-purple-100/60">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-600 to-yellow-500 flex items-center justify-center shadow-md">
                  <Heart className="w-6 h-6 text-white" fill="currentColor" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Our Mission</p>
                  <p className="text-sm text-gray-500">Health · Education · Empowerment</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed mb-6">
                To empower communities through accessible healthcare, quality education, and sustainable development initiatives.
              </p>
              <div className="grid grid-cols-3 gap-3 text-center">
                {HERO_STATS.map((stat) => (
                  <div key={stat.label} className="rounded-xl bg-gradient-to-br from-purple-50 to-yellow-50 border border-purple-100 py-3 px-2">
                    <p className="text-xl sm:text-2xl font-bold text-purple-700">{stat.value}</p>
                    <p className="text-[11px] sm:text-xs text-gray-500 leading-tight mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Our Services</h2>
            <p className="text-gray-600">Integrated programs that meet communities where they are.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {SERVICES.map((service, i) => (
              <Card key={service.title} className="card-hover border-purple-200 hover:border-purple-400 animate-scale-in" style={{ animationDelay: `${i * 0.08}s` }}>
                <CardHeader>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-yellow-100 flex items-center justify-center text-3xl mb-2">
                    {service.icon}
                  </div>
                  <CardTitle className="text-purple-700">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{service.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 to-yellow-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-8">About CHAFHEIN</h2>
          <div className="space-y-4 sm:space-y-6 text-base sm:text-lg text-gray-700 leading-relaxed">
            <p>
              <strong className="text-purple-700">Connected Hands for Family Health and Empowerment Initiative (CHAFHEIN)</strong> is a youth-led, non-profit organization committed to creating sustainable change in communities across Nigeria.
            </p>
            <p>
              We believe that every individual deserves access to quality healthcare, education, and opportunities for personal development. Our work focuses on bridging the gap between healthcare access, education, and community empowerment.
            </p>
            <p>
              Through our integrated approach, we address critical issues including sexual and reproductive health rights, healthcare accessibility, nutrition, policy advocacy, girl child education, and community capacity building.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 mt-10">
            {[
              { icon: ShieldCheck, title: "Transparent", desc: "Every naira accounted for and reported" },
              { icon: Target, title: "Impact-focused", desc: "Programs designed around measurable outcomes" },
              { icon: Users, title: "Community-led", desc: "Built with, not just for, the people we serve" },
            ].map((v) => (
              <div key={v.title} className="bg-white/70 border border-purple-100 rounded-2xl p-5 text-center">
                <v.icon className="w-7 h-7 text-purple-600 mx-auto mb-2" />
                <p className="font-semibold text-gray-900">{v.title}</p>
                <p className="text-sm text-gray-600 mt-1">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Get Involved Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-12 sm:mb-16">Get Involved</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              { title: "Become a Volunteer", desc: "Join our team and make a direct impact in communities", icon: Users, form: "volunteer" as const },
              { title: "Donate to Support", desc: "Your donation helps us reach more people and create lasting change", icon: Heart, form: "donation" as const },
              { title: "Become a Partner", desc: "Partner with us to amplify our impact and reach", icon: Handshake, form: "contact" as const },
            ].map((item, i) => (
              <Card key={item.title} className="card-hover border-purple-200 hover:border-purple-400 animate-scale-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-3">
                    <item.icon className="w-6 h-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-purple-700">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">{item.desc}</p>
                  <Button onClick={() => setActiveForm(item.form)} className="w-full bg-purple-600 hover:bg-purple-700 group">
                    Learn More <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Campaigns Section */}
      <section id="campaigns" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 to-yellow-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Active Campaigns</h2>
            <p className="text-gray-600">Fundraising drives currently underway — every contribution moves the needle.</p>
          </div>

          {campaignsLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No active campaigns right now — check back soon, or{" "}
              <button onClick={() => setActiveForm("donation")} className="text-purple-600 underline underline-offset-2">make a general donation</button>.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {campaigns.map((campaign, i) => {
                const target = Number(campaign.targetAmount) || 0;
                const raised = Number(campaign.raisedAmount) || 0;
                const pct = target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0;
                return (
                  <Card key={campaign.id} className="card-hover border-purple-200 hover:border-purple-400 animate-scale-in overflow-hidden" style={{ animationDelay: `${i * 0.08}s` }}>
                    {campaign.imageUrl && (
                      <img src={campaign.imageUrl} alt={campaign.title} className="h-40 w-full object-cover" />
                    )}
                    <CardHeader>
                      <div className="flex items-center justify-between gap-2">
                        <CardTitle className="text-purple-700">{campaign.title}</CardTitle>
                        <span className="shrink-0 px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700 capitalize">{campaign.status}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-gray-600 line-clamp-3">{campaign.description}</p>
                      {target > 0 && (
                        <div className="space-y-1.5">
                          <Progress value={pct} className="h-2" />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span className="font-semibold text-purple-700">{formatCurrency(raised)} raised</span>
                            <span>of {formatCurrency(target)}</span>
                          </div>
                        </div>
                      )}
                      <Button onClick={() => setActiveForm("donation")} className="w-full bg-purple-600 hover:bg-purple-700">
                        Support This Campaign
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Upcoming Events</h2>
            <p className="text-gray-600">Come meet the team and see the work in person.</p>
          </div>

          {eventsLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>
          ) : events.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No upcoming events scheduled right now — check back soon.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {events.map((event, i) => (
                <Card key={event.id} className="card-hover border-yellow-200 hover:border-yellow-400 animate-scale-in" style={{ animationDelay: `${i * 0.1}s` }}>
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-semibold text-purple-600">{formatDate(event.eventDate)}</span>
                      <span className="ml-auto px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-700 capitalize">{event.status}</span>
                    </div>
                    <CardTitle className="text-purple-700">{event.title}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" /> {event.location || "Location TBA"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{event.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 to-yellow-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <div className="space-y-6 sm:space-y-8 animate-slide-in-left">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Get In Touch</h2>
            <div className="space-y-4 sm:space-y-6">
              <div className="flex gap-4">
                <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm"><MapPin className="w-5 h-5 text-purple-600" /></div>
                <div>
                  <h3 className="font-semibold text-gray-900">Address</h3>
                  <p className="text-gray-600">Asokoro, Abuja, Nigeria</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm"><Mail className="w-5 h-5 text-purple-600" /></div>
                <div>
                  <h3 className="font-semibold text-gray-900">Email</h3>
                  <a href="mailto:info@chafhein.ng" className="text-purple-600 hover:text-purple-700">info@chafhein.ng</a>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm"><Phone className="w-5 h-5 text-purple-600" /></div>
                <div>
                  <h3 className="font-semibold text-gray-900">Phone</h3>
                  <a href="tel:+2348166265367" className="text-purple-600 hover:text-purple-700">+234 816 626 5367</a>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-purple-600 hover:bg-purple-600 hover:text-white transition duration-300">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-purple-600 hover:bg-purple-600 hover:text-white transition duration-300">
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Contact / Donation / Volunteer Forms */}
          <div className="animate-slide-in-right">
            {activeForm === "contact" && (
              <Card className="border-purple-200 shadow-lg shadow-purple-100/50">
                <CardHeader>
                  <CardTitle className="text-2xl sm:text-3xl">Send us a Message</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleContactSubmit} className="space-y-3 sm:space-y-4">
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Your Email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                      required
                    />
                    <textarea
                      placeholder="Your Message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-2.5 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 h-32"
                      required
                    />
                    <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={submitContact.isPending}>
                      {submitContact.isPending ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {activeForm === "donation" && (
              <Card className="border-purple-200 shadow-lg shadow-purple-100/50">
                <CardHeader>
                  <CardTitle>Make a Donation</CardTitle>
                  <CardDescription>Every contribution helps us reach more families.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Your Email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                      required
                    />
                    <input
                      type="number"
                      min="1"
                      placeholder="Donation Amount (NGN)"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full px-4 py-2.5 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                      required
                    />
                    <textarea
                      placeholder="Message (optional)"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-2.5 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 h-20"
                    />
                    {paystackPublicKey ? (
                      <PaystackButton
                        text={submitDonation.isPending ? "Processing..." : "Donate Now"}
                        className={`w-full text-white px-4 py-2.5 rounded-lg font-semibold transition duration-300 ${
                          donationFormValid ? "bg-purple-600 hover:bg-purple-700 cursor-pointer" : "bg-purple-300 cursor-not-allowed"
                        }`}
                        disabled={!donationFormValid || submitDonation.isPending}
                        {...paystackConfig}
                        onSuccess={handlePaystackSuccess}
                        onClose={handlePaystackClose}
                      />
                    ) : (
                      <div className="text-sm text-center text-gray-500 bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4">
                        Online payments aren't configured yet. Please reach us at{" "}
                        <a href="mailto:info@chafhein.ng" className="text-purple-600 underline">info@chafhein.ng</a> to donate.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeForm === "volunteer" && (
              <Card className="border-purple-200 shadow-lg shadow-purple-100/50">
                <CardHeader>
                  <CardTitle>Become a Volunteer</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleVolunteerSubmit} className="space-y-4">
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Your Email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Your Skills"
                      value={formData.skills}
                      onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                      className="w-full px-4 py-2.5 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                    />
                    <textarea
                      placeholder="Why do you want to volunteer?"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-2.5 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 h-20"
                    />
                    <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={submitVolunteer.isPending}>
                      {submitVolunteer.isPending ? "Submitting..." : "Apply Now"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {!activeForm && (
              <div className="h-full flex items-center justify-center text-center">
                <div className="space-y-4 bg-white/60 border border-purple-100 rounded-2xl p-10">
                  <p className="text-gray-600 text-lg">Select an action above to get started</p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    <Button onClick={() => setActiveForm("contact")} variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50">Message Us</Button>
                    <Button onClick={() => setActiveForm("donation")} className="bg-purple-600 hover:bg-purple-700">Donate</Button>
                    <Button onClick={() => setActiveForm("volunteer")} variant="outline" className="border-yellow-600 text-yellow-700 hover:bg-yellow-50">Volunteer</Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-14 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 md:grid-cols-4 gap-10">
          <div className="md:col-span-2 space-y-4">
            <Logo className="h-9 w-9" />
            <p className="text-gray-400 text-sm max-w-sm leading-relaxed">
              Connected Hands for Family Health and Empowerment Initiative — a youth-led non-profit advancing healthcare, education, and community empowerment across Nigeria.
            </p>
            <div className="flex gap-3">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-purple-600 transition duration-300">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-purple-600 transition duration-300">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm tracking-wide text-gray-200 uppercase">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {NAV_LINKS.map((link) => (
                <li key={link.href}><a href={link.href} className="hover:text-white transition">{link.label}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm tracking-wide text-gray-200 uppercase">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Asokoro, Abuja, Nigeria</li>
              <li><a href="mailto:info@chafhein.ng" className="hover:text-white transition">info@chafhein.ng</a></li>
              <li><a href="tel:+2348166265367" className="hover:text-white transition">+234 816 626 5367</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-white/10 mt-10 pt-6 text-center">
          <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} Connected Hands for Family Health and Empowerment Initiative (CHAFHEIN). All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
