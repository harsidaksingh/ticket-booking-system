// 1. the @Injectable decorator tells Angular: "I can inject this into components who need it"
import { Injectable, inject } from '@angular/core';
// 2. We inject the HttpClient to make web requests
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { TicketEvent } from '../models/event.model';
import { TicketSeat } from '../models/seat.model';

@Injectable({
  // This tells Angular there is only ONE copy of this service for the whole app
  providedIn: 'root'
})
export class EventService {
  // Dependency Injection: Grab the pre-configured HttpClient
  private http = inject(HttpClient);
  // This is where our backend lives!
  private apiUrl = 'http://localhost:3000/events';

  // This method returns an Observable (we will learn about these later, but think of them as super-Promises)
  getEvents() {
    return this.http.get<{result: TicketEvent[]}>(this.apiUrl).pipe(
      map(response => response.result)
    );
  }
  getSeats(eventId: number){
    return this.http.get<{seats: TicketSeat[]}>(`${this.apiUrl}/${eventId}/seats`).pipe(
      map(response => response.seats)
    )
  }
}
