'use client'

import { useState, useMemo, useCallback, KeyboardEvent } from 'react'
import { ChevronDown, ChevronUp, Search } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { MultiSelectDropdownProps } from '../app/app.types'

function Option({
  checked,
  label,
  onClick,
  onKeyDown,
  className,
}: {
  checked: boolean
  label: string
  onClick: () => void
  onKeyDown?: (e: KeyboardEvent<HTMLDivElement>) => void
  className?: string
}) {
  return (
    <div
      role="option"
      aria-selected={checked}
      tabIndex={0}
      className={cn(
        'flex items-center gap-4 px-4 py-2 cursor-pointer hover:bg-accent focus:bg-accent outline-none font-medium',
        className,
      )}
      onClick={onClick}
      onKeyDown={onKeyDown}
    >
      <Checkbox checked={checked} tabIndex={-1} />
      <span>{label}</span>
    </div>
  )
}

export default function MultiSelectDropdown({
  options,
  placeholder = 'Select items',
  itemLabel = { singular: 'item', plural: 'items' },
  onChange,
}: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [appliedSelection, setAppliedSelection] = useState<Set<string>>(
    new Set(),
  )
  const [draftSelection, setDraftSelection] = useState<Set<string>>(new Set())

  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options
    const term = searchTerm.toLowerCase()
    return options.filter((opt) => opt.name.toLowerCase().includes(term))
  }, [options, searchTerm])

  const allFilteredSelected = useMemo(() => {
    return (
      filteredOptions.length > 0 &&
      filteredOptions.every((opt) => draftSelection.has(opt.id))
    )
  }, [filteredOptions, draftSelection])

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setDraftSelection(new Set(appliedSelection))
    }
    setSearchTerm('')
    setOpen(isOpen)
  }

  const handleSelectAll = () => {
    const next = new Set(draftSelection)
    if (allFilteredSelected) {
      filteredOptions.forEach((opt) => next.delete(opt.id))
    } else {
      filteredOptions.forEach((opt) => next.add(opt.id))
    }
    setDraftSelection(next)
  }

  const handleToggle = (id: string) => {
    const next = new Set(draftSelection)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setDraftSelection(next)
  }

  const handleApply = () => {
    setAppliedSelection(new Set(draftSelection))
    onChange?.(Array.from(draftSelection))
    setOpen(false)
  }

  const handleCancel = () => {
    setOpen(false)
  }

  const handleOptionKeyDown = useCallback(
    (action: () => void) => (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        action()
      }
    },
    [],
  )

  const selectLabel =
    appliedSelection.size > 0
      ? `${appliedSelection.size} ${appliedSelection.size === 1 ? itemLabel.singular : itemLabel.plural} selected`
      : placeholder

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'flex items-center justify-between w-full sm:w-[370px] h-[42px] px-4 py-[10px] leading-5 font-medium border rounded-md bg-white cursor-pointer',
            open ? 'border-[#14645A] text-[#14645A]' : 'border-input',
          )}
        >
          <span>{selectLabel}</span>
          {open ? (
            <ChevronUp className="h-4 w-4 shrink-0 text-[#14645A]" />
          ) : (
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] sm:w-[370px] border-none shadow-dropdown p-0"
        align="start"
      >
        <div className="flex items-center gap-4 px-4 py-2 border-b">
          <Search className="h-4 w-4 shrink-0" />
          <input
            type="text"
            placeholder="Search"
            aria-label="Search options"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent outline-none placeholder:text-medium-gray font-medium"
          />
        </div>

        <div
          role="listbox"
          aria-label={placeholder}
          style={{ scrollbarWidth: 'thin' }}
          className="max-h-[200px] overflow-y-auto"
        >
          <Option
            checked={allFilteredSelected}
            label="Select all"
            onClick={handleSelectAll}
            onKeyDown={handleOptionKeyDown(handleSelectAll)}
            className="border-b h-10 box-border"
          />

          {filteredOptions.map((option) => (
            <Option
              key={option.id}
              checked={draftSelection.has(option.id)}
              label={option.name}
              onClick={() => handleToggle(option.id)}
              onKeyDown={handleOptionKeyDown(() => handleToggle(option.id))}
            />
          ))}

          {filteredOptions.length === 0 && (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              No results found
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-4 py-2 border-t">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleApply}>
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
