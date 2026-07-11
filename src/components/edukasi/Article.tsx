import Link from "next/link";

export function ArticleLayout({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/edukasi" className="text-sm text-coffee-600 hover:underline">← Edukasi Kopi</Link>
      <h1 className="mt-2 text-3xl font-bold text-coffee-800">{title}</h1>
      <p className="mt-2 text-lg text-coffee-700">{intro}</p>
      <div className="prose prose-coffee mt-6 max-w-none space-y-6 text-coffee-800">
        {children}
      </div>
    </article>
  );
}

export function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-coffee-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-coffee-800">{title}</h2>
      <div className="mt-2 space-y-2 text-coffee-700">{children}</div>
    </section>
  );
}
