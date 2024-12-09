'use server';

import {z} from 'zod';  // using a type validation library
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache'; 
import { redirect } from 'next/navigation';
import { error } from 'console';

// defining a schema that matches the shape of the form object to validate the formData before saving it to the database.
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(), // amount field is specifically set to coerce (change) from a string to a number
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});
 
const CreateInvoice = FormSchema.omit({ id: true, date: true });

// **Server Action for creating new invoice**
export async function createInvoice(formData: FormData) {
  const {customerId, amount, status} = CreateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
  //storing monetary values in cents in the database to eliminate JavaScript floating-point errors
  const amountInCents = amount * 100;
  
  //creating a new date with the format "YYYY-MM-DD" for the invoice's creation date
  const date = new Date().toISOString().split('T')[0];
  
  try{
    // Inserting the data into the database
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  
  }
  catch(error){
    return{
      message: 'Database Error: Failed to Create Invoice.',
    }
  }
  
  // Revalidating the path to ensure the newly created invoice is reflected in the cache and redirecting to InvoicesPage
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

// **Server Action for updating invoices**
const UpdateInvoice = FormSchema.omit({id:true, date:true});

export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
 
  const amountInCents = amount * 100;
 
  try{
    await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
  }
  catch(error){
    return { message: 'Database Error: Failed to Update Invoice.' };
  }
 
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

// **Server Action for deleting an invoice**
export async function deleteInvoice(id: string) {
  // throw new Error('failed to delete an invoice');
  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
    return { message: 'Deleted Invoice.' };
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Invoice.' };
  }
}