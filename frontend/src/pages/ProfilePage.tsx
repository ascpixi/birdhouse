import { useParams } from "react-router-dom";

import { useUserIdentity } from "../hooks";
import { Sidebar } from "../components/Sidebar";
import { Avatar, Button, Card, CardBody, CardHeader, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Skeleton, Spinner, Textarea, useDisclosure } from "@nextui-org/react";
import { ReactNode, useEffect, useState } from "react";
import { ApiUser } from "../api/user";

import * as api from "../api";

import { NotFound } from "../components/NotFound";
import { useFilePicker } from "use-file-picker";
import { FilePickerReturnTypes } from "use-file-picker/types";
import { getRelativeTimeString } from "../util";
import { TimelineDisplay } from "../components/TimelineDisplay";
import { Timeline } from "../api/timeline";

export function ProfilePage() {
  const { handle } = useParams();
  const editorModalState = useDisclosure();
  const [notFound, setNotFound] = useState(false);
  const currUser = useUserIdentity(user => {
    resetEditor(user);
  });
  
  // eslint-disable-next-line prefer-const
  let [targetUser, setTargetUser] = useState<ApiUser | null>(null);

  const [timeline, setTimeline] = useState<Timeline | null>(null);

  const [editorName, setEditorName] = useState("");
  const [editorBio, setEditorBio] = useState("");

  const [isFollowed, setIsFollowed] = useState(false);

  // These are blob URIs to actually display the avatar/banner before it's uploaded on the
  // server. When the user selects "Apply" in the editor, the media is uploaded, and the
  // returned media URLs are sent via `/api/user/modify`. The actual avatar/banner change
  // is reflected when we force-reload the user.
  const [editorAvatar, setEditorAvatar] = useState("");
  const [editorBanner, setEditorBanner] = useState("");

  function useImgPicker(setState: React.Dispatch<React.SetStateAction<string>>) {
    return useFilePicker({
      accept: "image/*",
      readAs: "ArrayBuffer",
      multiple: false,
      async onFilesSuccessfullySelected(data) {
        if (data.filesContent.length == 0)
          return;

        setState(URL.createObjectURL(data.plainFiles[0]));
      }
    });
  }

  const avatarPicker = useImgPicker(setEditorAvatar);
  const bannerPicker = useImgPicker(setEditorBanner);

  const isSelf = currUser != null && targetUser != null && currUser.id == targetUser.id;

  function resetEditor(user: ApiUser | null = null) {
    user ??= currUser;

    if (user === null) {
      console.warn("Attempted to reset the editor, but the current user data isn't loaded. Ignoring.");
      return;
    }

    setEditorName(user.displayName);
    setEditorAvatar(user.avatar);
    setEditorBanner(user.banner);
    setEditorBio(user.bio);
  }

  useEffect(() => {
    document.title = `@${handle} - Birdhouse`;

    (async () => {
      const targetUser = await refreshUser();
      if (targetUser == null) {
        console.warn("currentUser was null - cancelling further processing.");
        return;
      }

      setIsFollowed(targetUser.meta.followedByUser ?? false);

      await refreshTimeline();
    })().catch(console.error);
  }, [handle]);

  async function refreshTimeline() {
    if (targetUser === null) {
      console.warn("Attempted to call refreshTimeline when targetUser is null (not yet loaded?). This request will be ignored.");
      return;
    }
    
    const res = await api.timeline.user(targetUser.id)
    if (res.status !== "ok") {
      console.error(`Couldn't load the timeline of user ${targetUser.id}.`, res);
      alert(`Sorry, we couldn't load the posts of this user. ${res.error}`);
      return;
    }

    setTimeline(res);
  }

  async function refreshUser(): Promise<ApiUser | null> {
    if (handle == null) {
      setNotFound(true);
      return null;
    }

    const userResp = await api.user.get(handle);
    if (userResp.status !== "ok") {
      console.error(`Profile retrieval for ${handle} failed:`, userResp);
      setNotFound(true);
      return null;
    }

    setTargetUser(userResp);
    targetUser = userResp;

    console.log(`User data for ${handle} fetched.`, userResp);
    return userResp;
  }
  
  async function onFollowButtonClick() {
    const res = await api.user.follow(isFollowed ? "remove" : "add", targetUser!.id);
    if (res.status !== "ok") {
      console.error(`Encountered an error while trying to follow ${targetUser!.id}`, res);
      alert(`Sorry, we couldn't follow that user. ${res.error}`);
      return;
    }

    setIsFollowed(!isFollowed);
    setTargetUser({
      ...targetUser!,
      followers: targetUser!.followers + (isFollowed ? -1 : 1) 
    });
  }

  if (notFound)
    return <NotFound type="profile" />

  function userDependent(node: ReactNode) {
    return <Skeleton className="rounded-full" isLoaded={targetUser != null}> {node} </Skeleton>;
  }

  async function applyUserChanges(onClose: () => void) {
    if (targetUser == null || currUser == null || targetUser.id !== currUser.id) {
      console.warn("Attempted to apply user changes, while the profile is either not loaded or is not the profile of the current user. Ignoring.");
      return;
    }
    
    async function up(filePicker: FilePickerReturnTypes<ArrayBuffer, unknown>) {
      const data = filePicker.filesContent[0].content;
      const res = await api.media.upload(data);
      if (res.status !== "ok") {
        console.error("Could not upload file:", res);
        console.error("File picker state:", filePicker);
        return undefined;
      }

      return res.url;
    }

    const res = await api.user.modify({
      displayName: targetUser.displayName != editorName ? editorName : undefined,
      bio: targetUser.bio != editorBio ? editorBio : undefined,
      avatar: targetUser.avatar != editorAvatar ? await up(avatarPicker) : undefined,
      banner: targetUser.banner != editorBanner ? await up(bannerPicker) : undefined
    });

    if (res.status === "ok") {
      onClose();
      await refreshUser();
      return;
    }

    console.error("Couldn't update profile:", res);
    alert(`Sorry, we couldn't update your profile. ${res.error}`);
  }

  function handlePostInteraction() {
    refreshTimeline();
  }

  return <main className="flex w-full h-full">
    <Sidebar className="w-1/4" tab={isSelf ? "profile" : undefined} user={currUser} />

    <div className="w-full p-8 overflow-y-scroll">
      <Card className="mb-6 mr-8">
        <CardHeader className="flex flex-col items-start p-0">
          <div className="w-full h-32 mb-4 bg-cover bg-center bg-[image:var(--banner)]" style={
            targetUser ? {"--banner": `url('${targetUser!.banner}')`} as any : {}
          }></div>
          <div className="flex justify-between items-end w-full px-8 -mt-16">
            {userDependent(
              <Avatar
                isBordered
                src={targetUser?.avatar}
                className="w-24 h-24 text-large"
              />
            )}

            {
              isSelf
                ? <Button color="primary" variant="bordered" isDisabled={currUser === null} onClick={editorModalState.onOpen}>Edit profile</Button>
                : <Button
                    className={`${isFollowed ? "bg-transparent text-foreground" : ""}`}
                    color="primary"
                    variant={isFollowed ? "bordered" : "solid"}
                    onPress={onFollowButtonClick}
                  >
                    {isFollowed ? "Unfollow" : "Follow"}
                  </Button>
            }

          </div>
        </CardHeader>

        <CardBody className="px-8 pt-4 pb-8 flex flex-row justify-between">
          <section>
            {userDependent(<h2 className="text-2xl font-bold">{targetUser?.displayName ?? handle}</h2>)}
            <p className="text-gray-500">{`@${handle}`}</p>
            {userDependent(<p className="mt-2">{targetUser?.bio ?? `We don't know much about ${handle} yet, but we're sure they're great! Please wait until we load their page.`}</p>)}
          </section>

          <section className="flex flex-col gap-4">
            {userDependent(
              <div className="flex mt-4 space-x-4">
                <span><strong>{targetUser?.followers ?? "????"}</strong> Followers</span>
                <span><strong>{targetUser?.following ?? "??"}</strong> Following</span>
              </div>
            )}

            {userDependent(
              <div className="text-slate-500">
                Joined {targetUser == null ? "some time ago" : getRelativeTimeString(targetUser!.createdOn)}
              </div>
            )}
          </section>
        </CardBody>
      </Card>

      <div className="flex flex-col gap-4 mr-8">
        {
          timeline == null
            ? <Spinner />
            : <TimelineDisplay
                timeline={timeline}
                onPostInteraction={handlePostInteraction}
              />
        }
      </div>
    </div>

    <Modal isOpen={editorModalState.isOpen} onOpenChange={editorModalState.onOpenChange} size="xl">
      <ModalContent>
        {onClose => (currUser === null ? <></> :
          <>
            <ModalHeader className="flex flex-col gap-1">Edit profile</ModalHeader>

            <ModalBody>
              <Card className="mb-6 mr-8" >
                <CardHeader className="flex flex-col items-start p-0">
                  <div
                    className="w-full h-32 mb-4 bg-cover bg-center bg-[image:var(--banner)] transition-all duration-100 cursor-pointer hover:brightness-50"
                    style={{"--banner": `url('${editorBanner}')`} as any}
                    onClick={() => bannerPicker.openFilePicker()}
                  />
                  
                  <div className="flex justify-between items-end w-min px-8 -mt-16">
                    <Avatar
                      src={editorAvatar}
                      className="w-24 h-24 text-large cursor-pointer hover:brightness-50 transition-all duration-100"
                      onClick={() => avatarPicker.openFilePicker()}
                    />
                  </div>
                </CardHeader>

                <CardBody className="px-8 pt-4 pb-8 flex flex-col gap-4 justify-between">
                  <Input
                    label="Name"
                    value={editorName} onChange={ev => setEditorName(ev.target.value)}
                  />

                  <Textarea
                    label="Bio"
                    value={editorBio} onChange={ev => setEditorBio(ev.target.value)}
                  />
                </CardBody>
              </Card>
            </ModalBody>

            <ModalFooter>
              <Button color="primary" onPress={() => applyUserChanges(onClose)}>Apply</Button>
              <Button color="danger" variant="light" onPress={onClose}>Cancel</Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  </main>;
}