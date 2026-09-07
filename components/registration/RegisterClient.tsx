'use client'

import React, { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import OptionCardSelector from '@/components/registration/OptionCardSelector'
import ExpressStudentIntake from '@/components/registration/ExpressStudentIntake'
import RosterPortalLogin from '@/components/registration/RosterPortalLogin'
import RegisterForm from '@/components/RegisterForm'
import type {
  County,
  Region,
  InstitutionDirectoryItem,
  CompetitionRead,
  Category,
} from '@/lib/api'
import type en from '@/dictionaries/en.json'

type Dict = typeof en

interface RegisterClientProps {
  counties: County[]
  regions: Region[]
  institutions: InstitutionDirectoryItem[]
  competitions: CompetitionRead[]
  categories: Category[]
  dict: Dict
  lang: string
}

export default function RegisterClient({
  counties,
  regions,
  institutions,
  competitions,
  categories,
  dict,
  lang,
}: RegisterClientProps) {
  const searchParams = useSearchParams()
  const initialParam = searchParams.get('option')
  const defaultOpt: 1 | 2 | 3 = initialParam === '1' ? 1 : initialParam === '3' ? 3 : 2

  const [selectedOption, setSelectedOption] = useState<1 | 2 | 3>(defaultOpt)

  return (
    <div className="w-full">
      {/* 3-Option Card Switcher */}
      <OptionCardSelector
        selectedOption={selectedOption}
        onSelectOption={setSelectedOption}
        dict={dict}
        lang={lang}
      />

      {/* Dynamic Form Area Based on Selected Option */}
      <div className="mt-8">
        {selectedOption === 1 && (
          <div className="max-w-lg mx-auto">
            <RegisterForm
              dict={dict}
              counties={counties}
              regions={regions}
              lang={lang}
            />
          </div>
        )}

        {selectedOption === 2 && (
          <div className="max-w-3xl mx-auto">
            <ExpressStudentIntake
              institutions={institutions}
              competitions={competitions}
              categories={categories}
              dict={dict}
              lang={lang}
            />
          </div>
        )}

        {selectedOption === 3 && (
          <div className="max-w-2xl mx-auto">
            <RosterPortalLogin
              institutions={institutions}
              dict={dict}
              lang={lang}
            />
          </div>
        )}
      </div>
    </div>
  )
}
