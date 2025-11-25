import {WcaUser} from "./wca-api/wcaUser";

/**
 * Represents a user's information from the WCA database.
 */
export interface UserInfo {
  id: number;
  name: string;
  wcaId: string;
  country: string;
  photoUrl: string;
}

/**
 * Convert "WCA-me" (user data from API) to a {@link UserInfo}.
 * @param wcaUser The {@link WcaMeResponse} object from the api.
 */
export function wcaUserToUserInfo(wcaUser: WcaUser): UserInfo {
  return {
    id: wcaUser.id,
    name: wcaUser.name,
    wcaId: wcaUser.wca_id,
    country: wcaUser.country.name,
    photoUrl: wcaUser.avatar.url,
  };
}

/**
 * Check if a string matches the format of a WCA ID
 */
export function isWcaIdFormat(wcaId: string): boolean {
    const wcaIdLen = 4 + 4 + 2; // YYYYLLLLNN
    return wcaId.length === wcaIdLen
        && /^[0-9]+$/.test(wcaId.substring(0, 3)) // year
        && /^[A-Z]+$/.test(wcaId.substring(4,7)) // last name
        && /^[0-9]+$/.test(wcaId.substring(8,9)); // index
}
