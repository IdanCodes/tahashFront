import { UserInfo } from "@shared/interfaces/user-info";

/**
 * Tahash data in http session data
 */
export interface TahashUserSession {
  access_token: string;
  refresh_token: string;
  expiration: number; // token expiration date in milliseconds since epoch
  userInfo: UserInfo;
}
