import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private http = inject(HttpClient);
  private bookingUrl = 'http://localhost:3000/bookings';
  reserve(eventId: number, seatIds: number[], userId: string) {
    return this.http.post<{ message: string }>(`${this.bookingUrl}/reserve`, {
      eventId,
      seatIds,
      userId,
    });
  }
  confirmBooking(eventId: number, seatIds: number[]) {
    return this.http.post<{ message: string; reqId: string; status: string }>(
      `${this.bookingUrl}`,
      { eventId, seatIds },
    );
  }
  getBookingStatus(reqId: string) {
    return this.http.get<{ message: string; reqId: string; status: string }>(
      `${this.bookingUrl}/status/${reqId}`,
    );
  }
  getBookingStatusStream(reqId: string): Observable<{ status: string }> {
    return new Observable((observer) => {
      const eventSource = new EventSource(
        `http://localhost:3000/bookings/status/stream/${reqId}`,
        {
          withCredentials: true,
        },
      );
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        observer.next(data);

        if (data.status === 'CONFIRMED' || data.status === 'FAILED') {
          eventSource.close();
          observer.complete();
        }
      };
      eventSource.onerror = (error) => {
        console.error('SSE Error:', error);
        eventSource.close();
        observer.error(error);
      };
      return () => {
        eventSource.close();
      };
    });
  }
}
