
import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Users, Handshake, Mail, Phone, MapPin, Instagram, Twitter, ArrowRight, Calendar, Menu, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { PaystackButton } from "react-paystack";
import { PaintSplash } from "@/components/PaintSplash";

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
      toast.error(error.message || "Failed to submit. Please try again.");
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

  const handleDonationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.name || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }
  };

  const paystackConfig = {
    reference: `CHAFHEI-${Date.now()}`,
    email: formData.email,
    amount: parseInt(formData.amount || '0') * 100,
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_d62a19c25a9338eb2d7009f86eb1ebc35abcdbb8',
  };

  const handlePaystackSuccess = (reference: any) => {
    submitDonation.mutate({
      amount: formData.amount,
      donorName: formData.name,
      donorEmail: formData.email,
      message: formData.message,
    });
    toast.success(`Payment successful! Reference: ${reference.reference}`);
    setFormData({ name: '', email: '', message: '', amount: '', skills: '' });
    setActiveForm(null);
  };

  const handlePaystackClose = () => {
    toast.error('Payment window closed');
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
    <div className="min-h-screen bg-white overflow-hidden">
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        .animate-slide-in-left {
          animation: slideInLeft 0.6s ease-out forwards;
        }

        .animate-slide-in-right {
          animation: slideInRight 0.6s ease-out forwards;
        }

        .animate-scale-in {
          animation: scaleIn 0.5s ease-out forwards;
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-600 { animation-delay: 0.6s; }

        .group:hover .group-hover\\:translate-x-1 {
          transform: translateX(4px);
          transition: transform 0.3s ease;
        }

        button:active {
          transform: scale(0.97);
          transition: transform 0.1s ease;
        }

        .card-hover {
          transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .card-hover:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(32, 28, 22, 0.14);
        }
      `}</style>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-brand-cream-deep animate-fade-in-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="CHAFHEIN" className="h-10 w-10 object-contain" />
            <span className="text-2xl font-serif font-bold bg-gradient-to-r from-brand-orange to-brand-gold bg-clip-text text-transparent">
              CHAFHEIN
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-8">
            <a href="#home" className="text-foreground hover:text-accent transition duration-300">Home</a>
            <a href="#about" className="text-foreground hover:text-accent transition duration-300">About</a>
            <a href="#services" className="text-foreground hover:text-accent transition duration-300">Services</a>
            <a href="#events" className="text-foreground hover:text-accent transition duration-300">Events</a>
            <a href="#contact" className="text-foreground hover:text-accent transition duration-300">Contact</a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-brand-cream-deep rounded-lg transition duration-300"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-accent" />
            ) : (
              <Menu className="w-6 h-6 text-accent" />
            )}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-brand-cream-deep animate-fade-in-up">
            <div className="px-4 py-4 space-y-3">
              <a
                href="#home"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-foreground hover:text-accent hover:bg-brand-cream-deep px-4 py-2 rounded-lg transition duration-300"
              >
                Home
              </a>
              <a
                href="#about"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-foreground hover:text-accent hover:bg-brand-cream-deep px-4 py-2 rounded-lg transition duration-300"
              >
                About
              </a>
              <a
                href="#services"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-foreground hover:text-accent hover:bg-brand-cream-deep px-4 py-2 rounded-lg transition duration-300"
              >
                Services
              </a>
              <a
                href="#events"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-foreground hover:text-accent hover:bg-brand-cream-deep px-4 py-2 rounded-lg transition duration-300"
              >
                Events
              </a>
              <a
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-foreground hover:text-accent hover:bg-brand-cream-deep px-4 py-2 rounded-lg transition duration-300"
              >
                Contact
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-brand-cream via-white to-brand-cream-deep animate-fade-in-up">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="space-y-4 sm:space-y-6 animate-slide-in-left">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-foreground leading-tight">
              Let's Build The <span className="brand-mark">Better World</span> Together
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Connected Hands for Family Health and Empowerment Initiative (CHAFHEI) is a youth-led, non-profit organization dedicated to creating sustainable change through healthcare, education, and community empowerment.
            </p>
            <p className="text-base sm:text-lg text-accent font-semibold">
              Our Mission: To empower communities through accessible healthcare, quality education, and sustainable development initiatives.
            </p>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <Button onClick={() => setActiveForm("donation")} className="bg-accent hover:bg-brand-orange-dark text-accent-foreground px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg">
                Donate Now
              </Button>
              <Button onClick={() => setActiveForm("volunteer")} variant="outline" className="border-accent text-accent hover:bg-brand-cream-deep px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg">
                Volunteer
              </Button>
              <Button onClick={() => setActiveForm("contact")} variant="outline" className="border-brand-green-dark text-brand-green-dark hover:bg-brand-cream-deep px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg">
                Partner With Us
              </Button>
            </div>
          </div>
          <div className="relative animate-slide-in-right">
            <PaintSplash color="gold" className="absolute -top-8 -right-6 h-20 w-24 opacity-70 -z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-orange/20 to-brand-gold/20 rounded-3xl blur-3xl opacity-30"></div>
            <div className="relative bg-gradient-to-br from-brand-cream-deep to-brand-gold/10 rounded-3xl p-12 text-center">
              <div className="text-6xl mb-4">🤝</div>
              <p className="text-foreground font-semibold">300+ People Reached in Nigeria</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white animate-fade-in-up delay-100">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-center text-foreground mb-12 sm:mb-16">Our Services</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              { icon: "🏥", title: "SRHR Services", desc: "Sexual and Reproductive Health and Rights education and services" },
              { icon: "❤️", title: "Healthcare & Nutrition", desc: "Accessible healthcare and nutrition programs for all" },
              { icon: "📋", title: "Policy Influence", desc: "Advocating for policy changes that benefit communities" },
              { icon: "📚", title: "Girl Child Education", desc: "Empowering girls through quality education" },
              { icon: "🎓", title: "Mentorship", desc: "Capacity building and mentorship programs" },
              { icon: "🌍", title: "Community Health", desc: "Community-led health initiatives and awareness" },
            ].map((service, i) => (
              <Card key={i} className="card-hover border-border hover:border-accent animate-scale-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <CardHeader>
                  <div className="text-4xl mb-2">{service.icon}</div>
                  <CardTitle className="text-accent">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{service.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-brand-cream to-brand-cream-deep animate-fade-in-up delay-200">
        <div className="max-w-4xl mx-auto relative">
          <PaintSplash color="green" className="absolute -top-10 right-0 h-16 w-20 opacity-60 -z-10" />
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-center text-foreground mb-8">About CHAFHEI</h2>
          <div className="space-y-4 sm:space-y-6 text-base sm:text-lg text-foreground/80 leading-relaxed">
            <p>
              <strong className="text-accent">Connected Hands for Family Health and Empowerment Initiative (CHAFHEI)</strong> is a youth-led, non-profit organization committed to creating sustainable change in communities across Nigeria.
            </p>
            <p>
              We believe that every individual deserves access to quality healthcare, education, and opportunities for personal development. Our work focuses on bridging the gap between healthcare access, education, and community empowerment.
            </p>
            <p>
              Through our integrated approach, we address critical issues including sexual and reproductive health rights, healthcare accessibility, nutrition, policy advocacy, girl child education, and community capacity building.
            </p>
          </div>
        </div>
      </section>

      {/* Get Involved Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white animate-fade-in-up delay-300">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-center text-foreground mb-12 sm:mb-16">Get Involved</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              { title: "Become a Volunteer", desc: "Join our team and make a direct impact in communities", icon: Users, iconClassName: "text-accent", form: "volunteer" as const },
              { title: "Donate to Support", desc: "Your donation helps us reach more people and create lasting change", icon: Heart, iconClassName: "text-destructive", form: "donation" as const },
              { title: "Become a Partner", desc: "Partner with us to amplify our impact and reach", icon: Handshake, iconClassName: "text-brand-green-dark", form: "contact" as const },
            ].map((item, i) => (
              <Card key={i} className="card-hover border-border hover:border-accent animate-scale-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <CardHeader>
                  <item.icon className={`w-12 h-12 mb-4 ${item.iconClassName}`} />
                  <CardTitle className="text-accent">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{item.desc}</p>
                  <Button onClick={() => setActiveForm(item.form)} className="w-full bg-accent hover:bg-brand-orange-dark">
                    Learn More <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-brand-cream-deep to-brand-cream animate-fade-in-up delay-400">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-center text-foreground mb-12 sm:mb-16">Upcoming Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {[
              { date: "August 15, 2026", title: "Health Awareness Campaign", location: "Asokoro, Abuja", desc: "Community health screening and awareness program" },
              { date: "August 22, 2026", title: "Girl Child Education Summit", location: "Asokoro, Abuja", desc: "Forum on empowering girls through education" },
              { date: "September 5, 2026", title: "Volunteer Training Workshop", location: "Asokoro, Abuja", desc: "Capacity building for new volunteers" },
              { date: "September 12, 2026", title: "Community Outreach Program", location: "Asokoro, Abuja", desc: "Direct engagement with community members" },
            ].map((event, i) => (
              <Card key={i} className="card-hover border-border hover:border-brand-gold animate-scale-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-accent" />
                    <span className="text-sm font-semibold text-accent">{event.date}</span>
                  </div>
                  <CardTitle>{event.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> {event.location}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{event.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white animate-fade-in-up delay-500">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <div className="space-y-6 sm:space-y-8 animate-slide-in-left">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground">Get In Touch</h2>
            <div className="space-y-4 sm:space-y-6">
              <div className="flex gap-4">
                <MapPin className="w-6 h-6 text-accent flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground">Address</h3>
                  <p className="text-muted-foreground">Asokoro, Abuja, Nigeria</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Mail className="w-6 h-6 text-accent flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground">Email</h3>
                  <a href="mailto:info@chafhein.ng" className="text-accent hover:text-brand-orange-dark">info@chafhein.ng</a>
                </div>
              </div>
              <div className="flex gap-4">
                <Phone className="w-6 h-6 text-accent flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground">Phone</h3>
                  <a href="tel:+2348166265367" className="text-accent hover:text-brand-orange-dark">+234 816 626 5367</a>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <a href="https://instagram.com" className="text-accent hover:text-brand-orange-dark">
                  <Instagram className="w-6 h-6" />
                </a>
                <a href="https://twitter.com" className="text-accent hover:text-brand-orange-dark">
                  <Twitter className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="animate-slide-in-right">
            {activeForm === "contact" && (
              <Card className="border-border">
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
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-accent"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Your Email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-accent"
                      required
                    />
                    <textarea
                      placeholder="Your Message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-accent h-32"
                      required
                    />
                    <Button type="submit" className="w-full bg-accent hover:bg-brand-orange-dark" disabled={submitContact.isPending}>
                      {submitContact.isPending ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {activeForm === "donation" && (
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Make a Donation</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleDonationSubmit} className="space-y-4">
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-accent"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Your Email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-accent"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Donation Amount (NGN)"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-accent"
                      required
                    />
                    <textarea
                      placeholder="Message (optional)"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-accent h-20"
                    />
                    <PaystackButton
                      text="Donate Now"
                      className="w-full bg-accent hover:bg-brand-orange-dark text-accent-foreground px-4 py-2 rounded-lg font-semibold transition duration-300"
                      {...paystackConfig}
                      onSuccess={handlePaystackSuccess}
                      onClose={handlePaystackClose}
                    />
                  </form>
                </CardContent>
              </Card>
            )}

            {activeForm === "volunteer" && (
              <Card className="border-border">
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
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-accent"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Your Email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-accent"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Your Skills"
                      value={formData.skills}
                      onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-accent"
                    />
                    <textarea
                      placeholder="Why do you want to volunteer?"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-accent h-20"
                    />
                    <Button type="submit" className="w-full bg-accent hover:bg-brand-orange-dark" disabled={submitVolunteer.isPending}>
                      {submitVolunteer.isPending ? "Submitting..." : "Apply Now"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {!activeForm && (
              <div className="text-center space-y-4">
                <p className="text-muted-foreground text-lg">Select a form to get started</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-ink text-brand-cream py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-brand-cream/60">&copy; 2026 Connected Hands for Family Health and Empowerment Initiative (CHAFHEI). All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
