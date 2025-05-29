import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/dashboard');
  return null; // Or a loading component if preferred, but redirect is immediate
}
