// ---- File: src/components/ui/textarea.tsx ----
// (Assuming this is a standard Shadcn UI component - adding it here for completeness)
import * as React from "react"

import { cn } from "@/lib/utils"

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    // Added auto-resizing logic
    const internalRef = React.useRef<HTMLTextAreaElement>(null);
    const combinedRef = (node: HTMLTextAreaElement | null) => {
        if (typeof ref === 'function') {
            ref(node);
        } else if (ref) {
            ref.current = node;
        }
        (internalRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
    };

    React.useEffect(() => {
        const textarea = internalRef.current;
        if (textarea) {
            // Reset height to recalculate
            textarea.style.height = 'auto';
            // Set height based on scroll height
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [props.value]); // Re-run when value changes

    return (
      <textarea
        className={cn(
          "flex min-h-[40px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          "overflow-hidden", // Hide scrollbar until needed
           className
        )}
        ref={combinedRef}
        onInput={(e) => {
            const textarea = e.currentTarget;
            textarea.style.height = 'auto'; // Reset height
            textarea.style.height = `${textarea.scrollHeight}px`; // Set new height
            if (props.onInput) {
                props.onInput(e); // Forward original onInput if provided
            }
        }}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }