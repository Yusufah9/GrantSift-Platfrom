import { PostForm } from "@/components/admin/post-form";
import { createPostAction } from "@/app/(admin)/admin/blog/actions";

export default function NewPostPage() {
  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">New post</h1>
      <div className="mt-8">
        <PostForm action={createPostAction} />
      </div>
    </div>
  );
}

