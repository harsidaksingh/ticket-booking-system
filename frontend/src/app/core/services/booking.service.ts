import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

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
}
