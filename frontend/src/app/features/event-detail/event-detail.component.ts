import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../core/services/event.service';
import { TicketSeat } from '../../core/models/seat.model';
import { BookingService } from '../../core/services/booking.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-eventDetail',
  standalone: true,
  template: `
    @if (isLoading) {
      <p class="text-center">Loading Events...</p>
    } @else {
      <div class="seat-grid mt-4">
        @for (seat of seats; track seat.id) {
          <button
            class="seat"
            [class.seat-booked]="seat.status === 1 || seat.status === 2"
            [class.seat-selected]="seat.id === selectedSeatId()"
            [class.seat-available]="
              seat.status === 0 && seat.id !== selectedSeatId()
            "
            [disabled]="seat.status === 1 || seat.status === 2"
            (click)="selectSeat(seat.id)"
          >
            {{ seat.seatNumber }}
          </button>
        }
      </div>

      <div
        class="fixed-bottom p-3"
        style="background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(10px); border-top: 1px solid rgba(255,255,255,0.05); z-index: 1030;"
      >
        <div
          class="container d-flex justify-content-between align-items-center"
        >
          <div>
            @if (selectedSeatId() !== null) {
              <p class="mb-0 text-success fw-bold">
                Ready to Reserve Seat {{ selectedSeatId() }}!
              </p>
            } @else {
              <p class="mb-0 text-muted">Select a seat to continue</p>
            }
          </div>

          <button
            class="btn btn-primary px-5 py-2"
            [disabled]="selectedSeatId() === null"
            (click)="reserve()"
          >
            Reserve Seat
          </button>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .seat-grid {
        display: grid;
        /* This automatically creates a flexible grid of 50px squares */
        grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
        gap: 12px;
        margin-bottom: 80px; /* Leaves space for the reserve button */
      }
      .seat {
        width: 100%;
        aspect-ratio: 1; /* Forces the button to be a perfect square */
        border-radius: 8px;
        border: none;
        font-weight: 600;
        font-size: 0.85rem;
        transition:
          transform 0.2s,
          box-shadow 0.2s;
      }
      .seat:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
      }
      /* Our premium color states */
      .seat-available {
        background-color: var(--surface-border);
        color: var(--bs-body-color);
      }
      .seat-selected {
        background-color: var(--bs-success);
        color: white;
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.4);
      }
      .seat-booked {
        background-color: var(--bs-danger);
        opacity: 0.5;
        color: white;
        cursor: not-allowed;
      }
    `,
  ],
})
export class EventDetailComponent implements OnInit {
  private activatedRoute = inject(ActivatedRoute);
  private eventService = inject(EventService);
  private bookingService = inject(BookingService);
  private authService = inject(AuthService);
  private router = inject(Router);
  isLoading: boolean = true;
  seats: TicketSeat[] = [];
  selectedSeatId = signal<number | null>(null);
  ngOnInit() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    this.eventService.getSeats(Number(id)).subscribe({
      next: (data) => {
        this.seats = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to fetch events:', err);
        this.isLoading = false;
      },
    });
  }
  selectSeat(id: number) {
    if (this.selectedSeatId() === id) {
      this.selectedSeatId.set(null);
    } else {
      this.selectedSeatId.set(id);
    }
  }
  reserve() {
    const eventId = this.activatedRoute.snapshot.paramMap.get('id');
    const userEmail: string = localStorage.getItem('userEmail')!;
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.bookingService
      .reserve(Number(eventId), Number(this.selectedSeatId()!), userEmail)
      .subscribe({
        next: (data) => {
          this.router.navigate(['/checkout'], {
            state: { eventId: eventId, seatId: this.selectedSeatId() },
          });
        },
        error: (error) => {
          console.error('Failed to reserve seat:', error);
        },
      });
  }
}
