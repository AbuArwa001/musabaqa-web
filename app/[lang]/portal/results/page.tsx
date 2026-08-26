import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { isValidLocale, getDictionary } from '@/lib/dictionaries'
import { listStudents, listCategories, getStudentResults } from '@/lib/api'
import PortalResultsClient from '@/components/PortalResultsClient'

export default async function PortalResultsPage(props: PageProps<'/[lang]/portal/results'>) {
  const { lang } = await props.params
  if (!isValidLocale(lang)) notFound()

  const store = await cookies()
  const token = store.get('musabaqa_token')?.value!
  const dict = await getDictionary(lang)

  const [students, categories] = await Promise.all([
    listStudents(token).catch(() => []),
    listCategories().catch(() => []),
  ])

  // Fetch results for each student
  const resultsMap: Record<number, Awaited<ReturnType<typeof getStudentResults>>> = {}
  await Promise.all(
    students.map(async (s) => {
      try {
        resultsMap[s.id] = await getStudentResults(token, s.id)
      } catch {
        resultsMap[s.id] = []
      }
    })
  )

  return (
    <PortalResultsClient
      students={students}
      categories={categories}
      resultsMap={resultsMap}
      dict={dict}
      lang={lang}
    />
  )
}
