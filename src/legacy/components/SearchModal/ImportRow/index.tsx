import { CSSProperties } from 'react'

import { Token } from '@uniswap/sdk-core'

import styled from 'styled-components/macro'

import { ButtonPrimary } from 'legacy/components/Button'
import { StyledListLogo } from 'legacy/components/ListLogo'
import { AutoRow } from 'legacy/components/Row'

import ImportRowMod, { TokenSection } from './ImportRowMod'

interface ImportRowProps {
  token: Token
  style?: CSSProperties
  dim?: boolean
  showImportView: () => void
  setImportToken: (token: Token) => void
}

const Wrapper = styled.div`
  width: 100%;

  ${TokenSection} > div > div:not(:last-child) {
    flex-flow: column wrap;
    align-items: flex-start;
  }

  ${StyledListLogo} {
    margin: 0 0 0 5px;
  }

  ${TokenSection} > svg {
    stroke: ${({ theme }) => theme.text2};
  }

  ${TokenSection} ${AutoRow} {
    flex-flow: column wrap;
    align-items: flex-start;
  }

  ${AutoRow} > div {
    color: ${({ theme }) => theme.text1};
    margin: 0;
  }

  ${TokenSection} > ${ButtonPrimary} {
    min-height: auto;
    font-size: 16px;
  }
`

export default function ImportRow(props: ImportRowProps) {
  return (
    <Wrapper>
      <ImportRowMod {...props} />
    </Wrapper>
  )
}
