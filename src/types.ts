export class Venue{
    id: number;
    name: string;
    address: string;
    max_capacity: number;
    rent_cost: number;
    weekdayHours: {
        start: string;
        end: string;
    };
    weekendHours: {
        start: string;
        end: string
    };
    closingDays: string[];
    booking: Booking;

    constructor(venue:Venue) { // TODO modificare costruttore e codici che lo usano
        this.id = venue.id;
        this.name = venue.name;
        this.address = venue.address;
        this.max_capacity = venue.max_capacity;
        this.rent_cost = venue.rent_cost;
        this.weekdayHours = venue.weekdayHours;
        this.weekendHours = venue.weekendHours;
        this.closingDays = venue.closingDays;
        this.booking = venue.booking;
    }
}

export class Booking{
    id: number;
    date: string;
    duration: {
        start: string;
        end: string;
    };
    venue: Venue;
    personnel: Personnel;

    constructor(id:number, date:string, duration:{start:string, end:string}, venue:Venue, personnel:Personnel) {
        this.id = id;
        this.date = date;
        this.duration = duration;
        this.venue = venue;
        this.personnel = personnel;
    }
}

export class Personnel{
    name: string;
    hourly_cost: number;
    weekdayHours: {
        start: string
        end: string
    };
    weekendHours: {
        start: string
        end: string
    };
    sector: string[];

    constructor(name:string, hourly_cost:number, weekdayHours:{start:string, end:string}, weekendHours: {start: string, end: string }, sector: string[]) {
        this.name = name;
        this.hourly_cost = hourly_cost;
        this.weekdayHours = weekdayHours;
        this.weekendHours = weekendHours;
        this.sector = sector;
    }
}

export class EventInfo{
    event_id: number;
    event_type: string;
    date: string;
    schedule_start: string;
    schedule_end: string;
    max_participants: number;

    constructor(eventInfo:EventInfo) { // TODO modificare costruttore e codici che lo usano
        this.event_id = eventInfo.event_id;
        this.event_type = eventInfo.event_type;
        this.date = eventInfo.date;
        this.schedule_start = eventInfo.schedule_start;
        this.schedule_end = eventInfo.schedule_end;
        this.max_participants = eventInfo.max_participants;
    }
}