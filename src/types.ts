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

    constructor(id:number, name:string, address:string, max_capacity:number, rent_cost:number, weekdayHours:{start:string, end:string;}, weekendHours:{start:string,end: string }, closingDays: string[], booking: Booking) { // TODO modificare costruttore e codici che lo usano
        this.id = id;
        this.name = name;
        this.address = address;
        this.max_capacity = max_capacity;
        this.rent_cost = rent_cost;
        this.weekdayHours = weekdayHours;
        this.weekendHours = weekendHours;
        this.closingDays = closingDays;
        this.booking = booking;
    }
}

export class Booking{
    id: number;
    codice_fiscale: string;
    date: string;
    duration: {
        start: string;
        end: string;
    };
    venue: Venue;
    personnel: Personnel[];

    constructor(id:number, codice_fiscale:string, date:string, duration:{start:string, end:string}, venue:Venue, personnel:Personnel[]) {
        this.id = id;
        this.codice_fiscale = codice_fiscale
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

    constructor(event_id:number, event_type:string, date:string, schedule_start:string, schedule_end:string, max_participants:number) {
        this.event_id = event_id;
        this.event_type = event_type;
        this.date = date;
        this.schedule_start = schedule_start;
        this.schedule_end = schedule_end;
        this.max_participants = max_participants;
    }
}