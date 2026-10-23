import { redirect } from 'next/navigation';

export default async function MekanDeneRedirect({ searchParams }) {
  const params = await searchParams;
  const search = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v) search.set(k, v);
    });
  }
  const qs = search.toString();
  // Redirect directly to the interactive 3D Modeling Studio (/tasarim)
  redirect(qs ? `/tasarim?${qs}` : '/tasarim');
}
