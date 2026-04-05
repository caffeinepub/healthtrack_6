import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PenLine, Star, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

const LS_KEY = "vitaflow-user-reviews";

interface Athlete {
  name: string;
  sport: string;
  initials: string;
  color: string;
  bio: string;
  quote: string;
}

const ATHLETES: Athlete[] = [
  {
    name: "Serena Williams",
    sport: "Tennis",
    initials: "SW",
    color: "oklch(0.55 0.18 25)",
    bio: "Serena Williams is the greatest tennis player of all time, winning 23 Grand Slam singles titles. She trained rigorously from childhood under her father's guidance in Compton, California. Off the court, she battles health challenges and uses her platform to champion equality.",
    quote:
      "I really think a champion is defined not by their wins, but by how they can recover when they fall.",
  },
  {
    name: "Usain Bolt",
    sport: "Track & Field",
    initials: "UB",
    color: "oklch(0.72 0.18 65)",
    bio: "Usain Bolt is the fastest human ever recorded, holding world records in the 100m and 200m sprint. The Jamaican sprinter won 8 Olympic gold medals and transformed athletics into a global spectacle. His infectious personality made him one of sport's most beloved figures.",
    quote:
      "I trained 4 years to run 9 seconds, and people give up when they don't see results in 2 months.",
  },
  {
    name: "Simone Biles",
    sport: "Gymnastics",
    initials: "SB",
    color: "oklch(0.55 0.2 290)",
    bio: "Simone Biles is the most decorated American gymnast in history, with four gymnastics moves named after her. She bravely prioritized her mental health at the 2020 Olympics and returned stronger, winning gold at Paris 2024. Her courage inside and outside the gym inspires millions.",
    quote:
      "I'm not the next Usain Bolt or Michael Phelps. I'm the first Simone Biles.",
  },
  {
    name: "Cristiano Ronaldo",
    sport: "Football",
    initials: "CR",
    color: "oklch(0.48 0.09 215)",
    bio: "Cristiano Ronaldo is one of the greatest footballers of all time with 5 Ballon d'Or awards and over 800 career goals. His relentless work ethic and dedication to physical fitness have made him a role model for athletes worldwide. He continues to perform at elite level well into his late 30s.",
    quote:
      "Talent without working hard is nothing. Your love for what you do and willingness to push yourself beyond your limits is the secret.",
  },
  {
    name: "Eliud Kipchoge",
    sport: "Marathon",
    initials: "EK",
    color: "oklch(0.7 0.18 155)",
    bio: "Eliud Kipchoge is the greatest marathon runner in history, holding the world record with a time of 2:01:09. The Kenyan became the first human to run a marathon in under 2 hours in a controlled experiment. His philosophy that 'no human is limited' has made him a global icon.",
    quote: "No human is limited. Only the mind can limit you.",
  },
  {
    name: "LeBron James",
    sport: "Basketball",
    initials: "LJ",
    color: "oklch(0.62 0.19 35)",
    bio: "LeBron James is the all-time leading scorer in NBA history with 4 championships across 3 different teams. He invests over $1.5 million annually in his body through nutrition, sleep optimization, and training. Beyond basketball, he champions education and social justice through his I PROMISE School.",
    quote:
      "I like criticism. It makes you strong. The more adversity you face, the stronger you become.",
  },
];

interface StaticReview {
  name: string;
  userType: string;
  rating: number;
  text: string;
  date: string;
}

interface UserReview {
  id: string;
  name: string;
  userType: string;
  rating: number;
  text: string;
  date: string;
}

