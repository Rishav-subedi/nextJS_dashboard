import { fetchCustomers, fetchFilteredCustomers } from "@/app/lib/data";
import CustomersTable from "@/app/ui/customers/table";

export default async function (props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
  try {
    const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
    const response = await fetchFilteredCustomers(query);
      return (
      <div>
        <CustomersTable customers={response} />
      </div>
      )
  } catch (error) {
    console.log(error)
    return "Error in server Code";
  }
}
