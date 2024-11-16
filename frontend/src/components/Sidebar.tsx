import { Button, Skeleton, Tooltip, User } from "@nextui-org/react";
import LogoBlue from "../icons/birdhouse-blue.svg";
import { RiHome7Fill, RiHome7Line, RiUser3Line, RiUser3Fill, RiLogoutBoxLine } from "@remixicon/react";
import { ReactNode } from "react";
import { ApiUser } from "../api/user";

import * as api from "../api";

export type SidebarTab = "home" | "profile";

export function Sidebar({ user, tab, className }: {
  user: ApiUser | null,
  tab: SidebarTab | undefined,
  className: string | ""
}) {
  function userField(condition: boolean, getter: () => string) {
    return <Skeleton className="rounded-lg" isLoaded={condition}>
      <p>{condition ? getter() : "loading..."}</p>
    </Skeleton>
  }

  function goToUserProfile() {
    if (user == null) {
      console.warn("Attempted to go to the user's profile, but their identity is not yet loaded. Ignoring.");
      return;
    }

    location.pathname = `/profile/${user.handle}`;
  }

  function goToHome() {
    location.pathname = `/`;
  }

  async function logOut() {
    await api.auth.invalidate(localStorage.getItem("token")!);
    localStorage.removeItem("token");
    location.pathname = "/auth";
  }

  function makeSidebarButton(tabType: SidebarTab, name: string, activeIcon: ReactNode, inactiveIcon: ReactNode, onClick: () => void) {
    const active = tab == tabType;

    return <Button
      className={`text-lg ${active ? 'font-semibold' : ''}`}
      startContent={active ? activeIcon : inactiveIcon}
      variant="light"
      onClick={onClick}
    >{name}</Button>
  }

  return <nav className={`p-12 flex flex-col justify-between h-full items-start ${className}`}>
    <div className="flex flex-col gap-8">
      <img src={LogoBlue} className="w-10" />

      <div className="flex flex-col gap-2">
        {makeSidebarButton("home", "Home", <RiHome7Fill />, <RiHome7Line />, goToHome)}
        {makeSidebarButton("profile", "Profile", <RiUser3Fill />, <RiUser3Line />, goToUserProfile)}
      </div>
    </div>

    <div className="flex justify-between w-full">
      <User
        name={userField(user != null, () => user!.displayName)}
        description={userField(user != null, () => `@${user!.handle}`)}
        avatarProps={{
          src: user != null ? user.avatar : ""
        }}
        className="text-xl cursor-pointer"
        onClick={goToUserProfile}
      />

      <Tooltip content="Log out" color="warning">
        <Button
          aria-label="Log-out"
          isIconOnly={true}
          variant="bordered"
          onClick={logOut}
        >
          <RiLogoutBoxLine color="#999"/>
        </Button>
      </Tooltip>
    </div>

  </nav>;
}