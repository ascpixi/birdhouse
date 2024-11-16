import { Avatar, Button, Card, CardBody, CardFooter, CardHeader, Tooltip } from "@nextui-org/react";
import { ApiPost, InteractionKind } from "../api/posts";
import { ApiUser } from "../api/user";
import { RiChat1Line, RiHeartFill, RiHeartLine, RiShareForwardFill, RiShareForwardLine } from "@remixicon/react";
import { ReactNode, useEffect, useState } from "react";

import * as api from "../api";
import { getMediaTypeFromUrl, getRelativeTimeString } from "../util";
import { UserTooltipCard } from "./UserTooltipCard";

export function PostDisplay({ post, author, isLarge, frontMatter, clickable, onInteraction, onUserMutate }: {
  post: ApiPost,
  author: ApiUser,
  isLarge?: boolean,
  clickable?: boolean,
  frontMatter?: ReactNode,
  onInteraction?: (target: ApiPost, kind: InteractionKind) => void,
  onUserMutate?: (target: ApiPost, author: ApiUser) => void,
}) {
  const [createdWhen, setCreatedWhen] = useState(getRelativeTimeString(post.createdOn));

  useEffect(() => {
    const id = setInterval(() => {
      setCreatedWhen(getRelativeTimeString(post.createdOn));
    }, 1000);

    return () => {
      clearInterval(id);
    }
  }, [post.createdOn]);

  async function onLikeClick() {
    const res = await api.posts.interact("like", post.id, post.meta.likedByUser ? "remove" : "add");
    if (res.status !== "ok") {
      console.error("Could not like/unlike that post.", res);
      return;
    }

    onInteraction?.(post, "like");
  }

  async function onRepostClick() {
    const res = await api.posts.interact("repost", post.id, post.meta.repostedByUser ? "remove" : "add");
    if (res.status !== "ok") {
      console.error("Could not repost/unrepost that post.", res);
      return;
    }

    onInteraction?.(post, "repost");
  }

  function navigateToProfile() {
    location.pathname = `/profile/${author.handle}`;
  }

  function navigateToPost() {
    if (!clickable)
      return;

    location.pathname = `/post/${post.id}`;
  }

  return <Card className={`w-full ${clickable ? "hover:bg-foreground-100" : ""}`}>
    <CardHeader className={`items-start p-6 flex flex-col gap-6 ${clickable ? "cursor-pointer" : ""}`} onClick={navigateToPost}>
      { frontMatter ?? <></> }

      <div className={`flex ${isLarge ? "text-medium" : "text-small"} justify-between w-full`}>
        <Tooltip closeDelay={0} content={
          <UserTooltipCard
            user={author}
            onMutate={() => onUserMutate?.(post, author)}
          />
        }>
          <div className="flex gap-5 cursor-pointer" onClick={navigateToProfile}>
            <Avatar isBordered radius="full" size={isLarge ? "lg" : "md"} src={author.avatar} />
            <div className="flex flex-col gap-1 items-start justify-center">
              <h4 className="font-semibold leading-none text-default-600">{author.displayName}</h4>
              <h5 className="tracking-tight text-default-400">@{author.handle}</h5>
            </div>
          </div>
        </Tooltip>

        <div>
          <span>{createdWhen}</span>
        </div>

      </div>
    </CardHeader>

    <CardBody className={`px-6 pt-0 ${isLarge ? "text-medium" : "text-small"} ${clickable ? "cursor-pointer" : ""}`} onClick={navigateToPost}>
      { post.textContent.length != 0 ? <p>{post.textContent}</p> : <></> }

      { !post.media ? <></> : (
          getMediaTypeFromUrl(post.media) == "image"
          ? <img
              className=" cursor-pointer w-64 h-64 object-contain"
              src={post.media} onClick={() => window.open(post.media!)}
            />
          : <video
              className="w-64 h-64 object-contain"
              src={post.media} controls
            />
        )
      }
    </CardBody>

    <CardFooter className="flex px-6 gap-8 pb-8 ">
      <div className="flex gap-2">
        <Button 
          startContent={ <RiChat1Line/> }
          aria-label={`${post.replies} replies`}
          variant="ghost"
          className="border-0"
        >{post.replies}</Button>
      </div>

      <div className="flex gap-2">
        <Button 
          startContent={ !post.meta.repostedByUser ? <RiShareForwardLine/> : <RiShareForwardFill/> }
          aria-label={`${post.reposts} reposts`}
          variant="ghost"
          className="border-0"
          onClick={onRepostClick}
        >{post.reposts}</Button>
      </div>

      <div className="flex gap-2">
        <Button 
          startContent={ !post.meta.likedByUser ? <RiHeartLine/> : <RiHeartFill/> }
          aria-label={`${post.likes} likes`}
          variant="ghost"
          className="border-0"
          onClick={onLikeClick}
        >{post.likes}</Button>
      </div>
    </CardFooter>
  </Card>;
}