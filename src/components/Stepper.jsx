import { cn } from '../lib/utils'
import { LoaderCircle } from 'lucide-react'
import React, { createContext, useContext } from 'react'
import { CheckIcon } from '@radix-ui/react-icons'

// ── Contexts ────────────────────────────────────────────────

const StepperContext = createContext(undefined)
const StepItemContext = createContext(undefined)

function useStepper() {
  const ctx = useContext(StepperContext)
  if (!ctx) throw new Error('useStepper must be used within a Stepper')
  return ctx
}

function useStepItem() {
  const ctx = useContext(StepItemContext)
  if (!ctx) throw new Error('useStepItem must be used within a StepperItem')
  return ctx
}

// ── Stepper ─────────────────────────────────────────────────

function Stepper({
  defaultValue = 0,
  value,
  onValueChange,
  orientation = 'horizontal',
  className,
  children,
  ...props
}) {
  const [activeStep, setInternalStep] = React.useState(defaultValue)

  const setActiveStep = React.useCallback(
    (step) => {
      if (value === undefined) setInternalStep(step)
      onValueChange?.(step)
    },
    [value, onValueChange],
  )

  const currentStep = value ?? activeStep

  return (
    <StepperContext.Provider value={{ activeStep: currentStep, setActiveStep, orientation }}>
      <div
        className={cn(
          'group/stepper inline-flex',
          'data-[orientation=horizontal]:w-full data-[orientation=horizontal]:flex-row',
          'data-[orientation=vertical]:flex-col',
          className,
        )}
        data-orientation={orientation}
        {...props}
      >
        {children}
      </div>
    </StepperContext.Provider>
  )
}

// ── StepperItem ─────────────────────────────────────────────

function StepperItem({
  step,
  completed = false,
  disabled = false,
  loading = false,
  className,
  children,
  ...props
}) {
  const { activeStep } = useStepper()

  const state =
    completed || step < activeStep
      ? 'completed'
      : activeStep === step
        ? 'active'
        : 'inactive'

  const isLoading = loading && step === activeStep

  return (
    <StepItemContext.Provider value={{ step, state, isDisabled: disabled, isLoading }}>
      <div
        className={cn(
          'group/step flex items-center',
          'group-data-[orientation=horizontal]/stepper:flex-row',
          'group-data-[orientation=vertical]/stepper:flex-col',
          className,
        )}
        data-state={state}
        {...(isLoading ? { 'data-loading': true } : {})}
        {...props}
      >
        {children}
      </div>
    </StepItemContext.Provider>
  )
}

// ── StepperTrigger ──────────────────────────────────────────

function StepperTrigger({ className, children, ...props }) {
  const { setActiveStep } = useStepper()
  const { step, isDisabled } = useStepItem()

  return (
    <button
      className={cn(
        'inline-flex items-center gap-3 disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
      onClick={() => setActiveStep(step)}
      disabled={isDisabled}
      {...props}
    >
      {children}
    </button>
  )
}

// ── StepperIndicator ────────────────────────────────────────
// Numbered circle. Check icon on completion, spinner when loading.
// Colors: inactive → gray-200, active/completed → blue-600

function StepperIndicator({ className, children, ...props }) {
  const { state, step, isLoading } = useStepItem()

  return (
    <div
      className={cn(
        'relative flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium',
        'bg-gray-200 text-gray-600',
        'data-[state=active]:bg-slate-700 data-[state=active]:text-white',
        'data-[state=completed]:bg-slate-700 data-[state=completed]:text-white',
        className,
      )}
      data-state={state}
      {...props}
    >
      <span className="transition-all group-data-[loading=true]/step:scale-0 group-data-[state=completed]/step:scale-0 group-data-[loading=true]/step:opacity-0 group-data-[state=completed]/step:opacity-0 group-data-[loading=true]/step:transition-none">
        {children}
      </span>
      <CheckIcon
        className="absolute scale-0 opacity-0 transition-all group-data-[state=completed]/step:scale-100 group-data-[state=completed]/step:opacity-100"
        size={16}
        strokeWidth={2}
        aria-hidden="true"
      />
      {isLoading && (
        <span className="absolute transition-all">
          <LoaderCircle className="animate-spin" size={14} strokeWidth={2} aria-hidden="true" />
        </span>
      )}
    </div>
  )
}

// ── StepperTitle ────────────────────────────────────────────

function StepperTitle({ className, ...props }) {
  return <h3 className={cn('text-sm font-medium', className)} {...props} />
}

// ── StepperDescription ──────────────────────────────────────

function StepperDescription({ className, ...props }) {
  return <p className={cn('text-sm text-gray-500', className)} {...props} />
}

// ── StepperSeparator ────────────────────────────────────────
// Line between steps. Turns blue-600 when the preceding step is completed.

function StepperSeparator({ className, ...props }) {
  return (
    <div
      className={cn(
        'm-0.5 bg-gray-200',
        'group-data-[orientation=horizontal]/stepper:h-0.5 group-data-[orientation=horizontal]/stepper:w-full group-data-[orientation=horizontal]/stepper:flex-1',
        'group-data-[orientation=vertical]/stepper:h-12 group-data-[orientation=vertical]/stepper:w-0.5',
        'group-data-[state=completed]/step:bg-slate-700',
        className,
      )}
      {...props}
    />
  )
}

// ── Exports ─────────────────────────────────────────────────

export {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
}

