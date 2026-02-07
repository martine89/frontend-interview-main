'use client'

import { useState, useCallback, KeyboardEvent, useMemo, useEffect } from 'react'
import { ChevronDown, ChevronUp, Search, LoaderCircle } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { MultiSelectDropdownProps } from '../app/app.types'
import { debounce } from 'lodash'
import { useInView } from 'react-intersection-observer'

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
  options = [],
  placeholder = 'Select items',
  itemLabel = { singular: 'item', plural: 'items' },
  onLoadMore,
  hasMore,
  loadingMore,
  onSearch,
  onSelection,
}: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [appliedSelection, setAppliedSelection] = useState<string[]>([])
  const [draftSelection, setDraftSelection] = useState<string[]>([])

  const { ref, inView } = useInView()

  const debouncedOnSearch = useMemo(
    () => debounce((value: string) => onSearch(value), 500),
    [onSearch],
  )

  useEffect(() => {
    return () => debouncedOnSearch.cancel()
  }, [debouncedOnSearch])

  useEffect(() => {
    if (inView && hasMore && !loadingMore) {
      onLoadMore()
    }
  }, [onLoadMore, inView, hasMore, loadingMore])

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setDraftSelection([...appliedSelection])
    }
    setSearchTerm('')
    debouncedOnSearch('')
    setOpen(isOpen)
  }

  const allOptionsSelected = useMemo(() => {
    return (
      options.length > 0 &&
      options.every((opt) => draftSelection.includes(opt.id))
    )
  }, [options, draftSelection])

  const handleSelectAll = () => {
    if (allOptionsSelected) {
      setDraftSelection([])
    } else {
      setDraftSelection(options.map((opt) => opt.id))
    }
  }

  const handleToggle = (id: string) => {
    if (draftSelection.includes(id)) {
      setDraftSelection(draftSelection.filter((x) => x !== id))
    } else {
      setDraftSelection([...draftSelection, id])
    }
  }

  const handleApply = () => {
    setAppliedSelection([...draftSelection])
    setOpen(false)
    onSelection(draftSelection)
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
    appliedSelection.length > 0
      ? `${appliedSelection.length} ${appliedSelection.length === 1 ? itemLabel.singular : itemLabel.plural} selected`
      : placeholder

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'flex items-center justify-between w-full sm:w-[370px] h-[42px] px-4 py-[10px] leading-5 font-medium border rounded-md bg-white cursor-pointer',
            open ? 'border-focused text-focused' : 'border-input',
          )}
        >
          <span>{selectLabel}</span>
          {open ? (
            <ChevronUp className="h-4 w-4 shrink-0 text-focused" />
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
            onChange={(e) => {
              setSearchTerm(e.target.value)
              debouncedOnSearch(e.target.value)
            }}
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
            checked={allOptionsSelected}
            label="Select all"
            onClick={handleSelectAll}
            onKeyDown={handleOptionKeyDown(handleSelectAll)}
            className="border-b h-10 box-border"
          />

          {options.map((option) => (
            <Option
              key={option.id}
              checked={draftSelection.includes(option.id)}
              label={option.name}
              onClick={() => handleToggle(option.id)}
              onKeyDown={handleOptionKeyDown(() => handleToggle(option.id))}
            />
          ))}

          {loadingMore && (
            <div className="h-10 w-full flex items-center justify-center">
              <LoaderCircle className="animate-spin" />
            </div>
          )}
          <div ref={ref}></div>

          {options.length === 0 && (
            <div className="h-10 px-3 py-2 text-sm flex items-center text-muted-foreground">
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
