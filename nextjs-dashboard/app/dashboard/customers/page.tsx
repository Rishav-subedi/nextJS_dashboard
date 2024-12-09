
export default function Page() {
  try {
      return (
      <div>
        <p>Customers Page</p>
      </div>
      )
  } catch (error) {
    console.log(error)
    return "Error in server Code";
  }
}
