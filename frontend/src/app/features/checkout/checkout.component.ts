import { Component, inject, OnInit } from '@angular/core';
import { interval, switchMap, takeWhile } from 'rxjs';
import { BookingService } from '../../core/services/booking.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-checkout',
  standalone: true,
  template: `
    <div class="container mt-4 text-center">
      @if (bookingStatus === 'UNCONFIRMED') {
        <h2>Confirm Your Booking</h2>
        <p>Ready to finalize your seat?</p>
        <button class="btn btn-primary mt-2" (click)="confirmBooking()">
          Book Seat
        </button>
      }
      @if (bookingStatus === 'PENDING') {
        <h2 class="text-warning">⏳ Processing your booking...</h2>
        <p>Please wait, we are securing your seat.</p>
      }
      @if (bookingStatus === 'CONFIRMED') {
        <h2 class="text-success">🎉 Booking Confirmed!</h2>
        <p>Your ticket is secured.</p>
      }
      @if (bookingStatus === 'FAILED') {
        <h2 class="text-danger">❌ Booking failed.</h2>
        <p>Unfortunately, we couldn't secure the seat. Please try again.</p>
      }
    </div>
  `,
})
export class CheckoutComponent {
  private bookingService = inject(BookingService);
  private router = inject(Router);
  reqId: string = '';
  bookingStatus: string = 'UNCONFIRMED';
  confirmBooking() {
    const state = history.state;
    const eventId = state.eventId;
    const seatId = state.seatId;
    this.bookingStatus = 'PENDING';
    this.bookingService.confirmBooking(eventId, seatId).subscribe({
      next: (data) => {
        this.reqId = data.reqId;
        interval(2000)
          .pipe(
            switchMap(() => this.bookingService.getBookingStatus(this.reqId)),
            takeWhile((response) => response.status === 'PENDING', true),
          )
          .subscribe({
            next: (pollingData) => {
              this.bookingStatus = pollingData.status;
            },
          });
      },
      error: (err) => {
        console.error('Failed to create booking', err);
        this.bookingStatus = 'FAILED';
      },
    });
  }
}
