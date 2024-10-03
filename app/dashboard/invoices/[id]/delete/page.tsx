import { deleteInvoice } from "@/app/lib/actions";
import Breadcrumbs from "@/app/ui/invoices/breadcrumbs";

export default async function DeleteInvoicePage({params} : {params : {id : string}}) {
    const id = params.id;
    await deleteInvoice(id);
    

    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    {
                        label: 'Invoices',
                        href: '/dashboard/invoices'
                    },
                    {
                        label: 'Delete Invoice',
                        href: `/dashboard/invoices/${id}/delete`,
                        active: true
                    }
                ]}
            />     
        </main>
    );
}   