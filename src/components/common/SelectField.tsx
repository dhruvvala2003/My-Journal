import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Option } from '@/lib/constants'
import { cn } from '@/lib/utils'

const ALL = '__all__'

interface SelectFieldProps {
  id?: string
  value: string
  onChange: (value: string) => void
  options: readonly Option[]
  placeholder?: string
  /** Adds an "All …" choice that maps to an empty string (used by filters). */
  allLabel?: string
  className?: string
  invalid?: boolean
}

export function SelectField({
  id,
  value,
  onChange,
  options,
  placeholder = 'Select…',
  allLabel,
  className,
  invalid,
}: SelectFieldProps) {
  return (
    <Select
      value={value === '' && allLabel ? ALL : value}
      onValueChange={(v) => onChange(v === ALL ? '' : v)}
    >
      <SelectTrigger id={id} className={cn('w-full', className)} aria-invalid={invalid || undefined}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent position="popper">
        {allLabel && <SelectItem value={ALL}>{allLabel}</SelectItem>}
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
