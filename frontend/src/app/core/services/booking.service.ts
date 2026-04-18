import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private http = inject(HttpClient);
  private bookingUrl = 'http://localhost:3000/bookings';
  reserve(eventId: number, seatId: number, userId: string) {
    return this.http.post<{ message: string }>(`${this.bookingUrl}/reserve`, {
      eventId,
      seatId,
      userId,
    });
  }
  confirmBooking(eventId: number, seatId: number) {
    return this.http.post<{ message: string; reqId: string; status: string }>(
      `${this.bookingUrl}`,
      { eventId, seatId },
    );
  }
  getBookingStatus(reqId: string) {
    return this.http.get<{ message: string; reqId: string; status: string }>(
      `${this.bookingUrl}/status/${reqId}`,
    );
  }
}
