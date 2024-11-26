import { useState } from "react";
import { Avatar, Button, Card, CardBody, CardFooter, CardHeader } from "@nextui-org/react";
import { ApiUser } from "../api/user";

import * as api from "../api";

export function UserTooltipCard({ user, onMutate }: {
  user: ApiUser,
  onMutate: () => void
}) {
  const [isFollowed, setIsFollowed] = useState(user.meta.followedByUser ?? false);

  async function onFollowButtonClick() {
    const res = await api.user.follow(isFollowed ? "remove" : "add", user.id);
    if (res.status !== "ok") {
      console.error(`Encountered an error while trying to follow ${user.id}`, res);
      alert(`Sorry, we couldn't follow that user. ${res.error}`);
      return;
    }

    setIsFollowed(!isFollowed);
    onMutate?.();
  }

  return (
    <Card shadow="none" className="border-none bg-transparent max-w-[400px]">
      <CardHeader className="justify-between gap-16">
        <div className="flex gap-3">
          <Avatar isBordered radius="full" size="md" src={user.avatar} />
          <div className="flex flex-col items-start justify-center">
            <h4 className="text-small font-semibold leading-none text-default-600 text-nowrap">{user.displayName}</h4>
            <h5 className="text-small tracking-tight text-default-500">@{user.handle}</h5>
          </div>
        </div>

        {
          user.meta.isRequester ? <></> :
          <Button
            className={`w-20 ${isFollowed ? "bg-transparent text-foreground border-default-200" : ""}`}
            color="primary"
            radius="full"
            size="sm"
            variant={isFollowed ? "bordered" : "solid"}
            onPress={onFollowButtonClick}
          >
            {isFollowed ? "Unfollow" : "Follow"}
          </Button>
        }
      </CardHeader>

      <CardBody className="px-3 py-0">
        <p className="text-small pl-px text-default-500">{user.bio}</p>
      </CardBody>
      <CardFooter className="gap-3">
        <div className="flex gap-1">
          <p className="font-semibold text-default-600 text-small">{user.following}</p>
          <p className="text-default-500 text-small">Following</p>
        </div>
        <div className="flex gap-1">
          <p className="font-semibold text-default-600 text-small">{user.followers}</p>
          <p className="text-default-500 text-small">Followers</p>
        </div>
      </CardFooter>
    </Card>
  );
};
