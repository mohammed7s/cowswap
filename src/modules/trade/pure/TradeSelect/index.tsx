import { Menu, MenuList, MenuButton, MenuItem } from '@reach/menu-button'
import { transparentize } from 'polished'
import { ChevronDown } from 'react-feather'
import styled from 'styled-components/macro'

import { TradeWidgetField, TradeWidgetFieldProps } from '../TradeWidgetField'

export type TradeSelectItem = { label: string; value: unknown }

export interface TradeSelectProps extends TradeWidgetFieldProps {
  activeLabel: string
  items: TradeSelectItem[]
  onSelect(item: TradeSelectItem): void
  className?: string
}

const StyledMenuList = styled(MenuList)`
  background: ${({ theme }) => theme.bg1};
  box-shadow: ${({ theme }) => theme.boxShadow2};
  margin: 15px 0 0 0;
  padding: 16px;
  border-radius: 20px;
  outline: none;
  list-style: none;
  position: relative;
  z-index: 2;
  min-width: 120px;
  display: flex;
  flex-flow: column wrap;
  gap: 10px;
  transition: background 0.1s ease-in-out;
`

const StyledMenuButton = styled(MenuButton)`
  background: none;
  border: 0;
  outline: none;
  padding: 0;
  margin: 0;
  font-size: 18px;
  display: flex;
  align-items: center;
  flex-flow: row wrap;
  cursor: pointer;
  width: 100%;
  justify-content: space-between;
  color: ${({ theme }) => theme.text1};
`

const StyledMenuItem = styled(MenuItem)`
  cursor: pointer;
  font-size: 14px;
  color: ${({ theme }) => transparentize(0.2, theme.text1)};

  &:hover {
    color: ${({ theme }) => theme.text1};
  }

  &:not(:last-child) {
    margin: 0 0 10px;
  }
`

export function TradeSelect(props: TradeSelectProps) {
  const { activeLabel, items, onSelect, className } = props
  return (
    <TradeWidgetField {...props}>
      <div>
        <Menu>
          <StyledMenuButton className={className}>
            {activeLabel} <ChevronDown size={20} />
          </StyledMenuButton>
          <StyledMenuList>
            {items.map((item) => {
              return (
                <StyledMenuItem key={item.label} onSelect={() => onSelect(item)}>
                  {item.label}
                </StyledMenuItem>
              )
            })}
          </StyledMenuList>
        </Menu>
      </div>
    </TradeWidgetField>
  )
}
