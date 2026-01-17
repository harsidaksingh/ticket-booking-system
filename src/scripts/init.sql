create table events (
    id number generated always as identity primary key,
    name varchar2(100) not null,
    total_seats number default 0 not null 
);

create table seats(
    id number  generated always as identity primary key,
    event_id number not null,
    seat_number number not null,
    status number default 0,
    version number default 0,
    CONSTRAINT fk_event FOREIGN KEY (event_id) REFERENCES events(id)
);

create table bookings(
    id number  generated always as identity primary key,
    event_id number not null,
    seat_id number not null,
    user_email varchar2(100),
    booking_time timestamp default current_timestamp,
    CONSTRAINT fk_booking_seat FOREIGN KEY (seat_id) REFERENCES seats(id)
);