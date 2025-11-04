import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const gameCardVariants = cva(
  "relative overflow-hidden rounded-lg border bg-card text-card-foreground transition-all duration-300 hover:shadow-elevated hover:-translate-y-1 cursor-pointer group",
  {
    variants: {
      variant: {
        default: "border-border hover:border-primary/50",
        subject: "border-transparent bg-gradient-primary text-primary-foreground hover:shadow-glow",
        success: "border-transparent bg-gradient-success text-success-foreground hover:shadow-orange-glow",
        warning: "border-transparent bg-gradient-warning text-warning-foreground hover:shadow-golden-glow",
        game: "border-transparent bg-gradient-game text-primary-foreground hover:shadow-glow",
        knowledge: "border-transparent bg-gradient-knowledge text-primary-foreground hover:shadow-glow",
        wisdom: "border-transparent bg-gradient-wisdom text-secondary-foreground hover:shadow-orange-glow",
        growth: "border-transparent bg-gradient-growth text-primary-foreground hover:shadow-cyan-glow",
        intellect: "border-transparent bg-gradient-intellect text-intellect-foreground hover:shadow-golden-glow",
        purity: "border-transparent bg-gradient-purity text-purity-foreground hover:shadow-white-glow",
      },
      size: {
        default: "p-6",
        sm: "p-4",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface GameCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gameCardVariants> {}

const GameCard = React.forwardRef<HTMLDivElement, GameCardProps>(
  ({ className, variant, size, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(gameCardVariants({ variant, size, className }))}
      {...props}
    />
  )
);
GameCard.displayName = "GameCard";

export { GameCard, gameCardVariants };