import RevenueChart from '@/app/ui/dashboard/revenue-chart';
import LatestInvoices from '@/app/ui/dashboard/latest-invoices';
import { poppins } from '@/app/ui/fonts';
import { fetchCardData } from '@/app/lib/data';
import { Suspense } from 'react';
import { RevenueChartSkeleton } from '@/app/ui/skeletons';
import { LatestInvoicesSkeleton } from '@/app/ui/skeletons';
import CardWrapper from '@/app/ui/dashboard/cards';
import CardSkeleton from '@/app/ui/dashboard/cards';
export default async function Page() {
  

  return (
    <main>
      <h1 className={`${poppins.className} mb-4 text-xl md:text-2xl`}>
        Olá, Rhuan!
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {<Suspense fallback={<CardSkeleton />}>
            <CardWrapper/>
          </Suspense>}
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        { <Suspense fallback={<RevenueChartSkeleton />}>
          <RevenueChart />
        </Suspense> }
        { <Suspense fallback={<LatestInvoicesSkeleton />}>
          <LatestInvoices />
        </Suspense> }
      </div>
    </main>
  );
}