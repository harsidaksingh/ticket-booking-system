import { Component, inject, OnInit } from '@angular/core';
import { interval, switchMap, takeWhile } from 'rxjs';
import { BookingService } from '../../core/services/booking.service';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="row justify-content-center mt-5">
      <div class="col-md-6 col-lg-5">
        <!-- PENDING STATE (Spinner) -->
        @if (bookingStatus === 'PENDING') {
          <div class="card p-5 text-center shadow-lg border-0">
            <h4 class="mb-4 fw-bold">Processing Your Booking</h4>
            <div
              class="spinner-border text-primary mx-auto mb-3"
              style="width: 3rem; height: 3rem;"
              role="status"
            ></div>
            <p class="text-muted">Please don't close this window...</p>
          </div>
        }

        <!-- CONFIRMED STATE (Ticket Graphic) -->
        @if (bookingStatus === 'CONFIRMED') {
          <div
            class="card shadow-lg"
            style="border: 2px dashed var(--bs-primary);"
          >
            <div
              class="card-header bg-primary text-white text-center py-3 border-0"
            >
              <h4 class="mb-0 fw-bold">🎫 VIP TICKET</h4>
            </div>

            <div class="card-body p-4 text-center">
              <h2 class="text-success mb-3">
                <i class="bi bi-check-circle-fill"></i> Confirmed!
              </h2>
              <p class="fs-5 mb-1">
                Event ID: <strong>{{ eventId }}</strong>
              </p>
              <p class="fs-5 mb-4">
                Seat Number: <strong>{{ seatId }}</strong>
              </p>

              <div
                class="bg-dark p-3 rounded-3 mb-3"
                style="letter-spacing: 5px;"
              >
                || ||| | ||| || | | || |
              </div>

              <button class="btn btn-primary w-100 py-2" routerLink="/">
                Return Home
              </button>
            </div>
          </div>
        }

        <!-- FAILED / REJECTED STATE -->
        @if (bookingStatus === 'FAILED' || bookingStatus === 'REJECTED') {
          <div class="card p-5 text-center shadow-lg border-danger">
            <h4 class="text-danger fw-bold mb-3">Booking Failed</h4>
            <p class="text-muted mb-4">
              Something went wrong or someone beat you to this seat.
            </p>
            <button
              class="btn btn-outline-danger w-100 py-2"
              [routerLink]="['/events', eventId]"
            >
              Try Another Seat
            </button>
          </div>
        }
      </div>
    </div>
  `,
})
export class CheckoutComponent implements OnInit {
  private bookingService = inject(BookingService);
  private router = inject(Router);
  reqId: string = '';
  bookingStatus: string = 'PENDING';
  eventId!: number;
  seatId!: number;
  ngOnInit() {
    const state = history.state;
    this.eventId = state.eventId;
    this.seatId = state.seatId;

    this.confirmBooking();
  }
  confirmBooking() {
    this.bookingStatus = 'PENDING';
    this.bookingService.confirmBooking(this.eventId, this.seatId).subscribe({
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
