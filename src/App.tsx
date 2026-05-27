import { type FormEvent, useState } from "react";
import confetti from "canvas-confetti";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Gift, Plus, Sparkles, Ticket, Trash2 } from "lucide-react";

import BeamsBackground from "@/components/kokonutui/beams-background";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import data from "./data.json";

type Coupon = {
  id: string;
  title: string;
  description: string;
  isCustom?: boolean;
};

const birthdayGirl = data.birthdayGirl;
const fromName = data.fromName;
const redeemedStorageKey = `${birthdayGirl.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-birthday-redeemed`;
const customCouponsStorageKey = `${birthdayGirl.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-birthday-custom-coupons`;

const defaultCoupons: Coupon[] = data.coupons;

function readJson<T>(key: string, fallback: T) {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "") as T;
  } catch {
    return fallback;
  }
}

function createCouponId(title: string) {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return `custom-${slug || "coupon"}-${Date.now()}`;
}

function App() {
  const reduceMotion = useReducedMotion();
  const [redeemed, setRedeemed] = useState<Record<string, number>>(() =>
    readJson(redeemedStorageKey, {}),
  );
  const [customCoupons, setCustomCoupons] = useState<Coupon[]>(() =>
    readJson(customCouponsStorageKey, []),
  );
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newCouponTitle, setNewCouponTitle] = useState("");
  const [newCouponDescription, setNewCouponDescription] = useState("");
  const [titleError, setTitleError] = useState<string | null>(null);

  const handleAddOpenChange = (open: boolean) => {
    setIsAddOpen(open);
    if (!open) {
      setNewCouponTitle("");
      setNewCouponDescription("");
      setTitleError(null);
    }
  };

  const coupons = [...defaultCoupons, ...customCoupons];

  function launchConfetti() {
    if (reduceMotion) return;

    confetti({
      particleCount: 70,
      spread: 68,
      origin: { y: 0.76 },
      colors: ["#2f2925", "#8a4a45", "#f3ede5", "#fffaf4"],
    });
  }

  function redeemCoupon(coupon: Coupon) {
    const currentCount = redeemed[coupon.id] ?? 0;
    const nextRedeemed = { ...redeemed, [coupon.id]: currentCount + 1 };

    setRedeemed(nextRedeemed);
    localStorage.setItem(redeemedStorageKey, JSON.stringify(nextRedeemed));
    setSelectedCoupon(coupon);
    launchConfetti();
  }

  function addCoupon(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const title = newCouponTitle.trim();
    const description = newCouponDescription.trim();

    if (!title) {
      setTitleError("Coupon name is required.");
      return;
    }

    const nextCoupons = [
      ...customCoupons,
      {
        id: createCouponId(title),
        title,
        description,
        isCustom: true,
      },
    ];

    setCustomCoupons(nextCoupons);
    localStorage.setItem(customCouponsStorageKey, JSON.stringify(nextCoupons));
    setNewCouponTitle("");
    setNewCouponDescription("");
    setTitleError(null);
    setIsAddOpen(false);
  }

  function removeCustomCoupon(coupon: Coupon) {
    const nextCoupons = customCoupons.filter((item) => item.id !== coupon.id);
    const nextRedeemed = { ...redeemed };

    delete nextRedeemed[coupon.id];
    setCustomCoupons(nextCoupons);
    setRedeemed(nextRedeemed);
    localStorage.setItem(customCouponsStorageKey, JSON.stringify(nextCoupons));
    localStorage.setItem(redeemedStorageKey, JSON.stringify(nextRedeemed));
  }

  return (
    <BeamsBackground intensity="subtle" className="text-foreground">
      <main className="min-h-screen">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 sm:gap-12 px-5 py-8 sm:px-8 sm:py-12">
          <motion.section
            className="flex min-h-[50svh] flex-col justify-center gap-8 pt-8 sm:pt-12"
            aria-labelledby="birthday-title"
            initial={{ opacity: 0.72, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32 }}
          >
            <div className="flex max-w-3xl flex-col gap-7">
              <h1
                id="birthday-title"
                className="font-heading text-6xl leading-[0.95] font-semibold tracking-normal text-balance text-foreground sm:text-7xl lg:text-8xl"
              >
                Happy Birthday, {birthdayGirl}
              </h1>

              <div className="flex flex-col gap-5 text-base leading-8 text-foreground/75 sm:text-lg">
                {data.hero.paragraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
                <p className="font-medium text-foreground">
                  With all my love, {fromName}
                </p>
              </div>
            </div>
          </motion.section>

          <Separator />

          <section
            className="flex flex-col gap-6"
            aria-labelledby="coupon-title"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col gap-3">
                <Badge variant="secondary" className="w-fit">
                  <Ticket data-icon="inline-start" />
                  Birthday Coupons
                </Badge>
                <h2
                  id="coupon-title"
                  className="font-heading text-4xl font-semibold tracking-normal"
                >
                  Birthday Coupons
                </h2>
              </div>
              <Button type="button" onClick={() => setIsAddOpen(true)}>
                <Plus data-icon="inline-start" />
                Add coupon
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {coupons.map((coupon, index) => {
                const redeemCount = redeemed[coupon.id] ?? 0;
                const isRedeemed = redeemCount > 0;

                return (
                  <motion.div
                    key={coupon.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.35, delay: index * 0.03 }}
                  >
                    <Card className="h-full bg-card/80 backdrop-blur-md">
                      <CardHeader>
                        <CardTitle>{coupon.title}</CardTitle>
                        <CardDescription>
                          {isRedeemed
                            ? `Redeemed ${redeemCount} time${redeemCount > 1 ? "s" : ""}`
                            : "Available"}
                        </CardDescription>
                        <CardAction>
                          <Badge variant={isRedeemed ? "secondary" : "outline"}>
                            {isRedeemed ? (
                              <Check data-icon="inline-start" />
                            ) : (
                              <Gift data-icon="inline-start" />
                            )}
                            {isRedeemed ? `${redeemCount}x Redeemed` : "Ready"}
                          </Badge>
                        </CardAction>
                      </CardHeader>
                      <CardContent>
                        <p className="leading-7 text-foreground/70">
                          {coupon.description}
                        </p>
                      </CardContent>
                      <CardFooter className="gap-2">
                        <Button
                          type="button"
                          className="flex-1"
                          onClick={() => redeemCoupon(coupon)}
                        >
                          {isRedeemed ? "Redeem Again" : "Redeem"}
                        </Button>
                        {coupon.isCustom && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeCustomCoupon(coupon)}
                            aria-label={`Remove ${coupon.title}`}
                          >
                            <Trash2 />
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </section>

          <Separator />

          <motion.section
            className="mx-auto flex max-w-2xl flex-col items-center gap-4 pb-8 sm:pb-12 text-center"
            aria-labelledby="promise-title"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.45 }}
          >
            <Badge variant="outline">
              <Sparkles data-icon="inline-start" />
              Tiny promise
            </Badge>
            <h2
              id="promise-title"
              className="font-heading text-4xl font-semibold tracking-normal"
            >
              {data.promise.title}
            </h2>
            <p className="text-base leading-8 text-foreground/70 sm:text-lg">
              {data.promise.description}
            </p>
          </motion.section>
        </div>

        <Dialog open={isAddOpen} onOpenChange={handleAddOpenChange}>
          <DialogContent>
            <form className="flex flex-col gap-4" onSubmit={addCoupon}>
              <DialogHeader>
                <DialogTitle>Add a coupon</DialogTitle>
                <DialogDescription>
                  Write a promise you would like to redeem later.
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="new-coupon-title"
                  className={titleError ? "text-destructive" : ""}
                >
                  Coupon name
                </Label>
                <Input
                  id="new-coupon-title"
                  value={newCouponTitle}
                  onChange={(event) => {
                    setNewCouponTitle(event.target.value);
                    if (titleError) setTitleError(null);
                  }}
                  placeholder="Coffee date"
                  className={
                    titleError
                      ? "border-destructive focus-visible:ring-destructive"
                      : ""
                  }
                />
                {titleError && (
                  <p className="text-xs font-medium text-destructive mt-0.5 animate-in fade-in-50 duration-200">
                    {titleError}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="new-coupon-description">Promise</Label>
                <Textarea
                  id="new-coupon-description"
                  value={newCouponDescription}
                  onChange={(event) =>
                    setNewCouponDescription(event.target.value)
                  }
                  placeholder="A slow evening with coffee, dessert, and no rush."
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleAddOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  <Plus data-icon="inline-start" />
                  Save coupon
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog
          open={Boolean(selectedCoupon)}
          onOpenChange={() => setSelectedCoupon(null)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
                <Ticket className="h-6 w-6" />
              </div>
              <DialogTitle className="text-2xl font-semibold font-heading">
                Coupon Redeemed
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1">
                Show this screen to {fromName}. This birthday coupon is now
                officially active.
              </DialogDescription>
            </DialogHeader>

            {selectedCoupon && (
              <div className="relative overflow-hidden rounded-xl border border-border/60 bg-muted/30 p-6 my-3">
                {/* Visual coupon cutout ticket look */}
                <div className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border-r border-border/60 bg-background" />
                <div className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border-l border-border/60 bg-background" />

                <div className="flex flex-col gap-4 text-center">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center justify-center gap-1.5">
                    <span>Gift Voucher</span>
                    <span className="text-foreground/30 font-light">|</span>
                    <span>Redemption #{redeemed[selectedCoupon.id] ?? 1}</span>
                  </div>
                  <div className="font-heading text-xl font-medium text-foreground">
                    {selectedCoupon.title}
                  </div>
                  <Separator className="border-dashed" />
                  <p className="text-sm leading-relaxed text-foreground/80">
                    {selectedCoupon.description}
                  </p>
                  <div className="mt-2 inline-flex items-center justify-center gap-1.5 self-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    <Sparkles className="h-3.5 w-3.5" />
                    Ready to use
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                className="w-full"
                onClick={() => setSelectedCoupon(null)}
              >
                Got it
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </BeamsBackground>
  );
}

export default App;
