import { redirect } from 'next/navigation';

export default function NewOrderPage() {
  redirect('/student?tab=new-order');
}
