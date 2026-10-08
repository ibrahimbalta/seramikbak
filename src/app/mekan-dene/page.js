import { redirect } from 'next/navigation';

export default async function MekanDeneRedirect({ searchParams }) {
  const params = await searchParams;
  const qs = params?.slug ? `?slug=${encodeURIComponent(params.slug)}` : '';
  redirect(`/mekanimda-gor${qs}`);
}