const REVIEWS: StaticReview[] = [
  {
    name: "Maya Thompson",
    userType: "Marathon Runner",
    rating: 5,
    text: "VitaFlow completely changed how I approach my training. The AI suggestions helped me finally hit my step goals consistently, and the sleep tracking is incredibly accurate.",
    date: "Mar 28, 2026",
  },
  {
    name: "Carlos Rivera",
    userType: "CrossFit Athlete",
    rating: 5,
    text: "The workout logging is exactly what I needed. Being able to track progressive overload and see AI recommendations for muscle groups I haven't trained is a game changer.",
    date: "Mar 22, 2026",
  },
  {
    name: "Priya Sharma",
    userType: "Fitness Enthusiast",
    rating: 4,
    text: "I love the clean interface and how everything syncs seamlessly. The mood tracking alongside physical metrics gives me a holistic view of my health. Highly recommend!",
    date: "Mar 15, 2026",
  },
  {
    name: "James O'Brien",
    userType: "Personal Trainer",
    rating: 5,
    text: "I recommend VitaFlow to all my clients. The goal-setting features and visual progress indicators keep them motivated. The athlete stories are an awesome motivational touch.",
    date: "Mar 8, 2026",
  },
  {
    name: "Aisha Nkrumah",
    userType: "Yoga Practitioner",
    rating: 4,
    text: "Finally a health app that doesn't feel overwhelming. The automation reminders help me stay consistent with hydration and sleep. The AI insights are surprisingly spot-on.",
    date: "Feb 28, 2026",
  },
];

function loadUserReviews(): UserReview[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as UserReview[]) : [];
  } catch {
    return [];
  }
}

function saveUserReviews(reviews: UserReview[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(reviews));
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          // biome-ignore lint/suspicious/noArrayIndexKey: stable positional array
          key={i}
          className="w-3.5 h-3.5"
          fill={i < rating ? "oklch(0.72 0.18 65)" : "transparent"}
          style={{
            color: i < rating ? "oklch(0.72 0.18 65)" : "oklch(0.8 0.01 240)",
          }}
        />
      ))}
    </div>
  );
}

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  const active = hovered > 0 ? hovered : value;

  return (
    <div className="flex gap-1" aria-label="Star rating">
      {Array.from({ length: 5 }).map((_, i) => {
        const starVal = i + 1;
        return (
          <button
            // biome-ignore lint/suspicious/noArrayIndexKey: stable positional array
            key={i}
            type="button"
            aria-label={`${starVal} star${starVal !== 1 ? "s" : ""}`}
            aria-pressed={value === starVal}
            className="p-0.5 rounded transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onMouseEnter={() => setHovered(starVal)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(starVal)}
          >
            <Star
              className="w-6 h-6 transition-colors"
              fill={starVal <= active ? "oklch(0.72 0.18 65)" : "transparent"}
              style={{
                color:
                  starVal <= active
                    ? "oklch(0.72 0.18 65)"
                    : "oklch(0.75 0.01 240)",
              }}
            />
          </button>
        );
      })}
    </div>
  );
}

