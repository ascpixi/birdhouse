import { ReactNode } from "react";
import { Timeline, TimelineEntry } from "../api/timeline";
import { ApiUser } from "../api/user";
import { PostDisplay } from "./PostDisplay";
import { RiShareForwardFill } from "@remixicon/react";
import { ApiPost, InteractionKind } from "../api/posts";

export function TimelineDisplay({ timeline, onPostInteraction, onUserMutate }: {
    timeline: Timeline,
    onPostInteraction?: (target: ApiPost, kind: InteractionKind) => void,
    onUserMutate?: (sender: ApiPost, target: ApiUser) => void,
}) {
    function makeFrontMatter(icon: ReactNode, text: string) {
        return <div className="flex gap-2 text-sm text-foreground-400">
            <div>{icon}</div>
            <div>{text}</div>
        </div>
    }

    /** Translates a timeline entry to a React node/component. */
    function translate(entry: TimelineEntry) {
        const post = entry.post;
        const author = timeline.actors[entry.post.authorId];

        if (entry.kind == "raw") {
            return <PostDisplay
                post={post}
                author={author}
                key={`post-${post.id}`}
                onInteraction={onPostInteraction}
                onUserMutate={() => onUserMutate?.(post, author)}
                clickable={true}
            />
        } else if (entry.kind == "repost") {
            const repostedBy = timeline.actors[entry.repostedBy];

            return <PostDisplay
                post={entry.post}
                author={timeline.actors[entry.post.authorId]}
                key={`repost-${entry.post.id}`}
                onInteraction={onPostInteraction}
                onUserMutate={() => onUserMutate?.(post, author)}
                clickable={true}
                frontMatter={makeFrontMatter(
                    <RiShareForwardFill size={20}/>,
                    `Reposted by ${repostedBy.displayName}`
                )}
            />
        } else {
            console.error("Unknown timeline entry kind.", entry);
            console.error("Source timeline:", timeline);
            throw new Error("Unknown timeline entry kind.");
        }
    }

    return <div className="flex flex-col gap-4"> { timeline.entries.map(translate) } </div>
}