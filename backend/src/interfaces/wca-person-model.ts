export interface WcaPersonModel {
  // WCA Id
  id: string;
  name: string;
  country: string;
  numberOfCompetitions: number;

  // List of competition ids of all competitions the user went to
  competitionIds: string[];
  numberOfChampionships: number;

  // List of the championship ids the user attended
  championshipIds: string[];

  rank: {
    singles: WcaEventRanksModel[];
    averages: WcaEventRanksModel[];
  };

  medals: {
    bronze: number;
    silver: number;
    gold: number;
  };

  // The number of records the person had
  records: {
    single: WcaPersonRecordsModel;
    average: WcaPersonRecordsModel;
  };

  /**
   * Map of person's competitions and their results in each one
   * More Information: https://wca-rest-api.robiningelbrecht.be/#tag/person_model
   */
  results: object;
}

export interface WcaEventRanksModel {
  eventId: string;
  best: number;
  rank: {
    // User's rank in the world
    world: number;

    // User's rank in their continent
    continent: number;

    // User's rank in their country
    country: number;
  };
}

interface WcaPersonRecordsModel {
  WR: number;
  NR: number;
  CR: number;
}
