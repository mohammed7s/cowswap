import React from 'react'

import { Trans } from '@lingui/macro'

import QuestionHelper from 'legacy/components/QuestionHelper'
import { renderTooltip } from 'legacy/components/Tooltip'

import { Content, ErrorText, TradeWidgetFieldBox, TradeWidgetFieldLabel } from './styled'

export type TradeWidgetFieldError = { type: 'error' | 'warning'; text: string | null } | null

export interface TradeWidgetFieldProps {
  label: React.ReactNode
  children?: JSX.Element
  tooltip?: React.ReactNode | ((params: any) => React.ReactNode)
  error?: TradeWidgetFieldError
  className?: string
  hasPrefix?: boolean
}

export function TradeWidgetField(props: TradeWidgetFieldProps) {
  const { className, children, label, tooltip, error, hasPrefix } = props
  const tooltipElement = renderTooltip(tooltip, props)

  return (
    <TradeWidgetFieldBox className={className} hasPrefix={hasPrefix}>
      <TradeWidgetFieldLabel>
        <Trans>{label}</Trans>
        {tooltip && <QuestionHelper text={tooltipElement} />}
      </TradeWidgetFieldLabel>
      <Content>{children}</Content>
      {error && <ErrorText type={error.type}>{error.text}</ErrorText>}
    </TradeWidgetFieldBox>
  )
}
