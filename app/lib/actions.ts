'use server';
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { InvoiceForm } from '../lib/definitions';





const FormSchema = z.object({ // schema para validar os dados
    id : z.string(),
    customerId : z.string(),
    amount : z.coerce.number(),
    status : z.enum(['pending', 'paid']),
    date : z.string()
});


const CreateInvoice = FormSchema.omit({id : true , date :true}); // omit para omitir os campos que não precisamos
const UpdateInvoice = FormSchema.omit({id : true , date :true}); // omit para omitir os campos que não precisamos

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
   try {
    await sql`
        INSERT INTO invoices (customer_id, amount, status, date) 
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
   } catch (error) {
    return { message : 'Database Error : Failed to create invoice'};
   }


    revalidatePath('/dashboard/invoices'); // revalidar o caminho para atualizar a lista de faturas
    redirect('/dashboard/invoices'); // redirecionar para a lista de faturas
}

export async function updateInvoice(id : string , formData : FormData) {
    const { customerId, amount, status } = UpdateInvoice.parse({ // parse para validar os dados
        customerId : formData.get('customerId'),
        amount : formData.get('amount'),
        status : formData.get('status')
    });
    
    const amountInCents = amount * 100; // evitar erros de arredondamento

    try {
        await sql`
            UPDATE invoices
            SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
            WHERE id = ${id}
        `;
    } catch (error) {
        return { message : 'Database Error : Failed to update invoice'};
    }

    revalidatePath('/dashboard/invoices'); // revalidar o caminho para atualizar a lista de faturas
    redirect('/dashboard/invoices'); // redirecionar para a lista de faturas
}

export async function deleteInvoice(id : string) {
    
    try {
        await sql`DELETE FROM invoices WHERE id = ${id}`;
        
    } catch (error) {
        return { message : 'Database Error : Failed to delete invoice'};
    }

    revalidatePath('/dashboard/invoices'); // revalidar o caminho para atualizar a lista de faturas
    redirect('/dashboard/invoices'); // redirecionar para a lista de faturas
}



