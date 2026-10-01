import { createClient } from "@/lib/supabase/server";

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  const [{ count: userCount }, { count: projectCount }, { count: postCount }, { count: publishedCount }] =
    await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("projects").select("*", { count: "exact", head: true }),
      supabase.from("posts").select("*", { count: "exact", head: true }),
      supabase.from("posts").select("*", { count: "exact", head: true }).eq("status", "published"),
    ]);

  const stats = [
    { label: "Users", value: userCount ?? 0 },
    { label: "Projects", value: projectCount ?? 0 },
    { label: "Blog posts", value: postCount ?? 0 },
    { label: "Published posts", value: publishedCount ?? 0 },
  ];

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">Overview</h1>
      <div className="mt-8 grid grid-cols-2 gap-px bg-paper-line sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-paper-raised px-5 py-6">
            <p className="font-mono text-xs uppercase tracking-wide text-ink-faint">{stat.label}</p>
            <p className="mt-2 font-serif text-3xl text-ink">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