function WriteReviewDialog({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (review: Omit<UserReview, "id" | "date">) => void;
}) {
  const [name, setName] = useState("");
  const [userType, setUserType] = useState("");
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");

  const isValid =
    name.trim().length > 0 &&
    userType.trim().length > 0 &&
    rating > 0 &&
    text.trim().length >= 10;

  function handleSubmit() {
    if (!isValid) return;
    onSubmit({
      name: name.trim(),
      userType: userType.trim(),
      rating,
      text: text.trim(),
    });
    setName("");
    setUserType("");
    setRating(0);
    setText("");
  }

  function handleClose() {
    onClose();
    setName("");
    setUserType("");
    setRating(0);
    setText("");
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-md" data-ocid="write_review.dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PenLine className="w-4 h-4" />
            Write a Review
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="review-name">Your Name</Label>
            <Input
              id="review-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Johnson"
              data-ocid="write_review.input"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="review-type">Who are you?</Label>
            <Input
              id="review-type"
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              placeholder="e.g. Marathon Runner, Fitness Enthusiast"
              data-ocid="write_review.input"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Rating</Label>
            <StarPicker value={rating} onChange={setRating} />
            {rating === 0 && (
              <p className="text-xs text-muted-foreground">
                Select a star rating
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="review-text">Your Review</Label>
            <Textarea
              id="review-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Share your experience with VitaFlow..."
              rows={4}
              className="resize-none"
              data-ocid="write_review.textarea"
            />
            {text.length > 0 && text.length < 10 && (
              <p className="text-xs text-destructive">
                Review must be at least 10 characters
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleClose}
            data-ocid="write_review.cancel_button"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid}
            data-ocid="write_review.submit_button"
          >
            Submit Review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AthleteStories() {
  const [userReviews, setUserReviews] = useState<UserReview[]>(loadUserReviews);
  const [dialogOpen, setDialogOpen] = useState(false);

  function handleSubmitReview(review: Omit<UserReview, "id" | "date">) {
    const now = new Date();
    const date = now.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const newReview: UserReview = {
      ...review,
      id: Date.now().toString(),
      date,
    };
    const updated = [newReview, ...userReviews];
    setUserReviews(updated);
    saveUserReviews(updated);
    setDialogOpen(false);
    toast.success("Review submitted! Thanks for sharing.");
  }

  function handleDeleteReview(id: string) {
    const updated = userReviews.filter((r) => r.id !== id);
    setUserReviews(updated);
    saveUserReviews(updated);
    toast("Review removed.");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-10"
    >
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Athlete Stories</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Get inspired by the world&apos;s greatest athletes
        </p>
      </div>

      {/* Athlete grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {ATHLETES.map((athlete, i) => (
          <motion.div
            key={athlete.name}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.07 }}
            data-ocid={`athlete_stories.item.${i + 1}`}
            className="bg-card rounded-2xl p-6 shadow-card space-y-4"
          >
            <div className="flex items-start gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                style={{ background: athlete.color }}
              >
                {athlete.initials}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-foreground text-base">
                  {athlete.name}
                </h3>
                <Badge
                  className="mt-1 text-xs"
                  style={{
                    background: `${athlete.color}22`,
                    color: athlete.color,
                    border: `1px solid ${athlete.color}44`,
                  }}
                >
                  {athlete.sport}
                </Badge>
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {athlete.bio}
            </p>

            <div
              className="rounded-xl p-4 relative"
              style={{ background: `${athlete.color}11` }}
            >
              <div
                className="absolute top-3 left-3 text-3xl leading-none font-serif opacity-30"
                style={{ color: athlete.color }}
              >
                &ldquo;
              </div>
              <p
                className="text-sm font-medium italic pl-4 leading-relaxed"
                style={{ color: athlete.color }}
              >
                {athlete.quote}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Reviews section */}
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              What Our Users Say
            </h2>
            <p className="text-muted-foreground text-sm mt-0.5">
              Real experiences from our VitaFlow community
            </p>
          </div>
          <Button
            onClick={() => setDialogOpen(true)}
            className="flex items-center gap-2 shrink-0"
            data-ocid="reviews.open_modal_button"
          >
            <PenLine className="w-4 h-4" />
            Write a Review
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* User-submitted reviews */}
          <AnimatePresence mode="popLayout">
            {userReviews.map((review, i) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                transition={{ duration: 0.28 }}
                data-ocid={`reviews.item.${i + 1}`}
                className="bg-card rounded-2xl p-5 shadow-card space-y-3 relative group border border-border"
              >
                {/* Delete button — visible on hover */}
                <button
                  type="button"
                  onClick={() => handleDeleteReview(review.id)}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                  aria-label="Delete review"
                  data-ocid="reviews.delete_button"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-start justify-between gap-2 pr-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-foreground">
                        {review.name}
                      </p>
                      <span
                        className="inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-full"
                        style={{
                          background: "oklch(0.7 0.18 155 / 0.12)",
                          color: "oklch(0.5 0.15 155)",
                          border: "1px solid oklch(0.7 0.18 155 / 0.25)",
                        }}
                      >
                        Verified User
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {review.userType}
                    </p>
                  </div>
                  <StarRating rating={review.rating} />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  &ldquo;{review.text}&rdquo;
                </p>
                <p className="text-xs text-muted-foreground/60">
                  {review.date}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Static reviews */}
          {REVIEWS.map((review, i) => (
            <motion.div
              key={review.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 + i * 0.07 }}
              data-ocid={`reviews.item.${userReviews.length + i + 1}`}
              className="bg-card rounded-2xl p-5 shadow-card space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {review.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {review.userType}
                  </p>
                </div>
                <StarRating rating={review.rating} />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                &ldquo;{review.text}&rdquo;
              </p>
              <p className="text-xs text-muted-foreground/60">{review.date}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <WriteReviewDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmitReview}
      />
    </motion.div>
  );
}
