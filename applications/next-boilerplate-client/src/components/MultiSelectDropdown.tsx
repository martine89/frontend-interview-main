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

const CHECKBOX_CLASS =
  'pointer-events-none data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600'

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
        'flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-accent focus:bg-accent outline-none',
        className,
      )}
      onClick={onClick}
      onKeyDown={onKeyDown}
    >
      <Checkbox checked={checked} tabIndex={-1} className={CHECKBOX_CLASS} />
      <span className="text-sm">{label}</span>
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
            'flex items-center justify-between w-full sm:w-[280px] px-3 py-2 text-sm border rounded-md bg-white cursor-pointer',
            open
              ? 'border-teal-600 text-teal-700 ring-1 ring-teal-600'
              : 'border-input text-foreground',
          )}
        >
          <span
            className={cn(
              appliedSelection.size === 0 && !open && 'text-muted-foreground',
            )}
          >
            {selectLabel}
          </span>
          {open ? (
            <ChevronUp className="h-4 w-4 shrink-0 opacity-50" />
          ) : (
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] sm:w-[280px] p-0"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex items-center gap-2 px-3 py-2 border-b">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search"
            aria-label="Search options"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div
          role="listbox"
          aria-label={placeholder}
          className="max-h-[200px] overflow-y-auto"
        >
          <Option
            checked={allFilteredSelected}
            label="Select all"
            onClick={handleSelectAll}
            onKeyDown={handleOptionKeyDown(handleSelectAll)}
            className="border-b"
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

        <div className="flex items-center justify-between px-3 py-2 border-t">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleApply}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
