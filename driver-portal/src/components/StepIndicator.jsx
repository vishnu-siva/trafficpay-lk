import { useTranslation } from 'react-i18next'

export default function StepIndicator({ current }) {
  const { t } = useTranslation()
  const steps = [t('step1'), t('step2'), t('step3')]

  return (
    <div className="flex items-center justify-center gap-2" aria-label="Payment progress">
      {steps.map((step, index) => {
        const stepNo = index + 1
        const complete = stepNo < current
        const active = stepNo === current

        return (
          <div key={step} className="flex min-w-0 items-center gap-2">
            <div
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold transition-all duration-200 ${
                complete
                  ? 'bg-blue-900 text-white shadow-md'
                  : active
                  ? 'bg-blue-950 text-white shadow-lg ring-2 ring-blue-300/60 ring-offset-2'
                  : 'bg-slate-200 text-slate-500 shadow-sm'
              }`}
            >
              {complete ? '✓' : stepNo}
            </div>
            <span
              className={`hidden max-w-28 truncate text-sm sm:block ${
                active ? 'font-semibold text-blue-950' : complete ? 'font-medium text-blue-800' : 'text-slate-400'
              }`}
            >
              {step}
            </span>
            {index < steps.length - 1 && (
              <div
                className={`h-0.5 w-8 shrink-0 rounded-full transition-all duration-300 ${
                  complete ? 'bg-blue-900' : 'bg-slate-200'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
