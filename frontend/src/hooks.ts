import { useEffect, useState } from "react";
import { ApiUser } from "./api/user";

import * as user from "./api/user";

/**
 * Provides a read-only stateful value that represents the current user, or `null`
 * if the underlying API request is still executing. 
 */
export function useUserIdentity(afterLoad: (user: ApiUser) => void = () => {}): ApiUser | null {
    const [currentUser, setCurrentUser] = useState<ApiUser | null>(null);
    
    useEffect(() => {
        (async () => {
            const userResp = await user.identity();
            if (userResp.status !== "ok") {
                console.error("Identity retrieval failed:", userResp);
                throw new Error("Could not get data about the current user.");
            }

            setCurrentUser(userResp);
            afterLoad(userResp);

            console.log("User identity data fetched.");
        })().catch(console.error);
    }, []);

    return currentUser;
}