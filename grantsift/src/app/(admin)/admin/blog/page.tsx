import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BlogService } from "@/lib/services/blog-service";
import { PostStatusSelect } from "@/components/admin/post-status-select";
import { DeletePostButton } from "@/components/admin/delete-post-button";

export default async function AdminBlogListPage() {
  const supabase = await createClient();
  const posts = await new BlogService(supabase).listAllForAdmin();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-ink">Blog</h1>
        <Link href="/admin/blog/new" className="bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-stamp-dark">
          New post
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="mt-10 text-ink-faint">No posts yet.</p>
      ) : (
        <div className="mt-8 overflow-x-auto border border-paper-line">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-paper-line bg-paper-raised font-mono text-[11px] uppercase tracking-wide text-ink-faint">
              <tr>
                <th className="px-4 py-2 font-normal">Title</th>
                <th className="px-4 py-2 font-normal">Updated</th>
                <th className="px-4 py-2 font-normal">Status</th>
                <th className="px-4 py-2 font-normal"></th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b border-paper-line last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/admin/blog/${post.id}/edit`} className="text-ink hover:underline">
                      {post.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-soft">
                    {new Date(post.updated_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <PostStatusSelect postId={post.id} status={post.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DeletePostButton postId={post.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
