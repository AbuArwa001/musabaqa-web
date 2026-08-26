import { redirect } from 'next/navigation'

export default async function PortalRoot(props: PageProps<'/[lang]/portal'>) {
  const { lang } = await props.params
  redirect(`/${lang}/portal/students`)
}
