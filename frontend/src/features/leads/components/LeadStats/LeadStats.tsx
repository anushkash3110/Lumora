const cards = [
  {
    title: "Total Leads",
    value: "1,245",
  },
  {
    title: "High Opportunity",
    value: "234",
  },
  {
    title: "Follow Ups",
    value: "51",
  },
  {
    title: "Closed",
    value: "18",
  },
];

export default function LeadStats() {
  return (
    <section className="grid grid-cols-4 gap-5">

      {cards.map((card) => (

        <div
          key={card.title}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-xl transition"
        >

          <p className="text-slate-500">

            {card.title}

          </p>

          <h2 className="mt-4 text-4xl font-bold">

            {card.value}

          </h2>

        </div>

      ))}

    </section>
  );
}