import { useEffect } from 'react'
import {
  onLCP,
  onFID,
  onCLS,
  onINP,
  onFCP,
  onTTFB,
} from 'next-hybrid/dist/compiled/web-vitals'
import type { Metric } from 'next-hybrid/dist/compiled/web-vitals'

export function useReportWebVitals(
  reportWebVitalsFn: (metric: Metric) => void
) {
  useEffect(() => {
    onCLS(reportWebVitalsFn)
    onFID(reportWebVitalsFn)
    onLCP(reportWebVitalsFn)
    onINP(reportWebVitalsFn)
    onFCP(reportWebVitalsFn)
    onTTFB(reportWebVitalsFn)
  }, [reportWebVitalsFn])
}
