'use server';
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { InvoiceForm } from '../lib/definitions';


export type State = {
    errors? : {
        customerId? : string[];
        amount? : string[];
        status? : string[];
    };
    message? : string | null;
};


const FormSchema = z.object({ // schema para validar os dados
    id : z.string(),
    customerId : z.string({
        invalid_type_error : 'Customer is required'
    }),
    amount : z.coerce.number().gt(0, {message : 'Amount must be greater than 0'}),
    status : z.enum(['pending', 'paid'], {
        invalid_type_error : 'Status is required'
    }),
    date : z.string()
});


const CreateInvoice = FormSchema.omit({id : true , date :true}); // omit para omitir os campos que não precisamos
const UpdateInvoice = FormSchema.omit({id : true , date :true}); // omit para omitir os campos que não precisamos

export async function createInvoice(prevState : State, formData: FormData) {

    const validatedFields = CreateInvoice.safeParse({ // parse para validar os dados
        customerId : formData.get('customerId'),
        amount : formData.get('amount'),
        status : formData.get('status')
    });

    if(!validatedFields.success) {
        return {
            errors : validatedFields.error.flatten().fieldErrors,
            message : 'Please fill all the required fields'
        };
    }

    const amountInCents = validatedFields.data.amount * 100; // evitar erros de arredondamento
    const date = new Date().toISOString().split('T')[0]; // pegar a data atual
    console.log(validatedFields.data);

    // inserir os dados no banco de dados
   try {
    await sql`
        INSERT INTO invoices (customer_id, amount, status, date) 
        VALUES (${validatedFields.data.customerId}, ${amountInCents}, ${validatedFields.data.status}, ${date})
    `;
   } catch (error) {
    return { message : 'Database Error : Failed to create invoice'};
   }


    revalidatePath('/dashboard/invoices'); // revalidar o caminho para atualizar a lista de faturas
    redirect('/dashboard/invoices'); // redirecionar para a lista de faturas
}

export async function updateInvoice(id : string , prevState : State, formData : FormData) {
    const validatedFields = UpdateInvoice.safeParse({ // parse para validar os dados
        customerId : formData.get('customerId'),
        amount : formData.get('amount'),
        status : formData.get('status')
    });

    if(!validatedFields.success) {
        return {
            errors : validatedFields.error.flatten().fieldErrors,
            message : 'Please fill all the required fields'
        };
    }
    
    const amountInCents = validatedFields.data.amount * 100; // evitar erros de arredondamento

    try {
        await sql`
            UPDATE invoices
            SET customer_id = ${validatedFields.data.customerId}, amount = ${amountInCents}, status = ${validatedFields.data.status}
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



