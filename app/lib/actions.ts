'use server';
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';




const CreateInvoiceSchema = z.object({ // schema para validar os dados
    id : z.string(),
    customerId : z.string(),
    amount : z.coerce.number(),
    status : z.enum(['pending', 'paid']),
    date : z.string()
});


const CreateInvoice = CreateInvoiceSchema.omit({id : true , date :true}); // omit para omitir os campos que não precisamos

export async function createInvoice(formData: FormData) {

    const { customerId, amount, status } = CreateInvoice.parse({ // parse para validar os dados
        customerId : formData.get('customerId'),
        amount : formData.get('amount'),
        status : formData.get('status')
    });

    const amountInCents = amount * 100; // evitar erros de arredondamento
    const date = new Date().toISOString().split('T')[0]; // pegar a data atual
    console.log(customerId, amount, status);

    // inserir os dados no banco de dados
    await sql` 
        INSERT INTO invoices (customer_id, amount, status, date) 
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;

    revalidatePath('/dashboard/invoices'); // revalidar o caminho para atualizar a lista de faturas
    redirect('/dashboard/invoices'); // redirecionar para a lista de faturas
}



