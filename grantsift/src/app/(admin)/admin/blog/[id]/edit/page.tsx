import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BlogService } from "@/lib/services/blog-service";
import { PostForm } from "@/components/admin/post-form";
import { updatePostAction } from "@/app/(admin)/admin/blog/actions";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const blog = new BlogService(supabase);

  const post = await blog.getById(id);
  if (!post) notFound();

  const [tags, categories] = await Promise.all([blog.getTagsForPost(post.id), blog.listCategories()]);
  const category = categories.find((c) => c.id === post.category_id);

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">Edit post</h1>
      <div className="mt-8">
        <PostForm
          action={updatePostAction.bind(null, post.id)}
          post={post}
          initialCategory={category?.name}
          initialTags={tags.map((t) => t.name).join(", ")}
        />
      </div>
    </div>
  );
}
