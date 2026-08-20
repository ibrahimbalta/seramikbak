import { redirect } from 'next/navigation';

export default async function TeklifAlRedirectPage({ searchParams }) {
  const sp = await searchParams;
  const queryString = sp ? new URLSearchParams(sp).toString() : '';
  const destination = queryString ? `/proje-talep?${queryString}` : '/proje-talep';
  
  redirect(destination);
}
