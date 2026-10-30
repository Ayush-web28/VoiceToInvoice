export default function ClientPayPortalPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Client Invoice Portal: {params.id}</h1>
    </div>
  );
}
