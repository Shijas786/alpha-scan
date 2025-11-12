import axios from "axios";

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY || "";
const NEYNAR_BASE_URL = "https://api.neynar.com/v2";

export interface FarcasterUser {
  fid: number;
  username: string;
  display_name: string;
  pfp_url?: string;
  custody_address: string;
  verifications: string[];
}

/**
 * Get Farcaster user by FID
 */
export async function getFarcasterUser(fid: number): Promise<FarcasterUser | null> {
  try {
    const response = await axios.get(`${NEYNAR_BASE_URL}/farcaster/user`, {
      headers: {
        accept: "application/json",
        api_key: NEYNAR_API_KEY,
      },
      params: {
        fid,
      },
    });

    const user = response.data?.result?.user;
    if (!user) return null;

    return {
      fid: user.fid,
      username: user.username,
      display_name: user.display_name,
      pfp_url: user.pfp_url,
      custody_address: user.custody_address,
      verifications: user.verifications || [],
    };
  } catch (error) {
    console.error("Error fetching Farcaster user:", error);
    return null;
  }
}

/**
 * Search for Farcaster user by username
 */
export async function searchFarcasterUser(query: string): Promise<FarcasterUser[]> {
  try {
    const response = await axios.get(`${NEYNAR_BASE_URL}/farcaster/user/search`, {
      headers: {
        accept: "application/json",
        api_key: NEYNAR_API_KEY,
      },
      params: {
        q: query,
      },
    });

    const users = response.data?.result?.users || [];
    
    return users.map((user: any) => ({
      fid: user.fid,
      username: user.username,
      display_name: user.display_name,
      pfp_url: user.pfp_url,
      custody_address: user.custody_address,
      verifications: user.verifications || [],
    }));
  } catch (error) {
    console.error("Error searching Farcaster users:", error);
    return [];
  }
}

/**
 * Get Farcaster user by connected wallet address
 */
export async function getUserByAddress(address: string): Promise<FarcasterUser | null> {
  try {
    const response = await axios.get(`${NEYNAR_BASE_URL}/farcaster/user/by_verification`, {
      headers: {
        accept: "application/json",
        api_key: NEYNAR_API_KEY,
      },
      params: {
        address: address.toLowerCase(),
      },
    });

    const user = response.data?.result?.user;
    if (!user) return null;

    return {
      fid: user.fid,
      username: user.username,
      display_name: user.display_name,
      pfp_url: user.pfp_url,
      custody_address: user.custody_address,
      verifications: user.verifications || [],
    };
  } catch (error) {
    console.error("Error fetching user by address:", error);
    return null;
  }
}

/**
 * Post a cast (notification) to Farcaster
 */
export async function postCast(
  signerUuid: string,
  text: string,
  embeds?: { url: string }[]
): Promise<{ hash: string; success: boolean }> {
  try {
    const response = await axios.post(
      `${NEYNAR_BASE_URL}/farcaster/cast`,
      {
        signer_uuid: signerUuid,
        text,
        embeds,
      },
      {
        headers: {
          accept: "application/json",
          api_key: NEYNAR_API_KEY,
          "content-type": "application/json",
        },
      }
    );

    return {
      hash: response.data?.cast?.hash || "",
      success: true,
    };
  } catch (error) {
    console.error("Error posting cast:", error);
    return {
      hash: "",
      success: false,
    };
  }
}

/**
 * Send a direct cast notification (mention someone)
 */
export async function sendNotificationCast(
  signerUuid: string,
  recipientUsername: string,
  message: string,
  frameUrl?: string
): Promise<{ hash: string; success: boolean }> {
  const text = `@${recipientUsername} ${message}`;
  const embeds = frameUrl ? [{ url: frameUrl }] : undefined;

  return postCast(signerUuid, text, embeds);
}

/**
 * Reply to a cast (for interactions within frames)
 */
export async function replyCast(
  signerUuid: string,
  parentHash: string,
  text: string
): Promise<{ hash: string; success: boolean }> {
  try {
    const response = await axios.post(
      `${NEYNAR_BASE_URL}/farcaster/cast`,
      {
        signer_uuid: signerUuid,
        text,
        parent: parentHash,
      },
      {
        headers: {
          accept: "application/json",
          api_key: NEYNAR_API_KEY,
          "content-type": "application/json",
        },
      }
    );

    return {
      hash: response.data?.cast?.hash || "",
      success: true,
    };
  } catch (error) {
    console.error("Error replying to cast:", error);
    return {
      hash: "",
      success: false,
    };
  }
}

/**
 * Validate Farcaster frame signature
 */
export async function validateFrameMessage(messageBytes: string): Promise<any> {
  try {
    const response = await axios.post(
      `${NEYNAR_BASE_URL}/farcaster/frame/validate`,
      {
        message_bytes_in_hex: messageBytes,
      },
      {
        headers: {
          accept: "application/json",
          api_key: NEYNAR_API_KEY,
          "content-type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error validating frame message:", error);
    return null;
  }
}

