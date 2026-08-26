import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { isValidLocale, getDictionary } from '@/lib/dictionaries'
import { listStudents, listCategories, getMyInstitution } from '@/lib/api'
import StudentsClient from '@/components/StudentsClient'

export default async function StudentsPage(props: PageProps<'/[lang]/portal/students'>) {
  const { lang } = await props.params
  if (!isValidLocale(lang)) notFound()

  const store = await cookies()
  const token = store.get('musabaqa_token')?.value!
  const dict = await getDictionary(lang)

  const [students, categories, institution] = await Promise.all([
    listStudents(token).catch(() => []),
    listCategories().catch(() => []),
    getMyInstitution(token).catch(() => null),
  ])

  return (
    <StudentsClient
      initialStudents={students}
      categories={categories}
      institution={institution}
      dict={dict}
      lang={lang}
      token={token}
    />
  )
}
