import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { isValidLocale, getDictionary } from '@/lib/dictionaries'
import { getStudent, listCategories } from '@/lib/api'
import StudentEditClient from '@/components/StudentEditClient'

export default async function EditStudentPage(
  props: PageProps<'/[lang]/portal/students/[id]/edit'>
) {
  const { lang, id } = await props.params
  if (!isValidLocale(lang)) notFound()

  const store = await cookies()
  const token = store.get('musabaqa_token')?.value!
  const dict = await getDictionary(lang)

  const [student, categories] = await Promise.all([
    getStudent(token, parseInt(id)).catch(() => null),
    listCategories().catch(() => []),
  ])

  if (!student) notFound()

  return (
    <div className="max-w-lg mx-auto">
      <StudentEditClient student={student} categories={categories} dict={dict} lang={lang} token={token} />
    </div>
  )
}
