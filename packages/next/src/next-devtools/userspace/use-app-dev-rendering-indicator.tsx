'use client'

import { useEffect, useTransition } from 'react'
import { dispatcher } from 'next-hybrid/dist/compiled/next-devtools'

export const useAppDevRenderingIndicator = () => {
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (isPending) {
      dispatcher.renderingIndicatorShow()
    } else {
      dispatcher.renderingIndicatorHide()
    }
  }, [isPending])

  return startTransition
}
