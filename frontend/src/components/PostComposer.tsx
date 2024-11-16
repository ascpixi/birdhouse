import { Avatar, Button, Card, CardBody, CardFooter, CardHeader, Popover, PopoverContent, PopoverTrigger, Textarea } from "@nextui-org/react";
import { ApiUser } from "../api/user";
import { ReactNode, useState } from "react";
import { useFilePicker } from "use-file-picker";
import { RiCloseCircleFill, RiEmojiStickerLine, RiGalleryLine } from "@remixicon/react";
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'

import * as api from "../api";

const MAX_POST_LENGTH = 280;

export function PostComposer({ currentUser, replyingTo, placeholder, onCreate }: {
  currentUser?: ApiUser,
  replyingTo?: number,
  placeholder: string,
  onCreate?: (createdId: number) => void
}) {
  const [postText, setPostText] = useState<string>("");
  const [postMedia, setPostMedia] = useState<string | undefined>(undefined);
  const [postMediaType, setPostMediaType] = useState<string>("");

  const emotePickerHover = useState(false);
  const mediaPickerHover = useState(false);

  const { openFilePicker, filesContent } = useFilePicker({
    accept: "image/*,video/*",
    readAs: "ArrayBuffer",
    multiple: false,
    async onFilesSuccessfullySelected(data) {
      if (data.filesContent.length == 0)
        return;

      setPostMedia(URL.createObjectURL(data.plainFiles[0]))
      setPostMediaType(data.plainFiles[0].type);
    }
  });

  const canPost =
    (postText.length > 0 || filesContent.length != 0) &&
    postText.length <= MAX_POST_LENGTH;

  function makeComposerButton({ getIcon, hoverState, onClick }: {
    getIcon: (color: string) => ReactNode,
    hoverState: [boolean, React.Dispatch<React.SetStateAction<boolean>>],
    onClick?: (ev: React.MouseEvent<HTMLButtonElement>) => void
  }) {
    const [isHovering, setIsHovering] = hoverState;
    
    return <Button
        variant="ghost"
        isIconOnly={true}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={onClick}
      >
        { getIcon(isHovering ? "#ccc" : "#71717a") }
      </Button>
  }

  async function createPost() {
    if (!canPost) {
      console.warn("Attempted to create a post while the preconditions are false.");
      return;
    }

    let mediaUrl: string | undefined = undefined;
    if (postMedia != undefined && filesContent.length != 0) {
      const data = filesContent[0].content;
      const res = await api.media.upload(data);
      if (res.status !== "ok") {
        console.error("Could not upload file:", res);
        console.error("File picker content:", filesContent);
        alert(`Sorry, we couldn't upload your file. ${res.error}`);
        return;
      }

      mediaUrl = res.url;
    }

    const resp = await api.posts.create({
      media: mediaUrl,
      text: postText,
      replyTo: replyingTo
    });

    if (resp.status !== "ok") {
      console.error("Couldn't create post. API response:", resp);
      alert(`Sorry, couldn't create your post! ${resp.error}`);
      return;
    }

    setPostText("");
    setPostMedia(undefined);

    onCreate?.(resp.createdId);
  }

  function handleEmojiPick(ev: any) {
    setPostText(postText + ev.native);
  }

  return <Card className="w-full p-4 h-fit min-h-fit">
    <CardHeader className="flex w-full gap-4 h-fit">
      <Avatar
        radius="full"
        size="md"
        src={currentUser?.avatar}
      />

      <Textarea
        variant="bordered"
        placeholder={placeholder}
        value={postText}
        onChange={ev => setPostText(ev.target.value)}
        maxLength={MAX_POST_LENGTH}
        description={postText.length == 0 ? undefined : `${postText.length} / ${MAX_POST_LENGTH}`}
        minRows={2}
        className="h-full "
        classNames={{
          input: "text-medium h-full",
          inputWrapper: "border-zinc-800 h-full min-h-fit"
        }}
      />
    </CardHeader>

    {postMedia == undefined ? <></> :
      <CardBody>
        <Card className={`relative overflow-hidden ${postMediaType.startsWith("video") ? "w-56" : "w-32"} h-32 ml-14`}>
          <Button
            isIconOnly
            className="absolute right-2 top-2 z-20 bg-transparent opacity-50 text-black backdrop-blur-md"
            size="sm"
            aria-label="Close"
            onClick={() => setPostMedia(undefined)}
          >
            <RiCloseCircleFill />
          </Button>

          {
            postMediaType.startsWith("image/")
              ? (
                <img
                  src={postMedia}
                  className="object-cover w-full h-full rounded-lg"
                />
              )
              : (
                <video
                  className="w-full h-full object-cover rounded-lg"
                  controls src={postMedia}
                />
              )
          }
        </Card>
      </CardBody>
    }

    <CardFooter className="pt-0 pl-16 flex justify-between">
      <div className="flex gap-2">
        {
          makeComposerButton({
            getIcon: c => <RiGalleryLine color={c} />,
            hoverState: mediaPickerHover,
            onClick: () => openFilePicker()
          })
        }

        <Popover placement="right">
          <PopoverTrigger>
            {
              makeComposerButton({
                getIcon: c => <RiEmojiStickerLine color={c} />,
                hoverState: emotePickerHover
              })
            }
          </PopoverTrigger>

          <PopoverContent className="bg-transparent">
            <Picker data={data} onEmojiSelect={handleEmojiPick} />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex">
        <Button color="primary" onClick={createPost} isDisabled={!canPost}>Post</Button>
      </div>
    </CardFooter>
  </Card>;
}
