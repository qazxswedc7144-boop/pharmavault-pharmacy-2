import * as React from "react"
import {
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  TooltipProps as RechartsTooltipProps,
} from "recharts"
import { cn } from "@/lib/utils"
const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    config?: Record<string, { label: string; color?: string }>
  }
>(({ className, children, config, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex aspect-video justify-center text-xs", className)}
      {...props}
    >
      <ResponsiveContainer width="100%" height="100%">
        {children as React.ReactElement}
      </ResponsiveContainer>
    </div>
  )
})
ChartContainer.displayName = "ChartContainer"
const ChartTooltip = RechartsTooltip
const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  RechartsTooltipProps<any, any> & {
    hideLabel?: boolean
    className?: string
  }
>(({ active, payload, label, hideLabel, className }, ref) => {
  if (!active || !payload?.length) {
    return null
  }
  return (
    <div
      ref={ref}
      className={cn(
        "grid min-w-[8rem] items-start gap-1.5 rounded-lg border bg-background p-2.5 shadow-xl text-right",
        className
      )}
      dir="rtl"
    >
      {!hideLabel && (
        <div className="font-medium text-muted-foreground">{label}</div>
      )}
      <div className="grid gap-1.5">
        {payload.map((item, index) => (
          <div
            key={index}
            className="flex flex-row-reverse items-center justify-between gap-2"
          >
            <div className="flex items-center gap-1.5 flex-row-reverse">
              <div
                className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-muted-foreground">{item.name}</span>
            </div>
            <span className="font-bold tabular-nums">
              {item.value?.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
})
ChartTooltipContent.displayName = "ChartTooltipContent"
export { ChartContainer, ChartTooltip, ChartTooltipContent }