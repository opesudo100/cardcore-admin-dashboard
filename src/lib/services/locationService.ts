export interface Timezones {
  zoneName: string;
  gmtOffset: number;
  gmtOffsetName: string;
  abbreviation: string;
  tzName: string;
}

export interface ICountry {
  name: string;
  phonecode: string;
  isoCode: string;
  flag: string;
  currency: string;
  latitude: string;
  longitude: string;
  timezones?: Timezones[];
}

export interface IState {
  name: string;
  isoCode: string;
  countryCode: string;
  latitude?: string | null;
  longitude?: string | null;
}

export interface ICity {
  name: string;
  countryCode: string;
  stateCode: string;
  latitude?: string | null;
  longitude?: string | null;
}

class LocationService {
  private static countries: ICountry[] | null = null;
  private static states: IState[] | null = null;
  private static cities: ICity[] | null = null;

  static async getCountries(): Promise<ICountry[]> {
    if (this.countries) return this.countries;
    const response = await fetch("/assets/data/country.json");
    this.countries = await response.json();
    return this.countries || [];
  }

  static async getStates(): Promise<IState[]> {
    if (this.states) return this.states;
    const response = await fetch("/assets/data/state.json");
    this.states = await response.json();
    return this.states || [];
  }

  static async getCities(): Promise<ICity[]> {
    if (this.cities) return this.cities;
    const response = await fetch("/assets/data/city.json");
    const rawData: any[][] = await response.json();
    
    // The city.json is an array of arrays: [name, countryCode, stateCode, latitude, longitude]
    this.cities = rawData.map((city) => ({
      name: city[0],
      countryCode: city[1],
      stateCode: city[2],
      latitude: city[3],
      longitude: city[4],
    }));
    
    return this.cities || [];
  }

  static async getStatesOfCountry(countryCode: string): Promise<IState[]> {
    const states = await this.getStates();
    return states.filter((state) => state.countryCode === countryCode);
  }

  static async getCitiesOfState(countryCode: string, stateCode: string): Promise<ICity[]> {
    const cities = await this.getCities();
    return cities.filter(
      (city) => city.countryCode === countryCode && city.stateCode === stateCode
    );
  }
}

export default LocationService;
