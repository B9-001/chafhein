"use client";

import { useMemo, useState } from "react";
import { Calendar, MapPin, PartyPopper, Radio, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { formatNaira, formatEventDate } from "@/app/page";
import type { Campaign, EventItem } from "@/server/supabase";

interface UpcomingPopupProps {
  campaigns: Campaign[];
  events: EventItem[];
}

/**
 * Floating "What's Coming Up" popup — a quick-glance summary of upcoming
 * events and active campaigns, reachable from anywhere on the page without
 * scrolling down to the full sections. Reuses the campaigns/events data
 * already fetched on the homepage (no extra network round trip) and the
 * existing Dialog/Tabs/Badge primitives so it matches the rest of the site
 * exactly rather than introducing a one-off visual style.
 *
 * Animations are defined in a small scoped <style> block below rather than
 * reused from page.tsx's global .animate-fade-in-up etc. — this component
 * can mount independently of page.tsx's own <style> tag ordering, and it
 * lets these specific animations respect prefers-reduced-motion without
 * changing the behavior of every other .animate-* class already used
 * across the homepage.
 */
export function UpcomingPopup({ campaigns, events }: UpcomingPopupProps) {
  const [open, setOpen] = useState(false);

  const upcomingEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return events
      .filter((e) => e.status?.toLowerCase() !== "completed")
      .filter((e) => !e.eventDate || new Date(e.eventDate) >= today)
      .sort((a, b) => {
        if (!a.eventDate) return 1;
        if (!b.eventDate) return -1;
        return new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime();
      })
      .slice(0, 5);
  }, [events]);

  const activeCampaigns = useMemo(() => {
    return campaigns
      .filter((c) => c.status?.toLowerCase() !== "completed" && c.status?.toLowerCase() !== "ended")
      .slice(0, 5);
  }, [campaigns]);

  const totalCount = upcomingEvents.length + activeCampaigns.length;

  function jumpTo(id: string) {
    setOpen(false);
    // Let the dialog's own close animation finish before scrolling, so the
    // page doesn't jump while the panel is still animating out.
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  }

  return (
    <>
      <style>{`
        @keyframes popFabIn {
          from { opacity: 0; transform: translateY(24px) scale(0.9); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes popItemIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes popPanelIn {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes popPing {
          0% { transform: scale(1); opacity: 0.85; }
          75%, 100% { transform: scale(2.2); opacity: 0; }
        }
        .pop-fab-in { animation: popFabIn 0.5s cubic-bezier(0.23, 1, 0.32, 1) 0.5s both; }
        .pop-item-in { animation: popItemIn 0.35s ease-out both; }
        .pop-panel-in { animation: popPanelIn 0.28s cubic-bezier(0.23, 1, 0.32, 1) both; }
        .pop-ping { animation: popPing 1.8s cubic-bezier(0, 0, 0.2, 1) infinite; }
        @media (prefers-reduced-motion: reduce) {
          .pop-fab-in, .pop-item-in, .pop-panel-in, .pop-ping { animation: none; }
        }
      `}</style>

      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="See upcoming events and campaigns"
        className="pop-fab-in fixed bottom-5 right-5 sm:bottom-8 sm:right-8 z-40 flex items-center gap-2 rounded-full bg-gradient-to-r from-accent to-brand-gold px-4 py-3.5 text-accent-foreground shadow-lg shadow-accent/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-accent/40 active:scale-95"
      >
        <span className="relative flex h-2.5 w-2.5">
          {totalCount > 0 && (
            <span className="pop-ping absolute inline-flex h-full w-full rounded-full bg-brand-gold" />
          )}
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-gold" />
        </span>
        <PartyPopper className="h-5 w-5" />
        <span className="hidden sm:inline text-sm font-semibold whitespace-nowrap">
          What&apos;s Coming Up
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent showCloseButton={false} className="pop-panel-in max-h-[85vh] overflow-hidden p-0 gap-0 sm:max-w-lg">
          <DialogHeader className="relative bg-gradient-to-br from-brand-ink to-accent px-6 py-5 text-left">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute right-4 top-4 rounded-full p-1 text-accent-foreground/80 transition hover:bg-white/10 hover:text-accent-foreground"
            >
              <X className="h-4 w-4" />
            </button>
            <DialogTitle className="flex items-center gap-2 text-xl font-serif text-accent-foreground">
              <PartyPopper className="h-5 w-5 text-brand-gold" /> What&apos;s Coming Up
            </DialogTitle>
            <DialogDescription className="text-accent-foreground/80">
              Stay in the loop on our upcoming events and active campaigns.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="events" className="px-6 py-5">
            <TabsList className="w-full">
              <TabsTrigger value="events" className="gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> Events
                <Badge variant="neutral" className="ml-1 px-1.5">{upcomingEvents.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="campaigns" className="gap-1.5">
                <Radio className="h-3.5 w-3.5" /> Campaigns
                <Badge variant="neutral" className="ml-1 px-1.5">{activeCampaigns.length}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="events" className="mt-4 max-h-[50vh] space-y-3 overflow-y-auto pr-1">
              {upcomingEvents.length === 0 ? (
                <EmptyRow icon={Calendar} message="No events scheduled right now. Check back soon!" />
              ) : (
                upcomingEvents.map((event, i) => (
                  <button
                    key={event.id}
                    onClick={() => jumpTo("events")}
                    style={{ animationDelay: `${i * 60}ms` }}
                    className="pop-item-in flex w-full items-start gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:border-accent hover:bg-brand-cream-deep"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-cream-deep text-accent">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-foreground">{event.title}</p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        {event.eventDate && <span>{formatEventDate(event.eventDate)}</span>}
                        {event.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {event.location}
                          </span>
                        )}
                        {event.webinarLink && (
                          <Badge variant="default" className="px-1.5 py-0">Webinar</Badge>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </TabsContent>

            <TabsContent value="campaigns" className="mt-4 max-h-[50vh] space-y-3 overflow-y-auto pr-1">
              {activeCampaigns.length === 0 ? (
                <EmptyRow icon={Radio} message="New campaigns are launching soon — check back soon!" />
              ) : (
                activeCampaigns.map((campaign, i) => {
                  const target = Number(campaign.targetAmount ?? 0);
                  const raised = Number(campaign.raisedAmount ?? 0);
                  const progress = target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : null;
                  return (
                    <button
                      key={campaign.id}
                      onClick={() => jumpTo("campaigns")}
                      style={{ animationDelay: `${i * 60}ms` }}
                      className="pop-item-in w-full rounded-lg border border-border p-3 text-left transition-colors hover:border-accent hover:bg-brand-cream-deep"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate font-semibold text-foreground">{campaign.title}</p>
                        <Badge variant="default" className="shrink-0 capitalize">{campaign.status}</Badge>
                      </div>
                      {progress !== null && (
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{formatNaira(raised)} raised</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-brand-cream-deep">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-accent to-brand-gold transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}

function EmptyRow({ icon: Icon, message }: { icon: typeof Calendar; message: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-8 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-cream-deep text-accent">
        <Icon className="h-4 w-4" />
      </div>
      <p className="max-w-[220px] text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
