import { redirect } from 'next/navigation';

export default function FreelancerOnboardingRedirect() {
  redirect('/register?role=freelancer');
}
