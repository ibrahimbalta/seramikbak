import { redirect } from 'next/navigation';

export default async function MekanDeneRedirect({ searchParams }) {
  const params = await searchParams;
  const search = new URLSearchParams();
  search.set('tab', 'studio');
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v) search.set(k, v);
    });
  }
  const qs = search.toString();
  // Redirect directly to the main SeramikBak 3D Modeling Studio on homepage
  redirect(`/?${qs}#studio`);
}
