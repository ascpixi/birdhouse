import { useEffect, useState } from "react";

import { Spinner } from "@nextui-org/react";

import { useUserIdentity } from "../hooks";
import { Sidebar } from "../components/Sidebar";

import { TimelineDisplay } from "../components/TimelineDisplay";
import { Timeline } from "../api/timeline";
import { ApiPost } from "../api/posts";
import { ApiUser } from "../api/user";
import { PostComposer } from "../components/PostComposer";

import * as api from "../api";

export function HomePage() {
  const currentUser = useUserIdentity();

  const [timeline, setTimeline] = useState<Timeline | null>();
  const [timelinePage, setTimelinePage] = useState(0);

  useEffect(() => {
    (async () => {
      const res = await api.timeline.home(timelinePage);
      if (res.status !== "ok") {
        console.error("Couldn't load the home timeline.", res);
        return;
      }
  
      // If we're fetching another page of the timeline, we merge instead of overwriting
      setTimeline(timeline == null ? res : {
        actors: { ...timeline.actors, ...res.actors },
        entries: [ ...timeline.entries, ...res.entries ]
      });
    })().catch(console.error);
  }, []);

  async function handlePostInteraction(sender: ApiPost) {
    if (!timeline) {
      console.warn("The 'handlePostInteraction' event handler was called before the timeline was loaded. Ignoring. Sender:", sender);
      return;
    }

    const res = await api.posts.get(sender.id);
    if (res.status !== "ok") {
      console.error(`Could not update post with ID ${sender.id}.`, res);
      return;
    }

    for (const entry of timeline.entries) {
      if (entry.post.id == sender.id) {
        entry.post = res.post;
      }
    }

    setTimeline({...timeline});
  }

  async function handleTimelineUserMutation(_: ApiPost, user: ApiUser) {
    if (!timeline)
      throw new Error("Timeline user mutation has occured while the timeline hasn't yet been loaded.");

    const resp = await api.user.get(user.handle);
    if (resp.status !== "ok") {
      console.error("Could not refresh the profile of a user on the timeline.", resp);
      return;
    }

    timeline.actors[user.id] = resp;
    setTimeline({ ...timeline });
  }

  async function handlePostCreate(createdId: number) {
    if (!currentUser || !timeline)
      return;

    const created = await api.posts.get(createdId);
    if (created.status !== "ok") {
      console.error("The post was created, but we couldn't retrieve it!", created);
      return;
    }

    if (!(currentUser.id in timeline.actors)) {
      timeline.actors[currentUser.id] = currentUser;
    }

    timeline.entries.unshift({
      kind: "raw",
      post: created.post
    });

    setTimeline({ ...timeline });
  }

  return <main className="flex w-full h-full">
    <Sidebar className="w-1/4" tab="home" user={currentUser} />

    <section className="flex w-full p-8 justify-start flex-col overflow-y-scroll gap-6">
      <PostComposer
        currentUser={currentUser ?? undefined}
        onCreate={handlePostCreate}
        placeholder="What's going on?"
      />

      <section>
      {
        timeline == null
          ? <Spinner />
          : <TimelineDisplay
              timeline={timeline}
              onPostInteraction={handlePostInteraction}
              onUserMutate={handleTimelineUserMutation}
            />
        }
      </section>
    </section>
  </main>;
}