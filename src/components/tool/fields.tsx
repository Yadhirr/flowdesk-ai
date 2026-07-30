import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="flex items-start gap-1.5 text-sm font-medium text-destructive">
      <AlertCircle aria-hidden className="mt-0.5 size-4 shrink-0" />
      <span className="min-w-0">
        <span className="sr-only">Error: </span>
        {message}
      </span>
    </p>
  );
}

function FieldShell({
  id,
  label,
  hint,
  required,
  error,
  children,
  counter,
}: {
  id: string;
  label: string;
  hint?: ReactNode;
  required?: boolean;
  error?: string;
  children: ReactNode;
  counter?: ReactNode;
}) {
  return (
    <div className="grid min-w-0 gap-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
          {required ? (
            <span className="ml-1 text-muted-foreground">
              <span aria-hidden>*</span>
              <span className="sr-only">(required)</span>
            </span>
          ) : (
            <span className="ml-1 text-xs font-normal text-muted-foreground">(optional)</span>
          )}
        </Label>
        {counter}
      </div>
      {children}
      {hint ? (
        <p id={`${id}-hint`} className="text-xs leading-relaxed text-muted-foreground">
          {hint}
        </p>
      ) : null}
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

type BaseProps = {
  id: string;
  label: string;
  hint?: ReactNode;
  required?: boolean;
  error?: string;
};

export function TextField({
  id,
  label,
  hint,
  required,
  error,
  value,
  onChange,
  placeholder,
  type = "text",
  inputRef,
}: BaseProps & {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  inputRef?: (el: HTMLInputElement | null) => void;
}) {
  return (
    <FieldShell id={id} label={label} hint={hint} required={required} error={error}>
      <Input
        id={id}
        ref={inputRef}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={cn(hint && `${id}-hint`, error && `${id}-error`) || undefined}
        className={cn(error && "border-destructive")}
      />
    </FieldShell>
  );
}

export function TextAreaField({
  id,
  label,
  hint,
  required,
  error,
  value,
  onChange,
  placeholder,
  rows = 5,
  maxLength,
  showCounter,
  inputRef,
}: BaseProps & {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  showCounter?: boolean;
  inputRef?: (el: HTMLTextAreaElement | null) => void;
}) {
  const counter = showCounter ? (
    <span className="text-xs tabular-nums text-muted-foreground" aria-live="polite">
      {value.length}
      {maxLength ? ` / ${maxLength}` : ""} characters
    </span>
  ) : undefined;

  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      required={required}
      error={error}
      counter={counter}
    >
      <Textarea
        id={id}
        ref={inputRef}
        rows={rows}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={cn(hint && `${id}-hint`, error && `${id}-error`) || undefined}
        className={cn("min-h-24 resize-y", error && "border-destructive")}
      />
    </FieldShell>
  );
}

export function SelectField({
  id,
  label,
  hint,
  required,
  error,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  triggerRef,
}: BaseProps & {
  value: string;
  onChange: (value: string) => void;
  options: readonly string[] | readonly { value: string; label: string }[];
  placeholder?: string;
  triggerRef?: (el: HTMLButtonElement | null) => void;
}) {
  const normalized = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
  return (
    <FieldShell id={id} label={label} hint={hint} required={required} error={error}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          id={id}
          ref={triggerRef}
          aria-invalid={error ? true : undefined}
          aria-describedby={cn(hint && `${id}-hint`, error && `${id}-error`) || undefined}
          className={cn("w-full", error && "border-destructive")}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {normalized.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldShell>
  );
}

export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="grid min-w-0 gap-4 border-0 p-0">
      <legend className="text-sm font-semibold">{title}</legend>
      {description ? (
        <p className="-mt-2 text-xs leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
      {children}
    </fieldset>
  );
}
