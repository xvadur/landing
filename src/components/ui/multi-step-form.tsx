import * as React from 'react'

/**
 * Multi-step form: a dependency-free form-state layer designed to sit on top of
 * the <Stepper /> UI. It owns values, per-field errors, touched state, and the
 * active step, and gates forward navigation on the current step's validator.
 * Stepper renders the indicator; this drives its `activeStep`.
 */

export type StepValidator<V> = (values: V) => Record<string, string> | null

export interface MultiStepFormStep<V> {
  id: string
  validate?: StepValidator<V>
}

interface MultiStepFormContextValue<V> {
  values: V
  setValue: <K extends keyof V>(name: K, value: V[K]) => void
  errors: Record<string, string>
  touched: Record<string, boolean>
  activeStep: number
  /** true = posun prebehol; false = krok má chyby (sú v `errors`) */
  next: () => boolean
  back: () => void
  /** Dopredu overí každý krok medzi aktuálnym a cieľom; pri chybe zastaví na prvom neplatnom kroku a vráti false. */
  goTo: (step: number) => boolean
  canGoNext: boolean
  isStepValid: boolean
  isFirstStep: boolean
  isLastStep: boolean
  /** Overí všetky kroky; pri chybe prejde na prvý neplatný krok a vráti false. */
  submit: () => boolean
}

// One context object reused for every value type; consumers read it through the
// typed useMultiStepForm<V>() hook below.
const MultiStepFormContext = React.createContext<MultiStepFormContextValue<unknown> | null>(null)

export interface MultiStepFormProps<V> {
  steps: MultiStepFormStep<V>[]
  initialValues: V
  onSubmit: (values: V) => void
  children: React.ReactNode
}

export function MultiStepForm<V>({
  steps,
  initialValues,
  onSubmit,
  children,
}: MultiStepFormProps<V>) {
  const [values, setValues] = React.useState<V>(initialValues)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [touched, setTouched] = React.useState<Record<string, boolean>>({})
  const [activeStep, setActiveStep] = React.useState(0)

  const totalSteps = steps.length
  const isFirstStep = activeStep === 0
  const isLastStep = activeStep === totalSteps - 1

  const setValue = React.useCallback(<K extends keyof V>(name: K, value: V[K]) => {
    setValues((prev) => ({ ...prev, [name]: value }))
    setTouched((prev) => ({ ...prev, [name as string]: true }))
    setErrors((prev) => {
      if (!(name as string in prev)) return prev
      const next = { ...prev }
      delete next[name as string]
      return next
    })
  }, [])

  // Validate the current step against the latest values. Returns true when the
  // step has no validator or the validator returns null; otherwise publishes
  // the errors and returns false.
  const validateStep = React.useCallback(
    (step: number): boolean => {
      const validator = steps[step]?.validate
      if (!validator) {
        setErrors({})
        return true
      }
      const result = validator(values)
      setErrors(result ?? {})
      return result === null
    },
    [steps, values]
  )

  const isStepValid = React.useMemo(() => {
    const validator = steps[activeStep]?.validate
    return validator ? validator(values) === null : true
  }, [steps, activeStep, values])

  // Prvý neplatný krok v rozsahu [from, to) alebo -1. Preskočiť krok dopredu sa nesmie bez jeho validácie
  // (goTo(3) z kroku 0 predtým overil iba krok 0 a kroky 1–2 obišiel).
  const firstInvalid = React.useCallback(
    (from: number, to: number): number => {
      for (let i = from; i < to; i++) {
        const validator = steps[i]?.validate
        if (validator && validator(values) !== null) return i
      }
      return -1
    },
    [steps, values]
  )

  const goTo = React.useCallback(
    (step: number): boolean => {
      if (step < 0 || step >= totalSteps) return false
      // Backward navigation is unguarded; forward validates every step in between.
      if (step > activeStep) {
        const bad = firstInvalid(activeStep, step)
        if (bad !== -1) {
          setActiveStep(bad)
          validateStep(bad)
          return false
        }
      }
      setErrors({})
      setActiveStep(step)
      return true
    },
    [activeStep, totalSteps, firstInvalid, validateStep]
  )

  const next = React.useCallback((): boolean => {
    if (isLastStep) return false
    if (!validateStep(activeStep)) return false
    setActiveStep((s) => Math.min(s + 1, totalSteps - 1))
    return true
  }, [activeStep, isLastStep, totalSteps, validateStep])

  const back = React.useCallback(() => {
    setErrors({})
    setActiveStep((s) => Math.max(s - 1, 0))
  }, [])

  const submit = React.useCallback((): boolean => {
    if (!isLastStep) return false
    const bad = firstInvalid(0, totalSteps)
    if (bad !== -1) {
      setActiveStep(bad)
      validateStep(bad)
      return false
    }
    setErrors({})
    onSubmit(values)
    return true
  }, [isLastStep, firstInvalid, totalSteps, onSubmit, validateStep, values])

  const ctx: MultiStepFormContextValue<V> = {
    values,
    setValue,
    errors,
    touched,
    activeStep,
    next,
    back,
    goTo,
    canGoNext: isStepValid && !isLastStep,
    isStepValid,
    isFirstStep,
    isLastStep,
    submit,
  }

  return (
    <MultiStepFormContext.Provider value={ctx as MultiStepFormContextValue<unknown>}>
      {children}
    </MultiStepFormContext.Provider>
  )
}

export function useMultiStepForm<V>(): MultiStepFormContextValue<V> {
  const ctx = React.useContext(MultiStepFormContext)
  if (!ctx) {
    throw new Error('useMultiStepForm must be used within a <MultiStepForm />')
  }
  return ctx as MultiStepFormContextValue<V>
}
