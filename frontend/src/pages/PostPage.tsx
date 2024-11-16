import { useParams } from "react-router-dom";
import { ApiPost } from "../api/posts";
import { useEffect, useRef, useState } from "react";
import { ApiUser } from "../api/user";
import { Timeline } from "../api/timeline";

import { NotFound } from "../components/NotFound";
import { Sidebar } from "../components/Sidebar";
import { useUserIdentity } from "../hooks";
import { PostDisplay } from "../components/PostDisplay";
import { Spinner } from "@nextui-org/react";
import { TimelineDisplay } from "../components/TimelineDisplay";
import { PostComposer } from "../components/PostComposer";

import * as api from "../api";

export function PostPage() {
  const currentUser = useUserIdentity();

  const { postId } = useParams();

  const [parentPost, setParentPost] = useState<ApiPost | null>(null);
  const [parentAuthor, setParentAuthor] = useState<ApiUser | null>(null);
  const [post, setPost] = useState<ApiPost | null>(null);
  const [author, setAuthor] = useState<ApiUser | null>(null);
  const [replies, setReplies] = useState<Timeline | null>(null);

  const mainPostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!postId)
      return;

    (async () => {
      const res = await api.posts.thread(parseInt(postId));
      if (res.status !== "ok") {
        console.error(`Couldn't load the post ${postId}.`, res);
        alert(`Sorry, we couldn't load that post. ${res.error}`);
        return;
      }

      setPost(res.post);
      setAuthor(res.author);
      setReplies(res.replyTimeline);
      setParentPost(res.parentPost);
      setParentAuthor(res.parentAuthor);

      mainPostRef.current?.scrollIntoView();
    })().catch(console.error);
  }, [postId]);

  if (postId == undefined) 
    return <NotFound type="post"/>

  async function handleInteract(
    id: number,
    applyUpdatedPost: React.Dispatch<React.SetStateAction<ApiPost | null>>,
    applyUpdatedAuthor: React.Dispatch<React.SetStateAction<ApiUser | null>>
  ) {
    const res = await api.posts.get(id);
    if (res.status !== "ok") {
      console.error(`Could not a post after an interaction.`, res);
      return;
    }

    applyUpdatedPost(res.post);
    applyUpdatedAuthor(res.author);
  }

  async function handleAuthorMutate(
    handle: string,
    applyUpdatedAuthor: React.Dispatch<React.SetStateAction<ApiUser | null>>
  ) {
    const res = await api.user.get(handle);
    if (res.status !== "ok") {
      console.error(`Could not update the parent author.`, res);
      return;
    }

    applyUpdatedAuthor(res);
  }

  async function handleChildInteraction(target: ApiPost) {
    const res = await api.posts.get(target.id);
    if (res.status !== "ok") {
      console.error(`Could not update post with ID ${target.id}.`, res);
      return;
    }

    for (const entry of replies!.entries) {
      if (entry.post.id == target.id) {
        entry.post = res.post;
      }
    }

    setReplies({...replies!});
  }

  async function handleChildAuthorMutation(_: ApiPost, author: ApiUser) {
    const resp = await api.user.get(author.handle);
    if (resp.status !== "ok") {
      console.error("Could not refresh the profile of a user on the timeline.", resp);
      return;
    }

    replies!.actors[author.id] = resp;
    setReplies({ ...replies! });
  }

  async function onReplyCreate(createdId: number) {
    if (!currentUser || !replies)
      return;

    const created = await api.posts.get(createdId);
    if (created.status !== "ok") {
      console.error("The post was created, but we couldn't retrieve it!", created);
      return;
    }

    if (!(currentUser.id in replies.actors)) {
      replies.actors[currentUser.id] = currentUser;
    }

    replies.entries.unshift({
      kind: "raw",
      post: created.post
    });

    setReplies({ ...replies });
    setPost({
      ...post!,
      replies: post!.replies + 1
    });
  }

  return <main className="flex w-full h-full">
    <Sidebar className="w-1/4" tab="home" user={currentUser} />

    <section className="flex w-full p-8 justify-start flex-col overflow-y-scroll gap-6">
      { post === null || author === null || replies === null
        ? <Spinner/>
        : (
        <>
          { parentPost == null || parentAuthor == null ? <></> : <div>
            <PostDisplay clickable={true}
              post={parentPost} author={parentAuthor}
              onInteraction={() => handleInteract(parentPost.id, setParentPost, setParentAuthor)}
              onUserMutate={() => handleAuthorMutate(parentAuthor.handle, setParentAuthor)}
            />
          </div> }

          <div ref={mainPostRef}>
            <PostDisplay isLarge={true}
              post={post} author={author}
              onInteraction={() => handleInteract(post.id, setPost, setAuthor)}
              onUserMutate={() => handleAuthorMutate(author.handle, setAuthor)}
            />
          </div>

          <PostComposer replyingTo={post.id}
            placeholder={`Reply to ${author.displayName}`}
            currentUser={currentUser ?? undefined}
            onCreate={onReplyCreate}
          />

          <div>
            <TimelineDisplay timeline={replies}
              onPostInteraction={handleChildInteraction}
              onUserMutate={handleChildAuthorMutation}
            />
          </div>
        </>
        )
      }
    </section>
  </main>
}