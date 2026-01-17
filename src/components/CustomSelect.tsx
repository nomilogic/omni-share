"use client";

import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";

type Option<T extends string> = { value: T; label: string };

const cn = (...classes: Array<string | undefined | null | false>) =>
  classes.filter(Boolean).join(" ");

export function CustomSelect<T extends string>({
  value,
  onChange,
  options,
  buttonClassName = "",
}: {
  value: T;
  onChange: (val: T) => void;
  options: Option<T>[];
  buttonClassName?: string;
}) {
  const selected = options.find((o) => o.value === value);

  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative">
        <Listbox.Button
          className={cn(
            "w-full px-3 py-2.5 border border-gray-300 rounded-md bg-white text-left",
            "focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-500",
            "flex items-center justify-between gap-2",
            buttonClassName
          )}
        >
          <span className="block truncate text-sm text-slate-900">
            {selected?.label ?? ""}
          </span>

          {/* Chevron */}
          <svg
            className="h-4 w-4 text-slate-500 shrink-0"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
              clipRule="evenodd"
            />
          </svg>
        </Listbox.Button>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <Listbox.Options className="absolute z-20 mt-1 w-full max-h-60 overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none">
            {options.map((opt) => (
              <Listbox.Option
                key={opt.value}
                value={opt.value}
                className={({ active }) =>
                  cn(
                    "relative cursor-pointer select-none py-2 pl-9 pr-3 text-sm",
                    active ? "bg-purple-100 text-slate-900" : "text-slate-700"
                  )
                }
              >
                {({ selected }) => (
                  <>
                    <span className={cn("block truncate", selected && "font-medium")}>
                      {opt.label}
                    </span>

                    {selected ? (
                      <span className="absolute inset-y-0 left-2 flex items-center text-purple-700">
                        {/* Check */}
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.704 5.29a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0l-3.25-3.25a1 1 0 011.414-1.414l2.543 2.543 6.543-6.543a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                    ) : null}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}
