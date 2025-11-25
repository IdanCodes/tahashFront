import { UserInfo } from "@shared/interfaces/user-info";
import { EventId } from "@shared/types/comp-event";
import { EventRecords } from "./event-records";
import { TimeFormat } from "@shared/constants/time-formats";
import { PastCompResults } from "./past-comp-results";

export type CompetitorData = {
  userInfo: UserInfo;
  records: Map<EventId, EventRecords<TimeFormat>>;
  pastResults: Map<string, PastCompResults>;
};
